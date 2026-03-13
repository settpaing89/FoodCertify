// src/screens/NutritionReferencesScreen.js
import { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { PRESET_REFERENCES } from '../utils/scoringConstants';

export default function NutritionReferencesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const presetId = route?.params?.presetId;
  const scrollRef = useRef(null);
  const sectionYRef = useRef({});

  useEffect(() => {
    if (!presetId) return;
    const timer = setTimeout(() => {
      const y = sectionYRef.current[presetId];
      if (y !== undefined && scrollRef.current) {
        scrollRef.current.scrollTo({ y, animated: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [presetId]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Science</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {PRESET_REFERENCES.map(preset => (
          <View
            key={preset.presetId}
            onLayout={e => { sectionYRef.current[preset.presetId] = e.nativeEvent.layout.y; }}
          >
            {/* ── Section card: rationale + key limits ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.rationale}>{preset.rationale}</Text>

              <View style={styles.divider} />

              <Text style={styles.subLabel}>PER SERVING TARGETS</Text>
              {preset.keyLimits.map((limit, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{limit}</Text>
                </View>
              ))}
            </View>

            {/* ── References card ── */}
            <View style={styles.refsCard}>
              <Text style={styles.subLabel}>SCIENTIFIC REFERENCES</Text>
              {preset.references.map((ref, i) => (
                <View key={i}>
                  <View style={styles.refItem}>
                    <Text style={styles.refTitle}>{ref.title}</Text>
                    <Text style={styles.refMeta}>{ref.journal} · {ref.year}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(ref.url)} activeOpacity={0.7}>
                      <Text style={styles.refLink}>View source →</Text>
                    </TouchableOpacity>
                  </View>
                  {i < preset.references.length - 1 && <View style={styles.refDivider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Feather name="alert-triangle" size={16} color={Colors.caution} style={{ marginTop: 1 }} />
          <Text style={styles.disclaimerText}>
            These presets are based on general population dietary guidelines. They are not medical advice. Always consult a healthcare provider before making significant dietary changes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },

  // ── Section card ─────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 8,
    ...SHADOW.sm,
    marginBottom: Spacing.sm,
  },
  presetName: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.displayBold,
    color: Colors.textPrimary,
  },
  rationale: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  subLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: FONT_SIZE.sm,
    color: Colors.accent,
    fontFamily: FONTS.bodySemibold,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  // ── References card ───────────────────────────────────────────────────────────
  refsCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 12,
    marginBottom: Spacing.md,
  },
  refItem: {
    gap: 4,
    paddingVertical: 4,
  },
  refTitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  refMeta: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
  },
  refLink: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodyMedium,
    color: Colors.accent,
    marginTop: 2,
  },
  refDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },

  // ── Disclaimer ────────────────────────────────────────────────────────────────
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.cautionBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.body,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
