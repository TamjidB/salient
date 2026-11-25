import { parse } from 'node-html-parser';
import type { UflpaEntity, UflpaSection } from '@salient/engine';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** "June 21, 2022" → "2022-06-21". Returns null if the text isn't a date in that form. */
export function parseUsDate(text: string): string | null {
  const m = /([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(text);
  if (!m) return null;
  const month = MONTHS.indexOf((m[1] ?? '').toLowerCase()) + 1;
  if (!month) return null;
  return `${m[3]}-${String(month).padStart(2, '0')}-${(m[2] ?? '').padStart(2, '0')}`;
}

/** "Last Updated: 10/28/2026" → "2026-10-28". */
export function parseLastUpdated(html: string): string | null {
  const m = /Last\s+Updated:?\s*(?:<[^>]*>\s*)*(\d{1,2})\/(\d{1,2})\/(\d{4})/i.exec(html);
  if (!m) return null;
  return `${m[3]}-${(m[1] ?? '').padStart(2, '0')}-${(m[2] ?? '').padStart(2, '0')}`;
}

const ALIAS_MARKER = String.raw`also known as|formerly known as|(?:and|including)\s+\S+\s+alias(?:es)?\s*:`;
const STARTS_WITH_MARKER = new RegExp(String.raw`^\s*(?:${ALIAS_MARKER})`, 'i');
const SPLIT_ON_MARKER = new RegExp(String.raw`(${ALIAS_MARKER})`, 'i');

function matchingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

function splitNames(segment: string): string[] {
  return segment
    .split(';')
    .map((s) => s.trim().replace(/^and\b\s*/i, '').replace(/[,;]\s*$/, '').trim())
    .filter(Boolean);
}

/**
 * Split a UFLPA table cell into the entity name, its aliases and its former names.
 * DHS writes aliases inline, in several forms:
 *
 *   "X (and two aliases: A; and B)"
 *   "X (including three aliases: A; B; and C)"
 *   "X (also known as A; B; and C)"
 *   "X (formerly known as A; and B)"
 *   "X (also known as A; and formerly known as B)"
 *
 * Parentheses that are part of the name itself, like "(Shanshan)", are kept.
 */
export function parseEntityCell(raw: string): Pick<UflpaEntity, 'name' | 'aliases' | 'formerNames'> {
  const text = raw.replace(/\s+/g, ' ').trim();

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '(' || !STARTS_WITH_MARKER.test(text.slice(i + 1))) continue;
    const close = matchingParen(text, i);
    const inner = text.slice(i + 1, close === -1 ? undefined : close);
    const parts = inner.split(SPLIT_ON_MARKER);
    const aliases: string[] = [];
    const formerNames: string[] = [];
    for (let p = 1; p < parts.length; p += 2) {
      const names = splitNames(parts[p + 1] ?? '');
      ((parts[p] ?? '').toLowerCase().startsWith('formerly') ? formerNames : aliases).push(...names);
    }
    return { name: text.slice(0, i).trim(), aliases, formerNames };
  }
  return { name: text, aliases: [], formerNames: [] };
}

const SECTION_RE = /Section\s*2\s*\(\s*d\s*\)\s*\(\s*2\s*\)\s*\(\s*B\s*\)\s*\(\s*(iv|v|i{1,3})\s*\)/gi;

function lastSection(html: string): UflpaSection | null {
  let found: UflpaSection | null = null;
  for (const m of html.matchAll(SECTION_RE)) found = (m[1] ?? '').toLowerCase() as UflpaSection;
  return found;
}

const clean = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Parse the DHS UFLPA Entity List page. Each table sits under a heading that cites
 * its statutory section, 2(d)(2)(B)(i)–(v). Entities listed under several sections are merged.
 */
export function parseUflpaHtml(html: string): UflpaEntity[] {
  const chunks = html.split(/<table\b/i);
  let section = lastSection(chunks[0] ?? '');
  const byName = new Map<string, UflpaEntity>();

  for (const chunk of chunks.slice(1)) {
    const end = chunk.search(/<\/table>/i);
    const table = parse(`<table${end === -1 ? chunk : chunk.slice(0, end + '</table>'.length)}`);

    for (const row of table.querySelectorAll('tr')) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;
      const cellText = clean(cells[0]?.text ?? '');
      if (!cellText || /^(name of entity|entity name)$/i.test(cellText)) continue;

      const parsed = parseEntityCell(cellText);
      const date = parseUsDate(clean(cells[1]?.text ?? ''));
      const key = parsed.name.toLowerCase();
      const existing = byName.get(key);

      if (!existing) {
        byName.set(key, { ...parsed, sections: section ? [section] : [], effectiveDate: date });
        continue;
      }
      for (const a of parsed.aliases) if (!existing.aliases.includes(a)) existing.aliases.push(a);
      for (const f of parsed.formerNames) if (!existing.formerNames.includes(f)) existing.formerNames.push(f);
      if (section && !existing.sections.includes(section)) existing.sections.push(section);
      if (date && (!existing.effectiveDate || date < existing.effectiveDate)) existing.effectiveDate = date;
    }

    section = lastSection(end === -1 ? '' : chunk.slice(end)) ?? section;
  }

  return [...byName.values()];
}
