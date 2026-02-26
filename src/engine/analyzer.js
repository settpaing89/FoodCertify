// src/engine/analyzer.js
// ─────────────────────────────────────────────────────────────────────────────
// FoodSafe Nutrition Safety Analysis Engine
// Analyzes ingredient lists against user health conditions.
// ─────────────────────────────────────────────────────────────────────────────

export const CONDITIONS = [
  { id: 'diabetes',    label: 'Diabetes',       icon: 'activity',  color: '#e53935', bg: '#fce4ec' },
  { id: 'gluten',      label: 'Gluten Allergy', icon: 'alert-circle', color: '#f57c00', bg: '#fff3e0' },
  { id: 'peanut',      label: 'Peanut Allergy', icon: 'shield',    color: '#6d4c41', bg: '#efebe9' },
  { id: 'vegan',       label: 'Vegan',          icon: 'leaf',      color: '#2e7d32', bg: '#e8f5e9' },
  { id: 'vegetarian',  label: 'Vegetarian',     icon: 'sun',       color: '#558b2f', bg: '#f1f8e9' },
];

// ─── Ingredient Database ──────────────────────────────────────────────────────
const INGREDIENT_DB = {
  // ── Diabetes ─────────────────────────────────────────────────────────────
  'high fructose corn syrup': {
    conditions: ['diabetes'], severity: 'avoid',
    reason: 'Rapidly spikes blood sugar and is strongly linked to insulin resistance and metabolic syndrome.',
    category: 'Sugar / Sweetener',
  },
  'corn syrup': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Simple sugar that raises blood glucose quickly with minimal nutritional value.',
    category: 'Sugar / Sweetener',
  },
  'glucose syrup': {
    conditions: ['diabetes'], severity: 'avoid',
    reason: 'Concentrated glucose — one of the fastest blood sugar elevators available.',
    category: 'Sugar / Sweetener',
  },
  'maltodextrin': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Has a glycemic index of ~185 — absorbs faster than table sugar.',
    category: 'Sugar / Thickener',
  },
  'dextrose': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Pure glucose — causes immediate blood sugar spike.',
    category: 'Sugar',
  },
  'sucrose': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Table sugar broken down rapidly to glucose in the bloodstream.',
    category: 'Sugar',
  },
  'fructose': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Metabolized directly by the liver, contributing to fatty liver and insulin resistance over time.',
    category: 'Sugar',
  },
  'invert sugar': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'Equal mix of glucose and fructose — rapidly absorbed.',
    category: 'Sugar / Sweetener',
  },
  'rice syrup': {
    conditions: ['diabetes'], severity: 'avoid',
    reason: 'Very high glycemic index (~98) — spikes blood sugar as fast as pure glucose.',
    category: 'Sugar / Sweetener',
  },
  'agave nectar': {
    conditions: ['diabetes'], severity: 'caution',
    reason: 'High in fructose (70–90%) which stresses the liver and worsens insulin sensitivity long-term.',
    category: 'Sweetener',
  },

  // ── Gluten ────────────────────────────────────────────────────────────────
  'wheat': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Primary source of gluten (gliadin + glutenin) — directly triggers celiac disease and NCGS reactions.',
    category: 'Grain',
  },
  'wheat flour': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Contains gliadin proteins that damage intestinal villi in celiac disease.',
    category: 'Grain',
  },
  'enriched wheat flour': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Refined wheat flour — high gluten content regardless of vitamin enrichment.',
    category: 'Grain',
  },
  'whole wheat': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Whole grain form of wheat — still contains full gluten proteins.',
    category: 'Grain',
  },
  'barley': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Contains hordein, a gluten-related protein that triggers immune reactions in sensitive individuals.',
    category: 'Grain',
  },
  'rye': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Contains secalin, another gluten-type prolamin that causes celiac flare-ups.',
    category: 'Grain',
  },
  'malt': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Usually derived from barley — contains gluten unless explicitly labeled gluten-free.',
    category: 'Additive / Flavoring',
  },
  'malt extract': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Barley malt derivative — contains gluten and unsafe for celiac disease.',
    category: 'Additive / Flavoring',
  },
  'malt vinegar': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Made from barley malt — retains gluten proteins unlike distilled vinegars.',
    category: 'Condiment',
  },
  'gluten': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Direct gluten content listed as an ingredient — completely unsafe for celiac and NCGS.',
    category: 'Protein',
  },
  'wheat gluten': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Concentrated wheat protein (seitan) — extremely high gluten content.',
    category: 'Protein',
  },
  'vital wheat gluten': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Pure gluten concentrate used in baking — must be avoided completely.',
    category: 'Protein',
  },
  'spelt': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Ancient wheat variety — despite some myths, still contains significant gluten.',
    category: 'Grain',
  },
  'kamut': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Ancient wheat species — contains gluten proteins similar to modern wheat.',
    category: 'Grain',
  },
  'semolina': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Coarsely ground durum wheat — high gluten content.',
    category: 'Grain',
  },
  'triticale': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Wheat-rye hybrid — contains gluten from both parent grains.',
    category: 'Grain',
  },
  'durum': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Hard wheat variety used for pasta — contains high-protein gluten.',
    category: 'Grain',
  },
  'oats': {
    conditions: ['gluten'], severity: 'caution',
    reason: 'Pure oats are gluten-free but almost always cross-contaminated with wheat in processing. Only certified GF oats are safe.',
    category: 'Grain',
  },
  'farro': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Ancient wheat grain — contains gluten and unsafe for celiac disease.',
    category: 'Grain',
  },
  'einkorn': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Primitive wheat variety — still contains gluten proteins despite being "ancient".',
    category: 'Grain',
  },
  'bulgur': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Parboiled cracked wheat — contains gluten.',
    category: 'Grain',
  },
  'couscous': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Made from semolina (durum wheat) — contains gluten.',
    category: 'Grain',
  },
  'fu': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Japanese wheat gluten product — extremely high gluten concentration.',
    category: 'Protein',
  },
  'seitan': {
    conditions: ['gluten'], severity: 'avoid',
    reason: 'Made entirely from wheat gluten — the highest gluten content food available.',
    category: 'Protein',
  },

  // ── Peanut ────────────────────────────────────────────────────────────────
  'peanuts': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Direct peanut allergen — can cause severe anaphylaxis in sensitized individuals.',
    category: 'Nut / Legume',
  },
  'peanut': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Peanut protein — primary allergen capable of triggering life-threatening reactions.',
    category: 'Nut / Legume',
  },
  'peanut oil': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Unless highly refined, retains allergenic peanut proteins. Unsafe unless labeled "refined cold-pressed".',
    category: 'Oil',
  },
  'peanut butter': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'High-concentration peanut allergen — a leading cause of severe anaphylaxis.',
    category: 'Spread',
  },
  'groundnut': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Alternate name for peanut — same allergenic proteins, same risk level.',
    category: 'Nut / Legume',
  },
  'groundnut oil': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Peanut (groundnut) oil — potential allergen unless fully refined.',
    category: 'Oil',
  },
  'arachis oil': {
    conditions: ['peanut'], severity: 'avoid',
    reason: 'Latin name for peanut oil — used in cosmetics and foods. Same allergy risk.',
    category: 'Oil',
  },
  'mixed nuts': {
    conditions: ['peanut'], severity: 'caution',
    reason: 'Often processed in facilities with peanuts — high cross-contamination risk.',
    category: 'Snack',
  },
  'may contain peanuts': {
    conditions: ['peanut'], severity: 'caution',
    reason: 'Cross-contamination advisory — indicates shared equipment or facility with peanut products.',
    category: 'Advisory',
  },
  'made in a facility that processes peanuts': {
    conditions: ['peanut'], severity: 'caution',
    reason: 'Facility-level cross-contamination risk — potentially unsafe for severe peanut allergy.',
    category: 'Advisory',
  },

  // ── Vegan ─────────────────────────────────────────────────────────────────
  'milk': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Dairy product from cows — excluded from all vegan diets.',
    category: 'Dairy',
  },
  'skim milk': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Fat-removed dairy — still fully animal-derived.',
    category: 'Dairy',
  },
  'nonfat milk': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Animal-derived dairy product.',
    category: 'Dairy',
  },
  'whole milk': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Full-fat cow\'s milk — animal product.',
    category: 'Dairy',
  },
  'cheese': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Dairy-derived and often contains animal rennet — not vegan.',
    category: 'Dairy',
  },
  'butter': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Dairy fat churned from cow\'s milk cream.',
    category: 'Dairy',
  },
  'cream': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'High-fat dairy from cow\'s milk.',
    category: 'Dairy',
  },
  'sour cream': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Fermented dairy cream — animal product.',
    category: 'Dairy',
  },
  'whey': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Milk protein byproduct from cheese production — commonly hidden in protein bars and breads.',
    category: 'Dairy Protein',
  },
  'whey protein': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Concentrated dairy whey — not compatible with vegan diets.',
    category: 'Dairy Protein',
  },
  'casein': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Primary milk protein — present in many "dairy-free" products deceptively.',
    category: 'Dairy Protein',
  },
  'caseinate': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Salt form of casein (milk protein) — animal-derived despite the altered name.',
    category: 'Dairy Protein',
  },
  'lactose': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Milk sugar — derived from animal dairy.',
    category: 'Dairy Sugar',
  },
  'egg': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Animal product — excluded from vegan diets.',
    category: 'Egg',
  },
  'eggs': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Animal product — excluded from vegan diets.',
    category: 'Egg',
  },
  'egg white': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Separated egg protein — still an animal product.',
    category: 'Egg',
  },
  'egg yolk': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Separated egg fat — animal-derived.',
    category: 'Egg',
  },
  'albumin': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Usually egg white protein — animal-derived binding agent.',
    category: 'Egg Protein',
  },
  'gelatin': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Made by boiling animal bones, skin, and connective tissue — a clear non-vegan ingredient.',
    category: 'Animal Derivative',
  },
  'honey': {
    conditions: ['vegan'], severity: 'avoid',
    reason: 'Produced by bees — excluded from vegan diets due to animal exploitation concerns.',
    category: 'Sweetener',
  },
  'lard': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Rendered pig fat — not suitable for vegetarians or vegans.',
    category: 'Animal Fat',
  },
  'tallow': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Rendered beef or mutton fat — animal product used in some fried foods.',
    category: 'Animal Fat',
  },
  'anchovies': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Small fish — hidden in sauces and dressings, incompatible with vegetarian/vegan diets.',
    category: 'Fish',
  },
  'fish sauce': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Fermented fish product — commonly hidden in Asian sauces and processed foods.',
    category: 'Fish',
  },
  'worcestershire sauce': {
    conditions: ['vegan', 'vegetarian'], severity: 'caution',
    reason: 'Traditional recipe contains anchovies — check label for vegan version.',
    category: 'Condiment',
  },
  'carmine': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Red dye made from crushed cochineal insects — hidden in red/pink foods.',
    category: 'Colorant',
  },
  'e120': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Carmine / cochineal — insect-derived red coloring.',
    category: 'Colorant',
  },
  'cochineal': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Crushed scale insects used as red colorant.',
    category: 'Colorant',
  },
  'shellac': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Resin secreted by lac bugs — used as food coating on candies and produce.',
    category: 'Coating',
  },
  'e904': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Shellac — insect-derived glazing agent.',
    category: 'Coating',
  },
  'isinglass': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Dried fish bladder used to clarify beer and wine — not listed on all labels.',
    category: 'Fining Agent',
  },
  'rennet': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Enzyme complex from calf stomach lining — makes most traditional cheeses non-vegetarian.',
    category: 'Enzyme',
  },
  'l-cysteine': {
    conditions: ['vegan', 'vegetarian'], severity: 'caution',
    reason: 'Often derived from duck feathers or animal hair — used as dough conditioner. Check source.',
    category: 'Amino Acid',
  },
  'e920': {
    conditions: ['vegan', 'vegetarian'], severity: 'caution',
    reason: 'L-cysteine — often animal-derived dough conditioner.',
    category: 'Additive',
  },
  'chicken broth': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Animal-derived stock — not suitable for vegetarians or vegans.',
    category: 'Flavoring',
  },
  'beef extract': {
    conditions: ['vegan', 'vegetarian'], severity: 'avoid',
    reason: 'Concentrated meat extract — hidden in savory snacks and soups.',
    category: 'Flavoring',
  },
  'natural flavors': {
    conditions: ['vegan'], severity: 'caution',
    reason: '"Natural flavors" can legally include animal-derived compounds. Contact manufacturer to verify.',
    category: 'Flavoring',
  },

  // ── Vegetarian specific ───────────────────────────────────────────────────
  'animal rennet': {
    conditions: ['vegetarian', 'vegan'], severity: 'avoid',
    reason: 'Enzyme from calf stomach — makes cheese non-vegetarian.',
    category: 'Enzyme',
  },
};

