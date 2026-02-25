// src/screens/DietaryPreferencesScreen.js
// Health condition toggle cards — extracted from original ProfileScreen.
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { useConditions } from '../hooks/useStorage';
import { CONDITIONS } from '../engine/analyzer';

export default function DietaryPreferencesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions, toggleCondition } = useConditions();

  const handleToggle = async (cid) => {
    await Haptics.selectionAsync();
    toggleCondition(cid);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Dietary Preferences</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          FoodSafe checks every scanned product against your active conditions.
        </Text>

        {CONDITIONS.map(cond => {
          const active = conditions.includes(cond.id);
          return (
            <TouchableOpacity
              key={cond.id}
              onPress={() => handleToggle(cond.id)}
              activeOpacity={0.85}
              style={[
                styles.conditionCard,
                active && { borderColor: cond.color, backgroundColor: cond.bg },
              ]}
            >
              <View style={styles.conditionLeft}>
                <View style={[
                  styles.conditionIconBg,
                  { backgroundColor: active ? cond.color : Colors.outlineVariant },
                ]}>
                  <Text style={styles.conditionIcon}>{cond.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.conditionName, active && { color: cond.color }]}>
                    {cond.label}
                  </Text>
                  <Text style={styles.conditionStatus}>
                    {active ? 'Active — scanning for issues' : 'Tap to enable'}
                  </Text>
                </View>
              </View>
              <Switch
                value={active}
                onValueChange={() => handleToggle(cond.id)}
                trackColor={{ false: Colors.outline, true: cond.color }}
                thumbColor={active ? '#fff' : '#f4f3f4'}
              />
            </TouchableOpacity>
          );
        })}

        {/* Active summary */}
        {conditions.length > 0 && (
          <View style={styles.summaryCard}>
            <Feather name="check-circle" size={18} color={Colors.safe} />
            <Text style={styles.summaryText}>
              {conditions.length} condition{conditions.length !== 1 ? 's' : ''} active — products will be checked against all of them.
            </Text>
          </View>
        )}
      </ScrollView>
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
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },

  subtitle: {
    ...Typography.body,
    marginBottom: 4,
  },

  // Condition card — preserved from original design
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    ...Shadow.sm,
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  conditionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionIcon: { fontSize: 22 },
  conditionName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  conditionStatus: {
    fontSize: 12,
    color: Colors.onSurfaceMuted,
    marginTop: 2,
  },

  // Active summary
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.safeBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: 4,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.safeText,
    lineHeight: 19,
  },
});
