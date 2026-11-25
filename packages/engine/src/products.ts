import { foldText, stripParentheticals, tokenize } from './normalize';
import { jaroWinkler } from './similarity';
import type { ProductMatch, ProductSynonym, Relation } from './types';

interface GoodEntry {
  good: string;
  /** Tokens of the good's name outside any parentheses ("Cobalt Ore (heterogenite)" → cobalt, ore). */
  core: string[];
  coreKey: string;
  fullKey: string;
}

interface SynonymEntry {
  phrase: string;
  tokens: string[];
  goods: { good: string; relation: Relation }[];
}

export interface ProductIndex {
  goods: GoodEntry[];
  byName: Map<string, GoodEntry>;
  synonyms: SynonymEntry[];
}

/** 0.94 keeps "coton" → Cotton (0.96) while rejecting "sheet" → Sheep (0.92). */
const FUZZY_THRESHOLD = 0.94;
const FUZZY_MIN_LENGTH = 5;

export function buildProductIndex(goods: readonly string[], synonyms: readonly ProductSynonym[] = []): ProductIndex {
  const entries: GoodEntry[] = [];
  const byName = new Map<string, GoodEntry>();
  for (const good of new Set(goods)) {
    const core = tokenize(stripParentheticals(good));
    const entry: GoodEntry = {
      good,
      core,
      coreKey: core.join(' '),
      fullKey: tokenize(good).join(' '),
    };
    entries.push(entry);
    byName.set(good, entry);
  }

  const synonymEntries: SynonymEntry[] = synonyms
    .map((s) => ({
      phrase: s.phrase,
      tokens: tokenize(s.phrase),
      // Ignore synonym targets that aren't in this vocabulary, so a stale synonym can't invent a good.
      goods: s.goods.filter((g) => byName.has(g.good)),
    }))
    .filter((s) => s.tokens.length > 0 && s.goods.length > 0);

  return { goods: entries, byName, synonyms: synonymEntries };
}

const RELATION_RANK: Record<Relation, number> = { is: 1, contains: 0 };

function better(a: ProductMatch, b: ProductMatch): boolean {
  if (a.relation !== b.relation) return RELATION_RANK[a.relation] > RELATION_RANK[b.relation];
  return a.score > b.score;
}

/**
 * Match a free-text product description ("cotton t-shirts", "solar panels")
 * to goods on the DOL list.
 *
 * Methods, strongest first:
 *  - exact:   the whole description is the good
 *  - synonym: a curated phrase maps to the good, as the thing itself ("is") or as an upstream input ("contains")
 *  - token:   every core token of the good appears in the description
 *  - fuzzy:   a single-token good is a near-spelling of a description token (typos)
 *
 * When a synonym phrase matches, generic token matches inside that phrase are suppressed,
 * so "cocoa beans" maps to Cocoa and not also to Beans.
 */
export function matchProduct(description: string, index: ProductIndex): ProductMatch[] {
  const descTokens = tokenize(description);
  if (!descTokens.length) return [];
  const descSet = new Set(descTokens);
  const descKey = descTokens.join(' ');
  const found = new Map<string, ProductMatch>();

  const add = (m: ProductMatch) => {
    const prev = found.get(m.good);
    if (!prev || better(m, prev)) found.set(m.good, m);
  };

  // exact
  for (const g of index.goods) {
    if (descKey === g.fullKey || descKey === g.coreKey) add({ good: g.good, relation: 'is', method: 'exact', score: 1 });
  }

  // synonyms
  const covered = new Set<string>();
  for (const s of index.synonyms) {
    if (!s.tokens.every((t) => descSet.has(t))) continue;
    s.tokens.forEach((t) => covered.add(t));
    for (const target of s.goods) {
      add({
        good: target.good,
        relation: target.relation,
        method: 'synonym',
        score: target.relation === 'is' ? 0.95 : 0.8,
        via: s.phrase,
      });
    }
  }

  // tokens
  for (const g of index.goods) {
    if (!g.core.length || found.has(g.good)) continue;
    if (!g.core.every((t) => descSet.has(t))) continue;
    // Suppress when every matched token sits inside a phrase a synonym already explained.
    if (g.core.every((t) => covered.has(t))) continue;
    add({ good: g.good, relation: 'is', method: 'token', score: 0.9 });
  }

  // fuzzy (typos), single-token goods only
  for (const g of index.goods) {
    if (found.has(g.good) || g.core.length !== 1) continue;
    const target = g.core[0];
    if (target === undefined || target.length < FUZZY_MIN_LENGTH) continue;
    let best = 0;
    for (const t of descTokens) {
      if (t.length < FUZZY_MIN_LENGTH || covered.has(t)) continue;
      const s = jaroWinkler(t, target);
      if (s > best) best = s;
    }
    if (best >= FUZZY_THRESHOLD && best < 1) add({ good: g.good, relation: 'is', method: 'fuzzy', score: best });
  }

  return [...found.values()].sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : a.good.localeCompare(b.good)));
}

/** Folded comparison key for a DOL good name (used to join product matches to listings). */
export function goodKey(good: string): string {
  return foldText(good);
}
