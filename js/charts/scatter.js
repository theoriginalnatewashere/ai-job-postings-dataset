/* ============================================================
   charts/scatter.js — relationship between numeric variables
   Methodology default for two numeric variables. Hairline
   gridlines, mono ticks, hover-scale dots; every dot is a
   keyboard-focusable evidence target with a full aria-label.
   Dataset: { xLabel, yLabel, points: [{ x, y, label, tip, color? }] }
   ============================================================ */

import { esc, tokenVar } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

const W = 640;
const H = 300;
const PAD = { l: 40, r: 16, t: 20, b: 34 };

export function renderScatter(block, ctx) {
  const cfg = ctx.getDataset(block.dataset);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const xMax = Math.max(...cfg.points.map((p) => p.x)) * 1.05 || 1;
  const yMax = Math.max(...cfg.points.map((p) => p.y)) * 1.1 || 1;
  const xAt = (v) => PAD.l + (v / xMax) * iw;
  const yAt = (v) => PAD.t + (1 - v / yMax) * ih;

  const gx = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const v = Math.round(xMax * f * 10) / 10;
      return `<line class="grid-line" x1="${xAt(v)}" x2="${xAt(v)}" y1="${PAD.t}" y2="${PAD.t + ih}"></line>` +
        `<text class="svg-tick" x="${xAt(v)}" y="${H - 12}" text-anchor="middle">${v}</text>`;
    })
    .join("");

  const gy = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const v = Math.round(yMax * f * 10) / 10;
      return `<line class="grid-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yAt(v)}" y2="${yAt(v)}"></line>` +
        `<text class="svg-tick" x="${PAD.l - 8}" y="${yAt(v) + 3.5}" text-anchor="end">${v}</text>`;
    })
    .join("");

  const dots = cfg.points
    .map(
      (p) =>
        `<circle class="svg-dot" cx="${xAt(p.x)}" cy="${yAt(p.y)}" r="4.5" fill="${tokenVar(p.color ?? "coral")}"${tipAttrs(
          p.tip,
          `${p.label}: ${cfg.xLabel} ${p.x}, ${cfg.yLabel} ${p.y}`
        )}></circle>`
    )
    .join("");

  const xLabel = `<text class="svg-tick" x="${W - PAD.r}" y="${PAD.t + ih + 24}" text-anchor="end">${esc(cfg.xLabel)}</text>`;
  const yLabel = `<text class="svg-tick" x="${PAD.l}" y="${PAD.t - 8}">${esc(cfg.yLabel)}</text>`;

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(block.ariaLabel ?? "Scatter plot")}">
  ${gx}
  ${gy}
  <line class="axis-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yAt(0)}" y2="${yAt(0)}"></line>
  <line class="axis-line" x1="${PAD.l}" x2="${PAD.l}" y1="${PAD.t}" y2="${PAD.t + ih}"></line>
  ${dots}
  ${xLabel}
  ${yLabel}
</svg>`;
}
