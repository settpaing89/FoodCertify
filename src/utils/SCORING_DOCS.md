# FoodSafe Scoring Logic Documentation

**File:** `src/engine/analyzer.js`
**Constants:** `src/utils/scoringConstants.js`
**Last updated:** 2026-03-06

---

## Overview

The main function is:

```js
analyzeIngredients(ingredientText, selectedConditions, dietaryPrefs = null, nutriments = null)
```

Called from:
- `ScannerScreen.js` — after barcode lookup, passes `product.ingredients`, `conditions`, `dietaryPrefs`, `product.nutriments`
- `ManualEntryScreen.js` — passes typed text, `conditions`, `dietaryPrefs`, no nutriments

Returns `null` if `ingredientText` is empty/blank or `selectedConditions` is empty.

---

## Inputs

| Parameter | Type | Source |
|---|---|---|
| `ingredientText` | string | Raw ingredient text from Open Food Facts or typed by user |
| `selectedConditions` | string[] | User's saved conditions. Values: `diabetes`, `gluten`, `peanut`, `vegan`, `vegetarian` |
| `dietaryPrefs` | object \| null | User's dietary prefs from ExploreScreen, via `useDietaryPrefs()` |
| `nutriments` | object \| null | Nutriment data from Open Food Facts. Per-100g fields always present; `_serving` fields present when the product has a defined serving size |

---

## Layer 1 — Ingredient Database Scan

`INGREDIENT_DB` is a hardcoded dictionary of ~90 ingredient strings. Each entry has:
- `conditions`: which user conditions it applies to
- `severity`: `'avoid'` or `'caution'`
- `reason`: plain English explanation
- `category`: grouping label

**Process:**
1. Lowercase the full ingredient text
2. Sort all `INGREDIENT_DB` keys by length descending (longest match first, prevents "peanut" matching before "peanut butter")
3. For each key: substring match against lowercased text
4. Only flag if key's conditions overlap with the user's selected conditions

**Conditions and severities:**

| Condition | AVOID ingredients | CAUTION ingredients |
|---|---|---|
| `diabetes` | high fructose corn syrup, glucose syrup, rice syrup | corn syrup, maltodextrin, dextrose, sucrose, fructose, invert sugar, agave nectar |
| `gluten` | wheat (all forms), barley, rye, malt, gluten, spelt, kamut, semolina, triticale, durum, farro, einkorn, bulgur, couscous, fu, seitan | oats |
| `peanut` | peanuts, peanut, peanut oil, peanut butter, groundnut, groundnut oil, arachis oil | mixed nuts, may contain peanuts, facility advisory |
| `vegan` | milk (all forms), cheese, butter, cream, whey, casein, caseinate, lactose, eggs, albumin, honey | worcestershire sauce, l-cysteine, e920, natural flavors |
| `vegan` + `vegetarian` | gelatin, lard, tallow, anchovies, fish sauce, carmine, e120, cochineal, shellac, e904, isinglass, rennet, animal rennet, chicken broth, beef extract | worcestershire sauce, l-cysteine, e920 |

Results go into `found[]` array.

---

## Layer 2 — Personal Blacklist

Only runs if `dietaryPrefs.enabled === true` AND `dietaryPrefs.blacklist` has entries.

- Each blacklist term is substring-matched (case-insensitive)
- All hits produce `severity: 'avoid'`, `category: 'Personal Blacklist'`

Results pushed into `found[]`.

---

## Layer 3 — User-Defined Nutrient Limits

Only runs if `dietaryPrefs.enabled === true` AND `nutriments` is not null.

Compares per-100g values against the user's custom min/max limits set in ExploreScreen. All hits produce `severity: 'caution'`, `category: 'Nutrient Limit'`.

Results pushed into `found[]`.

> Note: uses per-100g values only. Not per-serving.

---

## Layer 4 — WHO/FDA Nutrient Threshold Check

Applies regardless of user configuration. Uses constants from `src/utils/scoringConstants.js`.

**Thresholds (per serving):**

