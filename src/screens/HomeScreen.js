// src/screens/HomeScreen.js
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { RatingBadge } from '../components';
import { useConditions, useHistory } from '../hooks/useStorage';
import { usePremiumContext } from '../context/PremiumContext';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions } = useConditions();
  const { history } = useHistory();
  const { isPremium, remaining } = usePremiumContext();

  const safeCount    = history.filter(h => h.rating === 'SAFE').length;
  const safetyScore  = history.length > 0 ? Math.round((safeCount / history.length) * 100) : null;
  const recentScans  = history.slice(0, 5);

  const statusHeading =
    safetyScore === null || safetyScore >= 80 ? "You're Safe Today"
    : safetyScore >= 50 ? "Stay Cautious"
    : "Check Your Products";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header row ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <Feather name="user" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.85}>
          <Feather name="bell" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* ── Status Section ── */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>CURRENT STATUS</Text>
          <Text style={styles.statusHeading}>{statusHeading}</Text>
        </View>

        {/* ── Scan Button ── */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.88}
        >
          <Feather name="maximize" size={24} color="#fff" />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.scanBtnText}>Scan Product</Text>
            {!isPremium && (
              <Text style={styles.scanBtnSub}>
                {remaining > 0
                  ? `${remaining} scan${remaining !== 1 ? 's' : ''} left this week`
                  : 'Weekly limit reached — upgrade to scan'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="check-circle" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{safeCount}</Text>
            <Text style={styles.statLabel}>Safe items</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="droplet" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {safetyScore !== null ? `${safetyScore}%` : '--'}
            </Text>
            <Text style={styles.statLabel}>Safety Score</Text>
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>VIEW LOGS</Text>
          </TouchableOpacity>
        </View>

        {recentScans.length > 0 ? (
          recentScans.map((item, i) => (
            <TouchableOpacity
              key={item.id || i}
              style={styles.activityItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Result', {
                product: { name: item.productName, brand: item.brand },
                analysis: { rating: item.rating },
                barcode: item.barcode,
                fromHistory: true,
              })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={{ fontSize: 26 }}>🥫</Text>
                </View>
              )}

              <View style={styles.activityInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.productTime}>{formatRelativeTime(item.scannedAt)}</Text>
              </View>

              <RatingBadge rating={item.rating} size="sm" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Feather name="package" size={36} color={Colors.onSurfaceMuted} />
            </View>
            <Text style={styles.emptyTitle}>Ready to scan!</Text>
            <Text style={styles.emptyBody}>
              Scan a product barcode to check if it's safe for your health conditions.
            </Text>
            {conditions.length === 0 && (
              <TouchableOpacity
                style={styles.setupBanner}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.setupBannerText}>⚠️ Set up your health conditions first</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  avatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F4845F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },

  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },

  // ── Status ──────────────────────────────────────────────────────────────────
  statusSection: {
    gap: 8,
    marginTop: Spacing.md,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: Colors.primary,
  },
  statusHeading: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.onSurface,
    lineHeight: 46,
  },

  // ── Scan Button ─────────────────────────────────────────────────────────────
  scanBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    ...Shadow.md,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scanBtnSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // ── Stats ────────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    gap: 8,
    ...Shadow.md,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceMuted,
  },

  // ── Section Header ────────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.onSurfaceMuted,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Activity Item ─────────────────────────────────────────────────────────────
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 18,
    gap: Spacing.md,
    ...Shadow.md,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceVariant,
  },
  productImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    gap: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 22,
  },
  productTime: {
    fontSize: 13,
    color: Colors.onSurfaceMuted,
    fontWeight: '500',
  },

  // ── Empty State ───────────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.md,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...Typography.h2, textAlign: 'center' },
  emptyBody: { ...Typography.body, textAlign: 'center' },
  setupBanner: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.cautionBg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cautionBorder,
  },
  setupBannerText: {
    color: Colors.cautionText,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
