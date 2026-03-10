// src/screens/HistoryScreen.js
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity,
  Image, Alert, TextInput, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Spacing } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useHistoryContext } from '../context/HistoryContext';
import { usePremiumContext } from '../context/PremiumContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { DietListPickerModal } from '../components/DietListPickerModal';
import { RatingBadge } from '../components';

const FREE_HISTORY_LIMIT = 15;

// ─── Status badge with colored dot ───────────────────────────────────────────
const STATUS_CFG = {
  SAFE:    { dot: Colors.safe,    text: 'SAFE PRODUCT',       bg: Colors.safeBg,    color: Colors.safeText    },
  CAUTION: { dot: Colors.caution, text: 'CONTAINS ALLERGENS', bg: Colors.cautionBg, color: Colors.cautionText },
  AVOID:   { dot: Colors.avoid,   text: 'HIGH RISK',          bg: Colors.avoidBg,   color: Colors.avoidText   },
};

function StatusBadge({ rating }) {
  const cfg = STATUS_CFG[rating] || { dot: Colors.outline, text: 'UNKNOWN', bg: Colors.surfaceVariant, color: Colors.onSurfaceMuted };
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.text}</Text>
    </View>
  );
}

// ─── Time formatter ───────────────────────────────────────────────────────────
function formatItemTime(dateStr) {
  const date = new Date(dateStr);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

// ─── Date section key ─────────────────────────────────────────────────────────
function dateGroupKey(dateStr) {
  const date = new Date(dateStr);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (date.toDateString() === today) return 'TODAY';
  if (date.toDateString() === yesterday) return 'YESTERDAY';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
}

// ─── Filter config ────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Safe', 'Warning', 'Unsafe'];
const RATING_MAP = { Safe: 'SAFE', Warning: 'CAUTION', Unsafe: 'AVOID' };

// ─── Staggered row wrapper ────────────────────────────────────────────────────
function AnimatedRow({ index, children }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const rowDelay   = Math.min(index, 7) * 60;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 350, delay: rowDelay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: rowDelay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory, removeEntry, isLoading } = useHistoryContext();
  const { isPremium } = usePremiumContext();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dietListUpgradeVisible, setDietListUpgradeVisible] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useFocusEffect(useCallback(() => {
    setShowContent(true);
    return () => setShowContent(false);
  }, []));

  // Free users: cap at 15 items
  const cappedHistory = isPremium ? history : history.slice(0, FREE_HISTORY_LIMIT);
  const hasMore = !isPremium && history.length > FREE_HISTORY_LIMIT;

  // Filter + search (on capped history)
  const filtered = useMemo(() => {
    let result = [...cappedHistory];
    if (activeFilter !== 'All') {
      result = result.filter(h => h.safetyRating === RATING_MAP[activeFilter]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(h =>
        (h.productName || '').toLowerCase().includes(q) ||
        (h.brand || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [history, activeFilter, search]);

  // Group into sections
  const sections = useMemo(() => {
    const map = {};
    filtered.forEach(item => {
      const key = dateGroupKey(item.scannedAt);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const handleClear = () => {
    Alert.alert('Clear History', 'Delete all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const handleLongPress = (item) => {
    Alert.alert('Remove Item', `Remove "${item.productName}" from history?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeEntry(item.id) },
    ]);
  };

  if (isLoading) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Scan History</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleClear}>
          <Feather name="trash-2" size={18} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.onSurfaceMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recent scans..."
          placeholderTextColor={Colors.onSurfaceMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={Colors.onSurfaceMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter pills ── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, activeFilter === f && styles.filterPillTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {showContent && <SectionList
        sections={sections}
        keyExtractor={(item, i) => item.id || String(i)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionLabel}>{title}</Text>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item, index }) => (
          <AnimatedRow index={index}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Result', {
              product: {
                name: item.productName,
                brand: item.brand,
                allergens:          item.savedProduct?.allergens,
                ingredients:        item.savedProduct?.ingredients,
                imageUrl:           item.savedProduct?.imageUrl,
                imageThumbnailUrl:  item.savedProduct?.imageThumbnailUrl,
                nutriments:         item.savedProduct?.nutriments,
                servingSize:        item.savedProduct?.servingSize,
                quantity:           item.savedProduct?.quantity,
              },
              analysis: item.savedAnalysis || { rating: item.safetyRating },
              barcode: item.barcode,
              fromHistory: true,
              isFromHistory: true,
            })}
            onLongPress={() => handleLongPress(item)}
          >
            {/* Image */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Feather name="shopping-bag" size={20} color={Colors.onSurfaceMuted} />
              </View>
            )}

            {/* Name + date */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.productName || 'Unknown Product'}
              </Text>
              <Text style={styles.cardTime}>{formatItemTime(item.scannedAt)}</Text>
            </View>

            {/* Badge + bookmark */}
            <View style={styles.cardRight}>
              <RatingBadge rating={item.safetyRating} size="sm" />
              <TouchableOpacity
                style={styles.cardAddBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => {
                  if (!isPremium) {
                    setDietListUpgradeVisible(true);
                    return;
                  }
                  setSelectedProduct({
                    barcode: item.barcode,
                    productName: item.productName,
                    brand: item.brand,
                    rating: item.safetyRating,
                    imageUrl: item.imageUrl,
                  });
                  setPickerVisible(true);
                }}
              >
                <Feather name="bookmark" size={15} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </AnimatedRow>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Feather name="package" size={32} color={Colors.onSurfaceMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {search || activeFilter !== 'All' ? 'No results found' : 'No scans yet'}
            </Text>
            <Text style={styles.emptyBody}>
              {search || activeFilter !== 'All'
                ? 'Try a different search or filter.'
                : 'Scan your first product barcode to see your history here.'}
            </Text>
            {!search && activeFilter === 'All' && (
              <TouchableOpacity
                style={styles.scanNowBtn}
                onPress={() => navigation.navigate('Scanner')}
              >
                <Feather name="maximize-2" size={16} color={Colors.textInverse} />
                <Text style={styles.scanNowText}>Scan Now</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />}

      {/* ── Free tier history gate ── */}
      {hasMore && (
        <View style={styles.historyGate} pointerEvents="box-none">
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.historyGradient}
            pointerEvents="none"
          />
          <View style={styles.historyGateCard}>
            <View style={styles.historyGateIconWrap}>
              <Feather name="clock" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.historyGateTitle}>
              {history.length - FREE_HISTORY_LIMIT} more scans hidden
            </Text>
            <Text style={styles.historyGateSub}>Upgrade to access your full scan history</Text>
            <TouchableOpacity
              style={styles.historyGateBtn}
              onPress={() => setUpgradeVisible(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.historyGateBtnText}>Unlock Full History</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <UpgradeModal
        feature="history"
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onUpgrade={() => setUpgradeVisible(false)}
      />

      <DietListPickerModal
        visible={pickerVisible}
        onClose={() => { setPickerVisible(false); setSelectedProduct(null); }}
        product={selectedProduct}
      />
      <UpgradeModal
        feature="dietlist"
        visible={dietListUpgradeVisible}
        onClose={() => setDietListUpgradeVisible(false)}
        onUpgrade={() => setDietListUpgradeVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },

  // ── Search ───────────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: Colors.onSurface,
    padding: 0,
  },

  // ── Filter pills ──────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterPillText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.textInverse,
  },

  // ── Section label ─────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...SHADOW.sm,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
  },
  cardTime: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  cardAddBtn: {
    padding: 2,
  },

  // ── Status badge ──────────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 0.4,
  },

  // ── History gate ──────────────────────────────────────────────────────────────
  historyGate: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 280,
    justifyContent: 'flex-end',
  },
  historyGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
  },
  historyGateCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...SHADOW.lg,
  },
  historyGateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyGateTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  historyGateSub: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  historyGateBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    height: 52,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  historyGateBtnText: {
    color: Colors.textInverse,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...Typography.h2, textAlign: 'center', color: Colors.textPrimary },
  emptyBody: { ...Typography.body, textAlign: 'center', maxWidth: 260 },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    height: 52,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  scanNowText: {
    color: Colors.textInverse,
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZE.md,
  },
});
