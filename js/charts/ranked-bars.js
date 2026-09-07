/* ============================================================
   charts/ranked-bars.js — ranked horizontal bars
   Presentation pattern from the reference RankedBars.tsx:
   tick axis, optional tier group headers, rule-soft tracks,
   mono value column, hover brightness lift, every row an
   evidence target.

   PROJECT OVERRIDE (this dashboard copy only; see DATA-NOTES.md):
   items may carry a measured `value` (percent) instead of
   {count, n} — the OWID indicator publishes shares directly, and
   whole-number rounding would distort 0.2–4.7% values. Block
   options `max` and `axisSteps` scale the axis to the data
   (template default: 0–100%). The count/n path is preserved
   unchanged; the measured path omits the fabricated 50% midline.
   ============================================================ */

import { esc, pct, fmt, fmtTick, fillClass, tokenVar } from "../lib/util.js";
import { tipAttrs } from "../components/evidence.js";

export function bucketOf(p, tiers) {
  return tiers.find((t) => p >= t.minPct) ?? tiers[tiers.length - 1];
}

export function renderRankedBars(block, ctx) {
  const items = ctx.getDataset(block.dataset);
  const n = ctx.n;
  const tiers = block.tiers ? ctx.tiers : null;

  const measured = items.length > 0 && items[0].value !== undefined;
  const max = block.max ?? (measured ? Math.max(...items.map((m) => m.value)) : 100);
  const steps =
    block.axisSteps ?? [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f * 100) / 100);

  const axis =
    `<div class="rank-axis">` +
    steps.map((v) => `<span class="tick-label">${fmtTick(v)}%</span>`).join("") +
    `</div>`;

  let lastKey = null;
  const rows = items
    .map((m) => {
      let tierHead = "";
      let tier = null;
      const width = measured ? (m.value / max) * 100 : pct(m.count, n);
      if (tiers) {
        tier = bucketOf(pct(m.count, n), tiers);
        if (tier.key !== lastKey) {
          lastKey = tier.key;
          tierHead =
            `<div class="tier-head">` +
            `<span class="tier-name num" style="color:${tokenVar(tier.color)}">${esc(tier.key)}</span>` +
            `<span class="tick-label">${esc(tier.rangeLabel)}</span>` +
            `<span class="rule-fill"></span></div>`;
        }
      }
      const fill = fillClass(m.color ?? tier?.color ?? "coral");
      const valueHtml = measured
        ? `<b>${fmt(m.value)}%</b>${m.sub ? `<span class="den"> · ${esc(m.sub)}</span>` : ""}`
        : `<b>${pct(m.count, n)}%</b><span class="den"> · ${m.count}/${n}</span>`;
      const aria = measured
        ? `${m.label}: ${fmt(m.value)} percent${m.sub ? `, ${m.sub}` : ""}`
        : `${m.label}: ${pct(m.count, n)} percent, ${m.count} of ${n}${tier ? `, ${tier.key}` : ""}`;
      return `<li>${tierHead}<div class="chart-row"${tipAttrs(m.tip, aria)}>
  <span class="row-label${block.strong ? " strong" : ""}">${esc(m.label)}</span>
  <span class="track"><span class="bar-fill ${fill}" style="width:${width}%"></span></span>
  <span class="chart-value num">${valueHtml}</span>
</div></li>`;
    })
    .join("\n");

  return `${axis}
<ul class="rank-list">${rows}</ul>`;
}
