import type { CSSProperties } from 'react';
import type { Band, Leverage, ScreeningResult } from '@salient/engine';
import { formatShare, type Refs } from '../refs';
import { Ramp } from './Ramp';

const BAND_LABEL: Record<Band, string> = { critical: 'Critical', high: 'High', moderate: 'Moderate' };
const LEVERAGE_LABEL: Record<Leverage, string> = { high: 'High', medium: 'Medium', low: 'Low', unknown: 'Unknown' };
const COLUMNS = ['Ref', 'Band', 'Supplier', 'Finding', 'Severity', 'Likelihood', 'Leverage'];

/** Rows type in one after another, capped so long registers don't wait. */
const order = (i: number) => ({ '--i': Math.min(i, 12) + 9 }) as CSSProperties;

interface Props {
  result: ScreeningResult | null;
  refs: Refs | null;
  citeAs: string | null;
  onExport: () => void;
}

export function Register({ result, refs, citeAs, onExport }: Props) {
  const bySupplier = new Map(result?.suppliers.map((s) => [s.supplier.id, s]) ?? []);
  const findings = result?.findings ?? [];

  return (
    <section className="section" aria-labelledby="register-title">
      <div className="section-head">
        <div>
          <h2 id="register-title">Salience register</h2>
          <p className="legend">
            Most severe first, then most likely (UNGP 24). <Ramp value={1} label="Legend: one point" /> is one point
            of five. Spend sets leverage, never rank.
          </p>
        </div>
        {result && (
          <button type="button" className="button" onClick={onExport} disabled={!findings.length}>
            Download risk register
          </button>
        )}
      </div>

      {citeAs && (
        <p className="cite">
          <span className="cite-label">Cite as</span> {citeAs}
        </p>
      )}

      <div className="register-head" aria-hidden="true">
        {COLUMNS.map((c) => (
          <span key={c} className={c === 'Leverage' ? 'num' : undefined}>
            {c}
          </span>
        ))}
      </div>

      {!result && (
        <div className="register-empty">
          {[0, 1, 2].map((i) => (
            <div key={i} className="reg-row is-blank" aria-hidden="true">
              {COLUMNS.map((c) => (
                <span key={c} className="fill-line" />
              ))}
            </div>
          ))}
          <p className="register-note">Findings appear here once box 1 has a supplier list, most salient first.</p>
        </div>
      )}

      {result && !findings.length && (
        <p className="register-note">
          No matches on the current lists. That is not the same as no risk: check the suppliers marked not assessed
          below.
        </p>
      )}

      {findings.length > 0 && (
        <ol className="register">
          {findings.map((f, i) => {
            const s = bySupplier.get(f.supplierId);
            const band = f.salience.band;
            const share = formatShare(s?.spendShare ?? null);
            return (
              <li key={f.id} id={refs?.finding.get(f.id)} className={`reg-row typed band-${band}`} style={order(i)}>
                <div className="cell cell-ref">
                  <span className="sr-only">Reference </span>
                  <span className="ref">{refs?.finding.get(f.id)}</span>
                </div>
                <div className="cell cell-band">
                  <span className="band">{BAND_LABEL[band]}</span>
                  {f.needsReview && <span className="review">Needs review</span>}
                </div>
                <div className="cell cell-supplier">
                  <span className="cell-label">Supplier</span>
                  <span className="typed-text supplier-name">{s?.supplier.name}</span>
                  <span className="sub">
                    <a className="ref" href={`#${refs?.supplier.get(f.supplierId) ?? ''}`}>
                      {refs?.supplier.get(f.supplierId)}
                    </a>{' '}
                    <span className="typed-text">
                      {s?.supplier.country || 'no country'}, {s?.supplier.product || 'no product'}
                    </span>
                  </span>
                </div>
                <div className="cell cell-finding">
                  <span className="cell-label">Finding</span>
                  <p className="finding-title">{f.title}</p>
                  <p className="why">{f.salience.rationale.join(' ')}</p>
                  <p className="source">
                    <a href={f.evidence.url} target="_blank" rel="noreferrer">
                      {f.evidence.dataset}, {f.evidence.edition}
                    </a>
                    <span className="muted"> {f.evidence.detail}</span>
                  </p>
                </div>
                <div className="cell cell-sev">
                  <span className="cell-label">Severity</span>
                  <Ramp value={f.salience.severity} label="Severity" />
                </div>
                <div className="cell cell-lik">
                  <span className="cell-label">Likelihood</span>
                  <Ramp value={f.salience.likelihood} label="Likelihood" />
                </div>
                <div className="cell cell-lev num">
                  <span className="cell-label">Leverage</span>
                  <span>{s ? LEVERAGE_LABEL[s.leverage] : 'Unknown'}</span>
                  {share && <span className="typed-text figure share">{share}</span>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
