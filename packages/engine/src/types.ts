/** Exploitation types as the DOL List of Goods records them. */
export type Exploitation =
  | 'child_labor'
  | 'forced_labor'
  | 'forced_child_labor'
  | 'inputs_child_labor'
  | 'inputs_forced_labor';

export interface DatasetMeta {
  /** e.g. "List of Goods Produced by Child Labor or Forced Labor" */
  name: string;
  publisher: string;
  /** Edition or last-updated date, as the publisher states it. */
  edition: string;
  sourceUrl: string;
  /** ISO timestamp of when the ingest script fetched the data, or null for hand-built files. */
  retrievedAt: string | null;
  /** True when the file is a small development sample rather than the full official list. */
  sample: boolean;
  notice?: string;
}

export interface DolListing {
  /** Country or area, spelled exactly as DOL spells it. */
  country: string;
  /** Good, spelled exactly as DOL spells it. */
  good: string;
  exploitation: Exploitation[];
}

export interface DolDataset {
  meta: DatasetMeta;
  /** The full DOL goods vocabulary, used for product matching even where a country has no listing. */
  goods: string[];
  listings: DolListing[];
}

/** Statutory section of the UFLPA, 2(d)(2)(B)(i)–(v). */
export type UflpaSection = 'i' | 'ii' | 'iii' | 'iv' | 'v';

export interface UflpaEntity {
  name: string;
  aliases: string[];
  formerNames: string[];
  /** Statutory sections the entity is listed under (some entities appear in more than one). */
  sections: UflpaSection[];
  /** ISO date (YYYY-MM-DD) of the earliest listing. */
  effectiveDate: string | null;
}

export interface UflpaDataset {
  meta: DatasetMeta;
  entities: UflpaEntity[];
}

/** "is": the product is the good. "contains": the good is a typical upstream input of the product. */
export type Relation = 'is' | 'contains';

export interface ProductSynonym {
  phrase: string;
  goods: { good: string; relation: Relation }[];
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  product: string;
  spend: number | null;
}

export interface ProductMatch {
  good: string;
  relation: Relation;
  method: 'exact' | 'token' | 'synonym' | 'fuzzy';
  score: number;
  /** The synonym phrase that produced the match, if any. */
  via?: string;
}

export type EntityMatchStrength = 'exact' | 'strong' | 'possible';

export interface EntityMatch {
  entity: UflpaEntity;
  /** The listed name, alias or former name that matched. */
  matchedName: string;
  nameKind: 'name' | 'alias' | 'former';
  score: number;
  strength: EntityMatchStrength;
}

export type Band = 'critical' | 'high' | 'moderate';

export interface Salience {
  /** 1–5: scale, scope and irremediable character of the harm to people. */
  severity: number;
  /** 1–5: how likely it is that the harm is linked to this supplier. */
  likelihood: number;
  band: Band;
  rationale: string[];
}

export type Leverage = 'high' | 'medium' | 'low' | 'unknown';

export interface Evidence {
  dataset: string;
  edition: string;
  url: string;
  detail: string;
}

export type FindingMatch =
  | { kind: 'product'; product: ProductMatch }
  | { kind: 'entity'; entity: EntityMatch };

export interface Finding {
  id: string;
  supplierId: string;
  source: 'dol' | 'uflpa';
  title: string;
  exploitation: Exploitation[];
  salience: Salience;
  needsReview: boolean;
  evidence: Evidence;
  match: FindingMatch;
}

/**
 * flagged      – one or more findings
 * no_listing   – product recognized and country known, but nothing on the lists. NOT a clean bill of health.
 * not_assessed – product unrecognized or country missing (the name was still screened against UFLPA)
 */
export type SupplierStatus = 'flagged' | 'no_listing' | 'not_assessed';

export interface SupplierResult {
  supplier: Supplier;
  status: SupplierStatus;
  productMatches: ProductMatch[];
  findings: Finding[];
  leverage: Leverage;
  spendShare: number | null;
  notes: string[];
}

export interface ScreeningSummary {
  suppliers: number;
  flagged: number;
  noListing: number;
  notAssessed: number;
  findingsByBand: Record<Band, number>;
  needsReview: number;
}

export interface ScreeningResult {
  generatedAt: string;
  suppliers: SupplierResult[];
  /** All findings, most salient first. */
  findings: Finding[];
  summary: ScreeningSummary;
  datasets: DatasetMeta[];
}
