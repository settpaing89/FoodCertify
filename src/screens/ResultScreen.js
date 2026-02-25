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
import { RatingBadge, Card, NutriscoreBadge, Chip } from '../components';
import { calculateNutriScore } from '../engine/analyzer';
import { useHistory } from '../hooks/useStorage';

const RATING_CONFIG = {
  SAFE:    { gradient: Colors.safeGradient,    light: Colors.safeBg,    border: Colors.safeBorder    },
  CAUTION: { gradient: Colors.cautionGradient, light: Colors.cautionBg, border: Colors.cautionBorder },
  AVOID:   { gradient: Colors.avoidGradient,   light: Colors.avoidBg,   border: Colors.avoidBorder   },
};

export default function ResultScreen({ route, navigation }) {
  const { product, analysis, barcode } = route.params;
  const insets = useSafeAreaInsets();
  const { addScan } = useHistory();
  const [saved, setSaved] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState({});

  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const cfg = RATING_CONFIG[analysis?.rating || 'SAFE'];
  const nutriScore = product ? calculateNutriScore(product) : null;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Haptic feedback based on rating
    if (analysis?.rating === 'AVOID') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (analysis?.rating === 'CAUTION') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Auto-save to history
    if (product && analysis && !saved) {
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
    const emoji = { SAFE: '✅', CAUTION: '⚠️', AVOID: '🚫' }[analysis.rating];
    await Share.share({
      message: `${emoji} ${product.name} is ${analysis.rating} for my diet conditions — checked with FoodSafe`,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Hero header */}
        <Animated.View style={{ opacity: headerOpacity, transform: [{ scale: headerScale }] }}>
          <LinearGradient colors={cfg.gradient} style={styles.hero}>
            {/* Back button */}
            <View style={[styles.heroTopBar, { paddingTop: insets.top + 12 }]}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareIcon}>↑</Text>
              </TouchableOpacity>
            </View>

            {/* Product info */}
            <View style={styles.heroProduct}>
              {product?.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={{ fontSize: 48 }}>🥫</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productBrand}>{product?.brand}</Text>
                <Text style={styles.productName} numberOfLines={2}>
                  {product?.name || 'Unknown Product'}
                </Text>
                {product?.quantity && (
                  <Text style={styles.productQuantity}>{product.quantity}</Text>
                )}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <RatingBadge rating={analysis?.rating || 'SAFE'} size="lg" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Summary card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>{analysis?.summary}</Text>

          <View style={styles.summaryChips}>
            <Chip
              label={`${analysis?.checkedConditions || 0} conditions checked`}
              color={Colors.primary}
              bg={Colors.primarySurface}
              icon="✓"
            />
            <Chip
              label={`${analysis?.flaggedCount || 0} flagged`}
              color={analysis?.flaggedCount > 0 ? Colors.caution : Colors.primary}
              bg={analysis?.flaggedCount > 0 ? Colors.cautionBg : Colors.primarySurface}
              icon={analysis?.flaggedCount > 0 ? '⚠️' : '✅'}
            />
            {nutriScore && <NutriscoreBadge grade={nutriScore.label} />}
          </View>
        </Card>

        {/* Issues by condition */}
        {analysis?.issues?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Flagged Ingredients</Text>

            {Object.values(analysis.conditionBreakdown || {})
              .filter(cond => cond.issues?.length > 0)
              .map(cond => (
                <View key={cond.id} style={styles.conditionGroup}>
                  <View style={[styles.conditionHeader, { borderColor: cond.color, backgroundColor: cond.bg }]}>
                    <View style={styles.conditionHeaderLeft}>
                      <Text style={styles.conditionHeaderIcon}>{cond.icon}</Text>
                      <Text style={[styles.conditionHeaderLabel, { color: cond.color }]}>
                        {cond.label}
                      </Text>
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
                            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
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

        {/* Safe confirmation */}
        {analysis?.issues?.length === 0 && (
          <Card style={[styles.safeCard, { borderColor: Colors.safeBorder }]}>
            <Text style={styles.safeEmoji}>🎉</Text>
            <Text style={styles.safeTitle}>All Clear!</Text>
            <Text style={styles.safeBody}>
              No ingredients were flagged for your selected health conditions.
            </Text>
          </Card>
        )}

        {/* Tips */}
        {analysis?.tips?.length > 0 && (
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for You</Text>
            {analysis.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Full ingredient list */}
        <Card style={styles.ingredientsCard}>
          <Text style={styles.ingredientsTitle}>📋 Full Ingredient List</Text>
          <Text style={styles.ingredientsText}>
            {product?.ingredients || 'No ingredient information available.'}
          </Text>
        </Card>

        {/* Allergens */}
        {product?.allergens?.length > 0 && (
          <Card style={styles.allergenCard}>
            <Text style={styles.ingredientsTitle}>🚨 Declared Allergens</Text>
            <View style={styles.allergenChips}>
              {product.allergens.map((a, i) => (
                <Chip
                  key={i}
                  label={a.replace('en:', '').replace(/-/g, ' ')}
                  color={Colors.avoid}
                  bg={Colors.avoidBg}
                />
              ))}
            </View>
          </Card>
        )}

        {/* Nutrition */}
        {product?.nutriments && Object.keys(product.nutriments).length > 0 && (
          <NutritionPanel nutriments={product.nutriments} servingSize={product.servingSize} />
        )}

        {/* Barcode info */}
        <View style={styles.barcodeInfo}>
          <Text style={styles.barcodeText}>
            Barcode: {barcode} · Data from Open Food Facts
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://world.openfoodfacts.org/product/${barcode}`)}>
            <Text style={styles.barcodeLink}>View full product page →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom scan again button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient colors={Colors.safeGradient} style={styles.scanAgainGradient}>
            <Text style={styles.scanAgainText}>📷 Scan Another Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NutritionPanel({ nutriments, servingSize }) {
  const [expanded, setExpanded] = useState(false);

  const items = [
    { label: 'Calories', value: nutriments['energy-kcal_100g'], unit: 'kcal' },
    { label: 'Total Fat', value: nutriments.fat_100g, unit: 'g' },
    { label: 'Saturated Fat', value: nutriments['saturated-fat_100g'], unit: 'g' },
    { label: 'Carbohydrates', value: nutriments.carbohydrates_100g, unit: 'g' },
    { label: 'Sugars', value: nutriments.sugars_100g, unit: 'g' },
    { label: 'Fiber', value: nutriments.fiber_100g, unit: 'g' },
    { label: 'Proteins', value: nutriments.proteins_100g, unit: 'g' },
    { label: 'Salt', value: nutriments.salt_100g, unit: 'g' },
    { label: 'Sodium', value: nutriments.sodium_100g, unit: 'g' },
  ].filter(i => i.value !== undefined && i.value !== null);

  const displayed = expanded ? items : items.slice(0, 5);

  return (
    <Card style={styles.nutritionCard}>
      <Text style={styles.ingredientsTitle}>📊 Nutrition (per 100g{servingSize ? ` · Serving: ${servingSize}` : ''})</Text>
      {displayed.map((item, i) => (
        <View key={i} style={[styles.nutritionRow, i % 2 === 0 && styles.nutritionRowAlt]}>
          <Text style={styles.nutritionLabel}>{item.label}</Text>
          <Text style={styles.nutritionValue}>{Number(item.value).toFixed(1)}{item.unit}</Text>
        </View>
      ))}
      {items.length > 5 && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreBtn}>
          <Text style={styles.showMoreText}>
            {expanded ? '▲ Show less' : `▼ Show ${items.length - 5} more`}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  hero: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full, width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { color: '#fff', fontSize: 18, fontWeight: '800' },

  heroProduct: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: Spacing.lg },
  productImage: { width: 72, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  productImagePlaceholder: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  productBrand: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 3 },
  productName: { color: '#fff', fontSize: 19, fontWeight: '800', lineHeight: 24 },
  productQuantity: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 },
  ratingContainer: { alignItems: 'flex-start' },

  summaryCard: { margin: 16, marginTop: -16, gap: 12 },
  summaryText: { ...Typography.body, lineHeight: 22 },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },

  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { ...Typography.title, marginBottom: 4 },

  conditionGroup: { marginBottom: 12, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  conditionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderWidth: 1.5,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
  },
  conditionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  conditionHeaderIcon: { fontSize: 20 },
  conditionHeaderLabel: { fontSize: 15, fontWeight: '700' },
  conditionCount: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  conditionCountText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  issueCard: {
    padding: 14, marginHorizontal: 1,
    borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomWidth: 1.5,
  },
  issueHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  issueRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, textTransform: 'capitalize' },
  ingredientCategory: { fontSize: 12, color: Colors.onSurfaceMuted, marginTop: 2 },
  expandIcon: { fontSize: 12, color: Colors.onSurfaceMuted },
  issueExpanded: { marginTop: 10 },
  issueDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 10 },
  issueReason: { ...Typography.body, fontSize: 13, lineHeight: 20 },

  safeCard: {
    margin: 16, alignItems: 'center', gap: 8, padding: 24,
    borderWidth: 2, borderColor: Colors.safeBorder,
  },
  safeEmoji: { fontSize: 48 },
  safeTitle: { fontSize: 22, fontWeight: '800', color: Colors.safe },
  safeBody: { ...Typography.body, textAlign: 'center' },

  tipsCard: { margin: 16, marginTop: 8, gap: 12, backgroundColor: Colors.primarySurface, borderWidth: 1.5, borderColor: Colors.primaryBorder },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  tipText: { flex: 1, ...Typography.body, fontSize: 13, lineHeight: 20 },

  ingredientsCard: { margin: 16, marginTop: 8 },
  ingredientsTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginBottom: 10 },
  ingredientsText: { ...Typography.body, fontSize: 13, lineHeight: 20 },

  allergenCard: { margin: 16, marginTop: 0 },
  allergenChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },

  nutritionCard: { margin: 16, marginTop: 0 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  nutritionRowAlt: { backgroundColor: Colors.surfaceVariant, marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 6 },
  nutritionLabel: { ...Typography.body, fontSize: 14 },
  nutritionValue: { ...Typography.label, fontSize: 14 },
  showMoreBtn: { marginTop: 8, alignItems: 'center' },
  showMoreText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },

  barcodeInfo: { marginHorizontal: 16, marginTop: 4, marginBottom: 8, alignItems: 'center', gap: 4 },
  barcodeText: { ...Typography.caption, textAlign: 'center' },
  barcodeLink: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingTop: 12, paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
    ...Shadow.lg,
  },
  scanAgainBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  scanAgainGradient: {
    paddingVertical: 15, alignItems: 'center',
  },
  scanAgainText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
