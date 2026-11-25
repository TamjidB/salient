import Papa from 'papaparse';
import type { ScreeningResult, Supplier } from '@salient/engine';
import { EXPLOITATION_LABEL } from '@salient/engine';
import { buildRefs } from './refs';

const HEADER_ALIASES: Record<'name' | 'country' | 'product' | 'spend', string[]> = {
  name: ['name', 'supplier', 'supplier name', 'vendor', 'vendor name', 'company', 'company name'],
  country: ['country', 'country of origin', 'origin', 'origin country', 'location', 'supplier country'],
  product: ['product', 'products', 'goods', 'good', 'commodity', 'category', 'description', 'item', 'material'],
  spend: ['spend', 'annual spend', 'annual_spend', 'amount', 'value', 'spend usd', 'total spend'],
};

const normalizeHeader = (h: string) => h.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

function findColumn(headers: string[], field: keyof typeof HEADER_ALIASES): string | undefined {
  const wanted = HEADER_ALIASES[field].map(normalizeHeader);
  return headers.find((h) => wanted.includes(normalizeHeader(h)));
}

function parseSpend(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) && value.trim() !== '' ? n : null;
}

export interface ParsedSuppliers {
  suppliers: Supplier[];
  warnings: string[];
}

export function parseSuppliersCsv(text: string): ParsedSuppliers {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    comments: '#',
    transformHeader: (h) => h.trim(),
  });
  const headers = parsed.meta.fields ?? [];
  const warnings: string[] = [];

  const cols = {
    name: findColumn(headers, 'name'),
    country: findColumn(headers, 'country'),
    product: findColumn(headers, 'product'),
    spend: findColumn(headers, 'spend'),
  };

  const missing = (['name', 'country', 'product'] as const).filter((k) => !cols[k]);
  if (missing.length) {
    warnings.push(
      `Couldn't find a column for ${missing.join(', ')}. Expected headers like: name, country, product, spend.`,
    );
    if (!cols.name) return { suppliers: [], warnings };
  }
  if (!cols.spend) warnings.push('No spend column, so leverage will show as "unknown".');

  const suppliers = parsed.data
    .map((row, i): Supplier => ({
      id: String(i + 1),
      name: (row[cols.name ?? ''] ?? '').trim(),
      country: (row[cols.country ?? ''] ?? '').trim(),
      product: (row[cols.product ?? ''] ?? '').trim(),
      spend: parseSpend(cols.spend ? row[cols.spend] : undefined),
    }))
    .filter((s) => s.name);

  if (parsed.errors.length) warnings.push(`${parsed.errors.length} row(s) could not be read cleanly.`);
  return { suppliers, warnings };
}

export const TEMPLATE_CSV = 'name,country,product,spend\nExample Supplier Ltd,Ghana,cocoa beans,250000\n';

export function riskRegisterCsv(result: ScreeningResult): string {
  const refs = buildRefs(result);
  const bySupplier = new Map(result.suppliers.map((s) => [s.supplier.id, s]));
  return Papa.unparse(
    result.findings.map((f, i) => {
      const s = bySupplier.get(f.supplierId);
      return {
        ref: refs.finding.get(f.id) ?? '',
        rank: i + 1,
        supplier_ref: refs.supplier.get(f.supplierId) ?? '',
        band: f.salience.band,
        severity: f.salience.severity,
        likelihood: f.salience.likelihood,
        needs_review: f.needsReview ? 'yes' : 'no',
        supplier: s?.supplier.name ?? '',
        country: s?.supplier.country ?? '',
        product: s?.supplier.product ?? '',
        finding: f.title,
        harm: f.exploitation.map((e) => EXPLOITATION_LABEL[e]).join('; '),
        why: f.salience.rationale.join(' '),
        dataset: f.evidence.dataset,
        edition: f.evidence.edition,
        evidence: f.evidence.detail,
        source_url: f.evidence.url,
        leverage: s?.leverage ?? 'unknown',
        spend_share: s?.spendShare === null || s?.spendShare === undefined ? '' : (s.spendShare * 100).toFixed(1) + '%',
      };
    }),
  );
}

export function downloadText(filename: string, text: string, type = 'text/csv'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
