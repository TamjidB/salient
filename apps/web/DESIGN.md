---
name: Salient
description: Supply chain human rights screening, ranked by risk to people.
colors:
  paper: "oklch(97.6% 0.004 175)"
  paper-2: "oklch(95% 0.007 175)"
  ink: "oklch(21% 0.014 250)"
  ink-2: "oklch(34% 0.014 250)"
  muted: "oklch(47% 0.012 240)"
  form: "oklch(47% 0.08 172)"
  form-rule: "oklch(82% 0.045 172)"
  form-rule-strong: "oklch(62% 0.07 172)"
  rule: "oklch(89% 0.012 175)"
  hatch: "oklch(80% 0.03 172)"
  select: "oklch(88% 0.06 172)"
  focus: "oklch(45% 0.11 172)"
  critical: "oklch(46% 0.14 32)"
  high: "oklch(49% 0.1 70)"
  moderate: "oklch(46% 0.025 250)"
typography:
  display:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.488rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.44rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8333rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label-strong:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8333rem"
    fontWeight: 700
    letterSpacing: "normal"
    fontFeature: "tnum"
  typed:
    fontFamily: "'Courier Prime', ui-monospace, 'Courier New', monospace"
    fontSize: "1.0625em"
    fontWeight: 400
  figure:
    fontFamily: "'Courier Prime', ui-monospace, 'Courier New', monospace"
    fontSize: "calc(1.728rem * 1.0625)"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "tnum"
rounded:
  pip: "1px"
  box: "2px"
  control: "4px"
spacing:
  3xs: "2px"
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.paper-2}"
  text-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    padding: "8px 0"
  text-link-hover:
    textColor: "{colors.ink}"
  form-grid:
    backgroundColor: "{colors.form-rule}"
    rounded: "{rounded.box}"
  form-box:
    backgroundColor: "{colors.paper}"
    padding: "8px 16px 16px"
  form-box-dragging:
    backgroundColor: "{colors.paper-2}"
  form-box-label:
    textColor: "{colors.form}"
    typography: "{typography.label}"
  form-box-number:
    textColor: "{colors.form}"
    typography: "{typography.label-strong}"
  form-box-value:
    textColor: "{colors.ink}"
    typography: "{typography.typed}"
  remark:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.box}"
    padding: "8px 16px 12px"
  remark-error-label:
    textColor: "{colors.critical}"
  total-critical:
    textColor: "{colors.critical}"
    typography: "{typography.figure}"
  total-high:
    textColor: "{colors.high}"
    typography: "{typography.figure}"
  total-moderate:
    textColor: "{colors.moderate}"
    typography: "{typography.figure}"
  total-neutral:
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
  band-critical:
    textColor: "{colors.critical}"
    typography: "{typography.label-strong}"
  band-high:
    textColor: "{colors.high}"
    typography: "{typography.label-strong}"
  band-moderate:
    textColor: "{colors.moderate}"
    typography: "{typography.label-strong}"
  ramp-pip:
    size: "11px"
    rounded: "{rounded.pip}"
  ramp-pip-on:
    backgroundColor: "{colors.ink}"
    size: "11px"
    rounded: "{rounded.pip}"
  status-flagged:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.box}"
    padding: "0 8px"
  status-needs-review:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.box}"
    padding: "0 8px"
  status-no-listing:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.box}"
    padding: "0 8px"
  status-not-assessed:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.box}"
    padding: "0 8px"
  ref-code:
    textColor: "{colors.form}"
    typography: "{typography.label-strong}"
  ref-arrival:
    backgroundColor: "{colors.select}"
  register-head:
    textColor: "{colors.form}"
    typography: "{typography.label}"
  register-row:
    padding: "16px 0"
  masthead-form-title:
    textColor: "{colors.form}"
    typography: "{typography.label}"
---

# Design System: Salient

## Overview

**Creative North Star: "The Entry Summary"**

Salient is drawn as a ruled declaration form. Every supplier is an entry typed onto the form, and every finding is a reviewer's annotation ranked by harm to people. The form itself is printed in drop-out green on cool form stock; whatever the user supplied arrives typed in Courier Prime, in blue-black ink. The result reads as a research instrument whose output someone would cite. It is deliberately neither a KPI-card ESG dashboard nor a red-alert activist board, and it is never alarmist or playful.

