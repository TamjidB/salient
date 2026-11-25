import { useRef, useState, type CSSProperties, type DragEvent } from 'react';
import type { DatasetMeta } from '@salient/engine';
import { downloadText, TEMPLATE_CSV } from '../csv';

interface Props {
  onCsv: (text: string, source: string) => void;
  onSample: () => void;
  datasets: DatasetMeta[];
  fileName: string | null;
  screenedOn: string | null;
}

const order = (i: number) => ({ '--i': i }) as CSSProperties;

function FillLine() {
  return <span className="fill-line" aria-hidden="true" />;
}

export function EntryForm({ onCsv, onSample, datasets, fileName, screenedOn }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = async (file: File | undefined) => {
    if (file) onCsv(await file.text(), file.name);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void readFile(e.dataTransfer.files[0]);
  };

  return (
    <section className="entry" aria-label="Screening entry">
      <div
        className={`box box-supplier${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p className="box-label">
          <span className="box-no">1</span> Supplier list
        </p>
        <p className="box-value">
          {fileName ? (
            <span className="typed" key={fileName} style={order(0)}>
              {fileName}
            </span>
          ) : (
            <FillLine />
          )}
        </p>
        <p className="box-help">
          Drop a CSV here with <code>name</code>, <code>country</code> and <code>product</code> columns. Add{' '}
          <code>spend</code> to see your leverage.
        </p>
        <div className="actions">
          <button type="button" className="button button-primary" onClick={() => input.current?.click()}>
            Choose CSV
          </button>
          <button type="button" className="button" onClick={onSample}>
            Try sample suppliers
          </button>
          <button type="button" className="text-link" onClick={() => downloadText('salient-template.csv', TEMPLATE_CSV)}>
            Download template
          </button>
        </div>
        <p className="privacy-inline">Processed in this browser. Nothing is uploaded.</p>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          aria-label="Supplier list CSV"
          hidden
          onChange={(e) => {
            void readFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <div className="box box-editions">
        <p className="box-label">
          <span className="box-no">2</span> Data editions
        </p>
        <ul className="editions">
          {datasets.map((d) => (
            <li key={d.name}>
              <a href={d.sourceUrl} target="_blank" rel="noreferrer">
                {d.name}
              </a>
              <span className="muted">{d.edition}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="box box-processed">
        <p className="box-label">
          <span className="box-no">3</span> Processed
        </p>
        <p className="box-printed">In this browser. Nothing is uploaded.</p>
      </div>

      <div className="box box-date">
        <p className="box-label">
          <span className="box-no">4</span> Screened on
        </p>
        <p className="box-value figure">
          {screenedOn ? (
            <span className="typed" key={`${fileName}-date`} style={order(1)}>
              {screenedOn}
            </span>
          ) : (
            <FillLine />
          )}
        </p>
      </div>
    </section>
  );
}
