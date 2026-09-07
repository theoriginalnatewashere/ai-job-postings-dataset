/* ============================================================
   components/explorer.js — source explorer / table
   Port of the reference Explorer.tsx: native <table>, sortable
   header buttons (▲/▼, coral when active), search + select
   filters, live result count, empty-state row, external links.

   Filtering/sorting and row rendering are pure functions;
   only wireExplorer touches the DOM.
   ============================================================ */

import { esc } from "../lib/util.js";
import { tipAttrs } from "./evidence.js";

export function uniqueValues(records, key) {
  return [...new Set(records.map((r) => String(r[key] ?? "")).filter(Boolean))].sort();
}

export function defaultSortKey(cfg) {
  const col = cfg.columns.find((c) => c.sortable !== false);
  return col?.key ?? cfg.columns[0]?.key;
}

export function computeRows(cfg, state) {
  const needle = state.q.trim().toLowerCase();
  const rows = cfg.records.filter((r) => {
    for (const { key } of cfg.selects) {
      if (state.sel[key] && String(r[key] ?? "") !== state.sel[key]) return false;
    }
    if (!needle) return true;
    const hay = cfg.search.fields.map((f) => String(r[f] ?? "")).join(" ").toLowerCase();
    return hay.includes(needle);
  });
  const k = state.sortKey;
  const dir = state.dir;
  return [...rows].sort((a, b) => {
    const av = a[k];
    const bv = b[k];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv /* numeric columns sort numerically */
        : String(av ?? "").localeCompare(String(bv ?? ""));
    return cmp * dir;
  });
}

function renderCell(record, col, linkTip) {
  const v = record[col.key];
  if (col.link) {
    const attrs = linkTip ? tipAttrs(linkTip, `Original source: ${v}`) : "";
    return `<td><a class="ext-link" href="${esc(v)}" target="_blank" rel="noreferrer noopener"${attrs}>open ↗</a></td>`;
  }
  const cls = [col.mono ? "col-mono" : "", col.muted ? "cell-muted" : "", col.strong ? "cell-strong" : ""]
    .filter(Boolean)
    .join(" ");
  return `<td${cls ? ` class="${cls}"` : ""}>${esc(v)}</td>`;
}

function sortBtn(col, state) {
  const active = state.sortKey === col.key;
  const arrow = active && state.dir === -1 ? "▲" : "▼";
  const cls = active ? "arrow-active" : "arrow-idle";
  return `<button class="sort-btn" type="button" data-sort="${esc(col.key)}" aria-label="Sort by ${esc(col.label)}">${esc(col.label)}<span class="${cls}" aria-hidden="true">${arrow}</span></button>`;
}

export function renderBody(cfg, state) {
  const rows = computeRows(cfg, state);
  const trs = rows.length
    ? rows.map((r) => `<tr>${cfg.columns.map((c) => renderCell(r, c, cfg.linkTip)).join("")}</tr>`).join("")
    : `<tr class="empty-row"><td colspan="${cfg.columns.length}">No records match these filters.</td></tr>`;
  return {
    rowsHtml: trs,
    count: `${rows.length} of ${cfg.records.length} ${cfg.countLabel ?? "records"}`,
  };
}

export function renderExplorer(cfg) {
  const selects = cfg.selects
    .map(
      ({ key, label }) => `<label>
  <span class="tick-label">${esc(label)}</span>
  <select class="field" data-filter="${esc(key)}"><option value="">All</option>${uniqueValues(cfg.records, key)
        .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
        .join("")}</select>
</label>`
    )
    .join("\n");
  const initial = { sortKey: defaultSortKey(cfg), dir: 1 };
  const ths = cfg.columns
    .map((c) => (c.sortable === false ? `<th scope="col">${esc(c.label)}</th>` : `<th scope="col">${sortBtn(c, initial)}</th>`))
    .join("");
  return `<div class="filterbar">
  <label>
    <span class="tick-label">${esc(cfg.search.label)}</span>
    <input class="field" type="search" data-x-search placeholder="${esc(cfg.search.placeholder ?? "")}" style="min-width:16rem">
  </label>
  ${selects}
  <p class="result-count num" data-x-count></p>
</div>
<div class="tablebox">
  <table class="data">
    <caption class="sr-only">${esc(cfg.caption ?? "Source records")}</caption>
    <thead><tr>${ths}</tr></thead>
    <tbody data-x-body></tbody>
  </table>
</div>`;
}

export function wireExplorer(root, cfg) {
  const body = root.querySelector("[data-x-body]");
  const count = root.querySelector("[data-x-count]");
  const search = root.querySelector("[data-x-search]");
  if (!body || !count) return;
  const state = { q: "", sel: {}, sortKey: defaultSortKey(cfg), dir: 1 };

  function update() {
    const { rowsHtml, count: label } = renderBody(cfg, state);
    body.innerHTML = rowsHtml;
    count.textContent = label;
  }

  function refreshHeaders() {
    root.querySelectorAll("[data-sort]").forEach((btn) => {
      const active = btn.dataset.sort === state.sortKey;
      const span = btn.querySelector("span");
      if (span) {
        span.className = active ? "arrow-active" : "arrow-idle";
        span.textContent = active && state.dir === -1 ? "▲" : "▼";
      }
    });
  }

  search?.addEventListener("input", () => {
    state.q = search.value;
    update();
  });
  root.querySelectorAll("[data-filter]").forEach((sel) =>
    sel.addEventListener("change", () => {
      state.sel[sel.dataset.filter] = sel.value;
      update();
    })
  );
  root.querySelectorAll("[data-sort]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      state.dir = state.sortKey === key ? -state.dir : 1;
      state.sortKey = key;
      refreshHeaders();
      update();
    })
  );
  update();
}
