// src/screens/NotificationsScreen.js
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';

const NOTIFICATION_GROUPS = [
  {
    label: 'SCANNING',
    items: [
      { id: 'scan_results',  icon: 'maximize-2', title: 'Scan Results',    subtitle: 'Get notified after each product scan'     },
      { id: 'high_risk',     icon: 'alert-circle',title: 'High Risk Alerts', subtitle: 'Immediate alerts for unsafe products'    },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      { id: 'weekly_report', icon: 'bar-chart-2', title: 'Weekly Report',   subtitle: 'Summary of your weekly scan activity'    },
      { id: 'tips',          icon: 'star',        title: 'Tips & Insights', subtitle: 'Personalized food safety tips'            },
    ],
  },
  {
    label: 'ALERTS',
    items: [
      { id: 'recalls',       icon: 'package',    title: 'Product Recalls',  subtitle: 'Alerts for recalled products you scanned' },
      { id: 'new_products',  icon: 'tag',        title: 'New in Database',  subtitle: 'When new products matching your diet are added' },
    ],
  },
];

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [master, setMaster] = useState(true);
  const [toggles, setToggles] = useState({
    scan_results:  true,
    high_risk:     true,
    weekly_report: false,
    tips:          true,
    recalls:       true,
    new_products:  false,
  });

  const handleToggle = (id) => {
    if (!master) return;
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notifications</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconBg}>
              <Feather name="bell" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.masterTitle}>Push Notifications</Text>
              <Text style={styles.masterSubtitle}>Enable all notifications</Text>
            </View>
          </View>
          <Switch
            value={master}
            onValueChange={setMaster}
            trackColor={{ false: Colors.outline, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Notification groups */}
        {NOTIFICATION_GROUPS.map(group => (
          <View key={group.label}>
            <Text style={styles.sectionLabel}>{group.label}</Text>
            <View style={[styles.sectionCard, !master && styles.disabledCard]}>
              {group.items.map((item, idx) => (
                <View key={item.id}>
                  <View style={styles.row}>
                    <View style={styles.rowIcon}>
                      <Feather name={item.icon} size={16} color={master ? Colors.primary : Colors.onSurfaceMuted} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={[styles.rowTitle, !master && styles.disabledText]}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Switch
                      value={master && toggles[item.id]}
                      onValueChange={() => handleToggle(item.id)}
                      trackColor={{ false: Colors.outline, true: Colors.primaryLight }}
                      thumbColor="#fff"
                      disabled={!master}
                    />
                  </View>
                  {idx < group.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}
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
  topBarTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },

  masterCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.md,
  },
  masterLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  masterIconBg: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  masterTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  masterSubtitle: { fontSize: 12, color: Colors.onSurfaceMuted, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4, marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...Shadow.md, overflow: 'hidden',
  },
  disabledCard: { opacity: 0.55 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  rowSubtitle: { fontSize: 12, color: Colors.onSurfaceMuted, marginTop: 2 },
  disabledText: { color: Colors.onSurfaceMuted },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },
});