| Nutrient | Safe threshold | Caution threshold | Unit |
|---|---|---|---|
| Sodium | 600 | 900 | mg |
| Sugar | 6 | 12 | g |
| Saturated Fat | 3 | 5 | g |
| Trans Fat | 0 | 0.5 | g |
| Calories | 300 | 500 | kcal |

**Data source priority:**
1. `_serving` fields (e.g., `sodium_serving`) — preferred, uses actual serving size
2. `_100g` fields (e.g., `sodium_100g`) — fallback when serving data is absent

**Severity rules:**
- `value > caution threshold` → `severity: 'avoid'`
- `value > safe threshold AND value ≤ caution threshold` → `severity: 'caution'`
- `value ≤ safe threshold` → no flag

Results go into `nutrientFlags[]` (separate from `found[]`).

**Reason string examples:**
- `"Sodium: 1,240.0mg per serving — exceeds the recommended 900mg limit."`
- `"Sugar: 8.2g per serving — above the 6g recommended threshold."`

---

## Layer 5 — NOVA Processing Level

Reads `nutriments.nova_group`. Skips gracefully if the field is absent.

| NOVA Group | Meaning | Flag produced |
|---|---|---|
| 1 | Unprocessed / whole food | None |
| 2 | Minimally processed | None |
| 3 | Processed | `severity: 'caution'`, category `'Processing Level'` |
| 4 | Ultra-processed | `severity: 'caution'`, category `'Processing Level'` |

> `nova_group` and `nutriscore_grade` are merged into the nutriments object in `ScannerScreen.js` before being passed to the analyzer.

---

## Layer 6 — Nutri-Score

Reads `nutriments.nutriscore_grade`. Skips gracefully if absent.

| Grade | Flag produced |
|---|---|
| A, B | None |
| C | `severity: 'caution'`, category `'Nutri-Score'` |
| D, E | `severity: 'caution'`, category `'Nutri-Score'` |

> Same as NOVA — passed via the merged nutriments object in `ScannerScreen.js`.

---

## Layer 7 — Beneficial Nutrients

Reads fiber and protein values (`_serving` preferred, `_100g` fallback).

**Thresholds:**
| Nutrient | Good threshold |
|---|---|
| Fiber | ≥ 3g |
| Protein | ≥ 5g |

Returns a `beneficialNote` object if both thresholds are met. Used in the beneficial bonus below.

---

## Final Rating Logic

```
allFlags = found[] + nutrientFlags[] + novaFlag? + nutriscoreFlag?

hasAvoidFlag     = any flag in allFlags has severity 'avoid'
hasConditionFlag = found[].length > 0  (ingredient DB + blacklist + user prefs = direct triggers)
softCautionFlags = caution-level flags from: nutrientFlags + novaFlag + nutriscoreFlag only

AVOID   — hasAvoidFlag
CAUTION — hasConditionFlag
        OR softCautionFlags.length >= 2
SAFE    — everything else
```

**Beneficial bonus** (upgrades CAUTION → SAFE):
All of the following must be true:
- Rating is currently CAUTION
- `beneficialNote` is not null (fiber ≥ 3g AND protein ≥ 5g)
- `hasConditionFlag` is false
- Exactly 1 soft caution flag, and it is category `'Nutrient'`

---

## Return Object

