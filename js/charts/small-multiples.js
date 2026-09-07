/* ============================================================
   charts/small-multiples.js — per-entity trend panels
   PROJECT ADDITION for this dataset (registered in index.js;
   documented in DATA-NOTES.md): one mini line chart per country
   on a SHARED x domain and y scale so trajectories are directly
   comparable. Coverage differences are visible as line start
   points and stated in each panel's caption — never hidden.
   Dataset: { yMax, xDomain: [x0, x1], yLabel?,
              panels: [{ label, caption?, color?, tip,
                         points: [{ x, y }] }] }
   Renderer contract: (block, ctx) => HTML string, pure.
   ============================================================ */

import { esc, fmt, tokenVar } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

const W = 230;
const H = 92;
const PAD = { l: 30, r: 10, t: 10, b: 18 };

export function renderSmallMultiples(block, ctx) {
  const cfg = ctx.getDataset(block.dataset);
  const panels = cfg.panels;
  const yMax = cfg.yMax ?? Math.max(...panels.flatMap((p) => p.points.map((pt) => pt.y)));
  const x0 = cfg.xDomain?.[0] ?? Math.min(...panels.flatMap((p) => p.points.map((pt) => pt.x)));
  const x1 = cfg.xDomain?.[1] ?? Math.max(...panels.flatMap((p) => p.points.map((pt) => pt.x)));

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const xAt = (v) => PAD.l + ((v - x0) / (x1 - x0)) * iw;
  const yAt = (v) => PAD.t + (1 - v / yMax) * ih;

  const cells = panels
    .map((p) => {
      const pts = [...p.points].sort((a, b) => a.x - b.x);
      const first = pts[0];
      const last = pts[pts.length - 1];
      const poly = pts.map((pt) => `${xAt(pt.x)},${yAt(pt.y)}`).join(" ");
      const lineColor = tokenVar(p.color ?? "slate");
      const aria = `${p.label}: share of online job postings listing an AI-related skill, ${fmt(first.y)} percent in ${first.x} to ${fmt(last.y)} percent in ${last.x}${p.caption ? `, ${p.caption}` : ""}`;
      return `<div class="sm-panel"${tipAttrs(p.tip, aria)}>
  <div class="sm-head">
    <span class="sm-name">${esc(p.label)}</span>
    <span class="sm-value num">${fmt(last.y)}%</span>
  </div>
  <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">
    <line class="axis-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yAt(0)}" y2="${yAt(0)}"></line>
    <polyline class="series-line" stroke="${lineColor}" points="${poly}"></polyline>
    <circle class="svg-dot" cx="${xAt(last.x)}" cy="${yAt(last.y)}" r="3" fill="${tokenVar("coral")}"></circle>
    <text class="svg-tick" x="${PAD.l}" y="${H - 4}" text-anchor="middle">${esc(String(first.x))}</text>
    <text class="svg-tick" x="${W - PAD.r}" y="${H - 4}" text-anchor="middle">${esc(String(last.x))}</text>
  </svg>
  ${p.caption ? `<div class="sm-cap"><span class="tick-label">${esc(p.caption)}</span></div>` : ""}
</div>`;
    })
    .join("\n");

  return `<div class="small-multiples">${cells}</div>`;
}
