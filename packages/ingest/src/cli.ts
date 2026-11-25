/**
 * Refresh the official datasets in data/.
 *
 *   npm run data:fetch            # both lists
 *   npm run fetch:dol   -w @salient/ingest
 *   npm run fetch:uflpa -w @salient/ingest
 *
 * Fails loudly (non-zero exit, nothing written) if a source changes shape. Sanity thresholds stop
 * a format change from silently emptying a list.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';
import type { DolDataset, UflpaDataset } from '@salient/engine';
import { editionFromUrl, findDolExcelUrl, parseDolRows } from './dol.ts';
import { parseLastUpdated, parseUflpaHtml } from './uflpa.ts';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../data');
const USER_AGENT = 'salient-data-refresh/0.1 (open-source supply chain screening)';

const DOL_PAGE = 'https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods';
const DOL_FALLBACK_XLSX = 'https://www.dol.gov/sites/dolgov/files/ilab/child_labor_reports/tda2023/2024ListofGoodsExcel.xlsx';
const UFLPA_PAGE = 'https://www.dhs.gov/uflpa-entity-list';

const MIN_DOL_LISTINGS = 100;
const MIN_UFLPA_ENTITIES = 50;

async function get(url: string): Promise<Response> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  return res;
}

async function writeJson(file: string, data: unknown): Promise<void> {
  const target = path.join(DATA_DIR, file);
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote ${path.relative(process.cwd(), target)}`);
}

async function fetchDol(): Promise<void> {
  const page = await (await get(DOL_PAGE)).text();
  const xlsxUrl = findDolExcelUrl(page, DOL_PAGE) ?? DOL_FALLBACK_XLSX;
  console.log(`DOL: reading ${xlsxUrl}`);
  const buffer = Buffer.from(await (await get(xlsxUrl)).arrayBuffer());

  const sheets = await readXlsxFile(buffer);
  const parsed = sheets
    .map((s) => ({ sheet: s.sheet, ...parseDolRows(s.data) }))
    .sort((a, b) => b.listings.length - a.listings.length)[0];

  if (!parsed || parsed.listings.length < MIN_DOL_LISTINGS) {
    throw new Error(`DOL: parsed only ${parsed?.listings.length ?? 0} listings (expected ≥ ${MIN_DOL_LISTINGS}). Has the format changed?`);
  }
  if (parsed.unknownTypes.length) {
    throw new Error(`DOL: unrecognized exploitation types: ${parsed.unknownTypes.join(' | ')}. Map them in src/dol.ts.`);
  }

  const edition = editionFromUrl(xlsxUrl) ?? 'unknown';
  const dataset: DolDataset = {
    meta: {
      name: 'List of Goods Produced by Child Labor or Forced Labor',
      publisher: 'U.S. Department of Labor, Bureau of International Labor Affairs',
      edition,
      sourceUrl: DOL_PAGE,
      retrievedAt: new Date().toISOString(),
      sample: false,
    },
    goods: [...new Set(parsed.listings.map((l) => l.good))].sort((a, b) => a.localeCompare(b)),
    listings: parsed.listings,
  };
  console.log(`DOL: ${dataset.listings.length} listings, ${dataset.goods.length} goods (sheet "${parsed.sheet}", edition ${edition})`);
  await writeJson('dol-goods.json', dataset);
}

async function fetchUflpa(): Promise<void> {
  const html = await (await get(UFLPA_PAGE)).text();
  const entities = parseUflpaHtml(html);
  if (entities.length < MIN_UFLPA_ENTITIES) {
    throw new Error(`UFLPA: parsed only ${entities.length} entities (expected ≥ ${MIN_UFLPA_ENTITIES}). Has the page changed, or was the request blocked?`);
  }
  const lastUpdated = parseLastUpdated(html);
  const dataset: UflpaDataset = {
    meta: {
      name: 'UFLPA Entity List',
      publisher: 'U.S. Department of Homeland Security, Forced Labor Enforcement Task Force',
      edition: lastUpdated ? `last updated ${lastUpdated}` : 'unknown',
      sourceUrl: UFLPA_PAGE,
      retrievedAt: new Date().toISOString(),
      sample: false,
    },
    entities: entities.sort((a, b) => a.name.localeCompare(b.name)),
  };
  const aliasCount = entities.reduce((n, e) => n + e.aliases.length + e.formerNames.length, 0);
  console.log(`UFLPA: ${entities.length} entities, ${aliasCount} aliases/former names (${dataset.meta.edition})`);
  await writeJson('uflpa-entities.json', dataset);
}

const which = process.argv[2];
const jobs: Record<string, () => Promise<void>> = { dol: fetchDol, uflpa: fetchUflpa };
const selected = which ? [jobs[which]] : Object.values(jobs);

if (selected.some((j) => !j)) {
  console.error(`Unknown dataset "${which}". Use one of: ${Object.keys(jobs).join(', ')}`);
  process.exit(2);
}

let failed = false;
for (const job of selected) {
  try {
    await job!();
  } catch (err) {
    failed = true;
    console.error(err instanceof Error ? err.message : err);
  }
}
process.exit(failed ? 1 : 0);
