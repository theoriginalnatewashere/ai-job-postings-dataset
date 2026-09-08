#!/usr/bin/env node
/* ============================================================
   verify.mjs — template self-check (DOM-free, zero dependencies)

   Run before (and after) connecting a real dataset:

       node verify.mjs

   Checks:
   1. all modules import cleanly (syntax + registry wiring)
   2. every section block renders; unknown types/encodings fail
   3. every data-tip key referenced is present in the tips registry
   4. counts stay within 0..n; strip (part-of-whole) datasets sum to n
   5. explorer filter/sort pipeline behaves on empty and no-match states
   6. about-me band renders; portrait asset and link hygiene checked
   ============================================================ */

import { study, explorerTip } from "./js/data/study-data.js";
import { availableEncodings, renderChart } from "./js/charts/registry.js";
import "./js/charts/index.js";
import {
  renderSection,
  renderNote,
  renderMethod,
  renderLimitations,
  renderStatusGroups,
} from "./js/components/section.js";
import {
  renderKpis,
  renderFinding,
  renderDuality,
  renderValidation,
} from "./js/components/figures.js";
import { renderExplorer, computeRows } from "./js/components/explorer.js";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { esc } from "./js/lib/util.js";
import { renderAboutMe } from "./js/components/about.js";
import { authorProfile } from "./js/data/author-profile.js";

let errors = 0;
let warnings = 0;
const err = (m) => { errors += 1; console.error(`  x ${m}`); };
const warn = (m) => { warnings += 1; console.warn(`  ! ${m}`); };
const ok = (m) => console.log(`  ok  ${m}`);

console.log("research-dashboard template self-check\n");

if (!study || typeof study !== "object") {
  console.error("  x js/data/study-data.js did not export a `study` object");
  process.exit(1);
}
ok(`study imported: "${study.meta.title}"`);
if (study.placeholder) {
  warn("placeholder: true — this page shows SAMPLE data; replace js/data/study-data.js for real use");
}

const tips = { ...study.tips, rec_url: explorerTip };
const ctx = {
  n: study.n,
  tiers: study.tiers ?? [],
  getDataset: (name) => study.datasets[name],
};
const tipRefs = new Set();
const collect = (html) => {
  for (const m of String(html).matchAll(/data-tip="([^"]+)"/g)) tipRefs.add(m[1]);
  return html;
};

/* 1–2. render every block */
let blocks = 0;
let failed = 0;
for (const sec of study.sections ?? []) {
  for (const block of sec.blocks ?? []) {
    blocks += 1;
    try {
      let html = "";
      switch (block.type) {
        case "kpis": html = renderKpis(study.kpis); break;
        case "finding": html = renderFinding(study.findings[block.index ?? 0]); break;
        case "chart": html = renderChart(block, ctx); break;
        case "note": html = renderNote(block); break;
        case "duality": html = renderDuality(block.duality ?? study.duality); break;
        case "method": html = renderMethod(study.method?.steps ?? []); break;
        case "status-groups": html = renderStatusGroups(ctx.getDataset(block.dataset), block.tipKey); break;
        case "limitations": html = renderLimitations(study.limitations ?? []); break;
        case "explorer": html = renderExplorer({ ...ctx.getDataset("explorer"), linkTip: "rec_url" }); break;
        case "validation": html = renderValidation(ctx.getDataset("validation")); break;
        default: throw new Error(`unknown block type "${block.type}"`);
      }
      collect(html);
      if (/\bundefined\b/.test(html)) warn(`section ${sec.id} (${block.type}): rendered output contains "undefined"`);
    } catch (e) {
      failed += 1;
      err(`section ${sec.id} — ${block.type}${block.encoding ? ":" + block.encoding : ""}: ${e.message}`);
    }
  }
}
if (!failed) ok(`${blocks} blocks rendered without errors`);

/* 3. tip coverage */
const missing = [...tipRefs].filter((k) => !(k in tips));
if (missing.length) err(`tip keys referenced but missing from the registry: ${missing.join(", ")}`);
else ok(`${tipRefs.size} referenced tip keys all present in the registry`);
const unused = Object.keys(tips).filter((k) => !tipRefs.has(k) && k !== "rec_url"); /* rec_url is wired onto explorer links at render time */
if (unused.length) warn(`tip keys defined but never referenced: ${unused.join(", ")}`);

