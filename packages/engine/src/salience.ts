import type { Band, EntityMatch, Exploitation, Leverage, ProductMatch, Salience } from './types';

/**
 * Default severity (1–5) by exploitation type.
 *
 * The UNGPs define severity by scale, scope and irremediable character. Everything the current
 * datasets record (forced labor, forced child labor, child labor) is among the most severe harms,
 * so all default to 5. Supply chain distance ("inputs produced with …") does NOT lower severity:
 * the harm is just as grave for the person experiencing it. Distance lowers likelihood instead.
 *
 * Configurable so that practitioners can calibrate, and so that future datasets (wages, hours,
 * occupational safety) can sit on the same scale.
 */
export const DEFAULT_SEVERITY: Readonly<Record<Exploitation, number>> = {
  forced_labor: 5,
  forced_child_labor: 5,
  child_labor: 5,
  inputs_forced_labor: 5,
  inputs_child_labor: 5,
};

export const EXPLOITATION_LABEL: Readonly<Record<Exploitation, string>> = {
  child_labor: 'child labor',
  forced_labor: 'forced labor',
  forced_child_labor: 'forced child labor',
  inputs_child_labor: 'inputs produced with child labor',
  inputs_forced_labor: 'inputs produced with forced labor',
};

const clamp = (n: number) => Math.max(1, Math.min(5, n));

export function severityFor(
  exploitation: readonly Exploitation[],
  table: Readonly<Record<Exploitation, number>> = DEFAULT_SEVERITY,
): number {
  return clamp(Math.max(1, ...exploitation.map((e) => table[e])));
}

/** Likelihood that a DOL-listed harm is linked to this supplier, from how the product matched. */
export function dolLikelihood(
  match: ProductMatch,
  exploitation: readonly Exploitation[],
): { likelihood: number; rationale: string[] } {
  const rationale: string[] = [];
  let likelihood: number;

  if (match.relation === 'contains') {
    likelihood = 3;
    rationale.push(`${match.good} is a typical upstream input of this product, not the product itself.`);
  } else if (match.method === 'fuzzy') {
    likelihood = 3;
    rationale.push(`Product name is a near-spelling of "${match.good}", so confirm the match.`);
  } else {
    likelihood = 4;
    rationale.push(`Product matches the listed good "${match.good}" directly.`);
  }

  if (exploitation.length > 0 && exploitation.every((e) => e.startsWith('inputs_'))) {
    likelihood -= 1;
    rationale.push('DOL lists this good for its inputs, one tier further up the supply chain.');
  }

  return { likelihood: clamp(likelihood), rationale };
}

/** Likelihood from a UFLPA entity match. A confirmed listing carries a legal presumption of forced labor. */
export function uflpaLikelihood(match: EntityMatch): { likelihood: number; rationale: string[] } {
  switch (match.strength) {
    case 'exact':
      return {
        likelihood: 5,
        rationale: ['Name matches a UFLPA-listed entity. US law presumes its goods are made with forced labor.'],
      };
    case 'strong':
      return {
        likelihood: 4,
        rationale: [`Name closely matches "${match.matchedName}" (score ${match.score.toFixed(2)}). Confirm the entity.`],
      };
    case 'possible':
      return {
        likelihood: 3,
        rationale: [`Name may match "${match.matchedName}" (score ${match.score.toFixed(2)}). Review before acting.`],
      };
  }
}

export function bandFor(severity: number, likelihood: number): Band {
  if (severity >= 5 && likelihood >= 4) return 'critical';
  if (severity >= 4 && likelihood >= 3) return 'high';
  return 'moderate';
}

export function makeSalience(severity: number, likelihood: number, rationale: string[]): Salience {
  return { severity, likelihood, band: bandFor(severity, likelihood), rationale };
}

/** UNGP 24: severity first, then likelihood. Most salient first. */
export function compareSalience(a: Salience, b: Salience): number {
  return b.severity - a.severity || b.likelihood - a.likelihood;
}

export const LEVERAGE_THRESHOLDS = { high: 0.1, medium: 0.02 } as const;

/**
 * Leverage = how much influence you have over a supplier, approximated by share of spend.
 * Shown next to findings to help plan action. Never used to rank them.
 */
export function leverageFor(spend: number | null, totalSpend: number): { leverage: Leverage; share: number | null } {
  if (spend === null || !(totalSpend > 0)) return { leverage: 'unknown', share: null };
  const share = spend / totalSpend;
  if (share >= LEVERAGE_THRESHOLDS.high) return { leverage: 'high', share };
  if (share >= LEVERAGE_THRESHOLDS.medium) return { leverage: 'medium', share };
  return { leverage: 'low', share };
}