// ─── Main Analysis Function ───────────────────────────────────────────────────
export function analyzeIngredients(ingredientText, selectedConditions) {
  if (!ingredientText?.trim() || !selectedConditions?.length) {
    return null;
  }

  const lower = ingredientText.toLowerCase();
  const found = [];
  const seen = new Set();

  // Sort by length descending to match longest phrases first
  const sortedKeys = Object.keys(INGREDIENT_DB).sort((a, b) => b.length - a.length);

  for (const ingredient of sortedKeys) {
    if (seen.has(ingredient)) continue;
    if (!lower.includes(ingredient)) continue;

    const data = INGREDIENT_DB[ingredient];
    const relevantConditions = data.conditions.filter(c => selectedConditions.includes(c));

    if (relevantConditions.length > 0) {
      seen.add(ingredient);
      found.push({
        ingredient,
        severity: data.severity,
        reason: data.reason,
        category: data.category,
        conditions: relevantConditions,
      });
    }
  }

  // Determine overall rating
  const hasAvoid = found.some(f => f.severity === 'avoid');
  const hasCaution = found.some(f => f.severity === 'caution');
  const rating = hasAvoid ? 'AVOID' : hasCaution ? 'CAUTION' : 'SAFE';

  // Group issues by condition
  const conditionBreakdown = {};
  selectedConditions.forEach(cid => {
    const condInfo = CONDITIONS.find(c => c.id === cid);
    if (condInfo) {
      conditionBreakdown[cid] = {
        ...condInfo,
        issues: found.filter(f => f.conditions.includes(cid)),
        status: 'SAFE',
      };
    }
  });

  // Set per-condition status
  Object.values(conditionBreakdown).forEach(cond => {
    if (cond.issues.some(i => i.severity === 'avoid')) cond.status = 'AVOID';
    else if (cond.issues.some(i => i.severity === 'caution')) cond.status = 'CAUTION';
  });

  // Build nutritional summary
  const summary = buildSummary(rating, found, selectedConditions);
  const tips = buildTips(found, selectedConditions);

  return {
    rating,
    issues: found,
    conditionBreakdown,
    summary,
    tips,
    checkedConditions: selectedConditions.length,
    flaggedCount: found.length,
    analyzedAt: new Date().toISOString(),
  };
}