Density is that of a working form: information-dense but calm, one centred column, structure carried entirely by rules. Hairline box rules are drawn once by a 1px grid gap, dotted fill lines stand in for fields not yet entered, and a 3px double rule closes the masthead, the table total and the page. Colour is scarce on purpose. Green belongs to the printed form, ink belongs to what was entered, and the three band inks (deep oxide, ochre, slate) are held in reserve for the band word and the totals. Dark is derived rather than inverted: the same form at night, lamps low.

The governing craft rules come from Hallmark (github.com/nutlope/hallmark), pinned by the user alongside Impeccable: OKLCH tokens only, declared on `:root`; at most two families and two weights; untracked sentence-case labels with no eyebrows; no em dashes in copy; no shadows and no card in a card; tables with horizontal rules only; exactly one filled primary button; an instant focus-visible ring; reduced-motion fallbacks; `overflow-x: clip` on the page; a capped, centred container. Fonts are self-hosted, so the page makes no third-party requests. The form borrows the grammar of customs paperwork but never a real government form's identity: no official form numbers, seals or agency marks.

**Key Characteristics:**
- Printed versus typed: Public Sans in drop-out green for the form, Courier Prime in ink for every entered value.
- Numbered form boxes whose internal rules are a 1px gap over the rule colour.
- Dotted fill lines mark every blank field, including the empty register.
- Status carried by rule form (solid, dashed, hairline, hatched), never by hue alone.
- One fixed five-box check ramp for severity and likelihood, identical everywhere.
- F- and S- reference codes cross-link the register, the supplier table and the export.
- Band colour appears only on the band word and the band totals.
- Flat: no shadows, no cards, no side stripes.
- One signature motion: entries type into the form.

## Colors

Cool form stock, blue-black ink and drop-out green, with three muted band inks held in reserve. Every colour is an OKLCH custom property on `:root`; the frontmatter carries the light (default) values, and the dark scheme re-points the same tokens under `prefers-color-scheme: dark` (skipped when `data-theme="light"` is set on the root).

### Primary
- **Drop-Out Green** (`--color-form`; light oklch(47% 0.08 172), dark oklch(76% 0.075 172)): the printed form's ink. Box numbers and labels, column heads, group labels, the masthead's form title, the "Cite as" label, reference codes, phone-layout field labels and the text caret. Never used for anything the user entered.
- **Box Rule Green** (`--color-form-rule`; light oklch(82% 0.045 172), dark oklch(36% 0.04 172)): the background that shows through the 1px gaps of a form grid, so it is the colour of every internal box rule; also the outer rule of form grids and remarks fields.
- **Strong Rule Green** (`--color-form-rule-strong`; light oklch(62% 0.07 172), dark oklch(52% 0.06 172)): rules that must read at a glance. Dotted fill lines, column-head underlines, 3px double closing rules, outline-button borders, empty ramp pips, link underlines, the not-assessed status border, the dashed drop-target outline and the table scrollbar thumb.
- **Hatch Green** (`--color-hatch`; light oklch(80% 0.03 172), dark oklch(38% 0.035 172)): the 1px stroke of the 135° hatch on the not-assessed status, like a form's "no entry" box.
- **Arrival Tint** (`--color-select`; light oklch(88% 0.06 172), dark oklch(38% 0.06 172)): text selection and the arrival state of a register row or table row reached through an F- or S- link.
- **Focus Green** (`--color-focus`; light oklch(45% 0.11 172), dark oklch(80% 0.11 172)): the 2px focus-visible outline, and nothing else.

### Secondary
The band inks. Muted, dark and serious, so a critical finding reads as grave rather than as an alarm.
- **Deep Oxide** (`--color-critical`; light oklch(46% 0.14 32), dark oklch(73% 0.13 32)): the critical band word and the critical total. It doubles as the border and label colour of the "Problem with that file" remark.
- **Ochre** (`--color-high`; light oklch(49% 0.1 70), dark oklch(79% 0.11 75)): the high band word and the high total. Note the dark value shifts hue from 70 to 75.
- **Slate** (`--color-moderate`; light oklch(46% 0.025 250), dark oklch(76% 0.02 250)): the moderate band word and the moderate total.

