import type { Band } from '@salient/engine';

/** Fixed five-box check ramp: one box per point of five. Identical everywhere it appears. */
export function Ramp({ value, label, tone }: { value: number; label: string; tone?: Band }) {
  return (
    <span className={`ramp${tone ? ` ramp-${tone}` : ''}`} role="img" aria-label={`${label} ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'pip is-on' : 'pip'} />
      ))}
    </span>
  );
}