function buildSummary(rating, issues, conditions) {
  if (rating === 'SAFE') {
    return `Great news — no problematic ingredients were detected for your ${conditions.length} selected condition${conditions.length > 1 ? 's' : ''}. This product appears safe to consume.`;
  }
  if (rating === 'CAUTION') {
    const ingredients = issues.slice(0, 2).map(i => i.ingredient).join(', ');
    return `This product contains ${issues.length} ingredient${issues.length > 1 ? 's' : ''} that may concern you (${ingredients}${issues.length > 2 ? '...' : ''}). Consider consulting your doctor or dietitian.`;
  }
  return `This product contains ${issues.filter(i => i.severity === 'avoid').length} ingredient${issues.filter(i => i.severity === 'avoid').length > 1 ? 's' : ''} that are NOT recommended for your health conditions. We strongly advise avoiding this product.`;
}

function buildTips(issues, conditions) {
  const tips = [];
  if (conditions.includes('diabetes') && issues.some(i => i.conditions.includes('diabetes'))) {
    tips.push('Look for products with no added sugars or sweetened with stevia/erythritol instead.');
  }
  if (conditions.includes('gluten') && issues.some(i => i.conditions.includes('gluten'))) {
    tips.push('Look for the "Certified Gluten-Free" seal on packaging for guaranteed safety.');
  }
  if (conditions.includes('peanut') && issues.some(i => i.conditions.includes('peanut'))) {
    tips.push('Always carry your epinephrine auto-injector and check for facility cross-contamination warnings.');
  }
  if (conditions.includes('vegan') && issues.some(i => i.conditions.includes('vegan'))) {
    tips.push('Look for products with Vegan Society certification or "100% Plant-Based" labels.');
  }
  return tips;
}

