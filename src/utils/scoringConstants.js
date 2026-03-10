// src/utils/scoringConstants.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all scoring thresholds.
// Based on WHO and FDA Daily Value guidelines (per serving).
// ─────────────────────────────────────────────────────────────────────────────

// Per serving thresholds — based on WHO and FDA Daily Value guidelines
export const NUTRIENT_THRESHOLDS = {
  sodium:       { safe: 600,  caution: 900,  unit: 'mg' },
  sugars:       { safe: 6,    caution: 12,   unit: 'g'  },
  saturatedFat: { safe: 3,    caution: 5,    unit: 'g'  },
  transFat:     { safe: 0,    caution: 0.5,  unit: 'g'  },
  calories:     { safe: 300,  caution: 500,  unit: 'kcal' },
};

// Beneficial nutrients — presence improves score
export const BENEFICIAL_NUTRIENTS = {
  fiber:   { goodThreshold: 3, unit: 'g' },
  protein: { goodThreshold: 5, unit: 'g' },
};

// NOVA processing level thresholds
export const NOVA_THRESHOLDS = {
  safe:    [1, 2], // unprocessed, minimally processed
  caution: [3],    // processed
  avoid:   [4],    // ultra-processed
};

// Nutri-Score thresholds
export const NUTRISCORE_THRESHOLDS = {
  safe:    ['A', 'B'],
  caution: ['C'],
  avoid:   ['D', 'E'],
};

// Final rating logic weights
// AVOID if: any nutrient exceeds avoid threshold OR condition flag OR NOVA=4
// CAUTION if: 2+ nutrients in caution range OR NOVA=3 OR Nutri-Score C/D/E
// SAFE: everything else
