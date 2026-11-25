/** Jaro–Winkler similarity in [0, 1]. */
export function jaroWinkler(a: string, b: string, prefixScale = 0.1): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatched = new Array<boolean>(a.length).fill(false);
  const bMatched = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const m = matches;
  const jaro = (m / a.length + m / b.length + (m - transpositions / 2) / m) / 3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return jaro + prefix * prefixScale * (1 - jaro);
}

/**
 * Below this, two tokens count as different words rather than a near-spelling.
 * Without the floor, Jaro–Winkler's prefix bonus makes "haolin" vs "hair" (0.80) look half-similar.
 */
const TOKEN_FLOOR = 0.85;

/** Mean, over tokens of `a`, of the best Jaro–Winkler match in `b` (0 if below the floor). */
function mongeElkan(a: readonly string[], b: readonly string[]): number {
  if (!a.length || !b.length) return 0;
  let total = 0;
  for (const ta of a) {
    let best = 0;
    for (const tb of b) {
      const s = jaroWinkler(ta, tb);
      if (s > best) best = s;
      if (best === 1) break;
    }
    total += best >= TOKEN_FLOOR ? best : 0;
  }
  return total / a.length;
}

/**
 * Symmetric soft-token similarity. Takes the *minimum* of both directions,
 * so both names have to be covered: "Hotan Hair Accessories" does not
 * score highly against "Hotan Haolin Hair Accessories".
 */
export function softTokenSimilarity(a: readonly string[], b: readonly string[]): number {
  return Math.min(mongeElkan(a, b), mongeElkan(b, a));
}