// ─── Nutrient Score (from Open Food Facts data) ───────────────────────────────
export function calculateNutriScore(product) {
  if (!product?.nutriments) return null;

  const n = product.nutriments;
  let score = 0;
  let label = 'A';

  // Negative points (per 100g)
  const energy = n['energy-kcal_100g'] || 0;
  const sugars = n.sugars_100g || 0;
  const saturated = n['saturated-fat_100g'] || 0;
  const sodium = n.sodium_100g ? n.sodium_100g * 1000 : (n.salt_100g ? n.salt_100g * 400 : 0);

  score += energy > 335 ? 10 : energy > 270 ? 8 : energy > 203 ? 6 : energy > 135 ? 4 : energy > 67 ? 2 : 0;
  score += sugars > 45 ? 10 : sugars > 36 ? 8 : sugars > 27 ? 6 : sugars > 18 ? 4 : sugars > 9 ? 2 : 0;
  score += saturated > 10 ? 10 : saturated > 8 ? 8 : saturated > 6 ? 6 : saturated > 4 ? 4 : saturated > 2 ? 2 : 0;
  score += sodium > 900 ? 10 : sodium > 720 ? 8 : sodium > 540 ? 6 : sodium > 360 ? 4 : sodium > 180 ? 2 : 0;

  // Positive points
  const fiber = n.fiber_100g || 0;
  const protein = n.proteins_100g || 0;
  score -= fiber > 7 ? 5 : fiber > 5 ? 4 : fiber > 3 ? 3 : fiber > 1.5 ? 2 : fiber > 0.9 ? 1 : 0;
  score -= protein > 8 ? 5 : protein > 6.4 ? 4 : protein > 4.8 ? 3 : protein > 3.2 ? 2 : protein > 1.6 ? 1 : 0;

  label = score <= -1 ? 'A' : score <= 2 ? 'B' : score <= 10 ? 'C' : score <= 18 ? 'D' : 'E';
  return { label, score };
}
