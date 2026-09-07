/* charts/index.js — registers the built-in presentation renderers.
   Importing this module has the side effect of populating the
   registry. Add new encodings here (renderer contract: README).
   PROJECT ADDITION: "small-multiples" (per-entity shared-scale
   trend panels) for the AI-job-postings dataset. */

import { registerChart } from "./registry.js";
import { renderRankedBars } from "./ranked-bars.js";
import { renderGroupedBars } from "./grouped-bars.js";
import { renderDotMatrix } from "./dot-matrix.js";
import { renderStrip } from "./strip.js";
import { renderLine } from "./line.js";
import { renderScatter } from "./scatter.js";
import { renderSmallMultiples } from "./small-multiples.js";

registerChart("ranked-bars", renderRankedBars);
registerChart("grouped-bars", renderGroupedBars);
registerChart("dot-matrix", renderDotMatrix);
registerChart("strip", renderStrip);
registerChart("line", renderLine);
registerChart("scatter", renderScatter);
registerChart("small-multiples", renderSmallMultiples);
