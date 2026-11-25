import type { DolListing, Exploitation } from '@salient/engine';

type Cell = string | number | boolean | Date | null;

const EXPLOITATION_TEXT: Readonly<Record<string, Exploitation>> = {
  'child labor': 'child_labor',
  'forced labor': 'forced_labor',
  'forced child labor': 'forced_child_labor',
  'inputs produced with child labor': 'inputs_child_labor',
  'inputs produced with forced labor': 'inputs_forced_labor',
};

const text = (c: Cell | undefined) => (c === null || c === undefined ? '' : String(c)).replace(/\s+/g, ' ').trim();

/** "Child Labor, Forced Labor" → ['child_labor', 'forced_labor']; unrecognized parts are returned separately. */
export function parseExploitation(value: string): { types: Exploitation[]; unknown: string[] } {
  const types: Exploitation[] = [];
  const unknown: string[] = [];
  for (const part of value.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const t = EXPLOITATION_TEXT[part.toLowerCase()];
    if (t) {
      if (!types.includes(t)) types.push(t);
    } else unknown.push(part);
  }
  return { types, unknown };
}

const isMarked = (c: Cell | undefined) => {
  const v = text(c).toLowerCase();
  return v !== '' && v !== 'no' && v !== '0' && v !== 'false' && v !== '-';
};

/**
 * Parse rows from the DOL "List of Goods" spreadsheet. Supports two layouts:
 *  - "Country/Area | Good | Exploitation Type"  (comma-separated types, as on the 2024 web list)
 *  - "Country | Good | Child Labor | Forced Labor | …" (one column per type, marked with X)
 * Duplicate (country, good) rows are merged.
 */
export function parseDolRows(rows: readonly (readonly Cell[])[]): { listings: DolListing[]; unknownTypes: string[] } {
  const headerIndex = rows.findIndex(
    (r) => r.some((c) => /^country/i.test(text(c))) && r.some((c) => /^good/i.test(text(c))),
  );
  if (headerIndex === -1) return { listings: [], unknownTypes: [] };

  const header = (rows[headerIndex] ?? []).map((c) => text(c).toLowerCase());
  const col = (re: RegExp) => header.findIndex((h) => re.test(h));
  const countryCol = col(/^country/);
  const goodCol = col(/^good/);
  const typeCol = col(/exploitation/);
  const flagCols = Object.entries(EXPLOITATION_TEXT)
    .map(([label, type]) => ({ type, index: header.indexOf(label) }))
    .filter((f) => f.index !== -1);

  const merged = new Map<string, DolListing>();
  const unknownTypes = new Set<string>();

  for (const row of rows.slice(headerIndex + 1)) {
    const country = text(row[countryCol]);
    const good = text(row[goodCol]);
    if (!country || !good) continue;

    let types: Exploitation[] = [];
    if (typeCol !== -1) {
      const parsed = parseExploitation(text(row[typeCol]));
      types = parsed.types;
      parsed.unknown.forEach((u) => unknownTypes.add(u));
    } else {
      types = flagCols.filter((f) => isMarked(row[f.index])).map((f) => f.type);
    }
    if (!types.length) continue;

    const key = `${country}\u0000${good}`;
    const existing = merged.get(key);
    if (existing) {
      for (const t of types) if (!existing.exploitation.includes(t)) existing.exploitation.push(t);
    } else {
      merged.set(key, { country, good, exploitation: types });
    }
  }

  const listings = [...merged.values()].sort(
    (a, b) => a.country.localeCompare(b.country) || a.good.localeCompare(b.good),
  );
  return { listings, unknownTypes: [...unknownTypes] };
}

/** Year in a DOL file name, e.g. ".../2024ListofGoodsExcel.xlsx" → "2024". */
export function editionFromUrl(url: string): string | null {
  const name = url.split('/').pop() ?? '';
  return /(20\d{2})/.exec(name)?.[1] ?? null;
}

/** Find the newest "List of Goods" Excel link on the DOL page (highest year in the file name). */
export function findDolExcelUrl(html: string, pageUrl: string): string | null {
  let best: { url: string; year: number } | null = null;
  for (const m of html.matchAll(/href="([^"]+\.xlsx?)"/gi)) {
    const href = m[1] ?? '';
    if (!/list\s*of\s*goods|listofgoods/i.test(href)) continue;
    const year = Number(editionFromUrl(href) ?? 0);
    if (!best || year > best.year) best = { url: new URL(href, pageUrl).toString(), year };
  }
  return best?.url ?? null;
}
