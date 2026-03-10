// src/screens/ResultScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Animated, Easing, Share, Linking,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW, COLORS as TOKEN_COLORS } from '../utils/tokens';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { RatingBadge, Card, NutriscoreBadge } from '../components';
import { DietListPickerModal } from '../components/DietListPickerModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { calculateNutriScore } from '../engine/analyzer';
import { useHistoryContext } from '../context/HistoryContext';
import { usePremiumContext } from '../context/PremiumContext';

const RATING_CONFIG = {
  SAFE:    { solid: Colors.safe,    light: Colors.safeBg,    border: Colors.safeBorder    },
  CAUTION: { solid: Colors.caution, light: Colors.cautionBg, border: Colors.cautionBorder },
  AVOID:   { solid: Colors.avoid,   light: Colors.avoidBg,   border: Colors.avoidBorder   },
};

const ALLERGEN_EXPLANATIONS = {
  gluten:              'Contains gluten — avoid if you have celiac disease or gluten sensitivity.',
  wheat:               'Contains wheat — a common source of gluten.',
  milk:                'Contains dairy — may cause issues for lactose intolerance or milk allergy.',
  dairy:               'Contains dairy — may cause issues for lactose intolerance or milk allergy.',
  eggs:                'Contains eggs — a common allergen.',
  egg:                 'Contains eggs — a common allergen.',
  nuts:                'Contains tree nuts — avoid if you have a nut allergy.',
  peanuts:             'Contains peanuts — one of the most common and severe allergens.',
  peanut:              'Contains peanuts — one of the most common and severe allergens.',
  soy:                 'Contains soy — a common allergen found in many processed foods.',
  soybeans:            'Contains soy — a common allergen found in many processed foods.',
  fish:                'Contains fish — avoid if you have a fish allergy.',
  shellfish:           'Contains shellfish — a common and potentially severe allergen.',
  sesame:              'Contains sesame — increasingly recognised as a major allergen.',
  mustard:             'Contains mustard — may cause reactions in sensitive individuals.',
  celery:              'Contains celery — a declared allergen in many regions.',
  lupin:               'Contains lupin — related to peanuts; may cause cross-reactions.',
  molluscs:            'Contains molluscs — may cause reactions in shellfish-allergic individuals.',
  sulphites:           'Contains sulphites — may trigger asthma or allergic reactions.',
  'sulphur-dioxide':   'Contains sulphur dioxide — a preservative that can affect asthmatics.',
};

function getAllergenLabel(raw) {
  return raw.replace(/^en:/i, '').replace(/-/g, ' ');
}
function getAllergenExplanation(raw) {
  const key = raw.replace(/^en:/i, '').replace(/-/g, ' ').toLowerCase();
  return ALLERGEN_EXPLANATIONS[key] || `Contains ${key} — declared allergen.`;
}

// ─── Normalize analysis — handles both old and new return shapes ──────────────
function normalizeAnalysis(raw) {
  if (!raw) return null;
  if ('safetyRating' in raw) return raw;

  // Convert old shape (pre-refactor history items) to new shape
  const issues = raw.issues ?? [];

  const nutrientFlags = issues
    .filter(i => i.category === 'Nutrient' || i.category === 'Nutrient Limit')
    .map(i => ({ name: i.ingredient, value: '', threshold: '', status: i.severity, reason: i.reason }));

  const conditionFlags = [];
  for (const issue of issues.filter(i =>
    i.category !== 'Personal Blacklist' &&
    i.category !== 'Nutrient' &&
    i.category !== 'Nutrient Limit' &&
    i.category !== 'Processing Level' &&
    i.category !== 'Nutri-Score'
  )) {
    for (const cid of (issue.conditions ?? [])) {
      if (cid === 'dietary') continue;
      conditionFlags.push({
        condition: cid.charAt(0).toUpperCase() + cid.slice(1),
        ingredient: issue.ingredient,
        reason: issue.reason,
        status: issue.severity,
      });
    }
  }

  const blacklistFlags = issues
    .filter(i => i.category === 'Personal Blacklist')
    .map(i => ({ ingredient: i.ingredient, status: 'avoid' }));

  const bn = raw.beneficialNutrients;
  const beneficialNutrients = bn
    ? [
        { name: 'Fiber',   value: `${typeof bn.fiber   === 'number' ? bn.fiber.toFixed(1)   : bn.fiber}g`,   note: 'good source' },
        { name: 'Protein', value: `${typeof bn.protein === 'number' ? bn.protein.toFixed(1) : bn.protein}g`, note: 'good source' },
      ]
    : [];

  return {
    safetyRating:       raw.rating,
    summary:            raw.summary ?? '',
    conditionsChecked:  raw.checkedConditions ?? 0,
    ingredientsFlagged: raw.flaggedCount ?? 0,
    nutriScore:         null,
    nutrientFlags,
    beneficialNutrients,
    conditionFlags,
    blacklistFlags,
    analyzedAt:         raw.analyzedAt,
  };
}

