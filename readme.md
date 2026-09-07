# Research Dashboard Template

A reusable analytical-dashboard template that transfers the visual quality and
readability of the Lovable reference dashboard to **any** research dataset.
Dependency-free: semantic HTML, CSS custom properties, vanilla ES modules.

Design authority: [`design-system/dashboard-style-guide.md`](../../design-system/dashboard-style-guide.md)
and [`design-system/design-tokens.json`](../../design-system/design-tokens.json)
(extracted from the read-only reference project).

## Architecture

```
research question
    ↓
validated structured data        js/data/study-data.js   (the only file you replace)
    ↓
appropriate chart selection      block.encoding          (methodology decision, per dataset)
    ↓
design-system presentation       js/charts/* renderers + components + styles/*
    ↓
finished dashboard               index.html shell
```

The template **never forces a chart type**: each section block declares an
`encoding`, chosen per dataset by the research-visualization methodology.
Renderers decide only HOW the chosen chart is presented. Swapping datasets
never touches presentation; changing an encoding never touches the design system.

## File map

| Path | Role |
|---|---|
| `index.html` | Shell: fonts, stylesheets, `#app` mount, module script. |
| `styles/tokens.css` | Design tokens: oklch palette, type, radius, elevation, `.num` / `.tick-label` / `.panel` / `.hairline` utilities, data-fill classes. |
| `styles/components.css` | Presentation patterns: hero, nav, sections, KPIs, finding, panels, annotations, chart geometry, tables, tooltip, responsive rules. |
| `js/data/study-data.js` | **THE file you replace** — placeholder study + the full data contract. |
| `js/lib/util.js` | `esc`, `pct`, token-name→class/var helpers. |
| `js/components/evidence.js` | Provenance tooltip system (port of the reference `Tip.tsx`). |
| `js/components/section.js` | Section shell, `Note` annotations, method/limitations/status-group grids. |
| `js/components/figures.js` | KPI grid, major finding, measured-vs-interpretation panels, validation ledger. |
| `js/components/explorer.js` | Source explorer: filter + sort native table (port of `Explorer.tsx`). |
| `js/charts/registry.js` | Encoding → renderer boundary (the chart-selection contract). |
| `js/charts/*.js` | Presentation renderers (one file per encoding). |
| `js/charts/index.js` | Registers built-in encodings. |
| `js/main.js` | Assembler: data → blocks → sections → page; wires behavior. |
| `verify.mjs` | Self-check: run `node verify.mjs` (no browser, no deps). |

## Quick start

ES modules require a static server (not `file://`):

```sh
cd templates/research-dashboard
python -m http.server 8000     # or any static server
# open http://localhost:8000
node verify.mjs                # dataset + template self-check
```

The page opens with a visible **TEMPLATE PREVIEW** banner while
`placeholder: true` — remove the flag when real data is connected.

## Connecting a future dataset

1. Copy this folder; keep the reference project untouched.
2. Replace `js/data/study-data.js` with your validated data (same shape;
   the file header documents the contract). Set `placeholder: false`.
3. Update `meta` (title, kicker with **n**, badges, provenance chain, source).
4. For each section block, **choose the encoding per the methodology** (table
   below) and reference your dataset by name: `{ type: "chart", encoding:
   "ranked-bars", dataset: "myMetrics", tiers: true }`.
5. Write one `tips[key]` provenance entry per figure (author-controlled HTML;
   every referenced key must exist — `verify.mjs` enforces this).
6. Fill method steps, limitations, the measured/interpretation duality, the
   validation ledger (if a reconstruction exists), and the explorer records.
7. `node verify.mjs` must end with `0 error(s)`.

### Data contract (summary — full details in `study-data.js` header)

- Every figure carries `{ count, n }`; percentages are **computed**, never stored.
- Colors are referenced by **token name only** (`"coral"`, `"teal"`, `"slate"`,
  `"teal-soft"`, `"rule"`, `"ink"`), never raw values.
