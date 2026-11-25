import { foldText, stripParentheticals, STOPWORDS } from './normalize';

/**
 * Common names → the canonical key used for comparison.
 * Keys and values are already in canonical form (folded, stopwords removed).
 */
const ALIASES: Readonly<Record<string, string>> = {
  'ivory coast': 'cote divoire',
  drc: 'democratic republic congo',
  'dr congo': 'democratic republic congo',
  'dr congo kinshasa': 'democratic republic congo',
  'congo kinshasa': 'democratic republic congo',
  'congo drc': 'democratic republic congo',
  myanmar: 'burma',
  turkiye: 'turkey',
  dprk: 'north korea',
  'democratic peoples republic korea': 'north korea',
  'republic korea': 'south korea',
  rok: 'south korea',
  kyrgyzstan: 'kyrgyz republic',
  swaziland: 'eswatini',
  usa: 'united states',
  us: 'united states',
  'united states america': 'united states',
  uk: 'united kingdom',
  'great britain': 'united kingdom',
  britain: 'united kingdom',
  prc: 'china',
  'peoples republic china': 'china',
  'mainland china': 'china',
  'viet nam': 'vietnam',
  holland: 'netherlands',
  uae: 'united arab emirates',
};

/**
 * Canonical comparison key for a country name.
 *
 *   countryKey("Congo, Democratic Republic of the (DRC)") === countryKey("DRC")
 *   countryKey("Korea, North") === countryKey("North Korea")
 *   countryKey("Côte d'Ivoire") === countryKey("Ivory Coast")
 */
export function countryKey(raw: string): string {
  let name = stripParentheticals(raw);

  // Un-invert "Korea, North" → "North Korea"; "Congo, Democratic Republic of the" → "Democratic Republic of the Congo".
  const parts = name.split(',');
  if (parts.length === 2) name = `${parts[1]} ${parts[0]}`;

  const canonical = foldText(name)
    .split(' ')
    .filter((t) => t && !STOPWORDS.has(t))
    .join(' ');

  return ALIASES[canonical] ?? canonical;
}

export function sameCountry(a: string, b: string): boolean {
  const ka = countryKey(a);
  return ka !== '' && ka === countryKey(b);
}
