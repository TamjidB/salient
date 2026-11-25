import type { ScreeningResult } from '@salient/engine';

const pad = (n: number) => String(n).padStart(2, '0');

export const findingRef = (index: number) => `F-${pad(index + 1)}`;
export const supplierRef = (index: number) => `S-${pad(index + 1)}`;

/** Stable reference codes that cross-link the register, the supplier table and the export. */
export interface Refs {
  finding: Map<string, string>;
  supplier: Map<string, string>;
  findingsBySupplier: Map<string, string[]>;
}

export function buildRefs(result: ScreeningResult): Refs {
  const finding = new Map(result.findings.map((f, i) => [f.id, findingRef(i)]));
  const supplier = new Map(result.suppliers.map((s, i) => [s.supplier.id, supplierRef(i)]));
  const findingsBySupplier = new Map<string, string[]>();
  result.findings.forEach((f, i) => {
    const list = findingsBySupplier.get(f.supplierId) ?? [];
    list.push(findingRef(i));
    findingsBySupplier.set(f.supplierId, list);
  });
  return { finding, supplier, findingsBySupplier };
}

export const formatShare = (share: number | null) => (share === null ? null : `${(share * 100).toFixed(1)}%`);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
