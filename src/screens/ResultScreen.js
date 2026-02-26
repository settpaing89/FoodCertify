// src/screens/ResultScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Animated, Share, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RatingBadge, Card, NutriscoreBadge } from '../components';
import { calculateNutriScore } from '../engine/analyzer';
import { useHistory } from '../hooks/useStorage';

const RATING_CONFIG = {
  SAFE:    { gradient: Colors.safeGradient,    light: Colors.safeBg,    border: Colors.safeBorder    },
  CAUTION: { gradient: Colors.cautionGradient, light: Colors.cautionBg, border: Colors.cautionBorder },
  AVOID:   { gradient: Colors.avoidGradient,   light: Colors.avoidBg,   border: Colors.avoidBorder   },
};

export default function ResultScreen({ route, navigation }) {
  const { product, analysis: rawAnalysis, barcode, fromHistory } = route.params;
  const analysis = {
    issues: [],
    tips: [],
    conditionBreakdown: {},
    summary: '',
    checkedConditions: 0,
    flaggedCount: 0,
    ...rawAnalysis,
  };
  const hasFullAnalysis = Array.isArray(rawAnalysis?.issues);

  const insets = useSafeAreaInsets();
  const { addScan } = useHistory();
  const [saved, setSaved] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const cfg = RATING_CONFIG[analysis.rating || 'SAFE'];
  const nutriScore = product ? calculateNutriScore(product) : null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();

    if (analysis.rating === 'AVOID') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (analysis.rating === 'CAUTION') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (product && !saved && !fromHistory) {
      addScan({
        barcode,
        productName: product.name,
        brand: product.brand,
        rating: analysis.rating,
        imageUrl: product.imageThumbnailUrl,
        flaggedCount: analysis.flaggedCount,
      });
      setSaved(true);
    }
  }, []);

  const toggleIssue = (key) => {
    setExpandedIssues(prev => ({ ...prev, [key]: !prev[key] }));
    Haptics.selectionAsync();
  };

  const handleShare = async () => {
    const ratingLabel = { SAFE: 'SAFE', CAUTION: 'CAUTION', AVOID: 'UNSAFE' }[analysis.rating] || analysis.rating;
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
        {/* ── Hero ── */}
        <LinearGradient colors={cfg.gradient} style={styles.hero}>
          {/* Top bar */}
          <View style={[styles.heroTopBar, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Feather name="share-2" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Product row */}
          <View style={styles.heroProduct}>
            <View style={styles.productImageWrap}>
              {product?.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Feather name="shopping-bag" size={30} color="rgba(255,255,255,0.85)" />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              {product?.brand ? (
                <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
              ) : null}
              <Text style={styles.productName} numberOfLines={2}>
                {product?.name || 'Unknown Product'}
              </Text>
              {product?.quantity ? (
                <Text style={styles.productQuantity}>{product.quantity}</Text>
              ) : null}
            </View>
          </View>

          {/* Rating badge */}
          <RatingBadge rating={analysis.rating || 'SAFE'} size="lg" />
          <View style={{ height: 28 }} />
        </LinearGradient>

        {/* ── Stats + Summary card (slides up over hero) ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Card style={styles.summaryCard}>
            <View style={styles.statsRow}>
              {/* Conditions checked */}
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: Colors.primarySurface }]}>
                  <Feather name="check-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{analysis.checkedConditions}</Text>
                <Text style={styles.statLabel}>Conditions{'\n'}Checked</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Flagged */}
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, {
                  backgroundColor: analysis.flaggedCount > 0 ? Colors.cautionBg : Colors.primarySurface,
                }]}>
                  <Feather
                    name={analysis.flaggedCount > 0 ? 'alert-triangle' : 'shield'}
                    size={20}
                    color={analysis.flaggedCount > 0 ? Colors.caution : Colors.primary}
                  />
                </View>
                <Text style={[styles.statValue, {
                  color: analysis.flaggedCount > 0 ? Colors.caution : Colors.onSurface,
                }]}>{analysis.flaggedCount}</Text>
                <Text style={styles.statLabel}>Ingredients{'\n'}Flagged</Text>
              </View>

              {/* Nutriscore (if available) */}
              {nutriScore && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <NutriscoreBadge grade={nutriScore.label} />
                    <Text style={styles.statLabel}>Nutri{'\n'}Score</Text>
                  </View>
                </>
              )}
            </View>

            {/* Summary text */}
            {analysis.summary ? (
              <>
                <View style={styles.summaryDivider} />
                <Text style={styles.summaryText}>{analysis.summary}</Text>
              </>
            ) : null}
          </Card>
        </Animated.View>

        {/* ── Flagged Ingredients ── */}
        {hasFullAnalysis && analysis.issues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: Colors.avoidBg }]}>
                <Feather name="alert-triangle" size={15} color={Colors.avoid} />
              </View>
              <Text style={styles.sectionTitle}>Flagged Ingredients</Text>
            </View>

            {Object.values(analysis.conditionBreakdown)
              .filter(cond => cond.issues?.length > 0)
              .map(cond => (
                <View key={cond.id} style={styles.conditionGroup}>
                  <View style={[styles.conditionHeader, { borderColor: cond.color, backgroundColor: cond.bg }]}>
                    <View style={styles.conditionHeaderLeft}>
                      <View style={[styles.conditionIconWrap, { backgroundColor: cond.color }]}>
                        <MaterialCommunityIcons name={cond.icon} size={16} color="#fff" />
                      </View>
                      <Text style={[styles.conditionHeaderLabel, { color: cond.color }]}>{cond.label}</Text>
                    </View>
                    <View style={[styles.conditionCount, { backgroundColor: cond.color }]}>
                      <Text style={styles.conditionCountText}>{cond.issues.length}</Text>
                    </View>
                  </View>

                  {cond.issues.map((issue, idx) => {
                    const key = `${cond.id}-${idx}`;
                    const isExpanded = expandedIssues[key];
                    const issueCfg = RATING_CONFIG[issue.severity.toUpperCase()] || RATING_CONFIG.CAUTION;

                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => toggleIssue(key)}
                        activeOpacity={0.85}
                        style={[styles.issueCard, {
                          backgroundColor: issueCfg.light,
                          borderColor: issueCfg.border,
                        }]}
                      >
                        <View style={styles.issueHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.ingredientName}>{issue.ingredient}</Text>
                            <Text style={styles.ingredientCategory}>{issue.category}</Text>
                          </View>
                          <View style={styles.issueRight}>
                            <RatingBadge rating={issue.severity.toUpperCase()} />
                            <Feather
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color={Colors.onSurfaceMuted}
                            />
                          </View>
                        </View>
                        {isExpanded && (
                          <View style={styles.issueExpanded}>
                            <View style={styles.issueDivider} />
                            <Text style={styles.issueReason}>{issue.reason}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
          </View>
        )}

        {/* ── All Clear ── */}
        {hasFullAnalysis && analysis.issues.length === 0 && (
          <Card style={styles.safeCard}>
            <View style={styles.safeIconWrap}>
              <Feather name="check-circle" size={38} color={Colors.safe} />
            </View>
            <Text style={styles.safeTitle}>All Clear!</Text>
            <Text style={styles.safeBody}>
              No ingredients were flagged for your selected health conditions.
            </Text>
          </Card>
        )}

        {/* ── Tips ── */}
        {hasFullAnalysis && analysis.tips.length > 0 && (
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Feather name="info" size={15} color={Colors.primary} />
              <Text style={styles.tipsTitle}>Tips for You</Text>
            </View>
            {analysis.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* ── Full Ingredient List ── */}
        <Card style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Feather name="list" size={15} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Full Ingredient List</Text>
          </View>
          <Text style={styles.infoCardText}>
            {product?.ingredients || 'No ingredient information available.'}
          </Text>
        </Card>

        {/* ── Declared Allergens ── */}
        {product?.allergens?.length > 0 && (
          <Card style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Feather name="alert-circle" size={15} color={Colors.avoid} />
              <Text style={[styles.infoCardTitle, { color: Colors.avoid }]}>Declared Allergens</Text>
            </View>
            <View style={styles.allergenChips}>
              {product.allergens.map((a, i) => (
                <View key={i} style={styles.allergenChip}>
                  <Text style={styles.allergenChipText}>
                    {a.replace('en:', '').replace(/-/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
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
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => navigation.goBack()}>
          <LinearGradient colors={cfg.gradient} style={styles.scanAgainGradient}>
            <Feather name="maximize" size={18} color="#fff" />
            <Text style={styles.scanAgainText}>Scan Another Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NutritionPanel({ nutriments, servingSize }) {
  const [expanded, setExpanded] = useState(false);

  const items = [
    { label: 'Calories',      value: nutriments['energy-kcal_100g'],   unit: 'kcal' },
    { label: 'Total Fat',     value: nutriments.fat_100g,               unit: 'g' },
    { label: 'Saturated Fat', value: nutriments['saturated-fat_100g'],  unit: 'g' },
    { label: 'Carbohydrates', value: nutriments.carbohydrates_100g,     unit: 'g' },
    { label: 'Sugars',        value: nutriments.sugars_100g,            unit: 'g' },
    { label: 'Fiber',         value: nutriments.fiber_100g,             unit: 'g' },
    { label: 'Proteins',      value: nutriments.proteins_100g,          unit: 'g' },
    { label: 'Salt',          value: nutriments.salt_100g,              unit: 'g' },
    { label: 'Sodium',        value: nutriments.sodium_100g,            unit: 'g' },
  ].filter(i => i.value !== undefined && i.value !== null);

  const displayed = expanded ? items : items.slice(0, 5);

  return (
    <Card style={styles.nutritionCard}>
      <View style={styles.infoCardHeader}>
        <Feather name="bar-chart-2" size={15} color={Colors.primary} />
        <Text style={styles.infoCardTitle}>
          Nutrition{servingSize ? ` · Serving: ${servingSize}` : ' · per 100g'}
        </Text>
      </View>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  hero: { paddingHorizontal: Spacing.md },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroProduct: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.md,
  },
  productImageWrap: {
    width: 80, height: 80, borderRadius: 18, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  productBrand: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  productName: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 4 },
  productQuantity: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },

  // ── Summary Card ─────────────────────────────────────────────────────────────
  summaryCard: { marginHorizontal: 16, marginTop: -14 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingVertical: 6,
  },
  statItem: { alignItems: 'center', gap: 6, flex: 1 },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontSize: 24, fontWeight: '800',
    color: Colors.onSurface, letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11, color: Colors.onSurfaceMuted,
    fontWeight: '600', textAlign: 'center', lineHeight: 15,
  },
  statDivider: { width: 1, height: 56, backgroundColor: Colors.outline },
  summaryDivider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 14 },
  summaryText: { ...Typography.body, lineHeight: 22 },

  // ── Section ──────────────────────────────────────────────────────────────────
  section: { paddingHorizontal: 16, gap: 10, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.2 },

  // ── Condition Groups ──────────────────────────────────────────────────────────
  conditionGroup: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm, marginBottom: 4 },
  conditionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
  },
  conditionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  conditionIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  conditionHeaderLabel: { fontSize: 14, fontWeight: '700' },
  conditionCount: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  conditionCountText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  issueCard: {
    paddingHorizontal: 16, paddingVertical: 13, marginHorizontal: 1,
    borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomWidth: 1.5,
  },
  issueHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  issueRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientName: { fontSize: 14, fontWeight: '700', color: Colors.onSurface, textTransform: 'capitalize' },
  ingredientCategory: { fontSize: 11, color: Colors.onSurfaceMuted, marginTop: 2 },
  issueExpanded: { marginTop: 10 },
  issueDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 10 },
  issueReason: { ...Typography.body, fontSize: 13, lineHeight: 20 },

  // ── Safe Card ────────────────────────────────────────────────────────────────
  safeCard: {
    marginHorizontal: 16, marginTop: 8, alignItems: 'center', gap: 10, padding: 28,
    borderWidth: 1.5, borderColor: Colors.safeBorder, backgroundColor: Colors.safeBg,
  },
  safeIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  safeTitle: { fontSize: 20, fontWeight: '800', color: Colors.safe },
  safeBody: { ...Typography.body, textAlign: 'center', fontSize: 14 },

  // ── Tips ─────────────────────────────────────────────────────────────────────
  tipsCard: {
    marginHorizontal: 16, marginTop: 4, gap: 10,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1.5, borderColor: Colors.primaryBorder,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  tipText: { flex: 1, ...Typography.body, fontSize: 13, lineHeight: 20 },

  // ── Info Cards ───────────────────────────────────────────────────────────────
  infoCard: { marginHorizontal: 16, marginTop: 4, gap: 10 },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  infoCardText: { ...Typography.body, fontSize: 13, lineHeight: 20 },

  allergenChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  allergenChip: {
    backgroundColor: Colors.avoidBg, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.avoidBorder,
  },
  allergenChipText: { fontSize: 12, fontWeight: '700', color: Colors.avoidText, textTransform: 'capitalize' },

  // ── Nutrition ────────────────────────────────────────────────────────────────
  nutritionCard: { marginHorizontal: 16, marginTop: 4, gap: 4 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  nutritionRowAlt: {
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 6,
  },
  nutritionLabel: { ...Typography.body, fontSize: 13 },
  nutritionValue: { ...Typography.label, fontSize: 13 },
  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4, marginTop: 6,
  },
  showMoreText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },

  // ── Barcode ──────────────────────────────────────────────────────────────────
  barcodeInfo: { marginHorizontal: 16, marginTop: 12, marginBottom: 8, alignItems: 'center', gap: 4 },
  barcodeText: { ...Typography.caption, textAlign: 'center' },
  barcodeLink: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  // ── Bottom Bar ───────────────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingTop: 12, paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
    ...Shadow.lg,
  },
  scanAgainBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  scanAgainGradient: {
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  scanAgainText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
