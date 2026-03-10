// src/screens/AboutFoodSafeScreen.js
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

function LinkRow({ icon, label, subtitle, onPress, last }) {
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <Feather name={icon} size={16} color={Colors.primary} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        <Feather name="external-link" size={14} color={Colors.onSurfaceMuted} />
      </TouchableOpacity>
      {!last && <View style={styles.divider} />}
    </>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );
}

export default function AboutFoodSafeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>About FoodSafe</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* App identity */}
        <View style={styles.identityCard}>
          <View style={styles.appIcon}>
            <MaterialCommunityIcons name="leaf" size={38} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>FoodSafe</Text>
          <Text style={styles.appTagline}>Know what you eat. Stay safe.</Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionPillText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* App info */}
        <View>
          <Text style={styles.sectionLabel}>APP INFO</Text>
          <View style={styles.sectionCard}>
            <InfoRow label="Version"        value="1.0.0"               />
            <InfoRow label="Build"          value="100"                  />
            <InfoRow label="Platform"       value="iOS & Android"        />
            <InfoRow label="Last Updated"   value="February 2026"       last />
          </View>
        </View>

        {/* Powered by */}
        <View>
          <Text style={styles.sectionLabel}>POWERED BY</Text>
          <View style={styles.poweredCard}>
            <View style={styles.poweredIcon}>
              <Feather name="database" size={22} color={Colors.primary} />
            </View>
            <View style={styles.poweredBody}>
              <Text style={styles.poweredTitle}>Open Food Facts</Text>
              <Text style={styles.poweredDesc}>
                The world's largest open food database — 3M+ products, contributed by people like you. Free, open, and transparent.
              </Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View>
          <Text style={styles.sectionLabel}>LEGAL & LINKS</Text>
          <View style={styles.sectionCard}>
            <LinkRow
              icon="file-text"
              label="Terms of Service"
              onPress={() => {}}
            />
            <LinkRow
              icon="shield"
              label="Privacy Policy"
              onPress={() => {}}
            />
            <LinkRow
              icon="star"
              label="Rate FoodSafe"
              subtitle="Enjoying the app? Leave us a review"
              onPress={() => {}}
            />
            <LinkRow
              icon="github"
              label="Open Source Licenses"
              onPress={() => {}}
              last
            />
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            FoodSafe was built to make food safety accessible to everyone. Whether you manage allergies, follow a special diet, or just want to know what's in your food — we believe that information should be instant, clear, and free.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={styles.footer}>Made with</Text>
          <MaterialCommunityIcons name="leaf" size={12} color={Colors.onSurfaceMuted} />
          <Text style={styles.footer}>FoodSafe © 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  topBarBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },

  // Identity
  identityCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    alignItems: 'center', padding: Spacing.xl, gap: 8, ...SHADOW.md,
  },
  appIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  appName: { ...Typography.h1, color: Colors.primary },
  appTagline: { fontSize: FONT_SIZE.md, color: Colors.onSurfaceVariant, fontFamily: FONTS.bodyMedium },
  versionPill: {
    backgroundColor: Colors.primarySurface, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 5, marginTop: 4,
  },
  versionPillText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.primary },

  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4, marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...SHADOW.md, overflow: 'hidden',
  },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  infoLabel: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodyMedium, color: Colors.onSurfaceVariant },
  infoValue: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  rowSubtitle: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },

  // Powered by
  poweredCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...SHADOW.md,
  },
  poweredIcon: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  poweredBody: { flex: 1 },
  poweredTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface, marginBottom: 6 },
  poweredDesc: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceVariant, lineHeight: 19 },

  // Mission
  missionCard: {
    backgroundColor: Colors.primarySurface, borderRadius: Radius.lg,
    padding: Spacing.md, gap: 8, borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  missionTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.primary },
  missionText: { fontSize: FONT_SIZE.sm, color: Colors.primary, lineHeight: 20, opacity: 0.85 },

  footer: {
    textAlign: 'center', fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted,
    fontFamily: FONTS.bodyMedium, paddingVertical: 4,
  },
});
