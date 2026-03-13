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

// ─────────────────────────────────────────────────────────────────────────────
// Goal Presets — evidence-based per-serving targets
// ─────────────────────────────────────────────────────────────────────────────

export const GOAL_PRESETS = [
  {
    id: 'heart_healthy',
    name: 'Heart Healthy',
    description: 'Low sodium & saturated fat',
    limits: {
      sodium:       { max: 400, unit: 'mg' },
      saturatedFat: { max: 2,   unit: 'g'  },
      sugar:        { max: 5,   unit: 'g'  },
      transFat:     { max: 0,   unit: 'g'  },
    },
  },
  {
    id: 'keto',
    name: 'Keto',
    description: 'Very low carb, high fat',
    limits: {
      carbohydrates: { max: 5,  unit: 'g' },
      sugar:         { max: 2,  unit: 'g' },
      protein:       { max: 20, unit: 'g' },
    },
    minimums: {
      fiber:         { min: 2,  unit: 'g' },
    },
  },
  {
    id: 'cutting',
    name: 'Cutting',
    description: 'Caloric deficit, high protein',
    limits: {
      calories:     { max: 350, unit: 'kcal' },
      sugar:        { max: 6,   unit: 'g'    },
      saturatedFat: { max: 3,   unit: 'g'    },
      sodium:       { max: 500, unit: 'mg'   },
    },
    minimums: {
      protein:      { min: 20,  unit: 'g'    },
    },
  },
  {
    id: 'bulking',
    name: 'Bulking',
    description: 'Caloric surplus, high protein',
    minimums: {
      calories:      { min: 400, unit: 'kcal' },
      protein:       { min: 25,  unit: 'g'    },
      carbohydrates: { min: 30,  unit: 'g'    },
    },
    limits: {
      saturatedFat:  { max: 5,   unit: 'g'    },
      sodium:        { max: 600, unit: 'mg'   },
    },
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: 'Heart-smart, whole foods',
    limits: {
      saturatedFat: { max: 3,   unit: 'g'  },
      sodium:       { max: 400, unit: 'mg' },
      sugar:        { max: 6,   unit: 'g'  },
      transFat:     { max: 0,   unit: 'g'  },
    },
    minimums: {
      fiber:        { min: 3,   unit: 'g'  },
    },
  },
  {
    id: 'high_protein',
    name: 'High Protein',
    description: 'Muscle maintenance & growth',
    minimums: {
      protein:      { min: 20,  unit: 'g'    },
    },
    limits: {
      calories:     { max: 400, unit: 'kcal' },
      sugar:        { max: 8,   unit: 'g'    },
      saturatedFat: { max: 4,   unit: 'g'    },
    },
  },
];

