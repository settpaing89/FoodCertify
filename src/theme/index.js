// src/theme/index.js

export const Colors = {
  // ── Primary / Hero dark ───────────────────────────────────────────────────
  primary:        '#1C1C1E',   // charcoal — text, headings, body
  primaryDark:    '#111112',   // gradient start for hero header BGs
  primaryLight:   '#2D6A4F',   // legacy alias — maps to accent
  primarySurface: '#DCFCE7',   // legacy alias — maps to accentLight
  primaryBorder:  '#E0E4E0',   // legacy alias — maps to border

  // ── Accent ────────────────────────────────────────────────────────────────
  accent:      '#2D6A4F',   // CTAs, active states, key numbers, links
  accentLight: '#DCFCE7',   // icon circle backgrounds ONLY

  // ── Hero / dark surface ───────────────────────────────────────────────────
  hero:        '#1C1C1E',   // hero cards, avatar, floating scan button
  heroText:    '#FFFFFF',   // text on dark hero elements
  heroSubtext: '#A0A0A8',   // muted text on dark hero elements
  heroAccent:  '#2D6A4F',   // accent on dark backgrounds

  // ── Safe – Forest Green ───────────────────────────────────────────────────
  safe:         '#2D6A4F',
  safeBg:       '#DCFCE7',
  safeBorder:   '#BBD5C8',
  safeText:     '#2D6A4F',
  safeGradient: ['#2D6A4F', '#1A4A38'],

  // ── Caution – Amber ───────────────────────────────────────────────────────
  caution:         '#D97706',
  cautionBg:       '#FEF3C7',
  cautionBorder:   '#FDE68A',
  cautionText:     '#B45309',
  cautionGradient: ['#D97706', '#B45309'],

  // ── Avoid – Red ───────────────────────────────────────────────────────────
  avoid:         '#DC2626',
  avoidBg:       '#FEE2E2',
  avoidBorder:   '#FECACA',
  avoidText:     '#991B1B',
  avoidGradient: ['#DC2626', '#B91C1C'],

  // ── Neutral surfaces ──────────────────────────────────────────────────────
  background:       '#F5F5F5',
  surface:          '#FFFFFF',
  surfaceVariant:   '#EAEFEA',   // legacy alias — maps to surfaceSecondary
  surfaceSecondary: '#EAEFEA',

  // ── UI outlines ───────────────────────────────────────────────────────────
  outline:        '#E0E4E0',   // legacy alias — maps to border
  outlineVariant: '#F0F2F0',   // legacy alias — maps to divider
  border:         '#E0E4E0',
  divider:        '#F0F2F0',

  // ── Text ──────────────────────────────────────────────────────────────────
  onSurface:        '#1C1C1E',   // legacy alias — maps to textPrimary
  onSurfaceVariant: '#6B6B70',   // legacy alias — maps to textSecondary
  onSurfaceMuted:   '#9A9AA0',   // muted / inactive icons and placeholders
  onPrimary:        '#FFFFFF',
  textPrimary:      '#1C1C1E',
  textSecondary:    '#6B6B70',
  textInverse:      '#FFFFFF',

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabBarActive:     '#2D6A4F',
  tabBarInactive:   '#9A9AA0',
  tabBarBackground: '#FFFFFF',

  // ── Source tag pills ──────────────────────────────────────────────────────
  sourceFda:          '#E0F2FE',
  sourceFdaText:      '#0369A1',
  sourcePersonal:     '#DCFCE7',
  sourcePersonalText: '#2D6A4F',

  // ── Conditions ────────────────────────────────────────────────────────────
  conditions: {
    diabetes:   { color: '#DC2626', bg: '#FEE2E2', icon: '🩺' },
    gluten:     { color: '#D97706', bg: '#FEF3C7', icon: '🌾' },
    peanut:     { color: '#D97706', bg: '#FEF3C7', icon: '🥜' },
    vegan:      { color: '#1C1C1E', bg: '#EAEFEA', icon: '🌿' },
    vegetarian: { color: '#2D6A4F', bg: '#DCFCE7', icon: '🥗' },
  },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

// H1: 26px Outfit Bold | H2: 20px Outfit SemiBold | Body: 15px Inter Regular
export const Typography = {
  h1: {
    fontSize: 26,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.3,
    color: Colors.onSurface,
  },
  h2: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.onSurface,
  },
  display: {
    fontSize: 30,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  headline: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.3,
    color: Colors.onSurface,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.onSurface,
  },
  body: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.onSurfaceVariant,
  },
  caption: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.onSurfaceMuted,
  },
};
