/* ============================================================
   main.js — dashboard assembler
   Architecture chain (per the template brief):

     research question
       ↓
     validated structured data      → js/data/study-data.js
       ↓
     appropriate chart selection    → block.encoding (methodology decision)
       ↓
     design-system presentation     → js/charts/* + js/components/* + styles/*
       ↓
     finished dashboard             → index.html shell

   Swapping datasets never touches presentation; choosing a
   chart type never touches the design system.
   ============================================================ */

import { study, explorerTip } from "./data/study-data.js";
import { attachEvidence } from "./components/evidence.js";
import {
  renderSection,
  renderNote,
  renderMethod,
  renderLimitations,
  renderStatusGroups,
} from "./components/section.js";
import {
  renderKpis,
  renderFinding,
  renderDuality,
  renderValidation,
  wireValidation,
} from "./components/figures.js";
import { renderExplorer, wireExplorer } from "./components/explorer.js";
import { renderChart } from "./charts/registry.js";
import { esc } from "./lib/util.js";
import "./charts/index.js"; /* registers built-in encodings */

const LINK_TIP = "rec_url";

const ctx = {
  n: study.n,
  tiers: study.tiers ?? [],
  getDataset: (name) => study.datasets[name],
};

function renderBlock(block) {
  switch (block.type) {
    case "kpis":
      return renderKpis(study.kpis);
    case "finding":
      return renderFinding(study.findings[block.index ?? 0]);
    case "chart":
      return renderChart(block, ctx);
    case "note":
      return renderNote(block);
    case "duality":
      return renderDuality(block.duality ?? study.duality);
    case "method":
      return renderMethod(study.method.steps);
    case "status-groups":
      return renderStatusGroups(ctx.getDataset(block.dataset), block.tipKey);
    case "limitations":
      return renderLimitations(study.limitations);
    case "explorer":
      return `<div data-explorer>${renderExplorer({ ...ctx.getDataset("explorer"), linkTip: LINK_TIP })}</div>`;
    case "validation":
      return `<div data-validation>${renderValidation(ctx.getDataset("validation"))}</div>`;
    default:
      throw new Error(`Unknown block type: ${block.type}`);
  }
}

function hero() {
  const m = study.meta;
  return `<header class="hero">
  <div class="container">
    <p class="hero-kicker num">${esc(m.kicker)}</p>
    <h1>${esc(m.title)}</h1>
    <p class="hero-sub">${esc(m.subtitle)}</p>
    <p class="hero-desc">${esc(m.description)}</p>
    <div class="hero-badges">${m.badges.map((b) => `<span class="num">${esc(b)}</span>`).join("")}</div>
  </div>
</header>`;
}

function nav() {
  return `<nav class="topnav" aria-label="Dashboard sections">
  <ul>${study.sections
    .map((s) => `<li><a href="#${esc(s.id)}">${esc(s.navLabel ?? s.title)}</a></li>`)
    .join("")}</ul>
</nav>`;
}

function placeholderBanner() {
  return `<div class="placeholder-banner">
  <span class="num">TEMPLATE PREVIEW</span> — every figure below is placeholder sample data.
  Replace <code>js/data/study-data.js</code> with a validated dataset, set
  <code>placeholder: false</code>, and choose each section's chart encoding per the
  research-visualization methodology.
</div>`;
}

function footer() {
  const m = study.meta;
  return `<footer class="footer">
  <div class="container">
    <p class="footer-kicker num">Provenance chain</p>
    <p>${esc(m.provenanceChain)}</p>
    <p>${esc(m.footerSource)}</p>
  </div>
</footer>`;
}

/* ---------- assemble ---------- */

const app = document.getElementById("app");

app.innerHTML = `
${hero()}
${nav()}
<main class="container">
  ${study.placeholder ? placeholderBanner() : ""}
  ${study.sections
    .map((s) =>
      renderSection({
        ...s,
        body: s.blocks.map(renderBlock).join("\n"),
      })
    )
    .join("\n")}
</main>
${footer()}`;

/* ---------- behavior ---------- */

attachEvidence(app, { tips: { ...study.tips, [LINK_TIP]: explorerTip } });

const explorerEl = app.querySelector("[data-explorer]");
if (explorerEl) wireExplorer(explorerEl, { ...ctx.getDataset("explorer"), linkTip: LINK_TIP });

const validationEl = app.querySelector("[data-validation]");
if (validationEl) wireValidation(validationEl, ctx.getDataset("validation"));
