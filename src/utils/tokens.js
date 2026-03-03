// src/utils/tokens.js
// Single source of truth for all visual design constants.
// Import from here — never use raw fontSize, fontWeight, shadow, or radius values in screens.

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  regular: 'System',
  medium:  'System',
  bold:    'System',
};

export const FONT_SIZE = {
  xs:      11,   // micro labels, ALL-CAPS section headers, badges
  sm:      13,   // captions, secondary descriptions, ghost button text
  md:      15,   // body text, input fields, row labels
  lg:      17,   // screen titles (top bar), prominent row labels
  xl:      20,   // modal titles, card headlines
  xxl:     26,   // section display headings
  display: 34,   // hero numbers, stat values, large decorative text
};

export const FONT_WEIGHT = {
  regular:  '400',  // body paragraphs, descriptions
  medium:   '500',  // secondary labels, captions
  semibold: '600',  // row labels, filter pills, settings items
  bold:     '700',  // button text, card titles, screen titles
};

// ─── Shadows — clean, subtle, Apple-style (neutral #000 base) ─────────────────

export const SHADOW = {
  sm: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  4,
    elevation:     2,
  },
  md: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  8,
    elevation:     4,
  },
  lg: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  16,
    elevation:     8,
  },
};

// ─── Border Radius ────────────────────────────────────────────────────────────

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
