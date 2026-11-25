import { describe, expect, it } from 'vitest';
import {
  editionFromUrl,
  findDolExcelUrl,
  mergeDolListings,
  parseDolDownstreamRows,
  parseDolRows,
  parseExploitation,
} from '../src/dol.ts';
import { parseEntityCell, parseLastUpdated, parseUflpaHtml, parseUsDate } from '../src/uflpa.ts';

describe('parseEntityCell (verbatim formats from dhs.gov)', () => {
  it('handles a plain name', () => {
    expect(parseEntityCell('Baoding LYSZD Trade and Business Co., Ltd.')).toEqual({
      name: 'Baoding LYSZD Trade and Business Co., Ltd.',
      aliases: [],
      formerNames: [],
    });
  });

  it('handles "(and two aliases: A; and B)"', () => {
    expect(
      parseEntityCell('Hetian Haolin Hair Accessories Co. Ltd. (and two aliases: Hotan Haolin Hair Accessories; and Hollin Hair Accessories)'),
    ).toEqual({
      name: 'Hetian Haolin Hair Accessories Co. Ltd.',
      aliases: ['Hotan Haolin Hair Accessories', 'Hollin Hair Accessories'],
      formerNames: [],
    });
  });

  it('handles "(also known as A; B; C; and D)"', () => {
    expect(
      parseEntityCell(
        'Aksu Huafu Color Spinning Co., Ltd. (also known as Aksu Huafu Textiles Co., Ltd.; Akesu Huafu; Aksu Huafu Dyed Melange Yarn; and Akesu Huafu Melange Yarn Co., Ltd.)',
      ),
    ).toEqual({
      name: 'Aksu Huafu Color Spinning Co., Ltd.',
      aliases: ['Aksu Huafu Textiles Co., Ltd.', 'Akesu Huafu', 'Aksu Huafu Dyed Melange Yarn', 'Akesu Huafu Melange Yarn Co., Ltd.'],
      formerNames: [],
    });
  });

  it('handles "(formerly known as A; and B)"', () => {
    expect(
      parseEntityCell(
        'Xinjiang Goens Energy Technology Co., Ltd. (formerly known as Xinjiang GCL New Energy Material Technology Co., Ltd.; and Xinjiang GCL New Energy Materials Technology Co., Ltd.)',
      ),
    ).toEqual({
      name: 'Xinjiang Goens Energy Technology Co., Ltd.',
      aliases: [],
      formerNames: ['Xinjiang GCL New Energy Material Technology Co., Ltd.', 'Xinjiang GCL New Energy Materials Technology Co., Ltd.'],
    });
  });

  it('handles combined forms and parentheses inside the name', () => {
    expect(
      parseEntityCell('Example Silicon (Shanshan) Co., Ltd. (also known as Example Silicon; and formerly known as Example Materials Co.)'),
    ).toEqual({
      name: 'Example Silicon (Shanshan) Co., Ltd.',
      aliases: ['Example Silicon'],
      formerNames: ['Example Materials Co.'],
    });
    expect(parseEntityCell('Example Co. (including three aliases: A Co.; B Co.; and C Co.)').aliases).toEqual([
      'A Co.',
      'B Co.',
      'C Co.',
    ]);
  });
});

describe('UFLPA page', () => {
  const html = `
    <p>Last Updated: <time>10/28/2026</time></p>
    <h3>A list of entities in Xinjiang that mine, produce, or manufacture ... (Section 2(d)(2)(B)(i))</h3>
    <table>
      <tr><th>Name of Entity</th><th>Effective Date</th></tr>
      <tr><td>Example Alpha Co., Ltd. (and one alias: Alpha Example)</td><td>June 21, 2022</td></tr>
      <tr><td>Example Beta&nbsp;Co.</td><td>August 3, 2026</td></tr>
    </table>
    <h3>A list of facilities and entities ... (Section 2(d)(2)(B)(v))</h3>
    <table>
      <tr><td>Entity Name</td><td>Effective Date</td></tr>
      <tr><td>Example Alpha Co., Ltd.</td><td>May 1, 2020</td></tr>
      <tr><td>Example Gamma Co.</td><td>January 15, 2025</td></tr>
    </table>`;

  it('parses tables, sections and dates, and merges repeated entities', () => {
    expect(parseUflpaHtml(html)).toEqual([
      { name: 'Example Alpha Co., Ltd.', aliases: ['Alpha Example'], formerNames: [], sections: ['i', 'v'], effectiveDate: '2020-05-01' },
      { name: 'Example Beta Co.', aliases: [], formerNames: [], sections: ['i'], effectiveDate: '2026-08-03' },
      { name: 'Example Gamma Co.', aliases: [], formerNames: [], sections: ['v'], effectiveDate: '2025-01-15' },
    ]);
  });

  it('reads the last-updated date', () => {
    expect(parseLastUpdated(html)).toBe('2026-10-28');
  });

  it('parses US-style dates', () => {
    expect(parseUsDate('June 21, 2022')).toBe('2022-06-21');
    expect(parseUsDate('not a date')).toBeNull();
  });
});

