/* ============================================================
   components/figures.js — headline figures, major finding,
   measured-vs-interpretation panels, validation ledger.
   Pure renderers (HTML strings); validation has a pure
   row-filter used by its DOM wiring.
   ============================================================ */

import { esc } from "../lib/util.js";
import { tipAttrs } from "./evidence.js";

/* ---------- KPI / headline statistics ---------- */

/** Hairline grid of stats; the lead KPI is inverted (ink surface). */
export function renderKpis(kpis) {
  const cells = kpis
    .map((k, i) => {
      const lead = k.lead ?? i === 0;
      return `<div class="kpi${lead ? " lead" : ""}"${tipAttrs(k.tip, `${k.value} ${k.label}, ${k.sub}`)}>
  <span class="kpi-value num">${esc(k.value)}</span>
  <span>
    <span class="kpi-label">${esc(k.label)}</span>
    <span class="kpi-sub num">${esc(k.sub)}</span>
  </span>
</div>`;
    })
    .join("\n");
  return `<div class="kpi-grid">${cells}</div>`;
}

/* ---------- major finding ---------- */

/** The study's headline statement with its supporting figure. */
export function renderFinding(f) {
  return `<div class="finding"${tipAttrs(f.tip, `${f.value} — ${f.statement}`)}>
  <div class="finding-kicker num">Finding ${esc(f.num)}</div>
  <div class="finding-body">
    <p class="finding-statement">${esc(f.statement)}</p>
    <div>
      <span class="finding-value num">${esc(f.value)}</span>
      <div class="finding-value-label">${esc(f.valueLabel)}</div>
    </div>
  </div>
</div>`;
}

/* ---------- measured vs interpretation ---------- */

function dpanel(p, tone) {
  return `<div class="dpanel ${tone}">
  <div class="dpanel-kicker">
    <span class="chip"></span>
    <h3>${esc(p.kicker)}</h3>
  </div>
  <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
</div>`;
}

/** The two columns never mix: solid-border measured, dashed-coral reading. */
export function renderDuality(d) {
  return `<div class="duality">${dpanel(d.measured, "measured")}${dpanel(d.interpretation, "reading")}</div>`;
}

/* ---------- validation ledger ---------- */

export function validationRows(rows, open) {
  return open ? rows : rows.filter((r) => r.status === "discrepancy").slice(0, 6);
}

export function renderValidationRows(rows) {
  return rows
    .map(
      (v) => `<tr>
  <td class="cell-strong">${esc(v.metric)}</td>
  <td class="cell-muted">${esc(v.category)}</td>
  <td class="col-mono">${esc(v.report)}</td>
  <td class="col-mono cell-muted">${esc(v.recon)}</td>
  <td class="col-mono">${esc(v.diff)}</td>
  <td><span class="num ${v.status === "validated" ? "status-ok" : "status-flag"}">${
        v.status === "validated" ? "✓ validated" : "▲ discrepancy"
      }</span></td>
</tr>`
    )
    .join("");
}

export function renderValidation(v) {
  const cards = v.cards
    .map(
      ([a, b, c]) => `<div>
  <span class="a num">${esc(a)}</span>
  <span class="b">${esc(b)}</span>
  <span class="c">${esc(c)}</span>
</div>`
    )
    .join("\n");
  const initial = renderValidationRows(validationRows(v.rows, false));
  return `<div class="val-cards">${cards}</div>
<div class="tablebox">
  <table class="data">
    <caption class="sr-only">Published figures compared with the appendix reconstruction</caption>
    <thead>
      <tr><th>Metric</th><th>Category</th><th>Published</th><th>Reconstruction</th><th>Diff</th><th>Status</th></tr>
    </thead>
    <tbody data-val-body>${initial}</tbody>
  </table>
</div>
<button class="btn" type="button" data-val-toggle>Show all ${v.rows.length} checked metrics</button>
${v.note ? `<p class="note">${esc(v.note)}</p>` : ""}`;
}

/** DOM wiring for the show-all / flagged-only toggle. */
export function wireValidation(root, v) {
  const btn = root.querySelector("[data-val-toggle]");
  const body = root.querySelector("[data-val-body]");
  if (!btn || !body) return;
  let open = false;
  btn.addEventListener("click", () => {
    open = !open;
    body.innerHTML = renderValidationRows(validationRows(v.rows, open));
    btn.textContent = open
      ? "Show flagged discrepancies only"
      : `Show all ${v.rows.length} checked metrics`;
  });
}
