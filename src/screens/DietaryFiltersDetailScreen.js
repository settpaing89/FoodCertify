// src/screens/DietaryFiltersDetailScreen.js
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useConditions, useDietaryPrefs } from '../hooks/useStorage';
import { CONDITIONS, getIngredientsForCondition } from '../engine/analyzer';

export default function DietaryFiltersDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions: activeIds, toggleCondition } = useConditions();
  const { prefs, savePrefs } = useDietaryPrefs();

  const muted = prefs.mutedIngredients ?? [];

  const toggleIngredient = (name, newValue) => {
    const next = newValue
      ? muted.filter(m => m !== name)
      : [...muted, name];
    savePrefs({ ...prefs, mutedIngredients: next });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Dietary Filters</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Condition toggles ── */}
        <Text style={styles.sectionLabel}>Health Conditions</Text>
        <View style={styles.card}>
          {CONDITIONS.map((condition, i) => {
            const isActive = activeIds.includes(condition.id);
            return (
              <View key={condition.id}>
                <TouchableOpacity
                  style={styles.conditionRow}
                  onPress={() => toggleCondition(condition.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.conditionDot, { backgroundColor: condition.bg }]}>
                    <View style={[styles.conditionDotInner, { backgroundColor: condition.color }]} />
                  </View>
                  <Text style={styles.conditionLabel}>{condition.label}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleCondition(condition.id)}
                    trackColor={{ false: Colors.border, true: Colors.accentLight }}
                    thumbColor={isActive ? Colors.accent : Colors.surface}
                  />
                </TouchableOpacity>
                {i < CONDITIONS.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* ── Per-condition ingredient control ── */}
        {CONDITIONS.map(condition => {
          const isActive = activeIds.includes(condition.id);
          const ingredients = isActive ? getIngredientsForCondition(condition.id) : [];

          return (
            <View key={condition.id}>
              <Text style={styles.sectionLabel}>{condition.label}</Text>
              <View style={styles.card}>
                {isActive ? (
                  ingredients.map((ing, i) => {
                    const enabled = !muted.includes(ing.name);
                    return (
                      <View key={ing.name}>
                        <View style={styles.row}>
                          <View style={[
                            styles.dot,
                            { backgroundColor: ing.severity === 'avoid' ? Colors.avoid : Colors.caution },
                          ]} />
                          <View style={styles.rowMeta}>
                            <Text style={[styles.ingName, !enabled && styles.mutedText]}>
                              {ing.name}
                            </Text>
                            <Text style={styles.ingCategory}>{ing.category}</Text>
                          </View>
                          <View style={[
                            styles.badge,
                            { backgroundColor: ing.severity === 'avoid' ? Colors.avoidBackground : Colors.cautionBackground },
                            !enabled && styles.badgeMuted,
                          ]}>
                            <Text style={[
                              styles.badgeText,
                              { color: ing.severity === 'avoid' ? Colors.avoid : Colors.caution },
                              !enabled && styles.mutedText,
                            ]}>
                              {ing.severity === 'avoid' ? 'AVOID' : 'CAUTION'}
                            </Text>
                          </View>
                          <Switch
                            value={enabled}
                            onValueChange={v => toggleIngredient(ing.name, v)}
                            trackColor={{ false: Colors.border, true: Colors.accentLight }}
                            thumbColor={enabled ? Colors.accent : Colors.surface}
                          />
                        </View>
                        {i < ingredients.length - 1 && <View style={styles.divider} />}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.inactiveRow}>
                    <Feather name="slash" size={15} color={Colors.onSurfaceMuted} />
                    <Text style={styles.inactiveText}>Not active — nothing is being filtered</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  topBarBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },

  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1.5,
    color: Colors.textSecondary, textTransform: 'uppercase',
    marginBottom: 8, paddingHorizontal: 4,
  },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...SHADOW.sm,
  },

  // ── Condition rows ─────────────────────────────────────────────────────────
  conditionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 12,
  },
  conditionDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  conditionDotInner: { width: 12, height: 12, borderRadius: 6 },
  conditionLabel: { flex: 1, fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary },

  // ── Ingredient rows ────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  rowMeta: { flex: 1, gap: 2 },
  ingName: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary },
  ingCategory: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: Colors.textSecondary },
  mutedText: { color: Colors.onSurfaceMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeMuted: { opacity: 0.35 },
  badgeText: { fontSize: 10, fontFamily: FONTS.bodySemibold },

  divider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.md },

  inactiveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  inactiveText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: Colors.textSecondary },
});
