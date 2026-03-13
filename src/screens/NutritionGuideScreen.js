// src/screens/NutritionGuideScreen.js
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

const ARTICLES = [
  {
    id: '1', icon: 'clipboard', category: 'BASICS',
    title: 'Reading Nutrition Labels',
    subtitle: 'What every number on the label actually means',
    content: [
      'Nutrition labels can be confusing, but once you understand the structure they become powerful tools.',
      'Serving Size — All values on the label are based on this amount. If a bag says "2 servings" and you eat the whole bag, double every number.',
      'Calories — Energy you get from the product. General guidance: 100 kcal or less per serving is low, 400+ is high.',
      '% Daily Value (%DV) — Shows how much a nutrient contributes to a daily 2,000 kcal diet. 5% or less = low, 20% or more = high.',
      'Ingredients list — Listed by weight, heaviest first. The first 3 ingredients make up the bulk of the product.',
    ],
  },
  {
    id: '2', icon: 'filter', category: 'SODIUM',
    title: 'Why Sodium Matters',
    subtitle: 'How salt affects your heart and kidneys',
    content: [
      'Most adults should consume less than 2,300 mg of sodium per day — about 1 teaspoon of salt. Yet the average person consumes nearly double that.',
      'High sodium raises blood pressure by causing the body to retain water. Long-term high intake damages arteries and strains the heart.',
      'Hidden sodium sources: bread and rolls, canned soups, processed meats, and most fast food.',
      'Smart swap: Look for "No Added Salt" or "Low Sodium" labels. Cooking from scratch gives you full control.',
    ],
  },
  {
    id: '3', icon: 'droplet', category: 'SUGAR',
    title: 'Added Sugar vs Natural Sugar',
    subtitle: 'Not all sugar is created equal',
    content: [
      'Natural sugars — found in whole fruits, vegetables, and dairy. They come packaged with fiber and slow down absorption.',
      'Added sugars — sucrose, HFCS, maltose, and dozens of other names. These spike blood sugar and provide zero nutrition.',
      'Daily limit: The WHO recommends added sugars below 10% of total energy — about 50 g for a 2,000 kcal diet.',
      'How to spot added sugar: look for ingredients ending in "-ose", anything with "syrup", malt, molasses, or cane juice.',
    ],
  },
  {
    id: '4', icon: 'bar-chart-2', category: 'PROTEIN',
    title: 'Getting Enough Protein',
    subtitle: 'Daily targets and the best food sources',
    content: [
      'Sedentary adults need 0.8 g per kg of body weight. Active individuals need 1.2–1.7 g/kg. Athletes or those building muscle need 1.6–2.2 g/kg.',
      'Complete proteins (meat, fish, eggs, dairy, soy, quinoa) contain all essential amino acids.',
      'Incomplete proteins (most plants) are missing one or more — but combining them (rice + beans) creates a complete profile.',
      'Benchmarks per 100 g: chicken breast ≈ 31 g, eggs ≈ 13 g, Greek yogurt ≈ 10 g, lentils ≈ 9 g.',
    ],
  },
  {
    id: '5', icon: 'circle', category: 'FATS',
    title: 'Good Fats vs Bad Fats',
    subtitle: 'Understanding dietary fat types',
    content: [
      'Unsaturated fats (healthy): monounsaturated (olive oil, avocados) and polyunsaturated (fatty fish, walnuts) reduce inflammation.',
      'Saturated fats (moderate): found in meat and dairy. Raises LDL cholesterol — limit to < 10% of total calories.',
      'Trans fats (avoid): found in partially hydrogenated oils. Raises LDL and lowers HDL simultaneously — the worst fat for heart health.',
      'Check ingredients for "partially hydrogenated oil" even if the nutrition panel shows 0 g trans fat (rounding rules apply).',
    ],
  },
  {
    id: '6', icon: 'search', category: 'ADDITIVES',
    title: 'Common Food Additives Explained',
    subtitle: 'What E-numbers and chemical names mean',
    content: [
      'Generally safe: Ascorbic acid (Vitamin C/E300), Lecithin (E322), Pectin (E440) — these are derived from natural sources.',
      'Worth limiting: Sodium nitrite (E250) in processed meats, Carrageenan (linked to gut inflammation in some studies), and artificial colors (Red 40, Yellow 5/6).',
      'MSG (E621): despite its reputation, extensive research shows MSG is safe for the vast majority of people.',
      'Rule of thumb: shorter ingredient lists with names you recognize are generally a safer choice.',
    ],
  },
];

export default function NutritionGuideScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Guides</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {ARTICLES.map(article => (
          <View key={article.id} style={styles.articleCard}>
            {/* Card header */}
            <View style={styles.articleHeader}>
              <View style={styles.articleIconWrap}>
                <Feather name={article.icon} size={20} color={Colors.accent} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.articleCategory}>{article.category}</Text>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
              </View>
            </View>

            {/* Card body — always visible */}
            <View style={styles.articleBody}>
              {article.content.map((para, i) => (
                <View key={i} style={styles.paraRow}>
                  <View style={styles.paraDot} />
                  <Text style={styles.articlePara}>{para}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },

  // ── Article card ─────────────────────────────────────────────────────────────
  articleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...SHADOW.sm,
  },
  articleHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  articleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  articleCategory: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  articleSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // ── Article body ─────────────────────────────────────────────────────────────
  articleBody: {
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  paraRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  paraDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
    flexShrink: 0,
  },
  articlePara: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