/* 4. counts within 0..n */
const checkCount = (where, v) => {
  if (typeof v === "number" && (v < 0 || v > study.n)) err(`${where}: count ${v} outside 0..${study.n}`);
};
for (const [name, ds] of Object.entries(study.datasets ?? {})) {
  if (Array.isArray(ds)) ds.forEach((it) => checkCount(name, it.count));
  else if (ds && Array.isArray(ds.tools)) {
    ds.forEach((fam) => (fam.tools ?? []).forEach((t) => checkCount(`${name}/${fam.family}`, t.count)));
  } else if (ds && Array.isArray(ds.series)) {
    ds.series.forEach((s) =>
      (s.points ?? []).forEach((p) => {
        if (ds.yMax !== undefined && p.y > ds.yMax) warn(`${name}: point y=${p.y} exceeds yMax=${ds.yMax}`);
      })
    );
  } else if (ds && Array.isArray(ds.points)) {
    ds.points.forEach((p) => checkCount(name, p.y));
  }
}
/* part-of-whole strips must sum to n */
for (const sec of study.sections ?? []) {
  for (const b of sec.blocks ?? []) {
    if (b.type === "chart" && b.encoding === "strip") {
      const items = ctx.getDataset(b.dataset) ?? [];
      const sum = items.reduce((a, s) => a + (s.count ?? 0), 0);
      if (sum !== study.n) warn(`strip "${b.dataset}" sums to ${sum} but n=${study.n} — part-of-whole data should sum to n`);
    }
  }
}

/* 5. explorer pipeline */
const exCfg = { ...study.datasets.explorer, linkTip: "rec_url" };
if (exCfg.records) {
  const sortKey = exCfg.columns.find((c) => c.sortable !== false)?.key ?? exCfg.columns[0].key;
  const all = computeRows(exCfg, { q: "", sel: {}, sortKey, dir: 1 });
  if (all.length !== exCfg.records.length) err("explorer: empty filters must return every record");
  else ok(`explorer pipeline: ${all.length}/${exCfg.records.length} rows with empty filters`);
  const none = computeRows(exCfg, { q: "zzz-no-match", sel: {}, sortKey, dir: 1 });
  if (none.length !== 0) err("explorer: no-match search must return zero rows");
}

/* 6. about-me band (rendered by main.js before the provenance footer) */
try {
  const aboutHtml = renderAboutMe(authorProfile);
  collect(aboutHtml);
  if (/\bundefined\b/.test(aboutHtml)) err("about-me: rendered output contains \"undefined\"");
  const nameParts = Array.isArray(authorProfile.name) ? authorProfile.name : [authorProfile.name];
  if (!nameParts.every((part) => aboutHtml.includes(esc(part)))) err("about-me: author name missing from render");
  const factCount = (aboutHtml.match(/about-fact-num/g) ?? []).length;
  if (factCount !== (authorProfile.facts ?? []).length) {
    err(`about-me: rendered ${factCount} facts but the profile defines ${(authorProfile.facts ?? []).length}`);
  } else if (factCount !== 3) {
    warn(`about-me: ${factCount} fun facts rendered (template convention is 3)`);
  }
  const links = authorProfile.links ?? [];
  const wiredLinks = links.filter(
    (l) =>
      aboutHtml.includes(`href="${esc(l.url)}"`) &&
      aboutHtml.includes('target="_blank"') &&
      aboutHtml.includes('rel="noopener noreferrer"')
  );
  if (wiredLinks.length !== links.length) err("about-me: one or more links missing href, target, or rel");
  let imgFile = null;
  if (authorProfile.image.startsWith("/")) {
    /* Root-absolute shared asset — resolve against the workspace root by
       walking up from this file (dashboards live at varying depths). */
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 6 && !imgFile; i += 1) {
      const candidate = join(dir, authorProfile.image.slice(1));
      if (existsSync(candidate)) imgFile = candidate;
      dir = dirname(dir);
    }
  } else {
    imgFile = fileURLToPath(new URL(authorProfile.image, import.meta.url));
  }
  if (!imgFile || !existsSync(imgFile)) {
    err(`about-me: portrait asset not found at ${authorProfile.image}`);
  }
  if (!failed && !errors) {
    ok(`about-me: renders with ${factCount} facts, ${wiredLinks.length} links, portrait asset present`);
  }
  if (links.some((l) => /your-|\.example/.test(l.url))) {
    warn("about-me: link URLs are placeholders — edit js/data/author-profile.js before publishing");
  }
} catch (e) {
  err(`about-me: ${e.message}`);
}

ok(`registered encodings: ${availableEncodings().join(", ")}`);

console.log(`\nresult: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
