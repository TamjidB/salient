# Data

| File | What it is | Source |
|---|---|---|
| `dol-goods.json` | DOL *List of Goods Produced by Child Labor or Forced Labor*: the goods vocabulary plus country × good listings | [dol.gov](https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods), written by `npm run data:fetch` |
| `uflpa-entities.json` | DHS *UFLPA Entity List*, with aliases, former names, statutory sections and effective dates | [dhs.gov](https://www.dhs.gov/uflpa-entity-list), written by `npm run data:fetch` |
| `product-synonyms.json` | Hand-curated map from everyday product words to DOL goods, as the good itself (`is`) or as an upstream input (`contains`) | This repo. Contributions welcome |
| `sample/suppliers.csv` | Demo supplier list (fictional companies, apart from two rows that echo listed names to show alias matching) | This repo |

## Sample vs official

The committed `dol-goods.json` and `uflpa-entities.json` start as **small samples** (`"sample": true`). They hold a handful of entries checked against the source pages by hand. The app shows a banner while sample data is loaded.

Run this to replace them with the full official lists:

```bash
npm run data:fetch
```

The fetch fails without writing anything if a source changes shape, using sanity thresholds and unknown-category checks. A weekly GitHub Action runs it and opens a PR when the data changes.

## Licensing

Both lists are works of the U.S. federal government and in the public domain. Cite the publisher and edition when you reuse findings; every Salient finding carries both.

## Adding synonyms

Each entry maps a phrase to one or more DOL goods, spelled **exactly** as in `dol-goods.json`:

```json
{ "phrase": "solar panel", "goods": [
  { "good": "Solar Modules", "relation": "is" },
  { "good": "Polysilicon", "relation": "contains" }
]}
```

- Phrases are matched after lowercasing, accent folding and simple plural stemming. For example, "Solar Panels" matches "solar panel".
- Use `contains` only for inputs that are typical of the product, and that are actually listed as goods. A `contains` match lowers likelihood by one point.
- Targets that aren't in the vocabulary are ignored.
