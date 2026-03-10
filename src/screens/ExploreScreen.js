// src/screens/ExploreScreen.js
import { useState, Fragment, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, StyleSheet, Switch,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useDietaryPrefs } from '../hooks/useStorage';
import { useDietLists } from '../hooks/useDietLists';
import { usePremiumContext } from '../context/PremiumContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { AnimatedCard } from '../components/AnimatedCard';

// ─── Static config ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    key: 'keto',
    label: 'Keto',
    icon: 'leaf',
    desc: 'Low carb, high fat',
    color: '#2D6A4F',
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
    icon: 'zap',
    desc: 'Low calorie',
    color: '#D97706',
    apply: p => ({
      ...p, preset: 'cutting',
      calories: { enabled: true, max: 400, min: null },
    }),
  },
  {
    key: 'bulking',
    label: 'Bulking',
    icon: 'trending-up',
    desc: 'High protein',
    color: '#1C1C1E',
    apply: p => ({
      ...p, preset: 'bulking',
      protein:  { enabled: true, max: null, min: 25  },
      calories: { enabled: true, max: null, min: 400 },
    }),
  },
  {
    key: 'low_sodium',
    label: 'Low Sodium',
    icon: 'heart',
    desc: 'Heart health',
    color: '#DC2626',
    apply: p => ({
      ...p, preset: 'low_sodium',
      sodium: { enabled: true, max: 500, min: null },
    }),
  },
  {
    key: 'clean',
    label: 'Clean Eating',
    icon: 'sun',
    desc: 'Minimal sugar',
    color: '#6B6B70',
    apply: p => ({
      ...p, preset: 'clean',
      sugar: { enabled: true, max: 5, min: null },
    }),
  },
  {
    key: 'custom',
    label: 'Custom',
    icon: 'sliders',
    desc: 'Set manually',
    color: '#6B6B70',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatListDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetCard({ preset, isActive, onPress, locked, masterOff }) {
  return (
    <TouchableOpacity
      style={[
        styles.presetCard,
        isActive && { backgroundColor: Colors.hero, borderColor: Colors.hero },
        locked && styles.lockedCard,
        masterOff && { opacity: 0.4 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <View style={styles.presetCheck}>
          <Feather name="check" size={11} color={Colors.textInverse} />
        </View>
      )}
      {locked && (
        <View style={styles.lockBadge}>
          <Feather name="lock" size={11} color={Colors.onSurfaceMuted} />
        </View>
      )}
      <Text style={[styles.presetLabel, isActive && { color: Colors.heroText }, locked && styles.lockedText]}>
        {preset.label}
      </Text>
      <Text style={[styles.presetDesc, isActive && { color: Colors.heroSubtext }, locked && styles.lockedText]}>
        {preset.desc}
      </Text>
    </TouchableOpacity>
  );
}

function NutrientRow({ nutrient, value, onChange, locked, masterOff, onLockedPress }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = v => {
    if (locked) { onLockedPress?.(); return; }
    if (masterOff) return;
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
    <View style={[locked && styles.lockedRow, masterOff && { opacity: 0.4 }]}>
      <TouchableOpacity
        style={styles.nutrientRow}
        onPress={locked ? onLockedPress : masterOff ? undefined : () => value.enabled && setExpanded(e => !e)}
        activeOpacity={locked || masterOff ? 0.6 : value.enabled ? 0.7 : 1}
      >
        <View style={styles.nutrientIconWrap}>
          <Feather name={nutrient.icon} size={16} color={locked ? Colors.onSurfaceMuted : Colors.accent} />
        </View>
        <View style={styles.nutrientMeta}>
          <Text style={[styles.nutrientLabel, locked && styles.lockedText]}>{nutrient.label}</Text>
          {value.enabled && summary.length > 0 && (
            <Text style={styles.nutrientSummary}>{summary}</Text>
          )}
        </View>
        {locked ? (
          <Feather name="lock" size={16} color={Colors.onSurfaceMuted} />
        ) : (
          <Switch
            value={masterOff ? false : value.enabled}
            onValueChange={toggle}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={(!masterOff && value.enabled) ? Colors.accent : Colors.surface}
          />
        )}
      </TouchableOpacity>

      {!masterOff && value.enabled && expanded && (
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { prefs, savePrefs } = useDietaryPrefs();
  const { isPremium } = usePremiumContext();
  const { lists, addList, deleteList } = useDietLists();
  const [activeTab, setActiveTab] = useState('dietary');
  const [blacklistInput, setBlacklistInput] = useState('');
  const [newListInput, setNewListInput] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useFocusEffect(useCallback(() => {
    setShowContent(true);
    return () => setShowContent(false);
  }, []));

  if (!prefs) return null;

  const dietaryLocked = !isPremium;
  const masterOff     = !dietaryLocked && !prefs.enabled;
  const listLocked    = !isPremium;
  const showUpgrade   = () => setUpgradeVisible(true);

  const handleAddList = () => {
    const name = newListInput.trim();
    if (!name) return;
    addList(name);
    setNewListInput('');
    setShowNewListInput(false);
  };

  const handleDeleteList = (id) => {
    Alert.alert('Delete List', 'Delete this list and all its products?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteList(id) },
    ]);
  };

  const updatePrefs    = partial  => savePrefs({ ...prefs, ...partial });
  const updateNutrient = (key, v) => savePrefs({ ...prefs, [key]: v });
  const applyPreset = preset => {
    if (prefs.preset === preset.key) {
      savePrefs({ ...prefs, preset: null });
    } else {
      savePrefs(preset.apply({ ...prefs }));
    }
  };

  const addBlacklist = () => {
    if (dietaryLocked) { showUpgrade(); return; }
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
        {/* ── Page Content ── */}
        {showContent && <>
        <AnimatedCard delay={0}>
        <View style={[styles.pageHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.pageTitle}>Explore</Text>
          <Text style={styles.pageSub}>Dietary goals & nutrition guides</Text>
        </View>
        </AnimatedCard>

        {/* ── Tab Toggle ── */}
        <AnimatedCard delay={80}><View style={styles.tabToggleWrap}>
          <View style={styles.tabToggle}>
            {[
              { key: 'dietary',  icon: 'sliders', label: 'Dietary'   },
              { key: 'dietlist', icon: 'list',    label: 'Diet List' },
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
                  color={activeTab === t.key ? Colors.textInverse : Colors.textSecondary}
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
        </View></AnimatedCard>

        {/* ══ DIETARY TAB ══════════════════════════════════════════════════════ */}
        {activeTab === 'dietary' && (
          <AnimatedCard delay={160}><View style={styles.tabContent}>

            {/* Premium gate banner */}
            {dietaryLocked && (
              <TouchableOpacity style={styles.gateBanner} onPress={showUpgrade} activeOpacity={0.85}>
                <Feather name="lock" size={15} color={Colors.accent} />
                <Text style={styles.gateBannerText}>
                  Dietary configuration is a Premium feature
                </Text>
                <Text style={styles.gateBannerCta}>Upgrade →</Text>
              </TouchableOpacity>
            )}

            {/* Master Toggle */}
            <TouchableOpacity
              style={styles.masterCard}
              onPress={dietaryLocked ? showUpgrade : undefined}
              activeOpacity={dietaryLocked ? 0.7 : 1}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.masterTitle, dietaryLocked && styles.lockedText]}>
                  Dietary Filtering
                </Text>
                <Text style={styles.masterSub}>
                  Flag products during scanning that don't match your goals
                </Text>
              </View>
              {dietaryLocked ? (
                <Feather name="lock" size={20} color={Colors.onSurfaceMuted} />
              ) : (
                <Switch
                  value={prefs.enabled}
                  onValueChange={v => updatePrefs({ enabled: v })}
                  trackColor={{ false: Colors.border, true: Colors.accentLight }}
                  thumbColor={prefs.enabled ? Colors.accent : Colors.surface}
                />
              )}
            </TouchableOpacity>

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
                  isActive={!dietaryLocked && !masterOff && prefs.preset === p.key}
                  locked={dietaryLocked}
                  masterOff={masterOff}
                  onPress={dietaryLocked ? showUpgrade : masterOff ? undefined : () => applyPreset(p)}
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
                    locked={dietaryLocked}
                    masterOff={masterOff}
                    onLockedPress={showUpgrade}
                  />
                  {i < NUTRIENTS.length - 1 && <View style={styles.divider} />}
                </Fragment>
              ))}
            </View>

            {/* Blacklist */}
            <Text style={styles.sectionLabel}>AVOID INGREDIENTS</Text>
            <View style={[styles.card, dietaryLocked && styles.lockedCard]}>
              <TouchableOpacity
                style={styles.blacklistRow}
                onPress={dietaryLocked ? showUpgrade : undefined}
                activeOpacity={dietaryLocked ? 0.7 : 1}
              >
                <TextInput
                  style={[styles.blacklistInput, dietaryLocked && { opacity: 0.5 }]}
                  value={blacklistInput}
                  onChangeText={dietaryLocked ? undefined : setBlacklistInput}
                  placeholder="e.g. palm oil, msg, carrageenan…"
                  placeholderTextColor={Colors.onSurfaceMuted}
                  returnKeyType="done"
                  onSubmitEditing={addBlacklist}
                  editable={!dietaryLocked}
                />
                <TouchableOpacity
                  style={[styles.addBtn, dietaryLocked && { opacity: 0.5 }]}
                  onPress={addBlacklist}
                  activeOpacity={0.8}
                >
                  <Feather name={dietaryLocked ? 'lock' : 'plus'} size={20} color={Colors.textInverse} />
                </TouchableOpacity>
              </TouchableOpacity>

              {prefs.blacklist.length > 0 ? (
                <View style={styles.chips}>
                  {prefs.blacklist.map(item => (
                    <View key={item} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                      {!dietaryLocked && (
                        <TouchableOpacity
                          onPress={() => removeBlacklist(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                        >
                          <Feather name="x" size={13} color={Colors.accent} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyNote}>
                  {dietaryLocked
                    ? 'Upgrade to Premium to configure dietary filters.'
                    : 'No ingredients added yet. Type one above and press return or +.'}
                </Text>
              )}
            </View>
          </View></AnimatedCard>
        )}

        {/* ══ DIET LIST TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'dietlist' && (
          <AnimatedCard delay={160}><View style={styles.tabContent}>

            {/* Premium gate banner */}
            {listLocked && (
              <TouchableOpacity style={styles.gateBanner} onPress={showUpgrade} activeOpacity={0.85}>
                <Feather name="lock" size={15} color={Colors.accent} />
                <Text style={styles.gateBannerText}>
                  Diet List is a Premium feature
                </Text>
                <Text style={styles.gateBannerCta}>Upgrade →</Text>
              </TouchableOpacity>
            )}

            {/* New list input row */}
            {!listLocked && showNewListInput && (
              <View style={styles.newListInputRow}>
                <TextInput
                  style={styles.newListInput}
                  value={newListInput}
                  onChangeText={setNewListInput}
                  placeholder="List name..."
                  placeholderTextColor={Colors.onSurfaceMuted}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddList}
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddList} activeOpacity={0.8}>
                  <Feather name="check" size={20} color={Colors.textInverse} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addBtn, styles.cancelBtn]}
                  onPress={() => { setShowNewListInput(false); setNewListInput(''); }}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={20} color={Colors.onSurfaceMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Add new list button */}
            {!listLocked && !showNewListInput && (
              <TouchableOpacity
                style={styles.addListBtn}
                onPress={() => setShowNewListInput(true)}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={18} color={Colors.accent} />
                <Text style={styles.addListBtnText}>New List</Text>
              </TouchableOpacity>
            )}

            {/* Lists */}
            <Text style={styles.sectionLabel}>YOUR LISTS</Text>
            {lists && lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[styles.listCard, listLocked && styles.lockedCard]}
                onPress={() => listLocked
                  ? showUpgrade()
                  : navigation.navigate('DietListDetail', { listId: list.id })
                }
                onLongPress={!list.isDefault && !listLocked
                  ? () => handleDeleteList(list.id)
                  : undefined
                }
                activeOpacity={0.85}
              >
                <View style={styles.listIconWrap}>
                  <Feather
                    name={list.isDefault ? 'star' : 'list'}
                    size={20}
                    color={listLocked ? Colors.onSurfaceMuted : Colors.accent}
                  />
                </View>
                <View style={styles.listMeta}>
                  <Text style={[styles.listName, listLocked && styles.lockedText]}>
                    {list.name}
                  </Text>
                  <Text style={styles.listCount}>
                    {list.products.length} {list.products.length === 1 ? 'product' : 'products'}
                    {list.products.length > 0 ? ` · ${formatListDate(list.updatedAt)}` : ''}
                  </Text>
                </View>
                <Feather
                  name={listLocked ? 'lock' : 'chevron-right'}
                  size={16}
                  color={Colors.onSurfaceMuted}
                />
              </TouchableOpacity>
            ))}

            {/* Empty hint */}
            {!listLocked && lists?.length <= 1 && lists?.[0]?.products.length === 0 && (
              <Text style={styles.emptyNote}>
                Scan a product and tap "Add to Diet List" to build your personal food lists.
              </Text>
            )}
          </View></AnimatedCard>
        )}
        </>}
      </ScrollView>

      <UpgradeModal
        feature="dietary"
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onUpgrade={() => setUpgradeVisible(false)}
      />
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
    fontSize: FONT_SIZE.xxl,
    fontFamily: FONTS.displayBold,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  pageSub: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textSecondary,
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
    ...SHADOW.sm,
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
    backgroundColor: Colors.accent,
  },
  tabPillText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
  },
  tabPillTextActive: {
    color: Colors.textInverse,
  },

  // ── Tab content ──────────────────────────────────────────────────────────────
  tabContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },

  // ── Section labels ───────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionMeta: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textSecondary,
    opacity: 0.7,
  },

  // ── Master Toggle Card ───────────────────────────────────────────────────────
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...SHADOW.sm,
  },
  masterTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  masterSub: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
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
    borderRadius: Radius.lg,
    padding: 16,
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...SHADOW.sm,
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
  presetLabel: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // ── Card container ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },

  // ── Nutrient rows ────────────────────────────────────────────────────────────
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  nutrientIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrientMeta: {
    flex: 1,
    gap: 3,
  },
  nutrientLabel: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  nutrientSummary: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.accent,
  },
  nutrientInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 12,
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 100,
    gap: 6,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  numInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  collapseBtn: {
    padding: 8,
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },

  // ── Blacklist ────────────────────────────────────────────────────────────────
  blacklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  blacklistInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },
  emptyNote: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingTop: 4,
    lineHeight: 18,
  },

  // ── Lock / gate styles ───────────────────────────────────────────────────────
  gateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gateBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  gateBannerCta: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },
  lockedCard: {
    opacity: 0.65,
  },
  lockedRow: {
    opacity: 0.65,
  },
  lockedText: {
    color: Colors.onSurfaceMuted,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Diet List tab ─────────────────────────────────────────────────────────────
  newListInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newListInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtn: {
    backgroundColor: Colors.border,
  },
  addListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addListBtnText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...SHADOW.sm,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listMeta: {
    flex: 1,
    gap: 4,
  },
  listName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  listCount: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textSecondary,
  },
});
