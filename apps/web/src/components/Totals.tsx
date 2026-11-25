import type { CSSProperties } from 'react';
import type { ScreeningResult } from '@salient/engine';

interface Field {
  label: string;
  value: number;
  tone?: string;
}

const order = (i: number) => ({ '--i': i }) as CSSProperties;

interface GroupProps {
  title: string;
  total: number;
  note?: string;
  fields: Field[];
  offset: number;
}

function Group({ title, total, note, fields, offset }: GroupProps) {
  return (
    <div className="totals-group">
      <p className="group-label">
        {title} <span className="figure">{total}</span>
        {note && <span className="group-note">, {note}</span>}
      </p>
      <dl className="totals" style={{ '--cols': fields.length } as CSSProperties}>
        {fields.map((f, i) => (
          <div key={f.label} className={`box${f.tone ? ` total-${f.tone}` : ''}`}>
            <dt className="box-label">{f.label}</dt>
            <dd className="box-value figure">
              <span className="typed" style={order(offset + i)}>
                {f.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Two ruled groups whose cells sum to their labels: findings by band, suppliers by status. */
export function Totals({ result }: { result: ScreeningResult }) {
  const s = result.summary;
  const findings = s.findingsByBand.critical + s.findingsByBand.high + s.findingsByBand.moderate;
  return (
    <div className="totals-groups">
      <Group
        title="Findings"
        total={findings}
        note={`of which ${s.needsReview} need review`}
        offset={0}
        fields={[
          { label: 'Critical', value: s.findingsByBand.critical, tone: 'critical' },
          { label: 'High', value: s.findingsByBand.high, tone: 'high' },
          { label: 'Moderate', value: s.findingsByBand.moderate, tone: 'moderate' },
        ]}
      />
      <Group
        title="Suppliers screened"
        total={s.suppliers}
        offset={3}
        fields={[
          { label: 'Flagged', value: s.flagged },
          { label: 'No listing found', value: s.noListing },
          { label: 'Not assessed', value: s.notAssessed },
        ]}
      />
    </div>
  );
}
