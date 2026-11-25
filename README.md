# Salient

**Supply chain human rights screening, ranked by risk to people.**

Salient screens a supplier list for forced labor and child labor risk using public U.S. government data:

- the Department of Labor's [*List of Goods Produced by Child Labor or Forced Labor*](https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods)
- the Department of Homeland Security's [*UFLPA Entity List*](https://www.dhs.gov/uflpa-entity-list)

It ranks what it finds by **salience**, the UN Guiding Principles' term for severity of harm *to people*, rather than by spend or brand exposure.

It runs entirely in your browser. Your supplier list never leaves your machine.

**Try it:** https://tamjidb.github.io/salient/

## How to use it

You don't need to install anything or sign up.

1. Open **https://tamjidb.github.io/salient/**.
2. Click **Try sample suppliers** to see a full run on 11 fictional companies.
3. To screen your own list, click **Choose CSV** or drag a file onto box 1. Use one row per supplier, with these columns:
   - `name`, `country` and `product` (required)
   - `spend` (optional, used to show your leverage)

   **Download template** gives you a starter file.

### Reading the results

- **Findings** are listed most severe first, then most likely. Each one says why it was flagged and which list and edition it came from.
- **Needs review** means the match isn't certain. That's either a company name that is close to a listed one, or a product that typically contains a listed input. Check it before acting on it.
- **Leverage** shows each supplier's share of your spend. It helps you plan what to do, but it never changes the ranking.
- **Supplier status:**
  - *Flagged* means the supplier has at least one finding.
  - *No listing found* means nothing matched, which is not the same as no risk.
  - *Not assessed* means the product or country couldn't be recognized. Try a plainer product name, such as "cotton t-shirts" instead of an internal code.
- **Download risk register** saves every finding as a CSV with its source, for your records or a modern slavery statement.

Salient is a screening aid, not legal advice. It's a starting point for due diligence: the next steps are talking to suppliers, hearing from workers, and planning how any harm would be remedied.

## Why

- Mid-sized companies now have human rights obligations: UK Modern Slavery Act statements, Canada's S-211 reports, Australia's Modern Slavery Act statements, US import bans under the UFLPA, and the EU Forced Labour Regulation, which applies from **14 December 2027**. Commercial screening tools are priced for enterprises.
- The data is public but awkward. The DOL list is an Excel file. The UFLPA list exists only as HTML tables, with aliases written inline in prose.
- Most tools rank by **risk to the business**. The UN Guiding Principles ask companies to prioritize by **severity of harm to people**. Salient does that.

## What it does

1. **Import** a CSV of suppliers (name, country, product, optional spend), or try the sample.
2. **Match products to DOL goods**, as the good itself ("cocoa beans" → Cocoa) or as an upstream input ("solar panels" contain Polysilicon).
3. **Screen country × good** against the DOL list.
4. **Screen names** against the UFLPA Entity List, including aliases and former names. Fuzzy matches are scored and marked *needs review*, never auto-confirmed.
5. **Rank by salience.** Severity comes first, then likelihood (UNGP 24). Spend sets your **leverage**, shown alongside each finding, but **never changes the ranking**. A unit test enforces this.
6. **Export** a risk register CSV where every row cites its dataset and edition.

### Built-in honesty

- **"Not on a list ≠ no risk."** Suppliers are either *Flagged*, *No listing found* or *Not assessed*. Never "clear".
- Distance in the supply chain lowers *likelihood*, never *severity*. Harm two tiers up is just as grave for the person it happens to.
- Screening starts due diligence. The app points users on to supplier engagement, worker voice and remedy.
- This is not legal advice.

## Quick start

Requires Node 22.18+ (`.nvmrc` pins 24).

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints, and click **Try sample suppliers**.

The repo ships the **full official lists**:
- the DOL List of Goods, 2024 edition: 530 listings covering 204 goods in 82 countries and areas, including goods made from listed inputs
- the UFLPA Entity List as updated on 28 Oct 2026: 195 entities, with 132 aliases and former names

Refresh them with:

```bash
npm run data:fetch
```

Other commands:

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

## How it works

| Piece | What it does |
|---|---|
| [`packages/engine`](packages/engine) | Pure TypeScript, zero dependencies, browser-safe: country normalization, product matching, UFLPA name matching (Jaro–Winkler / Monge–Elkan), salience scoring |
| [`packages/ingest`](packages/ingest) | Node scripts that fetch and parse the DOL Excel file and the DHS HTML page into `data/*.json`, with sanity thresholds so a format change fails loudly |
| [`apps/web`](apps/web) | React + Vite single-page app. Static, no backend, no analytics, no third-party requests |
| [`data`](data) | Datasets, the curated product synonym table, and sample suppliers |

The full methodology, scope and roadmap are in **[docs/SPEC.md](docs/SPEC.md)**.

## Roadmap

- [ ] Review UI to confirm or override product and entity matches
- [ ] World map of findings
- [ ] Draft statement sections for the UK MSA s.54, Canada S-211 and Australia MSA
- [ ] EU Forced Labour database, once the Commission publishes it
- [ ] Country context: State Department TIP tiers, CBP Withhold Release Orders, DOL *Findings on the Worst Forms of Child Labor*
- [ ] Action tracker for engagement, remedy and effectiveness over time

## Contributing

The easiest high-value contribution is **[`data/product-synonyms.json`](data/README.md#adding-synonyms)**: teach Salient that "sneakers" contain rubber and leather. Please open an issue before large changes.

## License

Code: [MIT](LICENSE). Data: U.S. government works, public domain.
