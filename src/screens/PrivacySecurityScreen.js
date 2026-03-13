// src/screens/PrivacySecurityScreen.js
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

function SettingsRow({ icon, label, subtitle, onPress, danger, last }) {
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
          <Feather name={icon} size={16} color={danger ? Colors.avoid : Colors.primary} />
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        <Feather name="chevron-right" size={16} color={Colors.onSurfaceMuted} />
      </TouchableOpacity>
      {!last && <View style={styles.divider} />}
    </>
  );
}

export default function PrivacySecurityScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all scan history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Privacy & Security</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy notice */}
        <View style={styles.noticeCard}>
          <Feather name="shield" size={20} color={Colors.primary} />
          <Text style={styles.noticeText}>
            Vett never sells your data. Your scan history stays on your device and is only used to power your personal safety analysis.
          </Text>
        </View>

        {/* Data */}
        <View>
          <Text style={styles.sectionLabel}>YOUR DATA</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="refresh-cw"
              label="Clear Scan History"
              subtitle="Remove all saved scan history from your device"
              onPress={() => Alert.alert('Clear History', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => {} },
              ])}
              last
            />
          </View>
        </View>

        {/* Legal */}
        <View>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="file-text"
              label="Terms of Service"
              onPress={() => {}}
            />
            <SettingsRow
              icon="shield"
              label="Privacy Policy"
              onPress={() => {}}
            />
            <SettingsRow
              icon="list"
              label="Cookie Preferences"
              onPress={() => {}}
              last
            />
          </View>
        </View>

        {/* Danger zone */}
        <View>
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="trash-2"
              label="Delete Account"
              subtitle="Permanently remove your account and all data"
              onPress={handleDeleteAccount}
              danger
              last
            />
          </View>
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

  noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.primarySurface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  noticeText: { flex: 1, fontSize: FONT_SIZE.sm, color: Colors.primary, fontFamily: FONTS.bodyMedium, lineHeight: 20 },

  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4, marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...SHADOW.md, overflow: 'hidden',
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: Colors.avoidBg },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  rowLabelDanger: { color: Colors.avoid },
  rowSubtitle: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },
});
