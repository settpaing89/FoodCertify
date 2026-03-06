// src/screens/HomeScreen.js
import { useRef, useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, StyleSheet, Animated, Easing,
  TouchableOpacity, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { RatingBadge } from '../components';
import { AnimatedCard } from '../components/AnimatedCard';
import { useConditions } from '../hooks/useStorage';
import { useHistoryContext } from '../context/HistoryContext';
import { usePremiumContext } from '../context/PremiumContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Good evening';
}

function calculateStreak(history) {
  if (!history.length) return 0;
  const dayKeys = new Set(
    history.map(h => {
      const d = new Date(h.scannedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dayKeys.has(key)) streak++;
    else break;
  }
  return streak;
}

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
  const { history } = useHistoryContext();
  const { isPremium, remaining } = usePremiumContext();

  const safeCount     = history.filter(h => h.safetyRating === 'SAFE').length;
  const safetyScore   = history.length > 0 ? Math.round((safeCount / history.length) * 100) : null;
  const recentScans   = history.slice(0, 5);
  const streak        = calculateStreak(history);
  const greeting      = getGreeting();
  const targetProgress = safetyScore ?? 0;

  const fillColor = safetyScore === null ? Colors.border
    : safetyScore >= 70 ? Colors.safe
    : safetyScore >= 40 ? Colors.caution
    : Colors.avoid;

  const progressMessage = safetyScore === null
    ? 'Scan your first product to see your score'
    : safetyScore >= 70 ? 'Great choices this week 💪'
    : safetyScore >= 40 ? 'Some items to watch — keep scanning'
    : "Let's improve your choices this week";

  const scanSubLabel = !isPremium
    ? (remaining > 0
        ? `${remaining} free scan${remaining !== 1 ? 's' : ''} remaining this week`
        : 'Weekly limit reached — upgrade to scan')
    : 'Premium · Unlimited scans';

  // ── State ────────────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState('Hey there');
  const [showContent, setShowContent] = useState(true);

  useFocusEffect(useCallback(() => {
    setShowContent(true);
    return () => setShowContent(false);
  }, []));

  // ── Animation refs ────────────────────────────────────────────────────────────
  const greetFade    = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('@foodsafe:userName').then(name => {
      if (name) setUserName(name);
    });
  }, []);

  useEffect(() => {
    Animated.timing(greetFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: targetProgress, duration: 900,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [targetProgress]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <Feather name="user" size={20} color={Colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.85}>
          <Feather name="bell" size={20} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      {showContent && <View style={styles.content}>
        {/* ── Greeting ── */}
        <Animated.View style={{ opacity: greetFade }}>
          <Text style={styles.greetingText}>{greeting}, {userName} 👋</Text>
        </Animated.View>

        {/* ── Streak Card ── */}
        <AnimatedCard delay={0} style={styles.heroCard}>
          <View style={styles.streakRow}>
            <Animated.View style={[styles.fireWrap, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.fireEmoji}>🔥</Text>
            </Animated.View>
            <View style={{ flex: 1 }}>
              {streak > 0 ? (
                <>
                  <Text style={styles.streakValue}>{streak} day streak</Text>
                  <Text style={styles.streakSub}>Keep checking your food!</Text>
                </>
              ) : (
                <Text style={styles.streakSub}>Start your streak — scan a product today!</Text>
              )}
            </View>
          </View>
        </AnimatedCard>

        {/* ── Safety Progress Card ── */}
        <AnimatedCard delay={80} style={styles.heroCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Weekly Safety Score</Text>
            <Text style={styles.progressValue}>
              {safetyScore !== null ? `${safetyScore}%` : '--'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: progressAnim.interpolate({
                inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp',
              }),
              backgroundColor: fillColor,
            }]} />
          </View>
          <Text style={styles.progressMessage}>{progressMessage}</Text>
        </AnimatedCard>

        {/* ── Scan Button ── */}
        <AnimatedCard delay={160}><TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.88}
        >
          <Feather name="camera" size={20} color={Colors.textInverse} />
          <Text style={styles.scanBtnText}>Scan Product</Text>
        </TouchableOpacity>
        <Text style={styles.scanSubLabel}>{scanSubLabel}</Text></AnimatedCard>

        {/* ── Stats Row ── */}
        <AnimatedCard delay={240}><View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Safe Items</Text>
            <Text style={styles.statValue}>{safeCount}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Safety Score</Text>
            <Text style={styles.statValue}>
              {safetyScore !== null ? `${safetyScore}%` : '--'}
            </Text>
          </View>
        </View></AnimatedCard>

        {/* ── Recent History ── */}
        <AnimatedCard delay={320}><View style={styles.recentSection}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentScans.length > 0 ? (
          <View style={styles.activityCard}>
            {recentScans.map((item, i) => (
              <View key={item.id || i}>
                <TouchableOpacity
                  style={styles.activityRow}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Result', {
                    product: {
                      name: item.productName,
                      brand: item.brand,
                      allergens:         item.savedProduct?.allergens,
                      ingredients:       item.savedProduct?.ingredients,
                      imageUrl:          item.savedProduct?.imageUrl,
                      imageThumbnailUrl: item.savedProduct?.imageThumbnailUrl,
                      nutriments:        item.savedProduct?.nutriments,
                      servingSize:       item.savedProduct?.servingSize,
                      quantity:          item.savedProduct?.quantity,
                    },
                    analysis: item.savedAnalysis || { rating: item.safetyRating },
                    barcode: item.barcode,
                    fromHistory: true,
                    isFromHistory: true,
                  })}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Feather name="shopping-bag" size={18} color={Colors.accent} />
                    </View>
                  )}
                  <View style={styles.activityInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.productTime}>{formatRelativeTime(item.scannedAt)}</Text>
                  </View>
                  <RatingBadge rating={item.safetyRating} size="sm" />
                </TouchableOpacity>
                {i < recentScans.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Feather name="package" size={32} color={Colors.onSurfaceMuted} />
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
                <Text style={styles.setupBannerText}>Set up your health conditions first</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        </View></AnimatedCard>
      </View>}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },

  // ── Greeting ─────────────────────────────────────────────────────────────────
  greetingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // ── Hero Cards ────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...SHADOW.md,
  },

  // Streak card
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fireWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fireEmoji: {
    fontSize: 28,
  },
  streakValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.accent,
    letterSpacing: -0.3,
  },
  streakSub: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Safety progress card
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.accent,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressMessage: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  scanBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  scanBtnText: {
    color: Colors.textInverse,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.2,
  },
  scanSubLabel: {
    fontSize: FONT_SIZE.xs,
    color: Colors.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Stats Row ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...SHADOW.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Recent Section wrapper (tighter internal gap) ─────────────────────────────
  recentSection: {
    gap: Spacing.sm,
  },

  // ── Section Header ────────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.accent,
  },

  // ── Activity Card (all rows in one surface) ───────────────────────────────────
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  productImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    gap: 3,
  },
  productName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  productTime: {
    fontSize: FONT_SIZE.xs,
    color: Colors.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },

  // ── Empty State ───────────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...SHADOW.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
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
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
});
