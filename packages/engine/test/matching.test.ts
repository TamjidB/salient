import { describe, expect, it } from 'vitest';
import { buildProductIndex, matchProduct } from '../src/products';
import { buildEntityIndex, matchEntity } from '../src/entities';
import { GOODS, synonyms, uflpa } from './fixtures';

const products = buildProductIndex(GOODS, synonyms);
const goodsOf = (desc: string) => matchProduct(desc, products).map((m) => `${m.good}:${m.relation}:${m.method}`);

describe('matchProduct', () => {
  it('matches exact and token forms', () => {
    expect(goodsOf('Cocoa')).toEqual(['Cocoa:is:exact']);
    expect(goodsOf('raw cotton')).toEqual(['Cotton:is:token']);
  });

  it('matches both bricks entries for clay bricks', () => {
    expect(goodsOf('clay bricks').sort()).toEqual(['Bricks (clay):is:token', 'Bricks:is:token']);
  });

  it('lets a synonym suppress generic token matches inside its phrase', () => {
    expect(goodsOf('cocoa beans')).toEqual(['Cocoa:is:synonym']);
  });

  it('maps finished products to upstream inputs', () => {
    expect(goodsOf('Solar panels, 400W')).toEqual([
      'Solar Modules:is:synonym',
      'Polysilicon:contains:synonym',
      'Solar Cells:contains:synonym',
    ]);
  });

  it('catches typos on single-token goods', () => {
    const [m] = matchProduct('coton fabric', products);
    expect(m?.good).toBe('Cotton');
    expect(m?.method).toBe('fuzzy');
  });

  it('returns nothing for unrelated products', () => {
    expect(goodsOf('corrugated packaging')).toEqual([]);
    expect(goodsOf('')).toEqual([]);
  });

  it('ignores synonym targets missing from the vocabulary', () => {
    expect(goodsOf('ghost')).toEqual([]);
  });
});

const entities = buildEntityIndex(uflpa.entities);
const top = (name: string) => matchEntity(name, entities)[0];

describe('matchEntity', () => {
  it('matches listed names regardless of legal form and punctuation', () => {
    const m = top('BAODING LYSZD TRADE & BUSINESS CO LTD');
    expect(m?.strength).toBe('exact');
    expect(m?.entity.name).toBe('Baoding LYSZD Trade and Business Co., Ltd.');
  });

  it('matches aliases and former names', () => {
    expect(top('Akesu Huafu Melange Yarn Co Ltd')?.nameKind).toBe('alias');
    expect(top('Hotan Haolin Hair Accessory Co.')?.strength).toBe('exact');
    const former = top('Example Quartzite New Material Company Limited');
    expect(former?.nameKind).toBe('former');
    expect(former?.strength).toBe('exact');
  });

  it('flags near-spellings as strong, needing review', () => {
    const m = top('Hotan Hoalin Hair Accessories');
    expect(m?.strength).toBe('strong');
  });

  it('flags a distinctive partial name as possible', () => {
    const m = top('Example Quartzite');
    expect(m?.strength).toBe('possible');
  });

  it('does not match on shared generic words alone', () => {
    expect(top('Baoding Trading Co.')).toBeUndefined();
    expect(top('Xinjiang Trading Co.')).toBeUndefined();
    expect(top('Hotan Hair Accessories')?.strength ?? 'none').not.toBe('exact');
    expect(top('Acme Widgets Inc')).toBeUndefined();
  });
});