export const PRESET_REFERENCES = [
  {
    presetId: 'heart_healthy',
    name: 'Heart Healthy',
    rationale: 'Based on the American Heart Association and American College of Cardiology dietary guidelines. Limits sodium, saturated fat, added sugars, and trans fats per serving to reduce cardiovascular disease risk.',
    keyLimits: [
      'Sodium ≤ 400mg per serving (daily max 1,500–2,300mg)',
      'Saturated fat ≤ 2g per serving (< 6% of total daily calories)',
      'Added sugar ≤ 5g per serving',
      'Trans fat: 0g (no safe threshold)',
    ],
    references: [
      {
        title: 'AHA 2021 Dietary Guidance to Improve Cardiovascular Health',
        journal: 'Circulation, American Heart Association',
        year: '2021',
        url: 'https://www.ahajournals.org/doi/10.1161/cir.0000000000001031',
      },
      {
        title: 'AHA/ACC Guideline on Lifestyle Management to Reduce Cardiovascular Risk',
        journal: 'Circulation, American Heart Association',
        year: '2013',
        url: 'https://www.ahajournals.org/doi/10.1161/cir.0000000000000462',
      },
      {
        title: 'Saturated Fat Guidelines',
        journal: 'American Heart Association',
        year: '2023',
        url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats',
      },
    ],
  },
  {
    presetId: 'keto',
    name: 'Keto',
    rationale: 'Based on clinical research into very-low-carbohydrate ketogenic diets. Restricts carbohydrates to 20–50g/day to induce nutritional ketosis, shifting energy metabolism from glucose to ketone bodies.',
    keyLimits: [
      'Carbohydrates ≤ 5g per serving (daily max 20–50g)',
      'Sugar ≤ 2g per serving',
      'Protein ≤ 20g per serving (excess protein disrupts ketosis)',
      'Fiber ≥ 2g per serving (encouraged — keto is low-fiber by default)',
    ],
    references: [
      {
        title: 'The Ketogenic Diet: Clinical Applications, Evidence-based Indications, and Implementation',
        journal: 'StatPearls, NCBI Bookshelf',
        year: '2025',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK499830/',
      },
      {
        title: 'Diet Review: Ketogenic Diet for Weight Loss',
        journal: 'Harvard T.H. Chan School of Public Health — The Nutrition Source',
        year: '2025',
        url: 'https://nutritionsource.hsph.harvard.edu/healthy-weight/diet-reviews/ketogenic-diet/',
      },
      {
        title: 'Ketogenic Intervention for Obesity Weight-Loss: A Narrative Review',
        journal: 'PMC, National Library of Medicine',
        year: '2025',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11890254/',
      },
    ],
  },
  {
    presetId: 'cutting',
    name: 'Cutting',
    rationale: 'Based on evidence for fat loss while preserving lean muscle mass. A caloric deficit of 500–750 kcal/day with high protein intake (>22% of macronutrients) is recommended by major obesity and sports nutrition bodies.',
    keyLimits: [
      'Calories ≤ 350kcal per serving (supports daily 500–750 kcal deficit)',
      'Protein ≥ 20g per serving (preserves lean mass during deficit)',
      'Sugar ≤ 6g per serving',
      'Saturated fat ≤ 3g per serving',
      'Sodium ≤ 500mg per serving',
    ],
    references: [
      {
        title: 'Optimal Diet Strategies for Weight Loss and Weight Loss Maintenance',
        journal: 'PMC, Journal of Obesity & Metabolic Syndrome',
        year: '2021',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8017325/',
      },
      {
        title: 'Quantitative Analysis of Caloric Restriction vs Isocaloric Diets',
        journal: 'Frontiers in Nutrition',
        year: '2024',
        url: 'https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1493954/full',
      },
      {
        title: 'ISSN Position Stand: Diets and Body Composition',
        journal: 'Journal of the International Society of Sports Nutrition',
        year: '2017',
        url: 'https://link.springer.com/article/10.1186/s12970-017-0174-y',
      },
    ],
  },
  {
    presetId: 'bulking',
    name: 'Bulking',
    rationale: 'Based on ISSN and sports nutrition research for lean muscle gain. A 10% caloric surplus with 0.8–1g protein per pound of bodyweight maximizes muscle protein synthesis while minimizing fat accumulation.',
    keyLimits: [
      'Calories ≥ 400kcal per serving (supports caloric surplus)',
      'Protein ≥ 25g per serving (muscle protein synthesis)',
      'Carbohydrates ≥ 30g per serving (glycogen for training)',
      'Saturated fat ≤ 5g per serving',
      'Sodium ≤ 600mg per serving',
    ],
    references: [
      {
        title: 'ISSN Position Stand: Diets and Body Composition',
        journal: 'Journal of the International Society of Sports Nutrition',
        year: '2017',
        url: 'https://link.springer.com/article/10.1186/s12970-017-0174-y',
      },
      {
        title: 'Systematic Review and Meta-Analysis of Protein Intake to Support Muscle Mass',
        journal: 'PMC, Journal of Cachexia, Sarcopenia and Muscle',
        year: '2022',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8978023/',
      },
      {
        title: 'Macronutrient Considerations for the Sport of Bodybuilding',
        journal: 'PubMed, Journal of Sports Sciences',
        year: '2004',
        url: 'https://pubmed.ncbi.nlm.nih.gov/15107010/',
      },
    ],
  },
  {
    presetId: 'mediterranean',
    name: 'Mediterranean',
    rationale: 'One of the most studied dietary patterns in the world. Endorsed by the AHA and consistently ranked as the top diet for long-term health. Emphasizes whole foods, fiber, and healthy fats while limiting sodium, sugar, and saturated fat.',
    keyLimits: [
      'Saturated fat ≤ 3g per serving',
      'Sodium ≤ 400mg per serving',
      'Sugar ≤ 6g per serving',
      'Trans fat: 0g',
      'Fiber ≥ 3g per serving (strongly encouraged)',
    ],
    references: [
      {
        title: 'What is the Mediterranean Diet?',
        journal: 'American Heart Association',
        year: '2023',
        url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/mediterranean-diet',
      },
      {
        title: 'Popular Dietary Patterns: Alignment With AHA 2021 Dietary Guidance',
        journal: 'Circulation, American Heart Association',
        year: '2023',
        url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001146',
      },
      {
        title: 'Mediterranean Diet for Heart Health',
        journal: 'Mayo Clinic',
        year: '2023',
        url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/mediterranean-diet/art-20047801',
      },
    ],
  },
  {
    presetId: 'high_protein',
    name: 'High Protein',
    rationale: 'Based on ISSN and ACSM recommendations for active individuals. A daily protein intake of 1.4–2.0g/kg bodyweight supports lean mass gain, muscle preservation, and improved body composition.',
    keyLimits: [
      'Protein ≥ 20g per serving',
      'Calories ≤ 400kcal per serving',
      'Sugar ≤ 8g per serving',
      'Saturated fat ≤ 4g per serving',
    ],
    references: [
      {
        title: 'Dietary Protein and Muscle Mass: Translating Science to Application',
        journal: 'PMC, Nutrients',
        year: '2019',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6566799/',
      },
      {
        title: 'The Science of Protein and Muscle Growth',
        journal: 'ISSN & ACSM Guidelines Summary',
        year: '2025',
        url: 'https://foodmedcenter.org/the-science-of-protein-and-muscle-growth-what-the-evidence-really-shows/',
      },
      {
        title: 'Higher Protein During Energy Deficit Promotes Greater Lean Mass Gain',
        journal: 'PubMed, American Journal of Clinical Nutrition',
        year: '2016',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26817506/',
      },
    ],
  },
];
