// src/screens/ProfileScreen.js
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useConditions } from '../hooks/useStorage';
import { AnimatedCard } from '../components/AnimatedCard';
import { useHistoryContext } from '../context/HistoryContext';
import { useAppContext } from '../navigation';
import { usePremiumContext } from '../context/PremiumContext';


// ─── Reusable row inside a settings section ───────────────────────────────────
function SettingsRow({ icon, label, value, onPress, last }) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.rowIcon}>
          <Feather name={icon} size={18} color={Colors.accent} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress && <Feather name="chevron-right" size={16} color={Colors.onSurfaceMuted} />}
      </TouchableOpacity>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions } = useConditions();
  const { history } = useHistoryContext();
  const { resetOnboarding } = useAppContext();
  const { isPremium, hasBeenPremium, remaining, restorePurchases } = usePremiumContext();

  const activeConditionCount = conditions.length;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: resetOnboarding },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Feather name="user" size={34} color={Colors.textInverse} />
        </View>

        {/* Name + PRO badge */}
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>Vett User</Text>
          {isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{activeConditionCount}</Text>
            <Text style={styles.statLabel}>Conditions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {history.length > 0
                ? `${Math.round((history.filter(h => h.safetyRating === 'SAFE').length / history.length) * 100)}%`
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Safe Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>

        {/* ── Subscription Status Card ── */}
        <AnimatedCard delay={0}>
        {isPremium ? (
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardLeft}>
              <View style={styles.premiumIconWrap}>
                <Feather name="award" size={22} color={Colors.heroAccent} />
              </View>
              <View>
                <Text style={styles.premiumTitle}>Premium Member</Text>
                <Text style={styles.premiumSub}>All features unlocked</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
              <Text style={styles.manageLink}>Manage</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.freeCard}>
            <View style={styles.freeCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.freePlanTitle}>Free Plan</Text>
                <Text style={styles.freePlanSub}>
                  {remaining > 0 ? `${remaining} scans left this week` : 'Weekly scan limit reached'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.88}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </AnimatedCard>

        {/* ── Account Settings ── */}
        <AnimatedCard delay={80}><Section label="ACCOUNT SETTINGS">
          <SettingsRow
            icon="user"
            label="Personal Information"
            onPress={() => navigation.navigate('PersonalInformation')}
          />
          <SettingsRow
            icon="sliders"
            label="Dietary Preferences"
            value={activeConditionCount > 0 ? `${activeConditionCount} active` : undefined}
            onPress={() => navigation.navigate('DietaryPreferences')}
            last
          />
        </Section></AnimatedCard>

        {/* ── Preferences ── */}
        <AnimatedCard delay={160}><Section label="PREFERENCES">
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsRow
            icon="globe"
            label="Language"
            value="English"
            onPress={() => navigation.navigate('Language')}
            last
          />
        </Section></AnimatedCard>

        {/* ── Learn ── */}
        <AnimatedCard delay={220}><Section label="LEARN">
          <SettingsRow
            icon="bar-chart-2"
            label="How We Score Products"
            onPress={() => navigation.navigate('ScoringExplainer', { source: 'result' })}
          />
          <SettingsRow
            icon="book-open"
            label="Nutrition Science & References"
            onPress={() => navigation.navigate('NutritionReferences')}
          />
          <SettingsRow
            icon="file-text"
            label="Nutrition Guides"
            onPress={() => navigation.navigate('NutritionGuide')}
            last
          />
        </Section></AnimatedCard>

        {/* ── Security & Support ── */}
        <AnimatedCard delay={320}><Section label="SECURITY & SUPPORT">
          <SettingsRow
            icon="shield"
            label="Privacy & Security"
            onPress={() => navigation.navigate('PrivacySecurity')}
          />
          <SettingsRow
            icon="help-circle"
            label="Help Center"
            onPress={() => navigation.navigate('HelpCenter')}
          />
          <SettingsRow
            icon="info"
            label="About Vett"
            onPress={() => navigation.navigate('AboutVett')}
            last={!(hasBeenPremium && !isPremium)}
          />
          {hasBeenPremium && !isPremium && (
            <SettingsRow
              icon="refresh-cw"
              label="Renew Membership"
              onPress={restorePurchases}
              last
            />
          )}
        </Section></AnimatedCard>

        {/* ── Sign Out ── */}
        <AnimatedCard delay={400}>
        <TouchableOpacity style={styles.signOutCard} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* ── Version ── */}
        <Text style={styles.version}>VERSION 1.0.0</Text>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    fontFamily: FONTS.bodyMedium,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  nameText: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: {
    color: Colors.textInverse,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 1,
  },

  // ── Quick stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    width: '100%',
    ...SHADOW.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.bodySemibold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },

  // ── Content ────────────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },

  // ── Premium card ──────────────────────────────────────────────────────────────
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.hero,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...SHADOW.md,
  },
  premiumCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bodySemibold, color: Colors.heroText },
  premiumSub:   { fontSize: FONT_SIZE.sm, color: Colors.heroSubtext, marginTop: 2 },
  manageLink:   { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.heroAccent, textDecorationLine: 'underline' },

  // ── Free card ─────────────────────────────────────────────────────────────────
  freeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW.sm,
  },
  freeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  freePlanTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary },
  freePlanSub:   { fontSize: FONT_SIZE.sm, color: Colors.textSecondary, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    flexShrink: 0,
  },
  upgradeBtnText: { color: Colors.textInverse, fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold },

  // ── Section block ─────────────────────────────────────────────────────────────
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...SHADOW.sm,
    overflow: 'hidden',
  },

  // ── Row ────────────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    color: Colors.textSecondary,
    fontFamily: FONTS.bodyMedium,
    marginRight: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 64,
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────────
  signOutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  signOutText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.avoid,
  },

  // ── Version ───────────────────────────────────────────────────────────────────
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingVertical: Spacing.md,
  },

});