```js
{
  rating: 'SAFE' | 'CAUTION' | 'AVOID',

  issues: [
    // All flags from all layers combined
    {
      ingredient: string,        // matched name or label (e.g. "Sodium", "NOVA Group 4")
      severity: 'avoid' | 'caution',
      reason: string,            // plain English with actual values and thresholds
      category: string,          // 'Sugar / Sweetener' | 'Grain' | 'Nutrient' | 'Processing Level' |
                                 // 'Nutri-Score' | 'Personal Blacklist' | 'Nutrient Limit' | etc.
      conditions: string[],      // e.g. ['diabetes'], ['dietary']
      novaGroup?: number,        // only present on NOVA flags
    },
    ...
  ],

  conditionBreakdown: {
    // Keyed by condition ID. Built only from found[] (layers 1–3), not from nutrient/NOVA/Nutri-Score flags
    [conditionId]: {
      id, label, icon, color, bg,
      issues: [...],
      status: 'SAFE' | 'CAUTION' | 'AVOID',
    },
  },

  summary: string,           // one-sentence plain English verdict
  tips: string[],            // actionable tips per triggered condition
  checkedConditions: number,
  flaggedCount: number,      // total flags across all layers
  beneficialNutrients: {     // null if thresholds not met or data unavailable
    fiber: number,
    protein: number,
    note: string,
  } | null,
  analyzedAt: string,        // ISO timestamp
}
```

---

## All Threshold Values — Single Source of Truth

All numbers live in `src/utils/scoringConstants.js`. Zero hardcoded thresholds remain in `analyzer.js`.

```js
NUTRIENT_THRESHOLDS = {
  sodium:       { safe: 600,  caution: 900,  unit: 'mg'   },
  sugars:       { safe: 6,    caution: 12,   unit: 'g'    },
  saturatedFat: { safe: 3,    caution: 5,    unit: 'g'    },
  transFat:     { safe: 0,    caution: 0.5,  unit: 'g'    },
  calories:     { safe: 300,  caution: 500,  unit: 'kcal' },
}

BENEFICIAL_NUTRIENTS = {
  fiber:   { goodThreshold: 3, unit: 'g' },
  protein: { goodThreshold: 5, unit: 'g' },
}

NOVA_THRESHOLDS   = { safe: [1,2], caution: [3], avoid: [4] }
NUTRISCORE_THRESHOLDS = { safe: ['A','B'], caution: ['C'], avoid: ['D','E'] }
```

---

## Worked Example — Tim Hortons Hot Chocolate (Large)

**Product data (approximate, typical values):**
- Ingredients: Water, Skim Milk, Sugar, Cocoa, Modified Milk Ingredients, Salt, Natural Flavour
- Nutriments per serving (~354ml):
  - Calories: 320 kcal
  - Sugar: 44g
  - Sodium: 330mg
  - Saturated Fat: 3.5g
  - Trans Fat: 0g
  - Fiber: 1g
  - Protein: 8g
- NOVA Group: not available in current call
- Nutri-Score: not available in current call
- User conditions: `diabetes`

---

### Layer 1 — Ingredient DB Scan

Ingredient text (lowercased): `"water, skim milk, sugar, cocoa, modified milk ingredients, salt, natural flavour"`

Checking against `INGREDIENT_DB` for condition `diabetes`:

| Check | Found? | Severity |
|---|---|---|
| `high fructose corn syrup` | No | — |
| `glucose syrup` | No | — |
| `corn syrup` | No | — |
| `sucrose` | No (listed as "sugar", not "sucrose") | — |
| `maltodextrin` | No | — |
| `dextrose` | No | — |

**Result:** 0 ingredient DB flags. `found[] = []`

Also checking `vegan`:

| Check | Found? | Severity |
|---|---|---|
| `skim milk` | Yes | AVOID |

But user has NOT selected `vegan`, so this is not relevant. Only `diabetes` is active.

`found[] = []` — `hasConditionFlag = false`

---

### Layer 2 — Personal Blacklist

Assume user has no blacklist configured.

`found[] = []` (unchanged)

---

### Layer 3 — User Nutrient Limits

Assume user has not configured custom dietary limits in ExploreScreen (`dietaryPrefs.enabled = false`).

Skipped. `found[] = []` (unchanged)

---

### Layer 4 — WHO/FDA Nutrient Thresholds

Checking per-serving values:

| Nutrient | Value | Safe | Caution | Result |
|---|---|---|---|---|
| Calories | 320 kcal | 300 | 500 | **320 > 300** → CAUTION flag |
| Sugar | 44g | 6 | 12 | **44 > 12** → AVOID flag |
| Sodium | 330mg | 600 | 900 | 330 ≤ 600 → no flag |
| Saturated Fat | 3.5g | 3 | 5 | **3.5 > 3** → CAUTION flag |
| Trans Fat | 0g | 0 | 0.5 | 0 ≤ 0 → no flag |

