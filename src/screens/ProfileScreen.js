// src/screens/ProfileScreen.js
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { useConditions, useHistory } from '../hooks/useStorage';
import { useAppContext } from '../navigation';

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
          <Feather name={icon} size={18} color={Colors.primary} />
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
  const { history } = useHistory();
  const { resetOnboarding } = useAppContext();

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
          <Feather name="user" size={34} color="#fff" />
        </View>

        {/* Name + PRO badge */}
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>FoodSafe User</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
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
                ? `${Math.round((history.filter(h => h.rating === 'SAFE').length / history.length) * 100)}%`
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Safe Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Account Settings ── */}
        <Section label="ACCOUNT SETTINGS">
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
        </Section>

        {/* ── Preferences ── */}
        <Section label="PREFERENCES">
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsRow
            icon="grid"
            label="Units"
            value="Metric"
            onPress={() => navigation.navigate('Units')}
            last
          />
        </Section>

        {/* ── Security & Support ── */}
        <Section label="SECURITY & SUPPORT">
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
            label="About FoodSafe"
            onPress={() => navigation.navigate('AboutFoodSafe')}
            last
          />
        </Section>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutCard} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* ── Version ── */}
        <Text style={styles.version}>VERSION 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 13,
    color: Colors.onSurfaceMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  nameText: {
    ...Typography.h1,
    color: Colors.primary,
  },
  proBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Quick stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    width: '100%',
    ...Shadow.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceMuted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.outline,
  },

  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },

  // Section block
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.onSurfaceMuted,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.md,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: 14,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  rowValue: {
    fontSize: 13,
    color: Colors.onSurfaceMuted,
    fontWeight: '500',
    marginRight: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginLeft: 60,
  },

  // Sign Out
  signOutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
    marginTop: Spacing.sm,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.avoid,
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onSurfaceMuted,
    paddingVertical: Spacing.md,
  },
});