// ─── Source pill config ───────────────────────────────────────────────────────
const SOURCE_PILL_CONFIG = {
  'WHO/FDA Guidelines':                       { bg: TOKEN_COLORS.sourceFda,      text: TOKEN_COLORS.sourceFdaText      },
  'Your Dietary Limits':                      { bg: TOKEN_COLORS.accentLight,    text: TOKEN_COLORS.accent             },
  'WHO/FDA Guidelines & Your Dietary Limits': { bg: TOKEN_COLORS.accentLight,    text: TOKEN_COLORS.accent             },
  'Your Health Conditions':                   { bg: TOKEN_COLORS.sourcePersonal, text: TOKEN_COLORS.sourcePersonalText },
  'Your Dietary Blacklist':                   { bg: TOKEN_COLORS.avoidBackground,text: TOKEN_COLORS.avoid              },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function GroupHeader({ icon, label, count, worst }) {
  const pillBg    = worst === 'avoid' ? Colors.avoidBg    : Colors.cautionBg;
  const pillColor = worst === 'avoid' ? Colors.avoid      : Colors.caution;
  return (
    <View style={styles.groupHeader}>
      <View style={styles.groupIconCircle}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <Text style={styles.groupLabel}>{label}</Text>
      {count > 0 && (
        <View style={[styles.groupCountPill, { backgroundColor: pillBg }]}>
          <Text style={[styles.groupCountText, { color: pillColor }]}>{count} flagged</Text>
        </View>
      )}
    </View>
  );
}

function FlagRow({ name, detail, status, source, showDivider }) {
  const pillColors = source ? SOURCE_PILL_CONFIG[source] : null;
  return (
    <>
      {showDivider && <View style={styles.flagDivider} />}
      <View style={styles.flagRow}>
        <View style={styles.flagLeft}>
          <Text style={styles.flagName}>{name}</Text>
          {!!detail && <Text style={styles.flagDetail} numberOfLines={2}>{detail}</Text>}
          {!!pillColors && (
            <View style={[styles.flagSourcePill, { backgroundColor: pillColors.bg }]}>
              <Text style={[styles.flagSourceText, { color: pillColors.text }]}>{source}</Text>
            </View>
          )}
        </View>
        <View style={[styles.flagDot, {
          backgroundColor: status === 'avoid' ? Colors.avoid : Colors.caution,
          marginTop: 4,
        }]} />
      </View>
    </>
  );
}

function BeneficialRow({ item, showDivider }) {
  return (
    <>
      {showDivider && <View style={styles.flagDivider} />}
      <View style={styles.beneficialRow}>
        <View style={[styles.flagDot, { backgroundColor: Colors.safe }]} />
        <Text style={styles.beneficialText}>{item.name} {item.value} · {item.note}</Text>
      </View>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResultScreen({ route, navigation }) {
  const { product, analysis: rawAnalysis, barcode, isFromHistory, conditionsCount = 0 } = route.params;

  const analysis = normalizeAnalysis(rawAnalysis) ?? {
    safetyRating:       null,
    summary:            '',
    conditionsChecked:  0,
    ingredientsFlagged: 0,
    nutriScore:         null,
    nutrientFlags:      [],
    beneficialNutrients: [],
    conditionFlags:     [],
    blacklistFlags:     [],
  };

  const insets = useSafeAreaInsets();
  const { addScan } = useHistoryContext();
  const { isPremium } = usePremiumContext();
  const [saved,          setSaved]          = useState(false);
  const [pickerVisible,  setPickerVisible]  = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);

  const fadeAnim        = useRef(new Animated.Value(0)).current;
  const slideAnim       = useRef(new Animated.Value(24)).current;
  const badgeAnim       = useRef(new Animated.Value(0)).current;
  const ingredientsAnim = useRef(new Animated.Value(0)).current;

  // Computed display values
  const VALID_NUTRI_SCORES = ['A', 'B', 'C', 'D', 'E'];
  const nutriScoreGrade = (analysis.nutriScore && VALID_NUTRI_SCORES.includes(analysis.nutriScore))
    ? analysis.nutriScore
    : (product ? calculateNutriScore(product)?.label : null);
  const hasBadFlags      = analysis.nutrientFlags.length + analysis.conditionFlags.length + analysis.blacklistFlags.length > 0;
  const showAnalysisCard = hasBadFlags || analysis.conditionsChecked === 0;
  const showGroupB       = analysis.conditionsChecked === 0 || conditionsCount > 0 || analysis.conditionFlags.length > 0;
  const showNutrients    = analysis.nutrientFlags.length > 0 || analysis.beneficialNutrients.length > 0;
  const showBlacklist    = analysis.blacklistFlags.length > 0;

  const nutrientWorst   = analysis.nutrientFlags.some(f => f.status === 'avoid')   ? 'avoid' : 'caution';
  const conditionWorst  = analysis.conditionFlags.some(f => f.status === 'avoid')  ? 'avoid' : 'caution';

  // Allergens
  const allergens    = product?.allergens ?? [];
  const traces       = product?.traces    ?? [];
  const hasAllergens = allergens.length > 0;
  const hasTraces    = traces.length > 0;

  // Animated max-height for ingredient list
  const ingredientsMaxHeight = ingredientsAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 1200],
  });

  const toggleIngredients = () => {
    const newExpanded = !ingredientsExpanded;
    Animated.timing(ingredientsAnim, {
      toValue:         newExpanded ? 1 : 0,
      duration:        300,
      easing:          Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    setIngredientsExpanded(newExpanded);
  };

  // Entrance animation + haptics + history save
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();

    if (analysis.safetyRating === 'AVOID') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (analysis.safetyRating === 'CAUTION') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (product && !saved && !isFromHistory) {
      addScan({
        barcode,
        productName:        product.name,
        brand:              product.brand,
        quantity:           product.quantity,
        imageUrl:           product.imageThumbnailUrl || product.imageUrl,
        safetyRating:       analysis.safetyRating,
        conditionsChecked:  analysis.conditionsChecked,
        ingredientsFlagged: analysis.ingredientsFlagged,
        nutriScore:         analysis.nutriScore ?? nutriScoreGrade ?? null,
        fullIngredientList: product.ingredients,
        allergens:          product.allergens,
        savedProduct: {
          name:              product.name,
          brand:             product.brand,
          quantity:          product.quantity,
          imageUrl:          product.imageUrl,
          imageThumbnailUrl: product.imageThumbnailUrl,
          ingredients:       product.ingredients,
          allergens:         product.allergens,
          nutriments:        product.nutriments,
          servingSize:       product.servingSize,
        },
        savedAnalysis: analysis,
      });
      setSaved(true);
    }
  }, []);

  // Badge pop-in — fires once on mount
  useEffect(() => {
    Animated.timing(badgeAnim, {
      toValue:         1,
      duration:        400,
      easing:          Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    const ratingLabel = { SAFE: 'SAFE', CAUTION: 'CAUTION', AVOID: 'UNSAFE' }[analysis.safetyRating] || analysis.safetyRating;
    await Share.share({
      message: `${product?.name || 'This product'} is ${ratingLabel} for my dietary conditions — checked with FoodSafe`,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Feather name="share-2" size={18} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* ── Product Hero Card + Stats (animated entrance) ── */}
        <Animated.View style={[
          styles.animatedBlock,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          {/* Product Card */}
          <View style={styles.productCard}>
            <View style={styles.productImageWrap}>
              {product?.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Feather name="shopping-bag" size={28} color={Colors.onSurfaceMuted} />
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              {product?.brand ? (
                <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
              ) : null}
              <Text style={styles.productName} numberOfLines={2}>
                {product?.name || 'Unknown Product'}
              </Text>
              {product?.quantity ? (
                <Text style={styles.productQuantity}>{product.quantity}</Text>
              ) : null}
              <View style={styles.ratingRow}>
                <Animated.View style={{
                  opacity: badgeAnim,
                  transform: [{ scale: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.0] }) }],
                }}>
                  <RatingBadge rating={analysis.safetyRating || 'SAFE'} size="lg" />
                </Animated.View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ScoringExplainer', { source: 'result' })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="information-circle-outline" size={18} color={Colors.onSurfaceMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              {/* Conditions checked */}
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: Colors.accentLight }]}>
                  <Feather name="check-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{analysis.conditionsChecked}</Text>
                <Text style={styles.statLabel}>Conditions{'\n'}Checked</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Flagged */}
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, {
                  backgroundColor: analysis.ingredientsFlagged > 0 ? Colors.cautionBg : Colors.accentLight,
                }]}>
                  <Feather
                    name={analysis.ingredientsFlagged > 0 ? 'alert-triangle' : 'shield'}
                    size={20}
                    color={analysis.ingredientsFlagged > 0 ? Colors.caution : Colors.primary}
                  />
                </View>
                <Text style={styles.statValue}>{analysis.ingredientsFlagged}</Text>
                <Text style={styles.statLabel}>Ingredients{'\n'}Flagged</Text>
              </View>

              {/* Nutriscore */}
              {nutriScoreGrade && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <NutriscoreBadge grade={nutriScoreGrade} />
                    <View style={styles.nutriScoreLabelRow}>
                      <Text style={styles.statLabel}>Nutri{'\n'}Score</Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ScoringExplainer', { source: 'nutriscore' })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="information-circle-outline" size={14} color={Colors.onSurfaceMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>

            {analysis.summary ? (
              <>
                <View style={styles.summaryDivider} />
                <Text style={styles.summaryText}>{analysis.summary}</Text>
              </>
            ) : null}
          </View>
        </Animated.View>

        {/* ── Analysis Card OR All Clear ── */}
        {showAnalysisCard ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionCard}>
              {/* Card header */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { fontSize: FONT_SIZE.lg }]}>Why This Rating?</Text>
              </View>

              <View style={styles.analysisBody}>
                {/* Group A: Nutrients */}
                {showNutrients && (
                  <View>
                    <GroupHeader
                      icon="nutrition-outline"
                      label="Nutrients"
                      count={analysis.nutrientFlags.length}
                      worst={nutrientWorst}
                    />
                    {analysis.nutrientFlags.map((f, i) => (
                      <FlagRow
                        key={i}
                        name={f.name}
                        detail={f.value ? `${f.value} · max ${f.threshold}` : f.reason}
                        status={f.status}
                        source={f.source}
                        showDivider={i > 0}
                      />
                    ))}
                    {analysis.beneficialNutrients.map((b, i) => (
                      <BeneficialRow
                        key={i}
                        item={b}
                        showDivider={analysis.nutrientFlags.length > 0 || i > 0}
                      />
                    ))}
                  </View>
                )}

                {/* Divider between A and B */}
                {showNutrients && showGroupB && <View style={styles.groupDivider} />}

                {/* Group B: Health Conditions */}
                {showGroupB && (
                  <View>
                    <GroupHeader
                      icon="medical-outline"
                      label="Your Health Conditions"
                      count={analysis.conditionFlags.length}
                      worst={conditionWorst}
                    />
                    {analysis.conditionsChecked === 0 && conditionsCount === 0 ? (
                      <TouchableOpacity
                        style={styles.noConditionsRow}
                        onPress={() => navigation.navigate('Profile')}
                      >
                        <Text style={styles.noConditionsText}>
                          No conditions set — add conditions in Profile for personalized results
                        </Text>
                        <Feather name="chevron-right" size={14} color={Colors.onSurfaceMuted} />
                      </TouchableOpacity>
                    ) : analysis.conditionsChecked === 0 && conditionsCount > 0 ? (
                      <View style={styles.noConditionsRow}>
                        <Text style={styles.noConditionsText}>
                          Ingredient list unavailable — conditions could not be checked
                        </Text>
                      </View>
                    ) : analysis.conditionFlags.length === 0 ? (
                      <View style={styles.noConditionsRow}>
                        <Feather name="check-circle" size={14} color={Colors.safe} />
                        <Text style={[styles.noConditionsText, { color: Colors.safe }]}>
                          No issues found for your {analysis.conditionsChecked} condition{analysis.conditionsChecked !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    ) : (
                      analysis.conditionFlags.map((f, i) => (
                        <FlagRow
                          key={i}
                          name={f.condition}
                          detail={f.ingredient}
                          status={f.status}
                          source={f.source}
                          showDivider={i > 0}
                        />
                      ))
                    )}
                  </View>
                )}

                {/* Divider between B/A and C */}
                {(showNutrients || showGroupB) && showBlacklist && <View style={styles.groupDivider} />}

                {/* Group C: Dietary Blacklist */}
                {showBlacklist && (
                  <View>
                    <GroupHeader
                      icon="ban-outline"
                      label="Your Blacklist"
                      count={analysis.blacklistFlags.length}
                      worst="avoid"
                    />
                    {analysis.blacklistFlags.map((f, i) => (
                      <FlagRow
                        key={i}
                        name={f.ingredient}
                        detail="Matches your dietary blacklist"
                        status="avoid"
                        source={f.source}
                        showDivider={i > 0}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.sectionWrap}>
            <View style={[styles.sectionCard, styles.safeCard]}>
              <View style={styles.safeIconWrap}>
                <Feather name="check-circle" size={40} color={Colors.safe} />
              </View>
              <Text style={styles.safeTitle}>All Clear!</Text>
              <Text style={styles.safeBody}>
                No issues found for your conditions and dietary preferences.
              </Text>
            </View>
          </View>
        )}

        {/* ── Full Ingredient List (collapsible) ── */}
        {product?.ingredients ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.sectionHeader} onPress={toggleIngredients} activeOpacity={0.8}>
                <View style={[styles.sectionIconCircle, { backgroundColor: Colors.accentLight }]}>
                  <Feather name="list" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Full Ingredient List</Text>
                <Text style={styles.ingredientToggle}>{ingredientsExpanded ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
              <Animated.View style={{ maxHeight: ingredientsMaxHeight, overflow: 'hidden' }}>
                <View style={styles.sectionBody}>
                  <Text style={styles.infoCardText}>{product.ingredients}</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        ) : null}

        {/* ── Allergens (slim pill rows) ── */}
        {(hasAllergens || hasTraces) && (
          <View style={styles.allergenPillWrap}>
            {hasAllergens && (
              <View style={[styles.allergenPill, { backgroundColor: Colors.avoidBg, borderColor: Colors.avoidBorder }]}>
                <Feather name="alert-triangle" size={12} color={Colors.avoid} />
                <Text style={[styles.allergenPillText, { color: Colors.avoid }]}>
                  Contains: {allergens.map(a => getAllergenLabel(a)).join(', ')}
                </Text>
              </View>
            )}
            {hasTraces && (
              <View style={[styles.allergenPill, { backgroundColor: Colors.cautionBg, borderColor: Colors.cautionBorder }]}>
                <Feather name="alert-circle" size={12} color={Colors.caution} />
                <Text style={[styles.allergenPillText, { color: Colors.caution }]}>
                  May contain: {traces.map(t => getAllergenLabel(t)).join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Nutrition ── */}
        {product?.nutriments && Object.keys(product.nutriments).length > 0 && (
          <NutritionPanel nutriments={product.nutriments} servingSize={product.servingSize} />
        )}

        {/* ── Barcode ── */}
        <View style={styles.barcodeInfo}>
          <Text style={styles.barcodeText}>Barcode {barcode} · Open Food Facts</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://world.openfoodfacts.org/product/${barcode}`)}>
            <Text style={styles.barcodeLink}>View full product page</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Feather name="maximize-2" size={18} color={Colors.textInverse} />
          <Text style={styles.scanAgainText}>Scan Another Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToListBtn}
          onPress={() => isPremium ? setPickerVisible(true) : setUpgradeVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="bookmark" size={16} color={Colors.accent} />
          <Text style={styles.addToListText}>Add to Diet List</Text>
        </TouchableOpacity>
      </View>

      <DietListPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        product={{
          barcode,
          productName: product?.name,
          brand: product?.brand,
          rating: analysis.safetyRating,
          imageUrl: product?.imageThumbnailUrl || product?.imageUrl,
        }}
      />
      <UpgradeModal
        feature="dietlist"
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onUpgrade={() => setUpgradeVisible(false)}
      />
    </View>
  );
}

// ─── Nutrition Panel ──────────────────────────────────────────────────────────
function NutritionPanel({ nutriments, servingSize }) {
  const [expanded, setExpanded] = useState(false);

  const items = [
    { label: 'Calories',      value: nutriments['energy-kcal_100g'],  unit: 'kcal' },
    { label: 'Total Fat',     value: nutriments.fat_100g,              unit: 'g' },
    { label: 'Saturated Fat', value: nutriments['saturated-fat_100g'], unit: 'g' },
    { label: 'Carbohydrates', value: nutriments.carbohydrates_100g,    unit: 'g' },
    { label: 'Sugars',        value: nutriments.sugars_100g,           unit: 'g' },
    { label: 'Fiber',         value: nutriments.fiber_100g,            unit: 'g' },
    { label: 'Proteins',      value: nutriments.proteins_100g,         unit: 'g' },
    { label: 'Salt',          value: nutriments.salt_100g,             unit: 'g' },
    { label: 'Sodium',        value: nutriments.sodium_100g,           unit: 'g' },
  ].filter(i => i.value !== undefined && i.value !== null);

  const displayed = expanded ? items : items.slice(0, 5);

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconCircle, { backgroundColor: Colors.accentLight }]}>
            <Feather name="bar-chart-2" size={14} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>
            Nutrition{servingSize ? ` · Serving: ${servingSize}` : ' · per 100g'}
          </Text>
        </View>
        <View style={styles.sectionBody}>
          {displayed.map((item, i) => (
            <View key={i} style={[styles.nutritionRow, i % 2 === 0 && styles.nutritionRowAlt]}>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
              <Text style={styles.nutritionValue}>{Number(item.value).toFixed(1)} {item.unit}</Text>
            </View>
          ))}
          {items.length > 5 && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreBtn}>
              <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.primary} />
              <Text style={styles.showMoreText}>{expanded ? 'Show less' : `Show ${items.length - 5} more`}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },

  // ── Animated block ────────────────────────────────────────────────────────────
  animatedBlock: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // ── Product Card ──────────────────────────────────────────────────────────────
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    ...SHADOW.md,
  },
  productImageWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1, gap: 3 },
  productBrand: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
  },
  productName: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  productQuantity: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  // ── Stats Card ────────────────────────────────────────────────────────────────
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...SHADOW.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
  },
  statItem: { alignItems: 'center', gap: 6, flex: 1 },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.displaySemibold,
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: Colors.textSecondary,
    fontFamily: FONTS.bodySemibold,
    textAlign: 'center',
    lineHeight: 15,
  },
  nutriScoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statDivider: { width: 1, height: 56, backgroundColor: Colors.divider },
  summaryDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.sm },
  summaryText: { ...Typography.body, lineHeight: 22 },

  // ── Section wrapper ───────────────────────────────────────────────────────────
  sectionWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  sectionBody: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  ingredientToggle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },

  // ── Analysis Card ─────────────────────────────────────────────────────────────
  analysisBody: {
    paddingVertical: Spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  groupIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  groupCountPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupCountText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
  },
  groupDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  flagDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  flagLeft: { flex: 1, gap: 2 },
  flagName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  flagDetail: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  flagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  beneficialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  beneficialText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.safe,
  },
  noConditionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  noConditionsText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // ── All Clear ────────────────────────────────────────────────────────────────
  safeCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.safeBorder,
    backgroundColor: Colors.safeBg,
  },
  safeIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  safeTitle: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displaySemibold, color: Colors.safe },
  safeBody: { ...Typography.body, textAlign: 'center', fontSize: FONT_SIZE.md },

  // ── Info text ─────────────────────────────────────────────────────────────────
  infoCardText: { ...Typography.body, fontSize: FONT_SIZE.sm, lineHeight: 20 },

  // ── Allergen pill rows ────────────────────────────────────────────────────────
  allergenPillWrap: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  allergenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  allergenPillText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    lineHeight: 18,
    textTransform: 'capitalize',
  },

  // ── Nutrition ────────────────────────────────────────────────────────────────
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  nutritionRowAlt: {
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: -4,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  nutritionLabel: { ...Typography.body, fontSize: FONT_SIZE.sm },
  nutritionValue: { ...Typography.label, fontSize: FONT_SIZE.sm },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  showMoreText: { color: Colors.primary, fontFamily: FONTS.bodySemibold, fontSize: FONT_SIZE.sm },

  // ── Barcode ──────────────────────────────────────────────────────────────────
  barcodeInfo: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  barcodeText: { ...Typography.caption, textAlign: 'center' },
  barcodeLink: { color: Colors.primary, fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold },

  // ── Bottom Bar ───────────────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...SHADOW.lg,
  },
  scanAgainBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  scanAgainText: {
    color: Colors.textInverse,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
  },
  addToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    marginTop: Spacing.xs,
  },
  addToListText: {
    color: Colors.accent,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
  },

  // ── Source pill ───────────────────────────────────────────────────────────────
  flagSourcePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 5,
  },
  flagSourceText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodyMedium,
  },
});
