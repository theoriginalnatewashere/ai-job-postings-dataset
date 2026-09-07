/* ============================================================
   charts/registry.js — chart selection boundary
   The ENCODING (chart type) is a methodology decision recorded
   in the dataset (block.encoding). The registry maps an
   encoding to a presentation renderer; it deliberately knows
   nothing about any specific study.

   Renderer contract (see README.md):
   (block, ctx) => HTML string, pure, DOM-free.
   block:   { type:"chart", encoding, dataset, ...presentation opts }
   ctx:     { n, tiers, getDataset(name) }
   ============================================================ */

const renderers = new Map();

export function registerChart(encoding, renderFn) {
  renderers.set(encoding, renderFn);
}

export function renderChart(block, ctx) {
  const fn = renderers.get(block.encoding);
  if (!fn) {
    throw new Error(
      `No renderer for encoding "${block.encoding}". ` +
        `Available: ${[...renderers.keys()].join(", ")}. ` +
        `Choose an encoding supported by the data (research-visualization methodology decides), ` +
        `or add a renderer under js/charts/.`
    );
  }
  return fn(block, ctx);
}

export function availableEncodings() {
  return [...renderers.keys()];
}
