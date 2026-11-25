/**
 * Fold text for comparison: strip accents, lowercase, drop apostrophes,
 * turn "&" into "and", and collapse everything else that isn't a letter or digit into single spaces.
 *
 *   foldText("Côte d’Ivoire") === "cote divoire"
 */
export function foldText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Light plural stemmer. Deliberately simple: both sides of every comparison go through it. */
export function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && /(?:s|x|ch|sh|o)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export const STOPWORDS: ReadonlySet<string> = new Set(['the', 'of', 'and', 'with', 'for', 'a', 'an']);

/** Folded, stemmed tokens with stopwords removed. */
export function tokenize(input: string, extraDrop?: ReadonlySet<string>): string[] {
  const folded = foldText(input);
  if (!folded) return [];
  return folded
    .split(' ')
    .filter((t) => t && !STOPWORDS.has(t) && !(extraDrop?.has(t) ?? false))
    .map(stem);
}

/** Remove parenthesized parts: "Cobalt Ore (heterogenite)" → "Cobalt Ore". */
export function stripParentheticals(input: string): string {
  return input.replace(/\s*\([^)]*\)/g, '').trim();
}
