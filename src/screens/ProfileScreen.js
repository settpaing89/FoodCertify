// src/screens/ProfileScreen.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { useConditions } from '../hooks/useStorage';
import { AnimatedCard } from '../components/AnimatedCard';
import { useHistoryContext } from '../context/HistoryContext';
import { useAppContext } from '../navigation';
import { usePremiumContext } from '../context/PremiumContext';

// ─── Learn — static articles ──────────────────────────────────────────────────
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

function ArticleCard({ article }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.85}
    >
      <View style={styles.articleHeader}>
        <View style={styles.articleIconWrap}>
          <Feather name={article.icon} size={20} color={Colors.accent} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.articleCategory}>{article.category}</Text>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleSubtitle} numberOfLines={open ? undefined : 1}>
            {article.subtitle}
          </Text>
        </View>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.onSurfaceMuted}
        />
      </View>
      {open && (
        <View style={styles.articleBody}>
          {article.content.map((para, i) => (
            <Text key={i} style={styles.articlePara}>{para}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Reusable row inside a settings section ───────────────────────────────────
function SettingsRow({ icon, label, value, onPress, last }) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.rowIcon}>
          <Feather name={icon} size={18} color={Colors.accent} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress && <Feather name="chevron-right" size={16} color={Colors.onSurfaceMuted} />}
      </TouchableOpacity>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions } = useConditions();
  const { history } = useHistoryContext();
  const { resetOnboarding } = useAppContext();
  const { isPremium, hasBeenPremium, remaining, restorePurchases } = usePremiumContext();

  const activeConditionCount = conditions.length;
  const [showContent, setShowContent] = useState(true);

  useFocusEffect(useCallback(() => {
    setShowContent(true);
    return () => setShowContent(false);
  }, []));

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: resetOnboarding },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Feather name="user" size={34} color={Colors.textInverse} />
        </View>

        {/* Name + PRO badge */}
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>FoodSafe User</Text>
          {isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{activeConditionCount}</Text>
            <Text style={styles.statLabel}>Conditions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {history.length > 0
                ? `${Math.round((history.filter(h => h.safetyRating === 'SAFE').length / history.length) * 100)}%`
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Safe Rate</Text>
          </View>
        </View>
      </View>

      {showContent && <View style={styles.content}>

        {/* ── Subscription Status Card ── */}
        <AnimatedCard delay={0}>
        {isPremium ? (
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardLeft}>
              <View style={styles.premiumIconWrap}>
                <Feather name="award" size={22} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={styles.premiumTitle}>Premium Member</Text>
                <Text style={styles.premiumSub}>All features unlocked</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
              <Text style={styles.manageLink}>Manage</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.freeCard}>
            <View style={styles.freeCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.freePlanTitle}>Free Plan</Text>
                <Text style={styles.freePlanSub}>
                  {remaining > 0 ? `${remaining} scans left this week` : 'Weekly scan limit reached'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.88}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </AnimatedCard>

        {/* ── Account Settings ── */}
        <AnimatedCard delay={80}><Section label="ACCOUNT SETTINGS">
          <SettingsRow
            icon="user"
            label="Personal Information"
            onPress={() => navigation.navigate('PersonalInformation')}
          />
          <SettingsRow
            icon="sliders"
            label="Dietary Preferences"
            value={activeConditionCount > 0 ? `${activeConditionCount} active` : undefined}
            onPress={() => navigation.navigate('DietaryPreferences')}
            last
          />
        </Section></AnimatedCard>

        {/* ── Preferences ── */}
        <AnimatedCard delay={160}><Section label="PREFERENCES">
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsRow
            icon="grid"
            label="Units"
            value="Metric"
            onPress={() => navigation.navigate('Units')}
          />
          <SettingsRow
            icon="globe"
            label="Language"
            value="English"
            onPress={() => navigation.navigate('Language')}
            last
          />
        </Section></AnimatedCard>

        {/* ── Learn ── */}
        <AnimatedCard delay={240}><View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>LEARN</Text>
          <View style={styles.articlesWrap}>
            {ARTICLES.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </View>
        </View></AnimatedCard>

        {/* ── Security & Support ── */}
        <AnimatedCard delay={320}><Section label="SECURITY & SUPPORT">
          <SettingsRow
            icon="shield"
            label="Privacy & Security"
            onPress={() => navigation.navigate('PrivacySecurity')}
          />
          <SettingsRow
            icon="help-circle"
            label="Help Center"
            onPress={() => navigation.navigate('HelpCenter')}
          />
          <SettingsRow
            icon="info"
            label="About FoodSafe"
            onPress={() => navigation.navigate('AboutFoodSafe')}
            last={!(hasBeenPremium && !isPremium)}
          />
          {hasBeenPremium && !isPremium && (
            <SettingsRow
              icon="refresh-cw"
              label="Renew Membership"
              onPress={restorePurchases}
              last
            />
          )}
        </Section></AnimatedCard>

        {/* ── Sign Out ── */}
        <AnimatedCard delay={400}>
        <TouchableOpacity style={styles.signOutCard} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* ── Version ── */}
        <Text style={styles.version}>VERSION 1.0.0</Text>
        </AnimatedCard>
      </View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  nameText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: {
    color: Colors.textInverse,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
  },

  // ── Quick stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    width: '100%',
    ...SHADOW.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },

  // ── Content ────────────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },

  // ── Premium card ──────────────────────────────────────────────────────────────
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...SHADOW.sm,
  },
  premiumCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: Colors.textInverse },
  premiumSub:   { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  manageLink:   { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: 'rgba(255,255,255,0.85)', textDecorationLine: 'underline' },

  // ── Free card ─────────────────────────────────────────────────────────────────
  freeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW.sm,
  },
  freeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  freePlanTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: Colors.textPrimary },
  freePlanSub:   { fontSize: FONT_SIZE.sm, color: Colors.textSecondary, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    flexShrink: 0,
  },
  upgradeBtnText: { color: Colors.textInverse, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },

  // ── Section block ─────────────────────────────────────────────────────────────
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...SHADOW.sm,
    overflow: 'hidden',
  },

  // ── Row ────────────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    marginRight: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 64,
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────────
  signOutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  signOutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.avoid,
  },

  // ── Version ───────────────────────────────────────────────────────────────────
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingVertical: Spacing.md,
  },

  // ── Learn — articles ──────────────────────────────────────────────────────────
  articlesWrap: {
    gap: Spacing.sm,
  },
  articleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
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
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  articleSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  articleBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 10,
  },
  articlePara: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.regular,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
});
