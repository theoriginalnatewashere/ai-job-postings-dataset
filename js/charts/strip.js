/* ============================================================
   charts/strip.js — part-of-a-whole composition
   Reference pattern: a single divided strip for MUTUALLY
   EXCLUSIVE parts of n (never used for overlapping categories —
   those are independent ranked bars). Values printed in
   segments and repeated in a legend below.
   Dataset: [{ label, count, tip, color, textDark? }]
   ============================================================ */

import { esc, pct, fillClass } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

export function renderStrip(block, ctx) {
  const items = ctx.getDataset(block.dataset);
  const n = ctx.n;
  const total = items.reduce((sum, s) => sum + s.count, 0) || n;

  const segments = items
    .map((s) => {
      const w = (s.count / total) * 100;
      const p = pct(s.count, n);
      return `<div class="segment${s.textDark ? " label-dark" : ""} ${fillClass(s.color)}"${tipAttrs(
        s.tip,
        `${s.label}: ${p} percent, ${s.count} of ${n}`
      )} style="width:${w}%"><span class="count num">${s.count}</span></div>`;
    })
    .join("");

  const legend = items
    .map((s) => {
      const p = pct(s.count, n);
      return `<div class="item"${tipAttrs(s.tip, `${s.label}: ${p} percent, ${s.count} of ${n}`)}>
  <span class="sw ${fillClass(s.color)}"></span>
  <span class="pct num">${p}%</span>
  <span><span class="lbl">${esc(s.label)}</span><span class="den num">${s.count} of ${n}</span></span>
</div>`;
    })
    .join("");

  const aria = `Composition of ${n} teams: ${items.map((s) => `${s.label} ${s.count}`).join(", ")}`;
  return `<div class="strip" role="img" aria-label="${esc(aria)}">${segments}</div>
<div class="strip-legend">${legend}</div>`;
}