describe('DOL spreadsheet', () => {
  it('parses the "Exploitation Type" layout', () => {
    const rows = [
      ['List of Goods Produced by Child Labor or Forced Labor', null, null],
      ['Country/Area', 'Good', 'Exploitation Type'],
      ["Côte d'Ivoire", 'Cocoa', 'Child Labor, Forced Labor'],
      ['Ghana', 'Cocoa', 'Child Labor'],
      ['Malaysia', 'Refined Palm Oil', 'Inputs Produced with Child Labor, Inputs Produced with Forced Labor'],
      [null, null, null],
    ];
    const { listings, unknownTypes } = parseDolRows(rows);
    expect(unknownTypes).toEqual([]);
    expect(listings).toEqual([
      { country: "Côte d'Ivoire", good: 'Cocoa', exploitation: ['child_labor', 'forced_labor'] },
      { country: 'Ghana', good: 'Cocoa', exploitation: ['child_labor'] },
      { country: 'Malaysia', good: 'Refined Palm Oil', exploitation: ['inputs_child_labor', 'inputs_forced_labor'] },
    ]);
  });

  it('parses the one-column-per-type layout and merges duplicates', () => {
    const rows = [
      ['Country', 'Good', 'Child Labor', 'Forced Labor', 'Forced Child Labor'],
      ['Pakistan', 'Bricks', 'X', 'X', null],
      ['Pakistan', 'Bricks', null, null, 'X'],
      ['Nowhere', 'Nothing', null, null, null],
    ];
    expect(parseDolRows(rows).listings).toEqual([
      { country: 'Pakistan', good: 'Bricks', exploitation: ['child_labor', 'forced_labor', 'forced_child_labor'] },
    ]);
  });

  it('reports exploitation types it does not recognize', () => {
    expect(parseExploitation('Child Labor, Something New')).toEqual({ types: ['child_labor'], unknown: ['Something New'] });
  });

  it('finds the newest Excel link on the list page', () => {
    const page = `
      <a href="/sites/dolgov/files/ILAB/child_labor_reports/tda2022/2022ListofGoodsExcel-1.xlsx">2022 Excel</a>
      <a href="/sites/dolgov/files/ilab/child_labor_reports/tda2023/2024ListofGoodsExcel.xlsx">List of Goods (Excel)</a>
      <a href="/files/other.xlsx">Other</a>`;
    expect(findDolExcelUrl(page, 'https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods')).toBe(
      'https://www.dol.gov/sites/dolgov/files/ilab/child_labor_reports/tda2023/2024ListofGoodsExcel.xlsx',
    );
    expect(editionFromUrl('https://x/tda2023/2024ListofGoodsExcel.xlsx')).toBe('2024');
  });
});

describe('DOL downstream goods sheet (layout as in the 2024 Excel)', () => {
  const rows = [
    ['Country/Area', 'TVPRA Input Good', 'Child Labor', 'Forced Labor', 'Country/Area', 'TVPRA Downstream Good', 'Downstream Goods at Risk'],
    ['Bolivia', 'Zinc', 'X', null, 'South Korea', 'Indium', 'Conductive Glass, Phones'],
    ['China', 'Cotton', null, 'X', 'China', 'Garments (Cotton)', 'Garments, Textiles'],
    ['China', 'Cotton', null, 'X', 'China', 'Textiles (Cotton)', 'Garments, Textiles'],
    ['Peru', 'Zinc', 'X', null, 'South Korea', 'Indium', 'Conductive Glass, Phones'],
  ];

  it('turns each row into an "inputs produced with" listing for the downstream good', () => {
    expect(parseDolDownstreamRows(rows)).toEqual([
      {
        country: 'South Korea',
        good: 'Indium',
        exploitation: ['inputs_child_labor'],
        inputs: [
          { country: 'Bolivia', good: 'Zinc' },
          { country: 'Peru', good: 'Zinc' },
        ],
      },
      { country: 'China', good: 'Garments (Cotton)', exploitation: ['inputs_forced_labor'], inputs: [{ country: 'China', good: 'Cotton' }] },
      { country: 'China', good: 'Textiles (Cotton)', exploitation: ['inputs_forced_labor'], inputs: [{ country: 'China', good: 'Cotton' }] },
    ]);
  });

  it('ignores sheets without a downstream header', () => {
    expect(parseDolDownstreamRows([['Country/Area', 'Good', 'Child Labor']])).toEqual([]);
  });

  it('merges a downstream listing into a direct one for the same country and good', () => {
    const merged = mergeDolListings(
      [{ country: 'China', good: 'Garments', exploitation: ['forced_labor'] }],
      [{ country: 'China', good: 'garments', exploitation: ['inputs_forced_labor'], inputs: [{ country: 'China', good: 'Cotton' }] }],
    );
    expect(merged).toEqual([
      {
        country: 'China',
        good: 'Garments',
        exploitation: ['forced_labor', 'inputs_forced_labor'],
        inputs: [{ country: 'China', good: 'Cotton' }],
      },
    ]);
  });
});