### Neutral
- **Form Stock** (`--color-paper`; light oklch(97.6% 0.004 175), dark oklch(17.5% 0.008 200)): the page, the face of every form box, the outline button, and the text of the filled button.
- **Shaded Stock** (`--color-paper-2`; light oklch(95% 0.007 175), dark oklch(21% 0.01 200)): the only resting tint, and only as a state: outline-button hover and the supplier box while a file is dragged over it.
- **Blue-Black Ink** (`--color-ink`; light oklch(21% 0.014 250), dark oklch(93% 0.006 175)): body text and every entered value, the filled primary button, checked ramp pips, the mark's filled square and the flagged status rule.
- **Second Ink** (`--color-ink-2`; light oklch(34% 0.014 250), dark oklch(83% 0.008 175)): supporting prose (lede, help, legends, remarks, rationale, source lines), the text link, the dashed needs-review mark, and the primary button's hover fill.
- **Faded Ink** (`--color-muted`; light oklch(47% 0.012 240), dark oklch(70% 0.012 190)): secondary detail. Edition lines, the supplier's country and product line, spend share in the register, "none" placeholders and the footer.
- **Row Hairline** (`--color-rule`; light oklch(89% 0.012 175), dark oklch(28% 0.015 190)): the bottom rule of every register row and table body row, and the no-listing status border.

### Named Rules
**The Drop-Out Rule.** Everything printed on the form (box numbers, labels, column heads, reference codes, the form title) is drop-out green; everything entered onto it is ink. Green never carries the user's data.

**The Band-Word Rule.** Band colour appears in exactly two places: the band word in a register row and the band figures in the Findings totals. Never as fills, row tints, borders, stripes, ramp pips or icons. The oxide's only other job is the file-problem remark.

**The Derived Night Rule.** Dark mode re-points the same tokens to the same hues at low lamp: paper drops to 17.5% lightness, ink rises to 93%, and the greens and band inks lighten until they hold contrast. Nothing is inverted, and no token exists only in dark.

## Typography

