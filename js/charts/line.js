/* ============================================================
   charts/line.js — change over time
   For ordered temporal sequences (methodology default). Minimal
   SVG chrome: hairline gridlines, mono tick labels, series
   polylines in token colors, hover-scale dots. Legend swatches
   are evidence targets (series-level provenance).
   Dataset: { series: [{ name, color, tip?, points: [{x, y, tip?}] }],
              yMax?, yLabel? }

   PROJECT OVERRIDE (this dashboard copy only; see DATA-NOTES.md):
   cfg.yTicks may supply explicit y-axis tick values — the
   template's quarter-fraction ticks produce ugly labels on a
   0–5% scale (0, 1.25, 2.5 …). Default behavior unchanged.
   ============================================================ */

import { esc, fmtTick, fillClass, tokenVar } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

const W = 640;
const H = 280;
const PAD = { l: 40, r: 12, t: 20, b: 30 };

export function renderLine(block, ctx) {
  const cfg = ctx.getDataset(block.dataset);
  const series = cfg.series;
  const xLabels = series[0]?.points.map((p) => p.x) ?? [];
  const yMax = cfg.yMax ?? Math.max(...series.flatMap((s) => s.points.map((p) => p.y)));

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const xAt = (i) => PAD.l + (xLabels.length <= 1 ? iw / 2 : (i / (xLabels.length - 1)) * iw);
  const yAt = (v) => PAD.t + (1 - v / yMax) * ih;

  const ticks = cfg.yTicks ?? [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f * 100) / 100);
  const grid = ticks
    .map((v) => {
      return `<line class="grid-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yAt(v)}" y2="${yAt(v)}"></line>` +
        `<text class="svg-tick" x="${PAD.l - 8}" y="${yAt(v) + 3.5}" text-anchor="end">${fmtTick(v)}</text>`;
    })
    .join("");

  const xTicks = xLabels
    .map((lb, i) => `<text class="svg-tick" x="${xAt(i)}" y="${H - 8}" text-anchor="middle">${esc(lb)}</text>`)
    .join("");

  const lines = series
    .map((s) => {
      const pts = s.points.map((p, i) => `${xAt(i)},${yAt(p.y)}`).join(" ");
      const dots = s.points
        .map((p, i) => {
          const attrs = p.tip
            ? tipAttrs(p.tip, `${s.name}, ${p.x}: ${p.y} ${cfg.yLabel ?? ""}`.trim())
            : "";
          return `<circle class="svg-dot series-dot" cx="${xAt(i)}" cy="${yAt(p.y)}" r="4" fill="${tokenVar(s.color)}"${attrs}></circle>`;
        })
        .join("");
      return `<polyline class="series-line" stroke="${tokenVar(s.color)}" points="${pts}"></polyline>${dots}`;
    })
    .join("");

  const legend = series
    .map(
      (s) =>
        `<span${s.tip ? tipAttrs(s.tip, `${s.name} series`) : ""}><span class="sw ${fillClass(s.color)}"></span>${esc(s.name)}</span>`
    )
    .join("");

  const yLabel = cfg.yLabel
    ? `<text class="svg-tick" x="${PAD.l}" y="${PAD.t - 8}">${esc(cfg.yLabel)}</text>`
    : "";

  return `<div class="legend">${legend}</div>
<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(block.ariaLabel ?? "Trend over time")}">
  ${grid}
  <line class="axis-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yAt(0)}" y2="${yAt(0)}"></line>
  ${lines}
  ${xTicks}
  ${yLabel}
</svg>`;
}
