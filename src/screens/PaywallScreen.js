// src/screens/PaywallScreen.js
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { usePremiumContext } from '../context/PremiumContext';

// ─── Feature comparison rows ──────────────────────────────────────────────────
const ROWS = [
  { label: 'Barcode scans',         free: '20 / week',  premium: 'Unlimited'  },
  { label: 'Health conditions',     free: '2 max',      premium: 'All 5'      },
  { label: 'Dietary configuration', free: false,        premium: true         },
  { label: 'Scan history',          free: 'Last 15',    premium: 'Unlimited'  },
  { label: 'PDF export',            free: false,        premium: true         },
  { label: 'Education library',     free: true,         premium: true         },
  { label: 'Priority support',      free: false,        premium: true         },
];

function CellValue({ val, isPremiumCol }) {
  if (typeof val === 'boolean') {
    return (
      <Feather
        name={val ? 'check' : 'x'}
        size={16}
        color={val ? (isPremiumCol ? Colors.primary : Colors.safe) : Colors.onSurfaceMuted}
      />
    );
  }
  return (
    <Text style={[styles.cellText, isPremiumCol && styles.cellTextPremium]}>{val}</Text>
  );
}

export default function PaywallScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { purchasePremium, restorePurchases } = usePremiumContext();

  const handlePurchase = async () => {
    try {
      const success = await purchasePremium();
      if (success && navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      Alert.alert('Purchase Failed', e.message);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Compact Header ── */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={22} color={Colors.onSurfaceMuted} />
          </TouchableOpacity>
        )}
        <View style={styles.headerIcon}>
          <Feather name="award" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>FoodSafe Premium</Text>
        <Text style={styles.headerSub}>Everything you need to eat safe and smart</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={styles.content}>

          {/* ── Comparison Table ── */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={{ flex: 1 }} />
              <View style={styles.colFree}>
                <Text style={styles.colLabelFree}>FREE</Text>
              </View>
              <View style={styles.colPremium}>
                <Text style={styles.colLabelPremium}>PREMIUM</Text>
              </View>
            </View>

            {ROWS.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.colFree}>
                  <CellValue val={row.free} isPremiumCol={false} />
                </View>
                <View style={styles.colPremium}>
                  <CellValue val={row.premium} isPremiumCol />
                </View>
              </View>
            ))}
          </View>

          {/* ── Trial + Pricing ── */}
          <View style={styles.trialBadge}>
            <Feather name="gift" size={14} color={Colors.primary} />
            <Text style={styles.trialBadgeText}>7-day free trial included</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.price}>$3.49</Text>
            <Text style={styles.pricePer}> / month</Text>
          </View>
          <Text style={styles.priceNote}>After trial ends. Cancel anytime.</Text>

          {/* ── CTA ── */}
          <TouchableOpacity style={styles.ctaBtn} onPress={handlePurchase} activeOpacity={0.88}>
            <Text style={styles.ctaBtnText}>Start Free 7-Day Trial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreBtn} onPress={restorePurchases} activeOpacity={0.7}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          {/* ── Legal ── */}
          <Text style={styles.legal}>
            Your free trial lasts 7 days. After the trial, payment of $3.49/month will be
            charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account.
            Subscription renews automatically unless cancelled at least 24 hours before the
            end of the current period.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 6,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: FONT_SIZE.md,
    color: Colors.onSurfaceMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  content: { paddingHorizontal: Spacing.md, gap: Spacing.md },

  // Table
  table: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  colFree:    { width: 72, alignItems: 'center', justifyContent: 'center' },
  colPremium: { width: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySurface },
  colLabelFree:    { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: Colors.onSurfaceMuted, letterSpacing: 0.8 },
  colLabelPremium: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: Colors.primary, letterSpacing: 0.8 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
  },
  tableRowAlt:      { backgroundColor: Colors.outlineVariant },
  rowLabel:         { flex: 1, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: Colors.onSurface },
  cellText:         { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: Colors.onSurfaceMuted, textAlign: 'center' },
  cellTextPremium:  { color: Colors.primary, fontWeight: FONT_WEIGHT.bold },

  // Trial badge
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  trialBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.primary,
  },

  // Pricing
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: -4,
  },
  price:     { fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.bold, color: Colors.onSurface, letterSpacing: -1 },
  pricePer:  { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.semibold, color: Colors.onSurfaceMuted },
  priceNote: { textAlign: 'center', fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: -8 },

  // Buttons
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 20,
    alignItems: 'center',
    ...SHADOW.md,
  },
  ctaBtnText: { color: '#fff', fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, letterSpacing: 0.2 },
  restoreBtn: { alignItems: 'center', paddingVertical: 4 },
  restoreText: { fontSize: FONT_SIZE.md, color: Colors.onSurfaceMuted, fontWeight: FONT_WEIGHT.medium },

  // Legal
  legal: {
    fontSize: FONT_SIZE.xs,
    color: Colors.onSurfaceMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
    marginTop: 4,
  },
});
