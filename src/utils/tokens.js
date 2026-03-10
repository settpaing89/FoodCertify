// src/utils/tokens.js
// Single source of truth for all visual design constants.
// Import from here — never use raw fontSize, fontWeight, shadow, or radius values in screens.

// ─── Color System — Charcoal + Forest Green ───────────────────────────────────

export const COLORS = {
  // Backgrounds
  background:       '#F5F5F5',
  surface:          '#FFFFFF',
  surfaceSecondary: '#EAEFEA',

  // ONE dark color for ALL dark elements
  primary:     '#1C1C1E',   // nav text, headings, body text
  hero:        '#1C1C1E',   // hero cards, avatar, floating scan button
  heroText:    '#FFFFFF',   // text on dark hero elements
  heroSubtext: '#A0A0A8',   // muted text on dark hero elements
  heroAccent:  '#2D6A4F',   // forest green accent on dark backgrounds

  // ONE accent for ALL interactive elements
  accent:      '#2D6A4F',   // CTAs, active states, key numbers, links
  accentLight: '#DCFCE7',   // icon backgrounds ONLY — never large areas

  // Safety ratings — never substitute with accent
  safe:              '#2D6A4F',
  safeBackground:    '#DCFCE7',
  caution:           '#D97706',
  cautionBackground: '#FEF3C7',
  avoid:             '#DC2626',
  avoidBackground:   '#FEE2E2',

  // Text
  textPrimary:   '#1C1C1E',
  textSecondary: '#6B6B70',
  textInverse:   '#FFFFFF',

  // UI
  border:  '#E0E4E0',
  divider: '#F0F2F0',

  // Tab bar
  tabBarActive:     '#2D6A4F',
  tabBarInactive:   '#9A9AA0',
  tabBarBackground: '#FFFFFF',

  // Source tag pills
  sourceFda:          '#E0F2FE',
  sourceFdaText:      '#0369A1',
  sourcePersonal:     '#DCFCE7',
  sourcePersonalText: '#2D6A4F',
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  displayBold:     'Outfit_700Bold',
  displaySemibold: 'Outfit_600SemiBold',
  body:            'Inter_400Regular',
  bodyMedium:      'Inter_500Medium',
  bodySemibold:    'Inter_600SemiBold',
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
