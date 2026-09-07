/* lib/util.js — tiny shared helpers (pure, DOM-free, node-testable) */

/** Escape untrusted/plain-text values before interpolation into HTML strings. */
export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Share of n as a whole-number percentage (reference convention). */
export function pct(count, n) {
  return Math.round((count / n) * 100);
}

/**
 * PROJECT ADDITION (AI-job-postings dashboard; see DATA-NOTES.md):
 * format a measured percentage for display at 0.01 precision.
 * The OWID indicator publishes shares directly; the template's
 * whole-number pct(count, n) would distort 0.2–4.7% values.
 */
export function fmt(value) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

/** PROJECT ADDITION: format an axis tick — integers plain, else one decimal. */
export function fmtTick(v) {
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
}

/** Sanitize a token name arriving from data (charset allowlist). */
export function tokenName(name) {
  return String(name || "").replace(/[^a-z0-9-]/gi, "");
}

/** Resolve a data color-token name to a CSS var() reference. */
export function tokenVar(name) {
  return `var(--${tokenName(name)})`;
}

/**
 * Resolve a data color-token name to a fill class.
 * Data may only reference token names — never raw colors.
 */
export function fillClass(name) {
  return `fill-${tokenName(name) || "coral"}`;
}
