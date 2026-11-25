export * from './types';
export { foldText, stem, tokenize, stripParentheticals } from './normalize';
export { jaroWinkler, softTokenSimilarity } from './similarity';
export { countryKey, sameCountry } from './countries';
export { buildProductIndex, matchProduct, goodKey, type ProductIndex } from './products';
export { buildEntityIndex, matchEntity, entityTokens, ENTITY_THRESHOLDS, type EntityIndex } from './entities';
export {
  DEFAULT_SEVERITY,
  EXPLOITATION_LABEL,
  LEVERAGE_THRESHOLDS,
  bandFor,
  compareSalience,
  dolLikelihood,
  leverageFor,
  makeSalience,
  severityFor,
  uflpaLikelihood,
} from './salience';
export { createScreener, screenSuppliers, screen, type Screener, type ScreeningData } from './screen';
