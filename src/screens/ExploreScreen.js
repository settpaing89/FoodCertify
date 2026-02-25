// src/screens/ExploreScreen.js
import { useState, Fragment } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { useDietaryPrefs } from '../hooks/useStorage';

// ─── Static config ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    key: 'keto',
    label: 'Keto',
    icon: '🥑',
    desc: 'Low carb, high fat',
    color: '#0C6B6B',
    apply: p => ({
      ...p, preset: 'keto',
      carbs:   { enabled: true, max: 30,   min: null },
      sugar:   { enabled: true, max: 10,   min: null },
      fat:     { enabled: true, max: null, min: 15   },
    }),
  },
  {
    key: 'cutting',
    label: 'Cutting',
    icon: '🔥',
    desc: 'Low calorie',
    color: '#E8784A',
    apply: p => ({
      ...p, preset: 'cutting',
      calories: { enabled: true, max: 400, min: null },
    }),
  },
  {
    key: 'bulking',
    label: 'Bulking',
    icon: '💪',
    desc: 'High protein',
    color: '#15BAA8',
    apply: p => ({
      ...p, preset: 'bulking',
      protein:  { enabled: true, max: null, min: 25  },
      calories: { enabled: true, max: null, min: 400 },
    }),
  },
  {
    key: 'low_sodium',
    label: 'Low Sodium',
    icon: '🫀',
    desc: 'Heart health',
    color: '#E05252',
    apply: p => ({
      ...p, preset: 'low_sodium',
      sodium: { enabled: true, max: 500, min: null },
    }),
  },
  {
    key: 'clean',
    label: 'Clean Eating',
    icon: '🥗',
    desc: 'Minimal sugar',
    color: '#2E9494',
    apply: p => ({
      ...p, preset: 'clean',
      sugar: { enabled: true, max: 5, min: null },
    }),
  },
  {
    key: 'custom',
    label: 'Custom',
    icon: '⚙️',
    desc: 'Set manually',
    color: '#7AACAC',
    apply: p => ({ ...p, preset: 'custom' }),
  },
];

const NUTRIENTS = [
  { key: 'calories',     label: 'Calories',       unit: 'kcal', icon: 'zap',          hasMin: true,  hasMax: true  },
  { key: 'carbs',        label: 'Carbohydrates',   unit: 'g',    icon: 'layers',       hasMin: false, hasMax: true  },
  { key: 'sugar',        label: 'Sugar',           unit: 'g',    icon: 'coffee',       hasMin: false, hasMax: true  },
  { key: 'protein',      label: 'Protein',         unit: 'g',    icon: 'trending-up',  hasMin: true,  hasMax: false },
  { key: 'fat',          label: 'Total Fat',       unit: 'g',    icon: 'droplet',      hasMin: false, hasMax: true  },
  { key: 'saturatedFat', label: 'Saturated Fat',   unit: 'g',    icon: 'alert-circle', hasMin: false, hasMax: true  },
  { key: 'sodium',       label: 'Sodium',          unit: 'mg',   icon: 'activity',     hasMin: false, hasMax: true  },
];