- `tiers` is a study convention: ordered `{ key, color, minPct, rangeLabel }`.
- Datasets are named and referenced from section blocks; `sections[]` define
  order, titles, ledes, and typed blocks (`kpis`, `finding`, `chart`, `note`,
  `duality`, `method`, `status-groups`, `limitations`, `explorer`, `validation`).

## Chart selection (methodology decides) → presentation (template decides)

| Research question / data shape | Encoding (renderer) | Presentation provided |
|---|---|---|
| Ranking of shares | `ranked-bars` | tick axis, optional tier headers, tracks, midpoint divider, mono `pct% · count/n` |
| Overlapping categories | `ranked-bars` (no tiers) | independent bars — never a pie |
| Category comparison, 2+ series | `grouped-bars` | thin dual tracks, swatch legend, color-keyed values |
| Change over time (ordered) | `line` | hairline grid, mono ticks, hover dots, legend |
| Relationship, two numerics | `scatter` | hover/focus dots with per-point provenance |
| Composition, mutually exclusive | `strip` | one divided whole + legend cards |
| Raw counts with identity | `dot-matrix` | one dot = one unit, family headers |
| Exact values / sources | `explorer` | sortable filter table (block type) |

Distribution histograms, heatmaps, etc.: add a renderer file, register it in
`js/charts/index.js`. **Renderer contract:** `(block, ctx) => HTML string`,
pure and DOM-free; evidence via `tipAttrs`; colors via token names; `pct()`
computed from `count/n`. `verify.mjs` fails loudly on unknown encodings.

## Provenance tooltip

Any element with `data-tip="key"` becomes evidence: hover follows the cursor,
click or keyboard-focus **pins**, `Esc`/scroll/outside-click close. Targets are
`tabindex="0"` with full-sentence `aria-label`s. This is the single overlay of
the system — no other modals/tooltips.

## Transferred from the reference (design patterns)

Token-first oklch theming · semantic color roles, color=meaning only ·
hairline rules instead of shadows (single offset-shadow overlay exception) ·
`.num` mono tabular numerals for every figure · `tick-label` micro-labels ·
numbered section shells with ledes · hairline-gap KPI grid with inverted lead ·
solid/dashed measured-vs-interpretation panels · warn/neutral notes ·
tier-headed ranked bars with `count/n` everywhere · unit-dot matrices ·
single-strip composition · sortable native-table explorer with live count ·
provenance-on-every-figure · footer provenance chain · coral `focus-visible`
· sm/md/lg-only responsive collapses · `prefers-reduced-motion` respect.

## Deliberately NOT copied

- React/TanStack SSR app shell, router, query wiring (template is a static,
  dependency-free page; see porting map below).
- Tailwind utility compilation → translated to semantic component CSS on the
  same tokens.
- shadcn `ui/` set, Radix, recharts, sonner, RHF/zod — installed-but-unused in
  the reference; importing them would break the visual language.
- The Junior-DS dataset, its CORE/COMMON/USEFUL/NICHE thresholds (now
  configurable `tiers`), and all dataset-specific charts.
- The reference's unused dark-mode stub (the system is light-only by design).
- Lovable scaffolding (bunfig guard, error reporting, SSR entry).

## Porting map (if a future project uses the React/Lovable stack)

| Reference (React) | Template (vanilla) |
|---|---|
| `Tip.tsx` (`TipProvider`/`Evidence`) | `js/components/evidence.js` |
| `Section.tsx` (`Section`/`Note`) | `js/components/section.js` |
| `Bars.tsx` (`RankedBars`) | `js/charts/ranked-bars.js` |
| `Charts.tsx` (strip/dots) | `js/charts/strip.js`, `dot-matrix.js` |
| `Explorer.tsx` | `js/components/explorer.js` |
| `index.tsx` sections/KPIs/panels | `js/main.js`, `figures.js` |
| `styles.css` tokens | `styles/tokens.css` |

Note: the read-only reference lives at `reference/lovable` in this workspace
(referred to as `references/lovable-dashboard/` in the brief) — it was not
modified. No dependencies were installed; `verify.mjs` runs on the host's
Node alone.
