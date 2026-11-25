# Salient: Product Spec

**Status:** Draft v0.1 · **Last updated:** 2026-11-24

> Supply chain human rights screening, ranked by risk to people.

---

## 1. Summary

Salient is a free, open-source web app. It screens a company's supplier list for **forced labor and child labor risk** using public government data. It ranks what it finds by **salience**, which is the UN Guiding Principles on Business and Human Rights (UNGPs) term for the severity of harm *to people*, not the risk to the business.

Everything runs in the browser. Supplier data never leaves the user's machine.

## 2. Problem

**Obligations are growing faster than small teams can keep up:**

| Regime | Who it applies to | What it asks for |
|---|---|---|
| UK Modern Slavery Act 2015, s.54 | Organizations with turnover ≥ £36m that do business in the UK | Annual slavery and human trafficking statement |
| Canada S-211 (Fighting Against Forced Labour and Child Labour in Supply Chains Act) | Entities meeting 2 of 3: ≥ C$20m assets, ≥ C$40m revenue, ≥ 250 employees (plus listed entities and government institutions) | Annual report, due May 31 |
| Australia Modern Slavery Act 2018 | Entities with consolidated revenue ≥ A$100m | Annual modern slavery statement |
| US UFLPA and Tariff Act s.307 | Anyone importing into the US | Goods linked to Xinjiang or to listed entities are presumed made with forced labor and barred, unless rebutted |
| EU Forced Labour Regulation (EU) 2024/3015 | Anyone placing products on, or exporting from, the EU market | Ban on forced labour products, applying from **14 Dec 2027** |

**Existing tools don't fit these teams:**

- Commercial screening tools are priced for large enterprises. Mid-sized companies use spreadsheets, or skip the work.
- Most tools rank risk by **exposure to the business** (spend, brand, legal). The UNGPs ask companies to prioritize by **severity of harm to people** (UNGP 24).
- The public data exists, but it's scattered and hard to use:
  - The DOL list comes as Excel and PDF.
  - The UFLPA Entity List is only published as HTML tables and Federal Register notices.
  - The EU's risk database has not been published yet, and has missed its original June 2026 deadline.

## 3. Users

**Primary user:** the sustainability, ESG, procurement or compliance lead at a company with roughly 50–5,000 employees. Either they must file a modern slavery statement, or customers keep asking them supply chain due diligence questions.

**Secondary users:** NGOs, journalists, researchers, students, and consultants working with small clients.

**What users need from it:**

1. *"Show me where in my supply chain forced or child labor is most likely, and why."*
2. *"Help me write the risk section of our statement, with evidence I can cite."*
3. *"Tell me if any supplier might be on a US import-ban list."*

## 4. Product principles

1. **Risk to people first.** Rank by salience (severity, then likelihood). Spend affects *leverage*, meaning how much influence you have, but never the ranking.
2. **Show your work.** Every flag cites the dataset, its edition and the matching row.
3. **"Not on a list" ≠ "no risk".** Distinguish *No listing found* from *Not assessed*. Never say "clear".
4. **Possible, not proven.** Fuzzy name matches go to a human for review. They are never confirmed automatically.
5. **Private by default.** No backend, no upload and no analytics. Supplier data never leaves the browser.
6. **Screening starts due diligence; it doesn't finish it.** Prompt users to engage suppliers, hear from workers, and plan remedy (UNGPs Pillar III).
7. **Not legal advice.** Say so wherever output could be mistaken for it.

## 5. Scope

### v0.1 (MVP)

