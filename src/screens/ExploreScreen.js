// src/screens/ExploreScreen.js
import { useState, Fragment } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { useDietaryPrefs } from '../hooks/useStorage';
import { useDietLists } from '../hooks/useDietLists';
import { usePremiumContext } from '../context/PremiumContext';
import { UpgradeModal } from '../components/UpgradeModal';

// ─── Static config ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    key: 'keto',
    label: 'Keto',
    icon: 'leaf',
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
    icon: 'zap',
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
    icon: 'trending-up',
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
    icon: 'heart',
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
    icon: 'sun',
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
    icon: 'sliders',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatListDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetCard({ preset, isActive, onPress, locked }) {
  return (
    <TouchableOpacity
      style={[
        styles.presetCard,
        isActive && { backgroundColor: preset.color, borderColor: preset.color },
        locked && styles.lockedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <View style={styles.presetCheck}>
          <Feather name="check" size={11} color="#fff" />
        </View>
      )}
      {locked && (
        <View style={styles.lockBadge}>
          <Feather name="lock" size={11} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.presetIconWrap, isActive && styles.presetIconWrapActive, locked && { opacity: 0.5 }]}>
        <Feather name={preset.icon} size={20} color={isActive ? '#fff' : preset.color} />
      </View>
      <Text style={[styles.presetLabel, isActive && { color: '#fff' }, locked && styles.lockedText]}>
        {preset.label}
      </Text>
      <Text style={[styles.presetDesc, isActive && { color: 'rgba(255,255,255,0.75)' }, locked && styles.lockedText]}>
        {preset.desc}
      </Text>
    </TouchableOpacity>
  );
}

function NutrientRow({ nutrient, value, onChange, locked, onLockedPress }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = v => {
    if (locked) { onLockedPress?.(); return; }
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
    <View style={locked && styles.lockedRow}>
      <TouchableOpacity
        style={styles.nutrientRow}
        onPress={locked ? onLockedPress : () => value.enabled && setExpanded(e => !e)}
        activeOpacity={locked ? 0.6 : value.enabled ? 0.7 : 1}
      >
        <View style={styles.nutrientIconWrap}>
          <Feather name={nutrient.icon} size={16} color={locked ? Colors.onSurfaceMuted : Colors.primary} />
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
            value={value.enabled}
            onValueChange={toggle}
            trackColor={{ false: Colors.outline, true: Colors.primaryLight }}
            thumbColor={value.enabled ? Colors.primary : Colors.surface}
          />
        )}
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

  if (!prefs) return null;

  const dietaryLocked = !isPremium;
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
  const applyPreset    = preset   => savePrefs(preset.apply({ ...prefs }));

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
        {/* ── Page Header ── */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.pageTitle}>Explore</Text>
          <Text style={styles.pageSub}>Dietary goals & nutrition guides</Text>
        </View>

        {/* ── Tab Toggle ── */}
        <View style={styles.tabToggleWrap}>
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

            {/* Premium gate banner */}
            {dietaryLocked && (
              <TouchableOpacity style={styles.gateBanner} onPress={showUpgrade} activeOpacity={0.85}>
                <Feather name="lock" size={15} color={Colors.primary} />
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
                  trackColor={{ false: Colors.outline, true: Colors.primaryLight }}
                  thumbColor={prefs.enabled ? Colors.primary : Colors.surface}
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
                  isActive={!dietaryLocked && prefs.preset === p.key}
                  locked={dietaryLocked}
                  onPress={dietaryLocked ? showUpgrade : () => applyPreset(p)}
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
                  <Feather name={dietaryLocked ? 'lock' : 'plus'} size={20} color="#fff" />
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
                          <Feather name="x" size={13} color={Colors.primary} />
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
          </View>
        )}

        {/* ══ DIET LIST TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'dietlist' && (
          <View style={styles.tabContent}>

            {/* Premium gate banner */}
            {listLocked && (
              <TouchableOpacity style={styles.gateBanner} onPress={showUpgrade} activeOpacity={0.85}>
                <Feather name="lock" size={15} color={Colors.primary} />
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
                  <Feather name="check" size={20} color="#fff" />
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
                <Feather name="plus" size={18} color={Colors.primary} />
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
                    color={listLocked ? Colors.onSurfaceMuted : Colors.primary}
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
          </View>
        )}
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
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -0.8,
    color: Colors.onSurface,
  },
  pageSub: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
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
    backgroundColor: Colors.primary,
  },
  tabPillText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
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
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
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
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
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
    ...SHADOW.md,
  },
  masterTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
  },
  masterSub: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
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
  presetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  presetIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  presetLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
  },
  presetDesc: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: Colors.onSurfaceMuted,
    lineHeight: 16,
  },

  // ── Card container ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...SHADOW.md,
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
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.onSurface,
  },
  nutrientSummary: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
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
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.onSurfaceMuted,
    letterSpacing: 0.3,
  },
  numInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
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
    fontSize: FONT_SIZE.md,
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
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.primary,
  },
  emptyNote: {
    fontSize: FONT_SIZE.sm,
    color: Colors.onSurfaceMuted,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
    lineHeight: 18,
  },

  // ── Lock / gate styles ───────────────────────────────────────────────────────
  gateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  gateBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.primary,
  },
  gateBannerCta: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.primary,
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
    backgroundColor: Colors.primarySurface,
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
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  cancelBtn: {
    backgroundColor: Colors.outline,
  },
  addListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  addListBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.primary,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    gap: 14,
    ...SHADOW.md,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface,
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
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
  },
  listCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: Colors.onSurfaceMuted,
  },
});
