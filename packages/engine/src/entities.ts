import { tokenize } from './normalize';
import { softTokenSimilarity } from './similarity';
import type { EntityMatch, EntityMatchStrength, UflpaEntity } from './types';

/** Legal-form words that say nothing about identity. */
const LEGAL_FORMS: ReadonlySet<string> = new Set([
  'co', 'ltd', 'limited', 'company', 'inc', 'incorporated', 'corp', 'corporation', 'llc', 'plc',
  'gmbh', 'ag', 'sa', 'sarl', 'srl', 'bv', 'nv', 'pte', 'pvt', 'private', 'jsc', 'ojsc', 'llp', 'lp',
  'group', 'holding', 'holdings',
]);

/**
 * Words too common in listed names to identify anyone on their own: industry words and
 * place names. Used only by the containment rule ("Hoshine" ⊂ "Hoshine Silicon Industry").
 * Place names matter for regional risk, but that is a country/region question, not an identity match.
 */
const GENERIC: ReadonlySet<string> = new Set(
  [
    // industry and corporate words
    'trading', 'trade', 'industry', 'industrial', 'textile', 'technology', 'tech', 'new', 'energy',
    'material', 'international', 'import', 'export', 'development', 'product', 'manufacturing',
    'science', 'resource', 'agriculture', 'agricultural', 'hair', 'accessory', 'apparel', 'garment',
    'cotton', 'silicon', 'solar', 'chemical', 'metal', 'mining', 'business', 'service', 'enterprise',
    'global', 'supply', 'factory', 'county', 'city', 'province', 'park', 'zone', 'economic',
    // places
    'china', 'chinese', 'xinjiang', 'uyghur', 'hotan', 'hetian', 'aksu', 'akesu', 'kashgar', 'kashi',
    'urumqi', 'turpan', 'hami', 'korla', 'yili', 'changji', 'shihezi', 'shanshan', 'karamay',
  ],
);

export const ENTITY_THRESHOLDS = { strong: 0.95, possible: 0.88 } as const;

export function entityTokens(name: string): string[] {
  return tokenize(name, LEGAL_FORMS);
}

interface IndexedName {
  entity: UflpaEntity;
  name: string;
  kind: EntityMatch['nameKind'];
  tokens: string[];
  key: string;
}

export type EntityIndex = IndexedName[];

export function buildEntityIndex(entities: readonly UflpaEntity[]): EntityIndex {
  const out: IndexedName[] = [];
  const push = (entity: UflpaEntity, name: string, kind: IndexedName['kind']) => {
    const tokens = entityTokens(name);
    if (tokens.length) out.push({ entity, name, kind, tokens, key: tokens.join(' ') });
  };
  for (const e of entities) {
    push(e, e.name, 'name');
    e.aliases.forEach((a) => push(e, a, 'alias'));
    e.formerNames.forEach((f) => push(e, f, 'former'));
  }
  return out;
}

function containedWithDistinctiveToken(shorter: readonly string[], longer: readonly string[]): boolean {
  const longSet = new Set(longer);
  return (
    shorter.length < longer.length &&
    shorter.every((t) => longSet.has(t)) &&
    shorter.some((t) => t.length >= 4 && !GENERIC.has(t))
  );
}

/**
 * Screen one supplier name against the UFLPA Entity List (names, aliases, former names).
 * Returns at most `limit` entities, best first. Anything short of "exact" must be reviewed by a person.
 */
export function matchEntity(supplierName: string, index: EntityIndex, limit = 3): EntityMatch[] {
  const tokens = entityTokens(supplierName);
  if (!tokens.length) return [];
  const key = tokens.join(' ');
  const best = new Map<UflpaEntity, EntityMatch>();

  for (const cand of index) {
    let score: number;
    let strength: EntityMatchStrength | null = null;

    if (cand.key === key) {
      score = 1;
      strength = 'exact';
    } else {
      score = softTokenSimilarity(tokens, cand.tokens);
      if (score >= ENTITY_THRESHOLDS.strong) strength = 'strong';
      else if (score >= ENTITY_THRESHOLDS.possible) strength = 'possible';
      else if (
        containedWithDistinctiveToken(tokens, cand.tokens) ||
        containedWithDistinctiveToken(cand.tokens, tokens)
      ) {
        score = ENTITY_THRESHOLDS.possible;
        strength = 'possible';
      }
    }
    if (!strength) continue;

    const prev = best.get(cand.entity);
    if (!prev || score > prev.score) {
      best.set(cand.entity, { entity: cand.entity, matchedName: cand.name, nameKind: cand.kind, score, strength });
    }
  }

  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
