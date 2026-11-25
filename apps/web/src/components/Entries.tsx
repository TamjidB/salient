import type { ScreeningResult, SupplierStatus } from '@salient/engine';
import { formatShare, type Refs } from '../refs';

const STATUS_LABEL: Record<SupplierStatus, string> = {
  flagged: 'Flagged',
  no_listing: 'No listing found',
  not_assessed: 'Not assessed',
};

export function Entries({ result, refs }: { result: ScreeningResult; refs: Refs }) {
  const hasSpend = result.suppliers.some((s) => s.spendShare !== null);
  const totalShare = result.suppliers.reduce((sum, s) => sum + (s.spendShare ?? 0), 0);

  return (
    <section className="section" aria-labelledby="entries-title">
      <div className="section-head">
        <div>
          <h2 id="entries-title">Supplier entries</h2>
          <p className="legend">
            Flagged has findings. No listing found is not a clean bill of health. Not assessed means the product or
            country could not be read.
          </p>
        </div>
      </div>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="entries-title">
        <table className="entries">
          <thead>
            <tr>
              <th scope="col">Ref</th>
              <th scope="col">Supplier</th>
              <th scope="col">Country</th>
              <th scope="col">Product</th>
              <th scope="col">Matched DOL goods</th>
              <th scope="col">Findings</th>
              <th scope="col" className="num">
                Spend share
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.suppliers.map((s) => {
              const ref = refs.supplier.get(s.supplier.id);
              const findingRefs = refs.findingsBySupplier.get(s.supplier.id) ?? [];
              const share = formatShare(s.spendShare);
              const direct = s.productMatches.filter((m) => m.relation === 'is').map((m) => m.good);
              const inputs = s.productMatches.filter((m) => m.relation === 'contains').map((m) => m.good);
              return (
                <tr key={s.supplier.id} id={ref}>
                  <td className="ref" data-label="Ref">
                    {ref}
                  </td>
                  <td className="typed-text cell-name" data-label="Supplier">
                    {s.supplier.name}
                  </td>
                  <td className="typed-text" data-label="Country">
                    {s.supplier.country || <span className="muted">none</span>}
                  </td>
                  <td className="typed-text" data-label="Product">
                    {s.supplier.product || <span className="muted">none</span>}
                  </td>
                  <td data-label="Matched DOL goods">
                    {s.productMatches.length ? (
                      <>
                        {direct.length > 0 && <span className="goods">{direct.join(', ')}</span>}
                        {inputs.length > 0 && <span className="goods muted">Inputs: {inputs.join(', ')}</span>}
                      </>
                    ) : (
                      <span className="muted">None recognized</span>
                    )}
                  </td>
                  <td data-label="Findings">
                    {findingRefs.length ? (
                      findingRefs.map((r) => (
                        <a key={r} className="ref ref-link" href={`#${r}`}>
                          {r}
                        </a>
                      ))
                    ) : (
                      <span className="muted">None</span>
                    )}
                  </td>
                  <td className="num typed-text figure" data-label="Spend share">
                    {share ?? <span className="muted">Not given</span>}
                  </td>
                  <td data-label="Status">
                    <span className={`status status-${s.status}`} title={s.notes.join(' ') || undefined}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {hasSpend && (
            <tfoot>
              <tr>
                <th scope="row" colSpan={6}>
                  Total declared spend
                </th>
                <td className="num typed-text figure" data-label="Total declared spend">
                  {(totalShare * 100).toFixed(1)}%
                </td>
                <td className="empty-cell" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
