// src/screens/DietaryPreferencesScreen.js
// Health condition toggle cards — extracted from original ProfileScreen.
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useConditions } from '../hooks/useStorage';
import { CONDITIONS } from '../engine/analyzer';
import { usePremiumContext } from '../context/PremiumContext';
import { UpgradeModal } from '../components/UpgradeModal';

const FREE_CONDITION_LIMIT = 2;

export default function DietaryPreferencesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { conditions, toggleCondition } = useConditions();
  const { isPremium } = usePremiumContext();
  const [upgradeVisible, setUpgradeVisible] = useState(false);

  const handleToggle = async (cid) => {
    const isActive = conditions.includes(cid);
    // Gate: free users can only have 2 conditions enabled
    if (!isActive && !isPremium && conditions.length >= FREE_CONDITION_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
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
          Vett checks every scanned product against your active conditions.
        </Text>

        {!isPremium && (
          <View style={styles.freeBanner}>
            <Feather name="lock" size={14} color={Colors.cautionText} />
            <Text style={styles.freeBannerText}>
              Free plan: up to {FREE_CONDITION_LIMIT} conditions. Upgrade for all 5.
            </Text>
          </View>
        )}

        {CONDITIONS.map((cond, idx) => {
          const active = conditions.includes(cond.id);
          const isLocked = !isPremium && !active && conditions.length >= FREE_CONDITION_LIMIT;
          return (
            <TouchableOpacity
              key={cond.id}
              onPress={() => handleToggle(cond.id)}
              activeOpacity={0.85}
              style={[
                styles.conditionCard,
                active && { borderColor: cond.color, backgroundColor: cond.bg },
                isLocked && styles.conditionCardLocked,
              ]}
            >
              <View style={styles.conditionLeft}>
                <View style={[
                  styles.conditionIconBg,
                  { backgroundColor: active ? cond.color : Colors.outlineVariant },
                ]}>
                  <MaterialCommunityIcons
                    name={cond.icon}
                    size={20}
                    color={active ? Colors.textInverse : Colors.onSurfaceMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.conditionName, active && { color: cond.color }]}>
                    {cond.label}
                  </Text>
                  <Text style={styles.conditionStatus}>
                    {isLocked ? 'Premium only' : active ? 'Active — scanning for issues' : 'Tap to enable'}
                  </Text>
                </View>
              </View>
              {isLocked ? (
                <Feather name="lock" size={18} color={Colors.onSurfaceMuted} />
              ) : (
                <Switch
                  value={active}
                  onValueChange={() => handleToggle(cond.id)}
                  trackColor={{ false: Colors.outline, true: cond.color }}
                  thumbColor={active ? '#fff' : '#f4f3f4'}
                />
              )}
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

      <UpgradeModal
        feature="conditions"
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onUpgrade={() => setUpgradeVisible(false)}
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
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.onSurface,
  },

  subtitle: {
    ...Typography.body,
    marginBottom: 4,
  },

  // Free banner
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cautionBg,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cautionBorder,
  },
  freeBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.cautionText,
    lineHeight: 18,
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
    ...SHADOW.sm,
  },
  conditionCardLocked: {
    opacity: 0.6,
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
  // conditionIcon no longer used (replaced by Feather in conditionIconBg)
  conditionName: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
    color: Colors.onSurface,
  },
  conditionStatus: {
    fontSize: FONT_SIZE.sm,
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
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.safeText,
    lineHeight: 19,
  },
});
