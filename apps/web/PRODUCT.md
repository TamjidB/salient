# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** sustainability, ESG, procurement or compliance leads at companies of roughly 50 to 5,000 employees. They either must file a modern slavery statement or are fielding due diligence questions from customers. They need to find where forced or child labor is most likely in their supply chain, and why, and to cite evidence for it. They usually have no budget for enterprise screening tools.

**Secondary** (per docs/SPEC.md): NGOs, journalists, researchers, students, and consultants working with small clients.

## Product Purpose

Salient screens a supplier list (name, country, product, optional spend) against two public U.S. government datasets:

- the DOL *List of Goods Produced by Child Labor or Forced Labor*
- the DHS *UFLPA Entity List*

It ranks findings by salience, meaning severity of harm to people first and likelihood second (UNGP 24). Success means a lead can triage the top risks, review the uncertain matches, and export a cited risk register to support their statement.

The product is also the author's open-source portfolio piece, shown publicly on LinkedIn and GitHub.

## Positioning

- **Ranks by risk to people, not risk to the business.** Spend sets *leverage* and is shown beside each finding, but never changes the ranking. A unit test enforces this.
- **Runs entirely in the browser.** Supplier data never leaves the machine.
- **Free and open source,** built on public-domain data, with every finding citing its dataset and edition.

## Operating Context

- **How users arrive:** with a spreadsheet exported from procurement or ERP systems, often during the annual reporting cycle for the UK Modern Slavery Act s.54, Canada S-211 (due May 31), or the Australia Modern Slavery Act.
- **What they do in the app:** screen, triage, review possible matches, and download a risk register CSV for their statement or internal review.
- **Secondary context:** short public demos and screenshots for LinkedIn.

## Capabilities and Constraints

**Built today:**

- CSV import with flexible headers
- Country normalization that handles DOL spellings
- Matching products to DOL goods, as the good itself or as an upstream input
- Fuzzy matching of supplier names against UFLPA names and aliases
- Severity, likelihood and band (critical, high, moderate) for each finding
- Leverage from spend share
- Supplier statuses: Flagged / No listing found / Not assessed
- Risk register CSV export

**Constraints:**

- Static single-page app (React + Vite).
- No backend, no analytics, and no third-party requests at runtime. Fonts must be self-hosted or system fonts.
- The repo ships sample data until `npm run data:fetch` is run, and the UI must say so.

**Not decided yet (roadmap):** a review UI for confirming matches, a world map, and draft statement sections.

## Brand Commitments

- **Name:** Salient. **Tagline:** "Supply chain human rights screening, ranked by risk to people."
- **Voice:** evidence, not campaign. It must read as a credible research instrument whose findings someone would cite.
- **Must not feel:** alarmist, like an activist poster, or playful (confirmed by the user).
- **Honesty commitments the UI must keep:**
  - "Not on a list ≠ no risk."
  - Never label a supplier "clear."
  - Non-exact matches are always marked *needs review*.
  - Screening is presented as the start of due diligence (next: supplier engagement, worker voice, remedy).
  - "Not legal advice."
- **Design source (pinned by the user):** follow Hallmark (github.com/nutlope/hallmark) together with Impeccable.

## Evidence on Hand

- **Data:**
  - `data/dol-goods.json`: sample subset, 7 hand-checked listings plus the 2024 goods vocabulary
  - `data/uflpa-entities.json`: 4 entries copied verbatim from dhs.gov
  - `data/product-synonyms.json`
  - `data/sample/suppliers.csv`: fictional companies, plus two rows that echo listed names
- **Absences:** no users, customers, testimonials, press or benchmarks exist. Do not invent any.

## Product Principles

1. Risk to people first; leverage informs action, never rank.
2. Show your work: every flag cites its dataset, edition and matching row.
3. Possible, not proven: uncertainty is shown, never hidden or auto-resolved.
4. Private by default: nothing leaves the browser.
5. Screening starts due diligence; it doesn't finish it.
