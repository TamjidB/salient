import { useEffect, useMemo, useRef, useState } from 'react';
import { createScreener, screenSuppliers, type ScreeningResult } from '@salient/engine';
import { dol, sampleCsv, synonyms, uflpa, usingSampleData } from './data';
import { downloadText, parseSuppliersCsv, riskRegisterCsv } from './csv';
import { buildRefs, formatDate } from './refs';
import { Mark } from './components/Mark';
import { EntryForm } from './components/EntryForm';
import { Totals } from './components/Totals';
import { Register } from './components/Register';
import { Entries } from './components/Entries';

const SAMPLE_NAME = 'sample-suppliers.csv';

interface Run {
  result: ScreeningResult;
  source: string;
  warnings: string[];
}

export function App() {
  const screener = useMemo(() => createScreener({ dol, uflpa, synonyms }), []);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refs = useMemo(() => (run ? buildRefs(run.result) : null), [run]);
  const resultsTitle = useRef<HTMLHeadingElement>(null);

  // Bring the results into view (instantly) so the type-in plays where it can be seen, and move focus with it.
  useEffect(() => {
    const heading = resultsTitle.current;
    if (!run || !heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
  }, [run]);

  const screenCsv = (text: string, source: string) => {
    const { suppliers, warnings } = parseSuppliersCsv(text);
    if (!suppliers.length) {
      setRun(null);
      setError(warnings.join(' ') || 'That file has no supplier rows. Check it has a header row and at least one supplier.');
      return;
    }
    setError(null);
    setRun({ result: screenSuppliers(screener, suppliers), source, warnings });
  };

  const screenedOn = run ? formatDate(run.result.generatedAt) : null;
  const summary = run?.result.summary;
  const findingCount = run?.result.findings.length ?? 0;
  const citeAs = run
    ? `Salient screening of ${run.source}, ${screenedOn}. ${dol.meta.name}, ${dol.meta.edition}; ${uflpa.meta.name}, ${uflpa.meta.edition}.`
    : null;

  return (
    <div className="page">
      <header className="masthead">
        <a className="wordmark" href="./" aria-label="Salient, home">
          <Mark />
          <span>Salient</span>
        </a>
        <p className="form-title">Screening entry summary</p>
      </header>

      <main>
        <section className="intro">
          <h1>Screen suppliers by harm to people.</h1>
          <p className="lede">
            Salient checks your supplier list against the U.S. Labor Department's <em>List of Goods</em> and the DHS{' '}
            <em>UFLPA Entity List</em>. Findings rank by severity of harm, then likelihood, as the UN Guiding Principles
            ask.
          </p>
        </section>

        <EntryForm
          onCsv={screenCsv}
          onSample={() => screenCsv(sampleCsv, SAMPLE_NAME)}
          datasets={[dol.meta, uflpa.meta]}
          fileName={run?.source ?? null}
          screenedOn={screenedOn}
        />

        {error && (
          <div className="remark remark-error" role="alert">
            <p className="box-label">Problem with that file</p>
            <p>{error}</p>
          </div>
        )}

        {usingSampleData && (
          <div className="remark">
            <p className="box-label">Remarks</p>
            <p>
              This copy uses sample lists, so many real risks will not appear. Whoever runs it can load the full official
              lists with <code>npm run data:fetch</code>.
            </p>
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {summary
            ? `${summary.suppliers} suppliers screened, ${findingCount} findings, ${summary.needsReview} need review.`
            : ''}
        </p>

        {run && (
          <section className="section results" aria-labelledby="results-title">
            <h2 id="results-title" ref={resultsTitle} tabIndex={-1} className="results-title">
              Results
            </h2>

            {run.source === SAMPLE_NAME && (
              <div className="remark">
                <p className="box-label">About the sample</p>
                <p>
                  The sample suppliers are fictional. Two names deliberately echo UFLPA-listed entities to show alias and
                  near-spelling matching.
                </p>
              </div>
            )}

            {run.warnings.map((w) => (
              <div key={w} className="remark">
                <p className="box-label">Note on {run.source}</p>
                <p>{w}</p>
              </div>
            ))}

            <Totals key={run.result.generatedAt} result={run.result} />

            <div className="remark remark-caveat">
              <p className="box-label">Before you act</p>
              <p>
                Not on a list ≠ no risk. These lists cover specific goods, countries and entities. Screening starts due
                diligence: next, talk to suppliers, hear from workers, and plan how harm would be remedied.
              </p>
            </div>
          </section>
        )}

        <Register
          key={run?.result.generatedAt ?? 'empty'}
          result={run?.result ?? null}
          refs={refs}
          citeAs={citeAs}
          onExport={() => run && downloadText('salient-risk-register.csv', riskRegisterCsv(run.result))}
        />

        {run && refs && <Entries result={run.result} refs={refs} />}
      </main>

      <footer className="footer">
        <p>Data: U.S. government works, public domain. Every finding cites its dataset and edition.</p>
        <p>Salient is a screening aid, not legal advice. Open source under the MIT license.</p>
      </footer>
    </div>
  );
}
