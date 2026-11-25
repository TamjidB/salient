import type { DolDataset, ProductSynonym, UflpaDataset } from '@salient/engine';
import dolJson from '../../../data/dol-goods.json';
import uflpaJson from '../../../data/uflpa-entities.json';
import synonymsJson from '../../../data/product-synonyms.json';
import sampleSuppliersCsv from '../../../data/sample/suppliers.csv?raw';

// JSON imports are typed structurally; the ingest scripts guarantee the shape.
export const dol = dolJson as unknown as DolDataset;
export const uflpa = uflpaJson as unknown as UflpaDataset;
export const synonyms = synonymsJson as unknown as ProductSynonym[];
export const sampleCsv: string = sampleSuppliersCsv;

export const usingSampleData = dol.meta.sample || uflpa.meta.sample;