`nutrientFlags[] = [`
- `{ ingredient: 'Calories', severity: 'caution', reason: 'Calories: 320.0kcal per serving — above the 300kcal recommended threshold.' }`
- `{ ingredient: 'Sugar', severity: 'avoid', reason: 'Sugar: 44.0g per serving — exceeds the recommended 12g limit.' }`
- `{ ingredient: 'Saturated Fat', severity: 'caution', reason: 'Saturated Fat: 3.5g per serving — above the 3g recommended threshold.' }`
`]`

---

### Layer 5 — NOVA Group

`nutriments.nova_group` not present → skipped. `novaFlag = null`

---

### Layer 6 — Nutri-Score

`nutriments.nutriscore_grade` not present → skipped. `nutriscoreFlag = null`

---

### Layer 7 — Beneficial Nutrients

Fiber: 1g (below 3g threshold). Not both met. `beneficialNote = null`

---

### Final Rating

```
allFlags = [] + [Calories(caution), Sugar(avoid), Saturated Fat(caution)]
         = 3 flags

hasAvoidFlag     = true  (Sugar: 44g → avoid)
hasConditionFlag = false
softCautionFlags = [Calories, Saturated Fat]  (2 caution flags)
```

`hasAvoidFlag = true` → **rating = AVOID**

Beneficial bonus: not evaluated (only applies when rating is CAUTION)

---

### Final Output

```
rating: 'AVOID'
flaggedCount: 3
issues: [
  { ingredient: 'Sugar',        severity: 'avoid',   reason: 'Sugar: 44.0g per serving — exceeds the recommended 12g limit.' }
  { ingredient: 'Calories',     severity: 'caution', reason: 'Calories: 320.0kcal per serving — above the 300kcal recommended threshold.' }
  { ingredient: 'Saturated Fat',severity: 'caution', reason: 'Saturated Fat: 3.5g per serving — above the 3g recommended threshold.' }
]
summary: "This product contains 1 ingredient that is NOT recommended for your health conditions. We strongly advise avoiding this product."
beneficialNutrients: null
```

This is the correct outcome. A large Tim Hortons Hot Chocolate has 44g of sugar per serving — more than 3× the safe threshold and nearly 4× the caution threshold — which correctly produces AVOID.

---

## Files Involved in Scoring

| File | Role |
|---|---|
| `src/engine/analyzer.js` | All scoring logic and ingredient database |
| `src/utils/scoringConstants.js` | Single source of truth for all threshold values |
| `src/engine/api.js` | Fetches and normalizes product data; exposes `novaGroup`, `nutriscoreGrade` at product level |
| `src/hooks/useStorage.js` | `useConditions()` and `useDietaryPrefs()` |
| `src/screens/ScannerScreen.js` | Calls `analyzeIngredients()` after barcode scan |
| `src/screens/ManualEntryScreen.js` | Calls `analyzeIngredients()` for manually typed ingredients |
| `src/screens/ResultScreen.js` | Displays results; calls `calculateNutriScore()` for display only |
| `src/screens/ExploreScreen.js` | Where users configure dietary prefs and nutrient limits |

---

## Known Limitations

| Limitation | Impact | Fix |
|---|---|---|
| NOVA and Nutri-Score only active for barcode scans | ManualEntryScreen doesn't pass nutriments so those layers are skipped there — correct behaviour since manual entry has no product metadata | No action needed |
| Layer 3 (user nutrient limits) uses per-100g, not per-serving | Inconsistency with Layer 4 | Update `checkNutrientLimits` to also try `_serving` fields |
| `calculateNutriScore()` (display) and Layer 6 (scoring) are separate | Two Nutri-Score calculations in the app | Once NOVA/Nutri-Score are activated, the display can use the API grade directly |
