// src/components/UpgradeModal.js
import { useEffect, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  Animated, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadow } from '../theme';
import { usePremiumContext } from '../context/PremiumContext';

// ─── Per-feature config ───────────────────────────────────────────────────────
const FEATURE_CONFIG = {
  scanner:    { icon: 'camera',    headline: 'Unlock Unlimited Scans',       subtext: 'Scan unlimited products and never hit your weekly limit again.'        },
  conditions: { icon: 'heart',     headline: 'Unlock All Health Conditions', subtext: 'Track all 5 health conditions for complete protection on every scan.' },
  dietary:    { icon: 'sliders',   headline: 'Unlock Dietary Configuration', subtext: 'Set personal nutrient limits and build your perfect diet profile.'     },
  history:    { icon: 'clock',     headline: 'Unlock Full Scan History',     subtext: 'Access your complete scan archive and export it as a PDF report.'      },
  export:     { icon: 'file-text', headline: 'Unlock PDF Export',            subtext: 'Download your complete scan history as a formatted PDF report.'        },
};

const BENEFITS = [
  'Unlimited barcode scans every week',
  'All 5 health conditions tracked',
  'Full dietary config + history export',
];

// ─── Component ────────────────────────────────────────────────────────────────
export function UpgradeModal({ feature = 'scanner', visible, onClose, onUpgrade }) {
  const { purchasePremium, restorePurchases } = usePremiumContext();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const cfg = FEATURE_CONFIG[feature] ?? FEATURE_CONFIG.scanner;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handleUpgrade = async () => {
    try {
      const success = await purchasePremium();
      if (success) { onClose(); onUpgrade?.(); }
    } catch (e) {
      Alert.alert('Purchase Failed', e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Icon + copy */}
        <View style={styles.featureIconWrap}>
          <Feather name={cfg.icon} size={28} color={Colors.primary} />
        </View>
        <Text style={styles.headline}>{cfg.headline}</Text>
        <Text style={styles.subtext}>{cfg.subtext}</Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitCheck}>
                <Feather name="check" size={13} color="#fff" />
              </View>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Trial note */}
        <View style={styles.trialNote}>
          <Feather name="gift" size={13} color={Colors.primary} />
          <Text style={styles.trialNoteText}>7-day free trial, then $3.49/month</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleUpgrade} activeOpacity={0.88}>
          <Text style={styles.ctaBtnText}>Start Free 7-Day Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={restorePurchases} activeOpacity={0.7}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
    alignItems: 'center',
    ...Shadow.lg,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outline,
    marginBottom: 24,
  },
  featureIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 22, fontWeight: '800',
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14, color: Colors.onSurfaceMuted,
    textAlign: 'center', lineHeight: 20,
    marginBottom: 24,
  },
  benefits: { width: '100%', gap: 14, marginBottom: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitCheck: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: { fontSize: 15, fontWeight: '500', color: Colors.onSurface, flex: 1 },
  trialNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  trialNoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  restoreBtn: { paddingVertical: 8 },
  restoreText: { fontSize: 14, color: Colors.onSurfaceMuted, fontWeight: '500' },
});
