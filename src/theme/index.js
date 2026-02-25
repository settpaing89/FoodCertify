// src/theme/index.js

export const Colors = {
  // Primary – Deep Teal
  primary:       '#0C6B6B',
  primaryDark:   '#084E4E',
  primaryLight:  '#2E9494',
  primarySurface:'#E0F5F4',
  primaryBorder: '#A8E0DE',

  // Safe – Teal Green
  safe:       '#15BAA8',
  safeBg:     '#E0F8F5',
  safeBorder: '#8EDED8',
  safeText:   '#0A8C82',

  // Caution – Salmon Orange
  caution:       '#E8784A',
  cautionBg:     '#FFF3EF',
  cautionBorder: '#F5C4B0',
  cautionText:   '#C45A2E',

  // Danger / Avoid – Red
  avoid:       '#E05252',
  avoidBg:     '#FFF0F0',
  avoidBorder: '#F5B8B8',
  avoidText:   '#B83030',

  // Neutral
  background:     '#E2EFEE',
  surface:        '#FFFFFF',
  surfaceVariant: '#F0FAFA',
  outline:        '#C8E0DE',
  outlineVariant: '#DCF0EE',

  // Text
  onSurface:        '#0A2828',
  onSurfaceVariant: '#3A5F5F',
  onSurfaceMuted:   '#7AACAC',
  onPrimary:        '#FFFFFF',

  // Conditions
  conditions: {
    diabetes:   { color: '#E05252', bg: '#FFF0F0', icon: '🩺' },
    gluten:     { color: '#E8784A', bg: '#FFF3EF', icon: '🌾' },
    peanut:     { color: '#C45A2E', bg: '#FEF0E8', icon: '🥜' },
    vegan:      { color: '#0C6B6B', bg: '#E0F5F4', icon: '🌿' },
    vegetarian: { color: '#15BAA8', bg: '#E0F8F5', icon: '🥗' },
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
    shadowColor: '#0C6B6B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#0A4040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#0A4040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
};

// H1: 26px Bold | H2: 20px Medium | Body: 15px Regular
export const Typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Colors.onSurface,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  display: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Colors.onSurface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurfaceMuted,
  },
};
