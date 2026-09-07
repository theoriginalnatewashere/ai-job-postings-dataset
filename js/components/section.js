/* ============================================================
   components/section.js — page section patterns
   Port of the reference Section.tsx + Note + cell-grid blocks.
   All renderers are pure (HTML strings in → HTML string out).
   ============================================================ */

import { esc } from "../lib/util.js";
import { tipAttrs } from "./evidence.js";

/** Section shell: number chip + title + optional lede + body. */
export function renderSection({ id, num, title, lede, body }) {
  return `<section class="section" id="${esc(id)}">
  <div class="section-head">
    <span class="section-num num">${esc(num)}</span>
    <h2>${esc(title)}</h2>
  </div>
  ${lede ? `<p class="section-lede">${esc(lede)}</p>` : ""}
  ${body}
</section>`;
}

/** Contextual annotation. tone: "neutral" (rule) | "warn" (coral).
    `html` is author-controlled (study data), like the reference. */
export function renderNote({ tone, html }) {
  return `<p class="note${tone === "warn" ? " warn" : ""}">${html}</p>`;
}

/** Methodology steps in a shared-border cell grid. */
export function renderMethod(steps) {
  const cells = steps
    .map(
      (s) => `<li class="method-step">
  <span class="step-label num">STEP ${String(s.n).padStart(2, "0")}</span>
  <h3>${esc(s.t)}</h3>
  <p>${esc(s.d)}</p>
</li>`
    )
    .join("\n");
  return `<ol class="cellgrid cols-sm2 cols-lg4" style="list-style:none;margin:0;padding:0">${cells}</ol>`;
}

/** Limitations grid with L01… numbering. */
export function renderLimitations(limitations) {
  const cells = limitations
    .map(
      (text, i) => `<li class="limitation">
  <span class="lim-id num">L${String(i + 1).padStart(2, "0")}</span>${esc(text)}
</li>`
    )
    .join("\n");
  return `<ul class="cellgrid cols-sm2" style="list-style:none;margin:0;padding:0">${cells}</ul>`;
}

/** Source-accessibility groups with status dots (good/mid/bad/neutral).
    The whole grid is one evidence target, like the reference sources grid. */
export function renderStatusGroups(groups, tipKey) {
  const cells = groups
    .map(
      (g) => `<div class="status-group tone-${esc(g.tone)}">
  <div class="status-head">
    <span class="status-dot"></span>
    <h3>${esc(g.status)}</h3>
  </div>
  <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
</div>`
    )
    .join("\n");
  return `<div${tipAttrs(tipKey, "Source accessibility groups")} class="cellgrid cols-md2 cols-lg3">${cells}</div>`;
}
