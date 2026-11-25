import type { DolDataset, ProductSynonym, UflpaDataset } from '../src/types';

const meta = (name: string) => ({
  name,
  publisher: 'test',
  edition: 'test',
  sourceUrl: 'https://example.org',
  retrievedAt: null,
  sample: true,
});

export const GOODS = [
  'Beans',
  'Bricks',
  'Bricks (clay)',
  'Cattle',
  'Cobalt Ore (heterogenite)',
  'Cocoa',
  'Cocoa Butter',
  'Cotton',
  'Garments',
  'Leather',
  'Polysilicon',
  'Solar Cells',
  'Solar Modules',
];

export const dol: DolDataset = {
  meta: meta('DOL test list'),
  goods: GOODS,
  listings: [
    { country: "Côte d'Ivoire", good: 'Cocoa', exploitation: ['child_labor', 'forced_labor'] },
    { country: 'Congo, Democratic Republic of the (DRC)', good: 'Cobalt Ore (heterogenite)', exploitation: ['child_labor', 'forced_labor'] },
    { country: 'Pakistan', good: 'Bricks', exploitation: ['child_labor', 'forced_labor'] },
    { country: 'China', good: 'Polysilicon', exploitation: ['forced_labor'] },
    { country: 'Brazil', good: 'Cattle', exploitation: ['child_labor', 'forced_labor'] },
    { country: 'Testland', good: 'Garments', exploitation: ['inputs_forced_labor'] },
  ],
};

export const synonyms: ProductSynonym[] = [
  { phrase: 'cocoa beans', goods: [{ good: 'Cocoa', relation: 'is' }] },
  {
    phrase: 'solar panel',
    goods: [
      { good: 'Solar Modules', relation: 'is' },
      { good: 'Solar Cells', relation: 'contains' },
      { good: 'Polysilicon', relation: 'contains' },
    ],
  },
  { phrase: 't shirt', goods: [{ good: 'Garments', relation: 'is' }, { good: 'Cotton', relation: 'contains' }] },
  { phrase: 'leather', goods: [{ good: 'Leather', relation: 'is' }, { good: 'Cattle', relation: 'contains' }] },
  { phrase: 'ghost', goods: [{ good: 'Not A Real Good', relation: 'is' }] },
];

export const uflpa: UflpaDataset = {
  meta: meta('UFLPA test list'),
  entities: [
    {
      name: 'Hetian Haolin Hair Accessories Co. Ltd.',
      aliases: ['Hotan Haolin Hair Accessories', 'Hollin Hair Accessories'],
      formerNames: [],
      sections: [],
      effectiveDate: '2022-06-21',
    },
    {
      name: 'Baoding LYSZD Trade and Business Co., Ltd.',
      aliases: [],
      formerNames: [],
      sections: [],
      effectiveDate: '2022-06-21',
    },
    {
      name: 'Aksu Huafu Color Spinning Co., Ltd.',
      aliases: ['Aksu Huafu Textiles Co., Ltd.', 'Akesu Huafu', 'Aksu Huafu Dyed Melange Yarn', 'Akesu Huafu Melange Yarn Co., Ltd.'],
      formerNames: [],
      sections: [],
      effectiveDate: '2025-01-15',
    },
    {
      name: 'Example Quartzite Silicon Industry (Shanshan) Co., Ltd.',
      aliases: [],
      formerNames: ['Example Quartzite New Material Co., Ltd.'],
      sections: ['i'],
      effectiveDate: '2022-06-21',
    },
  ],
};
