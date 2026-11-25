import { describe, expect, it } from 'vitest';
import { foldText, stem, tokenize } from '../src/normalize';
import { jaroWinkler, softTokenSimilarity } from '../src/similarity';
import { countryKey, sameCountry } from '../src/countries';

describe('foldText', () => {
  it('strips accents, apostrophes and punctuation', () => {
    expect(foldText("Côte d’Ivoire")).toBe('cote divoire');
    expect(foldText("Côte d'Ivoire")).toBe('cote divoire');
    expect(foldText('Lithium-Ion Batteries')).toBe('lithium ion batteries');
    expect(foldText('Salt & Pepper')).toBe('salt and pepper');
  });
});

describe('stem', () => {
  it('handles common plural forms', () => {
    expect(stem('bricks')).toBe('brick');
    expect(stem('batteries')).toBe('battery');
    expect(stem('tomatoes')).toBe('tomato');
    expect(stem('glass')).toBe('glass');
    expect(stem('gas')).toBe('gas');
  });

  it('is applied consistently by tokenize', () => {
    expect(tokenize('Accessories of the Hair')).toEqual(['accessory', 'hair']);
  });
});

describe('similarity', () => {
  it('jaroWinkler scores near-spellings high and unrelated words low', () => {
    expect(jaroWinkler('cotton', 'cotton')).toBe(1);
    expect(jaroWinkler('coton', 'cotton')).toBeGreaterThan(0.92);
    expect(jaroWinkler('cotton', 'cobalt')).toBeLessThan(0.8);
  });

  it('softTokenSimilarity requires both names to be covered', () => {
    const listed = ['hotan', 'haolin', 'hair', 'accessory'];
    expect(softTokenSimilarity(['hotan', 'hoalin', 'hair', 'accessory'], listed)).toBeGreaterThan(0.95);
    expect(softTokenSimilarity(['hotan', 'hair', 'accessory'], listed)).toBeLessThan(0.95);
  });
});

describe('countryKey', () => {
  it('understands DOL spellings', () => {
    expect(sameCountry('Congo, Democratic Republic of the (DRC)', 'DRC')).toBe(true);
    expect(sameCountry('Congo, Democratic Republic of the (DRC)', 'Democratic Republic of Congo')).toBe(true);
    expect(sameCountry("Côte d'Ivoire", 'Ivory Coast')).toBe(true);
    expect(sameCountry('Burma', 'Myanmar')).toBe(true);
    expect(sameCountry('Turkey (Türkiye)', 'Türkiye')).toBe(true);
    expect(sameCountry('Korea, North', 'North Korea')).toBe(true);
    expect(sameCountry('Kyrgyz Republic', 'Kyrgyzstan')).toBe(true);
  });

  it('keeps distinct countries distinct', () => {
    expect(sameCountry('Congo, Democratic Republic of the (DRC)', 'Republic of the Congo')).toBe(false);
    expect(sameCountry('Korea, North', 'South Korea')).toBe(false);
    expect(sameCountry('', '')).toBe(false);
  });

  it('maps common abbreviations', () => {
    expect(countryKey('USA')).toBe('united states');
    expect(countryKey('PRC')).toBe('china');
  });
});