**Display Font:** Public Sans (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Public Sans (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Courier Prime (with ui-monospace, 'Courier New', monospace)

**Character:** Public Sans is the printed form: plain, civic and exact. Courier Prime is the typewriter that filled it in. Both are self-hosted through @fontsource at 400 and 700 only, with `font-synthesis: none` so no faux weights appear. The scale is a 1.2 ratio (0.8333, 1, 1.2, 1.44, 1.728rem); display skips a step to 2.488rem (1.2 to the fifth).

### Hierarchy
- **Display** (Public Sans 700, 1.728rem on phones and 2.488rem from 640px, line-height 1.1, -0.025em, max 22ch, balanced): the single page headline.
- **Headline** (Public Sans 700, 1.44rem, line-height 1.2, -0.015em): section titles. Results, Salience register, Supplier entries.
- **Title** (Public Sans 700, 1.2rem, -0.01em): the wordmark. Box values and the phone-layout supplier name share the 1.2rem size in the typed face.
- **Body** (Public Sans 400, 1rem, line-height 1.55): all prose, wrapped with `text-wrap: pretty`. Measures are capped per role: lede 64ch, box help 52ch, finding title 68ch, rationale 72ch, legend 70ch, remarks 80ch, citation 96ch.
- **Label** (Public Sans 400, 0.8333rem, line-height 1.4, normal tracking, sentence case): every printed label, in drop-out green. Box labels, column heads, group labels, the form title and the "Cite as" label. Status marks and the needs-review mark use this size in ink.
- **Label strong** (Public Sans 700, 0.8333rem, tabular figures): box numbers, F- and S- reference codes, and band words.
- **Typed** (Courier Prime 400, 1.0625 times the surrounding size): everything entered. The file name, the screening date, supplier names, countries, products, spend shares, the inline code for column names. Courier Prime 700 appears only in the table's total row, which is bold.
- **Figure** (Courier Prime 400, 1.728rem scaled by 1.0625, line-height 1.2, tabular): the counts in the totals groups.

### Named Rules
**The Printed and Typed Rule.** Public Sans is the form: headings, labels, instructions, findings and their rationale. Courier Prime is what was entered onto it: file name, date, supplier data, spend shares and totals. Never set a label in Courier Prime or a supplier name in Public Sans.

**The Untracked Label Rule.** Labels are sentence case at 0.8333rem with normal letter-spacing. No uppercase, no added tracking, no eyebrow or kicker above a heading. Negative tracking belongs to the display, headline and wordmark only.

## Layout

One centred column capped at 1160px (`--container`), with a 16px side gutter on phones, 24px from 640px and 40px from 1024px. `overflow-x: clip` on `html` and `body` guarantees no sideways page scroll. Spacing runs on a fixed scale (2, 4, 8, 12, 16, 24, 40, 64px). The intro sits 40px below the masthead with 24px beneath it, sections are 64px apart, a section head sits 16px above its content, remarks are 16px apart, and the footer opens 64px below the last section.

- **Entry grid:** one column on phones. From 760px it becomes three columns (1.7fr, 1fr, 1fr); box 1 spans two rows, box 2 spans two columns, and boxes 3 and 4 share the second row. Below 760px the privacy line repeats inside box 1 because box 3 falls below the fold.
- **Totals:** each group is two columns on phones (an odd last box spans the row so no empty ruled cell shows) and as many columns as fields from 640px. The two groups stand side by side from 1024px, 24px apart.
- **Register:** from 960px, a seven-column grid of 48px ref, 104px band, a flexible supplier column (min 180px, 1.3fr), a flexible finding column (min 240px, 2.2fr), 72px severity, 72px likelihood and 84px right-aligned leverage, with 16px column gaps. Below 960px the head row hides and each row restacks into three columns: ref with band and review mark, then supplier, then finding, then severity, likelihood and leverage with visible labels.
- **Supplier entries:** a table from 760px inside a horizontally scrollable region. Below 760px each row restacks into a labelled grid (ref and status, supplier name, country and product, then goods, findings and spend share), and only the last three carry printed labels.
- **Touch:** on coarse pointers buttons rise to a 44px minimum height.

**The Restack Rule.** On narrow screens, the register and the supplier table restack into labelled fields. Nothing on a phone scrolls sideways to be read.

## Elevation & Depth

Salient is completely flat. There is no `box-shadow` anywhere, no raised surface and no layered panel. Depth and grouping come from a hierarchy of rules instead: the faint row hairline (`--color-rule`), the box rule (`--color-form-rule`), the strong rule for column heads and fill lines (`--color-form-rule-strong`), and the 3px double rule that closes a region. Only two tints exist, and both are states: shaded stock for hover and an active drop target, and the arrival tint for a linked row and text selection.

**The Rules-Not-Shadows Rule.** Structure is drawn with rules, never lifted with shadow. If something needs separation, give it a rule of the right weight; if it needs emphasis, give it ink.

## Shapes

Near-square throughout. Ruled boxes, remarks fields, status marks and the needs-review mark take a 2px radius; buttons take 4px; ramp pips take 1px; the mark's box has a 1.5 radius in its 20-unit viewBox. Nothing is pill-shaped or circular.

The line itself is the shape language, and each form carries meaning:
- **Solid hairline (1px):** box rules, row rules, flagged status, remarks fields.
- **Dotted (1px):** a fill line, meaning nothing has been entered here yet.
- **Dashed (1px):** a person must still look (needs review); dashed 2px, inset 8px, marks box 1 as an active drop target.
- **Hatched (135°, 1px stroke every 5px):** not assessed, like a form's "no entry" box.
- **Double (3px):** a closing rule. Under the masthead, above the table's total row and above the footer.

**The Near-Square Rule.** Corners stay at 2px for boxes and 4px for controls. Rounder corners would turn the form into a card.

## Components

### Buttons
Plain and confident, like the controls printed on an official form.
- **Shape:** gently squared (4px radius), 40px minimum height (44px on coarse pointers), 16px side padding, Public Sans 700 at body size.
- **Primary:** filled blue-black ink with form-stock text and a matching ink border. There is exactly one on the page: "Choose CSV" in box 1.
- **Outline:** form-stock face, ink text, 1px strong-rule-green border. Used for every other button ("Try sample suppliers", "Download risk register").
- **Hover / Focus:** primary hover fills with second ink; outline hover shades to shaded stock. Hover is instant (no transitions). Focus is the global 2px focus-green outline at 2px offset. `:active` nudges down 1px, removed under reduced motion. Disabled drops to 0.55 opacity with a not-allowed cursor.
- **Hit area:** an `::after` band extends 3px above and below and 1px to each side, so the target is taller than the drawn button.
- **Text link:** for minor actions ("Download template"). Second-ink text, 1px strong-rule-green underline at 3px offset, 8px vertical padding; hover turns text and underline to ink.

### Chips (status marks)
- **Style:** inline marks at label size with 0 8px padding and a 2px radius, carried by rule form rather than fill.
- **Flagged:** 1px solid ink rule, ink text.
- **Needs review:** 1px dashed second-ink rule, second-ink text. Appears beside the band word in the register.
- **No listing found:** 1px solid row-hairline rule, second-ink text. Deliberately the quietest mark, never a green "clear".
- **Not assessed:** 1px strong-rule-green rule over a 135° hatch of hatch green on form stock, ink text.

### Cards / Containers
There are no cards. The two container forms are form fields:
- **Numbered form boxes:** a grid whose background is box rule green, with a 1px gap and a 1px outer rule in the same colour and a 2px radius. Each box has a form-stock face and 8px 16px 16px padding, so the gap draws every internal rule exactly once. A box opens with its label line: a bold tabular number, then the sentence-case label, both in drop-out green.
- **Remarks field:** the form's remarks box. A 1px box-rule-green rule, 2px radius, 8px 16px 12px padding, no fill. A green label ("Remarks", "About the sample", "Before you act", "Note on [file]") over second-ink text capped at 80ch. The error variant ("Problem with that file") turns its rule and label deep oxide and is announced as an alert.

### Inputs / Fields
- **Style:** the "input" is box 1 of the form. The file control is hidden and opened by the primary button; the whole box is the drop zone.
- **Blank field:** a dotted fill line (1px dotted strong rule green, 1.4em tall) wherever no value has been entered. The box value keeps a 1.75em minimum height so filling it in doesn't shift the layout.
- **Filled field:** the value types in, in Courier Prime at 1.2rem scaled by 1.0625.
- **Drag over:** the box shades to shaded stock and gains a 2px dashed strong-rule-green outline inset 8px.
- **Error:** reported in an error remarks field below the form, not inside the box.

### Navigation
- **Masthead:** the form's head strip. The wordmark (the mark plus "Salient" in 1.2rem Public Sans 700, -0.01em) sits left, followed by the form title "Screening entry summary" in drop-out green at label size. 16px above, 12px below, closed by a 3px double strong-rule-green rule. There is no menu; the page is a single form.
- **The mark:** a checked form box. A 20px square with a 1.5px drop-out green stroke and a solid ink square inside.
- **Links:** inherit text colour, with a 1px strong-rule-green underline at 3px offset that turns to the current colour on hover.

### Totals groups
Two ruled groups that each reconcile to their own label: "Findings [n], of which [n] need review" over Critical, High and Moderate; "Suppliers screened [n]" over Flagged, No listing found and Not assessed. The group label is drop-out green at label size with its total in bold ink and the note in second ink. The boxes use the 1px gap technique; each holds a green label and a typed figure. Findings figures take their band ink; supplier figures stay ink.

### Check ramp
A fixed five-box ramp for severity and likelihood: five 11px squares, 3px apart, each with a 1px strong-rule-green border and a 1px radius; checked boxes fill and border with ink. It is identical everywhere, takes no band colour, is exposed as an image labelled "[measure] [n] of 5", and a single-box legend explains it in the register's legend line.

### Salience register row
Each finding is one ordered list row, most salient first, separated by a row hairline with 16px vertical padding. Left to right: the F- reference code; the band word (bold, in its band ink) with the dashed needs-review mark beneath when the match is not exact; the supplier name typed in Courier Prime with its S- code link and typed country and product line in faded ink; the finding title, its rationale in second ink, and the source line (dataset and edition as a link, then detail in faded ink); the severity ramp; the likelihood ramp; and leverage as a right-aligned word with the spend share typed beneath in faded ink. Leverage never changes the order. Before any screening, three blank rows of dotted fill lines sit under the ruled column heads, with a note saying where findings will appear.

### Reference codes
Findings are F-01, F-02…, suppliers S-01, S-02…, zero-padded to two digits, in drop-out green Public Sans 700 at label size with tabular figures and no underline until hover. They cross-link both ways: a register row's S- code jumps to the supplier's table row, and a table row's F- codes jump to the findings. The landed row takes the arrival tint through `:target`, with 40px scroll margin so it isn't tucked under the viewport edge.

### Supplier entries table
Horizontal rules only. Column heads are drop-out green at label size and regular weight, underlined by a 1px strong rule; body rows are separated by row hairlines; cells pad 12px 16px 12px 0 and top-align; spend share is right-aligned in tabular figures. When spend is given, the foot row "Total declared spend" opens with a 3px double strong rule and is set bold, with the total typed in Courier Prime 700. Supplier, country, product and spend are typed; matched goods, inputs and statuses are printed.

### Type-in (signature motion)
Entries type into the form when a list is screened: each entered value fades from 0 to 1 opacity while rising 3px into place, over 220ms on the `cubic-bezier(0.16, 1, 0.3, 1)` ease-out, staggered 40ms per item. The file name, the date and the six totals land within the first 200ms; the register rows follow from 360ms, one step apart, with the delay capped at the thirteenth row so long registers finish inside about a second. The results heading is scrolled into view and focused instantly so the motion plays where it can be seen. Under `prefers-reduced-motion: reduce` the animation is removed and everything renders in place.

**The Type-In Rule.** Only entered values type in: the file name, the date, the totals and the register rows. The printed form never animates, and nothing else on the page moves.

**The One Filled Button Rule.** One filled ink button per screen, for the single primary action. Every other action is an outline button or a text link.

**The 1px Gap Rule.** Internal box rules are drawn by a 1px grid gap over box rule green, never by borders on each cell, so every rule is drawn once and at one weight.

**The Status-by-Rule-Form Rule.** Supplier and match status is told by the form of its rule (solid flagged, dashed needs review, hairline no listing, hatched not assessed), always with the word beside it and never by hue alone.

## Do's and Don'ts

### Do:
- **Do** draw internal box rules with the 1px grid gap over `--color-form-rule`, with the box faces in `--color-paper`.
- **Do** set every printed element (box numbers, labels, column heads, reference codes, the form title) in drop-out green Public Sans, and every entered value in Courier Prime ink.
- **Do** show a blank field as a dotted fill line (1px dotted `--color-form-rule-strong`), never as placeholder text or a dash.
- **Do** carry status by rule form (solid ink flagged, dashed needs review, hairline no listing, hatched not assessed) and always print the status word.
- **Do** use the same five-box ramp, with 11px pips, for every severity and likelihood value and for its legend.
- **Do** give every finding an F- code and every supplier an S- code, link them both ways, and land links on the `--color-select` arrival tint.
- **Do** keep the one filled ink button for the single primary action; every other action is an outline button or a text link.
- **Do** close a form region with the 3px double rule in `--color-form-rule-strong`: under the masthead, above a table total, above the footer.
- **Do** keep focus as the instant 2px `--color-focus` outline at 2px offset, and give every animation a reduced-motion fallback that renders the end state.
- **Do** derive dark values by re-pointing the same tokens at the same hues, lamps low, never by inverting.
- **Do** restack tables and the register into labelled fields on narrow screens instead of scrolling them sideways.

### Don't:
- **Don't** colour anything with a band ink except the band word in a register row and the band figures in the Findings totals (and the oxide on a file-problem remark). No band fills, row tints, borders, pips or icons.
- **Don't** add coloured side stripes (left or right borders thicker than 1px) to rows, remarks or boxes; the severity left rule was tried and refused.
- **Don't** use cards or shadows: no `box-shadow`, no raised or tinted panels at rest, and no ruled box inside a ruled box (controls and status marks are the only bordered things that sit inside a box).
- **Don't** add eyebrows, kickers, uppercase or letter-spaced labels; labels are sentence case at normal tracking.
- **Don't** introduce a third family or a third weight (Public Sans and Courier Prime, 400 and 700 only), and don't set user data in Public Sans or printed labels in Courier Prime.
- **Don't** add vertical rules to tables; tables use horizontal rules only.
- **Don't** use em dashes in interface copy.
- **Don't** define colours outside the OKLCH tokens on `:root`, or write raw colour values into components.
- **Don't** imitate a real government form: no official form numbers, seals, crests or agency marks. Box numbers are plain 1 to 4.
- **Don't** use red-alert treatments (filled red banners, warning icons, pulsing) or KPI-card dashboard tiles; findings are annotations, not alarms.
- **Don't** label any supplier "clear" or give "No listing found" a positive colour; it stays the quietest hairline mark.
- **Don't** give leverage or spend share weight that competes with severity; they stay a plain word and a faded typed figure in the last column.
- **Don't** animate anything except the type-in of entered values, and don't add hover transitions to controls.
