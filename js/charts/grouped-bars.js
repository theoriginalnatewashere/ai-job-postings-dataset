/* ============================================================
   charts/grouped-bars.js — comparison visualization
   Category comparison across two or more series: one thin
   track per series stacked inside a row, a swatch legend, and
   color-keyed mono values.

   PROJECT OVERRIDE (this dashboard copy only; see DATA-NOTES.md):
   series may carry a measured `value` (percent) instead of
   {count, n}; block.max scales the shared axis to the data; an
   item may carry `multiple` (a calculated ratio) displayed next
   to the values. Legacy count/n path preserved unchanged.
   ============================================================ */

import { esc, pct, fmt, fillClass, tokenVar } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

export function renderGroupedBars(block, ctx) {
  const items = ctx.getDataset(block.dataset);
  const n = ctx.n;
  const names = ctx.getDataset("comparisonSeriesNames") ?? items[0]?.series.map((s) => s.name) ?? [];

  const measured = items.length > 0 && items[0].series?.[0]?.value !== undefined;
  const max =
    block.max ?? (measured ? Math.max(...items.flatMap((i) => i.series.map((s) => s.value))) : 100);

  const legend = names
    .map((nm, i) => {
      const color = items[0]?.series[i]?.color ?? "slate";
      return `<span><span class="sw ${fillClass(color)}"></span>${esc(nm)}</span>`;
    })
    .join("");

  const rows = items
    .map((item) => {
      const tracks = item.series
        .map((s) => {
          const width = measured ? (s.value / max) * 100 : pct(s.count, n);
          return `<span class="track"><span class="bar-fill ${fillClass(s.color)}" style="width:${width}%"></span></span>`;
        })
        .join("");
      const values = item.series
        .map((s) => `<b style="color:${tokenVar(s.color)}">${measured ? fmt(s.value) : pct(s.count, n)}%</b>`)
        .join('<span class="den"> · </span>');
      const multiple =
        item.multiple !== undefined ? `<span class="den"> · ×${item.multiple}</span>` : "";
      const aria =
        item.series
          .map((s) => `${s.name}: ${measured ? fmt(s.value) : pct(s.count, n)} percent${measured ? "" : ` (${s.count} of ${n})`}`)
          .join("; ") + (item.multiple !== undefined ? `; growth ×${item.multiple}` : "");
      return `<div class="chart-row"${tipAttrs(item.tip, `${item.label} — ${aria}`)}>
  <span class="row-label">${esc(item.label)}</span>
  <span class="group-track">${tracks}</span>
  <span class="chart-value num">${values}${multiple}</span>
</div>`;
    })
    .join("\n");

  return `<div class="legend">${legend}</div>
<div>${rows}</div>`;
}
