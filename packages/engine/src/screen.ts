import { countryKey } from './countries';
import { buildEntityIndex, matchEntity, type EntityIndex } from './entities';
import { buildProductIndex, goodKey, matchProduct, type ProductIndex } from './products';
import {
  compareSalience,
  dolLikelihood,
  EXPLOITATION_LABEL,
  leverageFor,
  makeSalience,
  severityFor,
  uflpaLikelihood,
} from './salience';
import type {
  Band,
  DolDataset,
  DolListing,
  Exploitation,
  Finding,
  ProductSynonym,
  ScreeningResult,
  Supplier,
  SupplierResult,
  UflpaDataset,
} from './types';

export interface ScreeningData {
  dol: DolDataset;
  uflpa: UflpaDataset;
  synonyms: readonly ProductSynonym[];
}

/** Pre-built indexes. Build once, screen many lists. */
export interface Screener {
  data: ScreeningData;
  products: ProductIndex;
  entities: EntityIndex;
  /** countryKey → goodKey → listing */
  listings: Map<string, Map<string, DolListing>>;
}

export function createScreener(data: ScreeningData): Screener {
  const listings = new Map<string, Map<string, DolListing>>();
  for (const l of data.dol.listings) {
    const ck = countryKey(l.country);
    let byGood = listings.get(ck);
    if (!byGood) listings.set(ck, (byGood = new Map()));
    byGood.set(goodKey(l.good), l);
  }
  const vocabulary = [...data.dol.goods, ...data.dol.listings.map((l) => l.good)];
  return {
    data,
    products: buildProductIndex(vocabulary, data.synonyms),
    entities: buildEntityIndex(data.uflpa.entities),
    listings,
  };
}

function humanList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function describeExploitation(exploitation: readonly Exploitation[]): string {
  return humanList(exploitation.map((e) => EXPLOITATION_LABEL[e]));
}

export function screenSuppliers(screener: Screener, suppliers: readonly Supplier[]): ScreeningResult {
  const { dol, uflpa } = screener.data;
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.spend ?? 0), 0);

  const results: SupplierResult[] = suppliers.map((supplier) => {
    const notes: string[] = [];
    const findings: Finding[] = [];
    const ck = countryKey(supplier.country);
    const productMatches = matchProduct(supplier.product, screener.products);

    if (!ck) notes.push('No country given, so the DOL list could not be checked.');
    if (!productMatches.length) {
      notes.push(
        `Product "${supplier.product}" wasn't recognized as a DOL-listed good. Add a synonym or map it by hand.`,
      );
    }

    // DOL: country × good
    const byGood = ck ? screener.listings.get(ck) : undefined;
    for (const match of productMatches) {
      const listing = byGood?.get(goodKey(match.good));
      if (!listing) continue;
      const severity = severityFor(listing.exploitation);
      const { likelihood, rationale } = dolLikelihood(match, listing.exploitation);
      const harm = describeExploitation(listing.exploitation);
      const listed = `DOL lists ${listing.good} from ${listing.country} for ${harm}.`;
      const title =
        match.relation === 'contains' ? `${listing.good} is a typical input of "${supplier.product}". ${listed}` : listed;
      findings.push({
        id: `${supplier.id}:dol:${goodKey(listing.good)}`,
        supplierId: supplier.id,
        source: 'dol',
        title,
        exploitation: listing.exploitation,
        salience: makeSalience(severity, likelihood, rationale),
        needsReview: match.method === 'fuzzy' || match.relation === 'contains',
        evidence: {
          dataset: dol.meta.name,
          edition: dol.meta.edition,
          url: dol.meta.sourceUrl,
          detail: `${listing.country} · ${listing.good} · ${listing.exploitation.map((e) => EXPLOITATION_LABEL[e]).join(', ')}`,
        },
        match: { kind: 'product', product: match },
      });
    }

    // UFLPA: supplier name, screened regardless of country
    for (const em of matchEntity(supplier.name, screener.entities)) {
      const exploitation: Exploitation[] = ['forced_labor'];
      const { likelihood, rationale } = uflpaLikelihood(em);
      const title =
        em.strength === 'exact'
          ? `Matches UFLPA-listed entity "${em.entity.name}".`
          : `May match UFLPA-listed entity "${em.entity.name}".`;
      findings.push({
        id: `${supplier.id}:uflpa:${em.entity.name}`,
        supplierId: supplier.id,
        source: 'uflpa',
        title,
        exploitation,
        salience: makeSalience(severityFor(exploitation), likelihood, rationale),
        needsReview: em.strength !== 'exact',
        evidence: {
          dataset: uflpa.meta.name,
          edition: uflpa.meta.edition,
          url: uflpa.meta.sourceUrl,
          detail: [
            em.nameKind === 'name' ? 'Listed name' : em.nameKind === 'alias' ? `Alias "${em.matchedName}"` : `Former name "${em.matchedName}"`,
            em.entity.sections.length ? `UFLPA §2(d)(2)(B)(${em.entity.sections.join(', ')})` : null,
            em.entity.effectiveDate ? `effective ${em.entity.effectiveDate}` : null,
          ]
            .filter(Boolean)
            .join(' · '),
        },
        match: { kind: 'entity', entity: em },
      });
    }

    findings.sort((a, b) => compareSalience(a.salience, b.salience));
    const { leverage, share } = leverageFor(supplier.spend, totalSpend);
    const status = findings.length ? 'flagged' : productMatches.length && ck ? 'no_listing' : 'not_assessed';

    return { supplier, status, productMatches, findings, leverage, spendShare: share, notes };
  });

  const findings = results
    .flatMap((r) => r.findings)
    .sort((a, b) => compareSalience(a.salience, b.salience) || Number(a.needsReview) - Number(b.needsReview));

  const findingsByBand: Record<Band, number> = { critical: 0, high: 0, moderate: 0 };
  findings.forEach((f) => findingsByBand[f.salience.band]++);

  return {
    generatedAt: new Date().toISOString(),
    suppliers: results,
    findings,
    summary: {
      suppliers: results.length,
      flagged: results.filter((r) => r.status === 'flagged').length,
      noListing: results.filter((r) => r.status === 'no_listing').length,
      notAssessed: results.filter((r) => r.status === 'not_assessed').length,
      findingsByBand,
      needsReview: findings.filter((f) => f.needsReview).length,
    },
    datasets: [dol.meta, uflpa.meta],
  };
}

/** One-shot convenience: build indexes and screen. */
export function screen(data: ScreeningData, suppliers: readonly Supplier[]): ScreeningResult {
  return screenSuppliers(createScreener(data), suppliers);
}
