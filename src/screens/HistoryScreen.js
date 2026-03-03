// src/screens/HistoryScreen.js
import { useState, useMemo } from 'react';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity,
  Image, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Spacing } from '../theme';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { useHistory } from '../hooks/useStorage';
import { usePremiumContext } from '../context/PremiumContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { DietListPickerModal } from '../components/DietListPickerModal';

const FREE_HISTORY_LIMIT = 15;

// ─── Status badge with colored dot ───────────────────────────────────────────
const STATUS_CFG = {
  SAFE:    { dot: Colors.safe,    text: 'SAFE PRODUCT',       bg: Colors.safeBg,    color: Colors.safeText    },
  CAUTION: { dot: Colors.caution, text: 'CONTAINS ALLERGENS', bg: Colors.cautionBg, color: Colors.cautionText },
  AVOID:   { dot: Colors.avoid,   text: 'HIGH RISK',          bg: Colors.avoidBg,   color: Colors.avoidText   },
};

function StatusBadge({ rating }) {
  const cfg = STATUS_CFG[rating] || { dot: '#ccc', text: 'UNKNOWN', bg: '#F3F4F6', color: '#6B7280' };
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

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory, removeItem } = useHistory();
  const { isPremium } = usePremiumContext();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dietListUpgradeVisible, setDietListUpgradeVisible] = useState(false);

  // Free users: cap at 15 items
  const cappedHistory = isPremium ? history : history.slice(0, FREE_HISTORY_LIMIT);
  const hasMore = !isPremium && history.length > FREE_HISTORY_LIMIT;

  // Filter + search (on capped history)
  const filtered = useMemo(() => {
    let result = [...cappedHistory];
    if (activeFilter !== 'All') {
      result = result.filter(h => h.rating === RATING_MAP[activeFilter]);
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
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scan History</Text>
        <TouchableOpacity style={styles.topBarBtn} onPress={handleClear}>
          <Feather name="trash-2" size={20} color={Colors.onSurface} />
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
      <SectionList
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Result', {
              product: { name: item.productName, brand: item.brand },
              analysis: { rating: item.rating },
              barcode: item.barcode,
              fromHistory: true,
            })}
            onLongPress={() => handleLongPress(item)}
          >
            {/* Image */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Feather name="shopping-bag" size={22} color={Colors.onSurfaceMuted} />
              </View>
            )}

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.productName || 'Unknown Product'}
              </Text>
              <StatusBadge rating={item.rating} />
            </View>

            {/* Time + add to list */}
            <View style={styles.cardRight}>
              <Text style={styles.cardTime}>{formatItemTime(item.scannedAt)}</Text>
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
                    rating: item.rating,
                    imageUrl: item.imageUrl,
                  });
                  setPickerVisible(true);
                }}
              >
                <Feather name="bookmark" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
                <Feather name="maximize-2" size={16} color="#fff" />
                <Text style={styles.scanNowText}>Scan Now</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* ── Free tier history blur overlay ── */}
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

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topBarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...Typography.h2,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 10,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: Colors.onSurface,
    padding: 0,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.onSurfaceVariant,
  },
  filterPillTextActive: {
    color: '#fff',
  },

  // Section label
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    color: Colors.onSurfaceMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...SHADOW.md,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
  },
  cardRight: {
    alignItems: 'center',
    gap: 8,
  },
  cardTime: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.onSurfaceMuted,
  },
  cardAddBtn: {
    padding: 2,
  },

  // Status badge (dot + label)
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
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.4,
  },

  // History gate overlay
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
    borderRadius: Radius.xl,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...SHADOW.lg,
  },
  historyGateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyGateTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  historyGateSub: {
    fontSize: FONT_SIZE.sm,
    color: Colors.onSurfaceMuted,
    textAlign: 'center',
  },
  historyGateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  historyGateBtnText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // Empty
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
    backgroundColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...Typography.h2, textAlign: 'center' },
  emptyBody: { ...Typography.body, textAlign: 'center', maxWidth: 260 },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    marginTop: Spacing.sm,
  },
  scanNowText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.md,
  },
});