- [x] Import a supplier CSV (name, country, product, optional spend), or try the sample data
- [x] Country normalization that understands DOL spellings (e.g. *"Congo, Democratic Republic of the (DRC)"*, *"Burma"*)
- [x] Match products to DOL goods three ways: directly, as upstream inputs (from a curated synonym table), and by fuzzy matching
- [x] Screen each supplier's country and goods against the DOL list
- [x] Screen supplier names against the UFLPA Entity List, including aliases and former names, with confidence scores
- [x] Salience ranking, with leverage shown separately
- [x] Findings view, supplier view, and risk register export as CSV
- [ ] Review UI for confirming or overriding product and entity matches
- [ ] World map of findings
- [ ] Draft statement sections (UK, Canada, Australia); see [§9](#9-statement-drafting)
- [x] Data refresh pipeline (a scheduled GitHub Action opens a PR when the source data changes)

### v0.2+

- Add the EU Forced Labour database once the Commission publishes it.
- Add country context from public-domain sources: State Department TIP Report tiers, CBP Withhold Release Orders and Findings, and DOL *Findings on the Worst Forms of Child Labor*.
- Match on HS codes for teams that work from customs data.
- Multi-tier mapping: upload tier-2 relationships.
- **Action tracker:** for each finding, record supplier engagement, corrective action and remedy. Track effectiveness year over year, which feeds the "effectiveness" section of every statement.
- Survey templates for hearing directly from workers.
- Desktop app (Tauri) for offline use. Interface translations.

### Non-goals

- Salient is not an audit or certification, and does not grade suppliers pass/fail.
- It does not scrape non-public data, and has no accounts or server.
- It is not legal advice.

## 6. Data sources

| Dataset | Publisher | What it tells us | Format | Cadence | License |
|---|---|---|---|---|---|
| **List of Goods Produced by Child Labor or Forced Labor** (2024 ed., as of Sept 5, 2024; 204 goods, 82 countries/areas) | US DOL, Bureau of International Labor Affairs | Country × good pairs, each with an exploitation type: child labor, forced labor, forced child labor, or *inputs produced with* child or forced labor | Excel + PDF ([page](https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods)) | Every two years | US government work, public domain |
| **UFLPA Entity List** | DHS, Forced Labor Enforcement Task Force | Entities whose goods are presumed made with forced labor and barred from US import | HTML tables only ([page](https://www.dhs.gov/uflpa-entity-list)) plus Federal Register notices; no machine-readable file | Irregular (last updated 2026-10-28) | Public domain |
| **EU forced labour risk database** *(planned)* | European Commission | Indicative risk by geographic area and product | Not yet published | — | To confirm |

**Quirks the ingest code has to handle:**

- **DOL** uses the column `Country/Area | Good | Exploitation Type`. Exploitation types are combined with commas (e.g. `Child Labor, Forced Labor`).
- **DOL** country names are inverted or annotated: `Congo, Democratic Republic of the (DRC)`, `Korea, North`, `Turkey (Türkiye)`, `Burma`, `Kyrgyz Republic`.
- **UFLPA** entries put aliases inline in parentheses, in several forms:
  - `(and two aliases: A; and B)`
  - `(also known as A; B; and C)`
  - `(formerly known as A; and B)`
  - combinations such as `(also known as X; and formerly known as Y)`
- **UFLPA** entries are grouped by statutory section, 2(d)(2)(B)(i)–(v), and dates are formatted `Month D, YYYY`.

## 7. How screening works

All logic lives in `packages/engine`. It's pure TypeScript with zero dependencies and is unit-tested.

### 7.1 Input

The input is a CSV with one row per supplier. Common column names are recognized automatically:

| Field | Required | Accepted headers (case-insensitive) |
|---|---|---|
| name | yes | name, supplier, supplier name, vendor, company |
| country | yes | country, country of origin, origin, location |
| product | yes | product, products, goods, commodity, category, description |
| spend | no | spend, annual spend, amount, value |

### 7.2 Country normalization

Country names go through these steps before comparison:

1. Strip parentheticals.
2. Un-invert `"X, Y"` to `"Y X"`.
3. Fold accents and punctuation.
4. Drop filler words (*the, of, and*).
5. Map known aliases (Ivory Coast → Côte d'Ivoire, Myanmar → Burma, DRC → Democratic Republic of the Congo, Türkiye → Turkey, and so on).

### 7.3 Product → DOL good matching

| Method | Example | Relation | Base likelihood |
|---|---|---|---|
| Exact | "cocoa" → *Cocoa* | is | 4 |
| Token | "raw cotton" → *Cotton* | is | 4 |
| Synonym (is) | "t-shirts" → *Garments* | is | 4 |
| Synonym (contains) | "solar panels" → *Polysilicon* | contains (upstream input) | 3 |
| Fuzzy (typo) | "coton" → *Cotton* | is | 3 |

- Synonyms live in [`data/product-synonyms.json`](../data/product-synonyms.json). They're curated by hand and open to contributions.
- When a synonym covers a phrase, any generic token matches inside that phrase are suppressed. For example, "cocoa beans" maps to *Cocoa*, not to *Beans*.
- If the DOL listing itself is an *inputs produced with* type, the likelihood drops by one more point.

### 7.4 Entity matching (UFLPA)

Names are normalized first:

- Fold accents and punctuation.
- Drop legal forms (Co., Ltd., Inc., GmbH, …).
- Stem plurals.

Each supplier is then compared with every listed name, alias and former name:

- **Exact** (normalized tokens are identical) → likelihood 5.
- **Strong** (Monge–Elkan Jaro–Winkler ≥ 0.95, taking the *minimum* of both directions so that both names must be covered) → likelihood 4.
- **Possible** (≥ 0.88, or one name's tokens fully contained in the other's with at least one distinctive token) → likelihood 3.
- **Every non-exact match is marked *needs review*.**

### 7.5 Salience

This follows the UNGPs and their Interpretive Guide.

**Severity (1–5)** combines scale (how grave), scope (how many people), and irremediable character (whether it can be undone).

- Every harm in the current datasets (forced labor, forced child labor, child labor) is among the most severe, so all default to **5**.
- Distance in the supply chain does **not** reduce severity. A harm two tiers up is just as grave for the person suffering it. Distance only affects likelihood.
- The field exists so that future datasets (wages, hours, occupational safety) can sit on the same scale.
- Severity defaults are configurable and documented, and should be calibrated with practitioners and affected stakeholders.

**Likelihood (1–5)** comes from match strength and directness (see §7.3 and §7.4).

**Ranking:** severity first, then likelihood. This follows UNGP 24: address the most severe impacts first, and those where delay would make them irremediable.

**Bands:**

| Band | Rule |
|---|---|
| Critical | severity ≥ 5 and likelihood ≥ 4 |
| High | severity ≥ 4 and likelihood ≥ 3 |
| Moderate | everything else |

**Leverage** is based on the supplier's share of total spend: ≥ 10% is *high*, 2–10% is *medium*, < 2% is *low*. It's shown next to each finding to help plan action, and **is never used in ranking**. A unit test enforces this.

### 7.6 Supplier status

| Status | Meaning |
|---|---|
| **Flagged** | One or more findings |
| **No listing found** | The product was recognized and the country is known, but the lists have no matching entry. *This is not a clean bill of health.* |
| **Not assessed** | The product couldn't be matched, or the country is missing. The name was still screened against UFLPA. |

## 8. Architecture

```
salient/
├── packages/engine   Pure TS screening logic (normalize, match, score). Browser-safe, zero deps.
├── packages/ingest   Node scripts: fetch + parse DOL Excel and DHS HTML → data/*.json
├── apps/web          React + Vite single-page app. Static, no backend.
├── data/             Versioned datasets + curated synonym table + sample suppliers
└── .github/workflows CI (typecheck, test, build) · Pages deploy · weekly data refresh PR
```

- **Hosting:** static files on GitHub Pages.
- **Runtime network calls:** none beyond loading the app itself.
- **Data refresh:** a scheduled workflow runs the ingest code. If anything changed, it opens a pull request for a human to review.
  - Parsers enforce sanity thresholds: for example, they fail if fewer than 100 DOL rows parse.
  - This means a format change in a source breaks loudly, instead of quietly emptying the lists.

## 9. Statement drafting

Salient drafts a **structure plus a risk section** for each regime. It fills the risk section with the user's findings and citations, and marks every other section *to complete*.

| Regime | Sections (from the law) |
|---|---|
| UK MSA s.54(5) | (a) structure, business and supply chains · (b) policies · (c) due diligence · (d) risk assessment and management · (e) effectiveness and KPIs · (f) training |
| Canada S-211 s.11(3) | structure, activities and supply chains · policies and due diligence · parts at risk and steps taken · remediation measures · remediation of loss of income to vulnerable families · training · how effectiveness is assessed |
| Australia MSA s.16(1) | identify the entity · structure, operations and supply chains · risks · actions taken (including due diligence and remediation) · how effectiveness is assessed · consultation with owned and controlled entities · other relevant information |

All drafts are labeled *Draft, not legal advice*. Thresholds and section lists must be checked against current law before each release.

## 10. Success measures

- **Speed:** 1,000 suppliers screened in under 2 seconds on a mid-range laptop.
- **Matching quality:** a labeled benchmark of real alias variants and decoy names, aiming for ≥ 95% recall on true aliases and < 2% false positives on decoys.
- **Adoption:** GitHub stars and forks, outside contributors to the synonym table, and at least one organization that uses Salient to inform a published statement.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| False positives harm innocent suppliers | "Possible match" wording, mandatory review, no automatic conclusions, scores always shown |
| False comfort (missed risk) | "Not on a list ≠ no risk" shown prominently, a *Not assessed* status, and prompts to engage suppliers and workers |
| Stale data | Dataset edition shown on every screen and export; weekly refresh PR; warning when data is old |
| A source changes its format | Parser tests, sanity thresholds, and refreshes delivered as PRs so a human reviews each one |
| Publication cadence of a source changes | Each dataset's edition date is always visible; the source list can be extended |
| Output mistaken for legal advice | Disclaimers on every draft and export |

## 12. Open questions

1. Confirm the DOL Excel column layout on first fetch. The parser supports both the *Exploitation Type* layout and a one-column-per-type layout.
2. Does dhs.gov block automated fetches from CI runners? If so, fall back to Federal Register notices.
3. Default leverage thresholds (10% / 2%): validate them with practitioners.
4. Should child labor and forced labor default to different severities? They're equal for now; seek practitioner input.
5. How should the EU database be presented once it's live? It's "indicative" by design.

## 13. Milestones

| Milestone | Contents |
|---|---|
| **M0: Scaffold** *(this commit)* | Engine core with tests, sample data, app shell, CI |
| **M1: Real data** | Official lists ingested; review UI for matches |
| **M2: Outputs** | Map, statement drafts, polished export |
| **M3: Launch** | GitHub Pages demo, README GIF, LinkedIn post |
