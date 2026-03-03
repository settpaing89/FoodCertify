// src/components/index.js
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { Colors, Spacing, Radius, Typography } from '../theme';

// ─── Rating Badge ─────────────────────────────────────────────────────────────
// Flat pill style. AVOID is displayed as "UNSAFE" per design spec.
export function RatingBadge({ rating, size = 'sm' }) {
  const cfg = {
    SAFE:    { bg: Colors.safeBg,    border: Colors.safeBorder,    color: Colors.safeText,    label: 'SAFE'    },
    CAUTION: { bg: Colors.cautionBg, border: Colors.cautionBorder, color: Colors.cautionText, label: 'CAUTION' },
    AVOID:   { bg: Colors.avoidBg,   border: Colors.avoidBorder,   color: Colors.avoidText,   label: 'UNSAFE'  },
  }[rating] || { bg: '#F3F4F6', border: '#E5E7EB', color: '#6B7280', label: '?' };

  const large = size === 'lg';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: cfg.bg, borderColor: cfg.border },
      large && styles.badgeLg,
    ]}>
      <Text style={[styles.badgeText, { color: cfg.color }, large && styles.badgeTextLg]}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.card, style]}
    >
      {children}
    </Wrapper>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, right }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function Chip({ label, color, bg, icon, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, { backgroundColor: bg || Colors.primarySurface }]}
    >
      {icon && <Text style={styles.chipIcon}>{icon}</Text>}
      <Text style={[styles.chipLabel, { color: color || Colors.primary }]}>
        {label}
      </Text>
    </Wrapper>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Loader({ size = 'large', color = Colors.primary }) {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action}
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, disabled, icon, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
    >
      <LinearGradient
        colors={disabled ? ['#E2E8F0', '#E2E8F0'] : [Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryBtnGradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {icon || null}
            <Text style={[styles.primaryBtnLabel, disabled && { color: Colors.onSurfaceMuted }]}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Nutriscore Badge ─────────────────────────────────────────────────────────
export function NutriscoreBadge({ grade }) {
  const colors = {
    A: '#038141', B: '#85BB2F', C: '#FECB02',
    D: '#EE8100', E: '#E63946',
  };
  return (
    <View style={[styles.nutriBadge, { backgroundColor: colors[grade] || '#ccc' }]}>
      <Text style={styles.nutriLabel}>Nutri-Score</Text>
      <Text style={styles.nutriGrade}>{grade || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Flat pill badge
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeLg: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.8,
  },
  badgeTextLg: {
    fontSize: FONT_SIZE.lg,
    letterSpacing: 1.2,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...SHADOW.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: { ...Typography.h2 },
  sectionSubtitle: { ...Typography.caption, marginTop: 2 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  chipIcon: { fontSize: FONT_SIZE.md },
  chipLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyIcon: { fontSize: FONT_SIZE.display },
  emptyTitle: { ...Typography.h2, textAlign: 'center' },
  emptySubtitle: { ...Typography.body, textAlign: 'center' },

  primaryBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryBtnIcon: { fontSize: FONT_SIZE.xl },
  primaryBtnLabel: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, letterSpacing: 0.2 },

  nutriBadge: {
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  nutriLabel: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, letterSpacing: 0.5 },
  nutriGrade: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
});
