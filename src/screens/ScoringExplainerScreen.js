// src/screens/ScoringExplainerScreen.js
import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

const SECTIONS = [
  {
    id: 'rating',
    title: 'Safety Rating',
    icon: 'shield',
    iconColor: Colors.accent,
    iconBg: Colors.accentLight,
    content: [
      'Every product is scored SAFE, CAUTION, or AVOID based on a 7-layer analysis of its ingredients and nutritional data.',
      'SAFE — No concerning ingredients or nutrient levels detected for your conditions.',
      'CAUTION — At least one flagged ingredient or two nutrient thresholds exceeded. Worth reviewing before consuming.',
      'AVOID — A directly harmful ingredient found, or a nutrient far exceeds safe limits.',
    ],
  },
  {
    id: 'ingredients',
    title: 'Ingredient Database',
    icon: 'list',
    iconColor: Colors.primary,
    iconBg: Colors.accentLight,
    content: [
      'Vett checks the full ingredient list against a database of ~90 known problematic ingredients, matched to your selected health conditions.',
      'Matches are found by scanning the raw ingredient text — no AI guessing. Longest patterns are matched first to avoid false positives (e.g. "peanut butter" is matched before "peanut").',
      'Each match is tagged AVOID or CAUTION based on severity.',
    ],
  },
  {
    id: 'nutrients',
    title: 'WHO / FDA Nutrient Thresholds',
    icon: 'activity',
    iconColor: Colors.caution,
    iconBg: Colors.cautionBg,
    content: [
      'Five key nutrients are checked per serving against WHO and FDA Daily Value guidelines:',
      'Sodium — Safe: 600 mg, Caution: 900 mg',
      'Sugar — Safe: 6 g, Caution: 12 g',
      'Saturated Fat — Safe: 3 g, Caution: 5 g',
      'Trans Fat — Safe: 0 g, Caution: 0.5 g',
      'Calories — Safe: 300 kcal, Caution: 500 kcal',
      'When per-serving data is available from the product, it is used. Otherwise per-100g values are used as a fallback.',
    ],
  },
  {
    id: 'nutriscore',
    title: 'Nutri-Score',
    icon: 'bar-chart-2',
    iconColor: Colors.accent,
    iconBg: Colors.accentLight,
    content: [
      'Nutri-Score is a European front-of-pack nutrition label that grades products from A (best) to E (worst).',
      'It is calculated from the product\'s nutrient profile: negative points for energy, saturated fat, sugar, and sodium; positive points for fibre, protein, and fruit/vegetable content.',
      'A / B — No flag raised.',
      'C — CAUTION flag added.',
      'D / E — CAUTION flag added.',
      'Nutri-Score is available for products with barcode scans that have this data in Open Food Facts.',
    ],
  },
  {
    id: 'nova',
    title: 'NOVA Processing Level',
    icon: 'layers',
    iconColor: Colors.avoid,
    iconBg: Colors.avoidBg,
    content: [
      'NOVA is a food classification system based on the degree of industrial processing, not just nutritional content.',
      'Group 1 — Unprocessed or minimally processed foods (e.g. fresh fruit, plain meat). No flag.',
      'Group 2 — Processed culinary ingredients (e.g. oils, butter, sugar). No flag.',
      'Group 3 — Processed foods (e.g. canned vegetables, cured meats). CAUTION flag.',
      'Group 4 — Ultra-processed foods (e.g. soft drinks, packaged snacks, instant noodles). CAUTION flag.',
      'Ultra-processed foods are associated with higher risk of chronic disease independent of their nutrient content.',
    ],
  },
  {
    id: 'beneficial',
    title: 'Beneficial Nutrients & Bonus',
    icon: 'trending-up',
    iconColor: Colors.safe,
    iconBg: Colors.safeBg,
    content: [
      'Products with good fibre (≥ 3 g per serving) and good protein (≥ 5 g per serving) receive a beneficial nutrient note.',
      'If a product is borderline CAUTION — triggered only by a single mild nutrient flag and no ingredient-level flags — this beneficial note can upgrade the rating to SAFE.',
      'This bonus never applies when an ingredient-level flag exists (e.g. an allergen, or a blacklisted ingredient).',
    ],
  },
];

// Section anchors for auto-scroll
const SECTION_IDS = SECTIONS.map(s => s.id);

export default function ScoringExplainerScreen({ route, navigation }) {
  const { source } = route.params || {};
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const sectionYRef = useRef({});

  // Auto-scroll to Nutri-Score section when opened from Nutri-Score ⓘ
  useEffect(() => {
    if (source === 'nutriscore') {
      const timer = setTimeout(() => {
        const y = sectionYRef.current['nutriscore'];
        if (y != null && scrollRef.current) {
          scrollRef.current.scrollTo({ y, animated: true });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [source]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How Scoring Works</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Vett analyses every product through 7 independent layers. Here is what each layer checks and how the final rating is determined.
        </Text>

        {SECTIONS.map((section, index) => (
          <View
            key={section.id}
            style={styles.sectionCard}
            onLayout={e => { sectionYRef.current[section.id] = e.nativeEvent.layout.y + 80; }}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: section.iconBg }]}>
                <Feather name={section.icon} size={16} color={section.iconColor} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={[styles.layerBadge]}>
                <Text style={styles.layerBadgeText}>Layer {index + 1}</Text>
              </View>
            </View>
            <View style={styles.sectionBody}>
              {section.content.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  {section.content.length > 1 && i > 0
                    ? <View style={styles.bullet} />
                    : <View style={styles.bulletInvisible} />
                  }
                  <Text style={[styles.bodyText, i === 0 && styles.leadText]}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Final rating logic summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>Final Rating Logic</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={[styles.ratingRow, { borderColor: Colors.avoidBorder, backgroundColor: Colors.avoidBg }]}>
              <Text style={[styles.ratingLabel, { color: Colors.avoid }]}>AVOID</Text>
              <Text style={styles.ratingDesc}>Any ingredient or nutrient flag reaches the AVOID level</Text>
            </View>
            <View style={[styles.ratingRow, { borderColor: Colors.cautionBorder, backgroundColor: Colors.cautionBg }]}>
              <Text style={[styles.ratingLabel, { color: Colors.caution }]}>CAUTION</Text>
              <Text style={styles.ratingDesc}>A condition flag exists, OR 2+ soft caution flags across nutrients / NOVA / Nutri-Score</Text>
            </View>
            <View style={[styles.ratingRow, { borderColor: Colors.safeBorder, backgroundColor: Colors.safeBg }]}>
              <Text style={[styles.ratingLabel, { color: Colors.safe }]}>SAFE</Text>
              <Text style={styles.ratingDesc}>No flags, or beneficial nutrients outweigh a single mild caution</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  intro: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  layerBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  layerBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },
  sectionBody: {
    padding: Spacing.md,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.onSurfaceMuted,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletInvisible: {
    width: 5,
    height: 5,
    flexShrink: 0,
  },
  bodyText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  leadText: {
    color: Colors.textPrimary,
    fontFamily: FONTS.bodyMedium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  ratingLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    width: 56,
    paddingTop: 1,
    letterSpacing: 0.5,
  },
  ratingDesc: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