const ARTICLES = [
  {
    id: '1', icon: '📋', category: 'BASICS',
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
    id: '2', icon: '🧂', category: 'SODIUM',
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
    id: '3', icon: '🩸', category: 'SUGAR',
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
    id: '4', icon: '💪', category: 'PROTEIN',
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
    id: '5', icon: '🥑', category: 'FATS',
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
    id: '6', icon: '🔬', category: 'ADDITIVES',
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetCard({ preset, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.presetCard,
        isActive && { backgroundColor: preset.color, borderColor: preset.color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <View style={styles.presetCheck}>
          <Feather name="check" size={11} color="#fff" />
        </View>
      )}
      <Text style={styles.presetIcon}>{preset.icon}</Text>
      <Text style={[styles.presetLabel, isActive && { color: '#fff' }]}>{preset.label}</Text>
      <Text style={[styles.presetDesc, isActive && { color: 'rgba(255,255,255,0.75)' }]}>
        {preset.desc}
      </Text>
    </TouchableOpacity>
  );
}

function NutrientRow({ nutrient, value, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = v => {
    onChange({ ...value, enabled: v });
    setExpanded(v);
  };

  const maxStr = value.max !== null ? String(value.max) : '';
  const minStr = value.min !== null ? String(value.min) : '';

  const summary =
    (nutrient.hasMax && value.max !== null ? `Max ${value.max} ${nutrient.unit}` : '') +
    (nutrient.hasMax && value.max !== null && nutrient.hasMin && value.min !== null ? '  ·  ' : '') +
    (nutrient.hasMin && value.min !== null ? `Min ${value.min} ${nutrient.unit}` : '');

  return (
    <View>
      <TouchableOpacity
        style={styles.nutrientRow}
        onPress={() => value.enabled && setExpanded(e => !e)}
        activeOpacity={value.enabled ? 0.7 : 1}
      >
        <View style={styles.nutrientIconWrap}>
          <Feather name={nutrient.icon} size={16} color={Colors.primary} />
        </View>
        <View style={styles.nutrientMeta}>
          <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
          {value.enabled && summary.length > 0 && (
            <Text style={styles.nutrientSummary}>{summary}</Text>
          )}
        </View>
        <Switch
          value={value.enabled}
          onValueChange={toggle}
          trackColor={{ false: Colors.outline, true: Colors.primaryLight }}
          thumbColor={value.enabled ? Colors.primary : Colors.surface}
        />
      </TouchableOpacity>

      {value.enabled && expanded && (
        <View style={styles.nutrientInputs}>
          {nutrient.hasMax && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max ({nutrient.unit})</Text>
              <TextInput
                style={styles.numInput}
                keyboardType="numeric"
                value={maxStr}
                placeholder="—"
                placeholderTextColor={Colors.onSurfaceMuted}
                onChangeText={t => onChange({ ...value, max: t === '' ? null : Number(t) })}
              />
            </View>
          )}
          {nutrient.hasMin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min ({nutrient.unit})</Text>
              <TextInput
                style={styles.numInput}
                keyboardType="numeric"
                value={minStr}
                placeholder="—"
                placeholderTextColor={Colors.onSurfaceMuted}
                onChangeText={t => onChange({ ...value, min: t === '' ? null : Number(t) })}
              />
            </View>
          )}
          <TouchableOpacity onPress={() => setExpanded(false)} style={styles.collapseBtn}>
            <Feather name="chevron-up" size={16} color={Colors.onSurfaceMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

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
          <Text style={styles.articleIcon}>{article.icon}</Text>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { prefs, savePrefs } = useDietaryPrefs();
  const [activeTab, setActiveTab] = useState('dietary');
  const [blacklistInput, setBlacklistInput] = useState('');

  if (!prefs) return null;

  const updatePrefs   = partial  => savePrefs({ ...prefs, ...partial });
  const updateNutrient = (key, v) => savePrefs({ ...prefs, [key]: v });
  const applyPreset    = preset   => savePrefs(preset.apply({ ...prefs }));

  const addBlacklist = () => {
    const item = blacklistInput.trim().toLowerCase();
    if (!item || prefs.blacklist.includes(item)) { setBlacklistInput(''); return; }
    savePrefs({ ...prefs, blacklist: [...prefs.blacklist, item] });
    setBlacklistInput('');
  };

  const removeBlacklist = item =>
    savePrefs({ ...prefs, blacklist: prefs.blacklist.filter(i => i !== item) });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Header ── */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.pageTitle}>Explore</Text>
          <Text style={styles.pageSub}>Dietary goals & nutrition guides</Text>
        </View>

        {/* ── Tab Toggle ── */}
        <View style={styles.tabToggleWrap}>
          <View style={styles.tabToggle}>
            {[
              { key: 'dietary', icon: 'sliders',   label: 'Dietary' },
              { key: 'learn',   icon: 'book-open',  label: 'Learn'   },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.85}
              >
                <Feather
                  name={t.icon}
                  size={15}
                  color={activeTab === t.key ? '#fff' : Colors.onSurfaceMuted}
                />
                <Text style={[
                  styles.tabPillText,
                  activeTab === t.key && styles.tabPillTextActive,
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ══ DIETARY TAB ══════════════════════════════════════════════════════ */}
        {activeTab === 'dietary' && (
          <View style={styles.tabContent}>

            {/* Master Toggle */}
            <View style={styles.masterCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.masterTitle}>Dietary Filtering</Text>
                <Text style={styles.masterSub}>
                  Flag products during scanning that don't match your goals
                </Text>
              </View>
              <Switch
                value={prefs.enabled}
                onValueChange={v => updatePrefs({ enabled: v })}
                trackColor={{ false: Colors.outline, true: Colors.primaryLight }}
                thumbColor={prefs.enabled ? Colors.primary : Colors.surface}
              />
            </View>

            {/* Presets */}
            <Text style={styles.sectionLabel}>GOAL PRESETS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRow}
            >
              {PRESETS.map(p => (
                <PresetCard
                  key={p.key}
                  preset={p}
                  isActive={prefs.preset === p.key}
                  onPress={() => applyPreset(p)}
                />
              ))}
            </ScrollView>

            {/* Nutrient Limits */}
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>NUTRIENT LIMITS</Text>
              <Text style={styles.sectionMeta}>per serving</Text>
            </View>
            <View style={styles.card}>
              {NUTRIENTS.map((n, i) => (
                <Fragment key={n.key}>
                  <NutrientRow
                    nutrient={n}
                    value={prefs[n.key]}
                    onChange={v => updateNutrient(n.key, v)}
                  />
                  {i < NUTRIENTS.length - 1 && <View style={styles.divider} />}
                </Fragment>
              ))}
            </View>

            {/* Blacklist */}
            <Text style={styles.sectionLabel}>AVOID INGREDIENTS</Text>
            <View style={styles.card}>
              <View style={styles.blacklistRow}>
                <TextInput
                  style={styles.blacklistInput}
                  value={blacklistInput}
                  onChangeText={setBlacklistInput}
                  placeholder="e.g. palm oil, msg, carrageenan…"
                  placeholderTextColor={Colors.onSurfaceMuted}
                  returnKeyType="done"
                  onSubmitEditing={addBlacklist}
                />
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={addBlacklist}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {prefs.blacklist.length > 0 ? (
                <View style={styles.chips}>
                  {prefs.blacklist.map(item => (
                    <View key={item} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => removeBlacklist(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                      >
                        <Feather name="x" size={13} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyNote}>
                  No ingredients added yet. Type one above and press return or +.
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ══ LEARN TAB ════════════════════════════════════════════════════════ */}
        {activeTab === 'learn' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>NUTRITION GUIDES</Text>
            {ARTICLES.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Page header ─────────────────────────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 4,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: Colors.onSurface,
  },
  pageSub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceMuted,
  },

  // ── Tab Toggle ───────────────────────────────────────────────────────────────
  tabToggleWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    padding: 4,
    gap: 4,
    ...Shadow.sm,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceMuted,
  },
  tabPillTextActive: {
    color: '#fff',
  },

  // ── Tab content ──────────────────────────────────────────────────────────────
  tabContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },

  // ── Section labels ───────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.onSurfaceMuted,
    marginTop: 4,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceMuted,
    opacity: 0.7,
  },

  // ── Master Toggle Card ───────────────────────────────────────────────────────
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    gap: Spacing.md,
    ...Shadow.md,
  },
  masterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  masterSub: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.onSurfaceMuted,
    lineHeight: 18,
  },

  // ── Presets ──────────────────────────────────────────────────────────────────
  presetsRow: {
    gap: 10,
    paddingRight: Spacing.md,
  },
  presetCard: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    ...Shadow.sm,
    position: 'relative',
  },
  presetCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  presetDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceMuted,
    lineHeight: 16,
  },

  // ── Card container ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },

  // ── Nutrient rows ────────────────────────────────────────────────────────────
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  nutrientIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrientMeta: {
    flex: 1,
    gap: 3,
  },
  nutrientLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  nutrientSummary: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  nutrientInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 100,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceMuted,
    letterSpacing: 0.3,
  },
  numInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  collapseBtn: {
    padding: 8,
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 18,
  },

  // ── Blacklist ────────────────────────────────────────────────────────────────
  blacklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  blacklistInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyNote: {
    fontSize: 13,
    color: Colors.onSurfaceMuted,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
    lineHeight: 18,
  },

  // ── Article cards ────────────────────────────────────────────────────────────
  articleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    gap: 14,
  },
  articleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  articleIcon: {
    fontSize: 26,
  },
  articleCategory: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.primary,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 21,
  },
  articleSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.onSurfaceMuted,
    lineHeight: 18,
  },
  articleBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  articlePara: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 21,
  },
});
