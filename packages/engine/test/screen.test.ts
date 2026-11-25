import { describe, expect, it } from 'vitest';
import { createScreener, screenSuppliers } from '../src/screen';
import { bandFor, leverageFor } from '../src/salience';
import type { Supplier } from '../src/types';
import { dol, synonyms, uflpa } from './fixtures';

const screener = createScreener({ dol, uflpa, synonyms });

const supplier = (over: Partial<Supplier> & Pick<Supplier, 'id'>): Supplier => ({
  name: `Supplier ${over.id}`,
  country: '',
  product: '',
  spend: null,
  ...over,
});

describe('screenSuppliers', () => {
  it('flags a direct DOL listing as critical', () => {
    const r = screenSuppliers(screener, [supplier({ id: '1', country: 'Ivory Coast', product: 'cocoa beans' })]);
    const [f] = r.findings;
    expect(r.suppliers[0]?.status).toBe('flagged');
    expect(f?.source).toBe('dol');
    expect(f?.exploitation).toEqual(['child_labor', 'forced_labor']);
    expect(f?.salience).toMatchObject({ severity: 5, likelihood: 4, band: 'critical' });
    expect(f?.needsReview).toBe(false);
  });

  it('flags upstream inputs at lower likelihood, same severity', () => {
    const r = screenSuppliers(screener, [supplier({ id: '1', country: 'China', product: 'solar panels' })]);
    const [f] = r.findings;
    expect(f?.title).toBe('Polysilicon is a typical input of "solar panels". DOL lists Polysilicon from China for forced labor.');
    expect(f?.salience).toMatchObject({ severity: 5, likelihood: 3, band: 'high' });
    expect(f?.needsReview).toBe(true);
  });

  it('lowers likelihood again when DOL lists only the inputs', () => {
    const r = screenSuppliers(screener, [supplier({ id: '1', country: 'Testland', product: 't-shirts' })]);
    expect(r.findings[0]?.salience).toMatchObject({ severity: 5, likelihood: 3 });
  });

  it('screens names against UFLPA regardless of country or product', () => {
    const r = screenSuppliers(screener, [supplier({ id: '1', name: 'Aksu Huafu Textiles Co Ltd', product: 'something unknown' })]);
    const f = r.findings[0];
    expect(f?.source).toBe('uflpa');
    expect(f?.salience).toMatchObject({ likelihood: 5, band: 'critical' });
    expect(f?.evidence.detail).toContain('Alias');
  });

  it('separates "no listing found" from "not assessed"', () => {
    const r = screenSuppliers(screener, [
      supplier({ id: 'listed-elsewhere', country: 'United States', product: 'raw cotton' }),
      supplier({ id: 'unknown-product', country: 'Canada', product: 'corrugated packaging' }),
      supplier({ id: 'no-country', country: '', product: 'cocoa' }),
    ]);
    expect(r.suppliers.map((s) => s.status)).toEqual(['no_listing', 'not_assessed', 'not_assessed']);
    expect(r.summary).toMatchObject({ flagged: 0, noListing: 1, notAssessed: 2 });
  });

  it('ranks by salience: risk to people, not to the business', () => {
    // Identical risk, wildly different spend. Spend changes leverage, never salience or rank.
    const big = supplier({ id: 'big', country: 'Pakistan', product: 'bricks', spend: 9_900_000 });
    const small = supplier({ id: 'small', country: 'Pakistan', product: 'bricks', spend: 100_000 });
    const upstream = supplier({ id: 'upstream', country: 'Brazil', product: 'leather', spend: 50_000_000 });

    const r = screenSuppliers(screener, [upstream, big, small]);
    const bySupplier = Object.fromEntries(r.suppliers.map((s) => [s.supplier.id, s]));

    expect(bySupplier.big?.findings[0]?.salience).toEqual(bySupplier.small?.findings[0]?.salience);
    expect(bySupplier.big?.leverage).not.toBe(bySupplier.small?.leverage);

    // The biggest-spend supplier has only an upstream link, so it ranks below both direct findings.
    expect(r.findings.map((f) => f.supplierId)).toEqual(['big', 'small', 'upstream']);
  });
});

describe('salience helpers', () => {
  it('bands by severity then likelihood', () => {
    expect(bandFor(5, 5)).toBe('critical');
    expect(bandFor(5, 4)).toBe('critical');
    expect(bandFor(5, 3)).toBe('high');
    expect(bandFor(5, 2)).toBe('moderate');
    expect(bandFor(3, 5)).toBe('moderate');
  });

  it('computes leverage from spend share', () => {
    expect(leverageFor(20, 100).leverage).toBe('high');
    expect(leverageFor(5, 100).leverage).toBe('medium');
    expect(leverageFor(1, 100).leverage).toBe('low');
    expect(leverageFor(null, 100).leverage).toBe('unknown');
    expect(leverageFor(10, 0).leverage).toBe('unknown');
  });
});
