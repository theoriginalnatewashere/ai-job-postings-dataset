/* ============================================================
   charts/dot-matrix.js — unit matrix
   One dot = one unit of n (the reference's "each dot is one of
   the 30 postings"): raw counts stay visible and honest, grouped
   into families with hairline headers. Dots are aria-hidden;
   the row carries a full aria-label sentence.
   Dataset: [{ family, tools: [{ label, count, tip, color? }] }]
   ============================================================ */

import { esc, pct, fillClass } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

export function renderDotMatrix(block, ctx) {
  const families = ctx.getDataset(block.dataset);
  const n = ctx.n;

  const parts = families
    .map((fam) => {
      const head = `<div class="family-head"><h3>${esc(fam.family)}</h3><span class="rule-fill"></span></div>`;
      const rows = fam.tools
        .map((t) => {
          const p = pct(t.count, n);
          const dots = Array.from({ length: n }, (_, i) =>
            i < t.count ? `<span class="unit-dot ${fillClass(t.color)}"></span>` : `<span class="unit-dot empty"></span>`
          ).join("");
          return `<div class="chart-row"${tipAttrs(t.tip, `${t.label}: ${p} percent, ${t.count} of ${n} teams`)}>
  <span class="row-label">${esc(t.label)}</span>
  <span class="dot-field" aria-hidden="true">${dots}</span>
  <span class="chart-value num"><b>${p}%</b><span class="den"> · ${t.count}/${n}</span></span>
</div>`;
        })
        .join("\n");
      return `${head}${rows}`;
    })
    .join("\n");

  return `<p class="tick-label" style="margin:0 0 12px">One dot = one team of ${n}</p>
${parts}`;
}
