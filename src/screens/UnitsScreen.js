// src/screens/UnitsScreen.js
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';

function RadioGroup({ label, options, selected, onSelect }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>
        {options.map((opt, idx) => (
          <View key={opt.value}>
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <View style={styles.radioRowLeft}>
                <View style={styles.radioIconBg}>
                  <Feather name={opt.icon} size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.radioTitle}>{opt.label}</Text>
                  {opt.subtitle && <Text style={styles.radioSubtitle}>{opt.subtitle}</Text>}
                </View>
              </View>
              <View style={[styles.radio, selected === opt.value && styles.radioActive]}>
                {selected === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
            {idx < options.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function UnitsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [measurement, setMeasurement] = useState('metric');
  const [energy,      setEnergy]      = useState('kcal');
  const [language,    setLanguage]    = useState('en');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Units & Language</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <RadioGroup
          label="MEASUREMENT SYSTEM"
          selected={measurement}
          onSelect={setMeasurement}
          options={[
            { value: 'metric',   icon: 'thermometer', label: 'Metric',   subtitle: 'kg, g, ml, cm — used globally'       },
            { value: 'imperial', icon: 'box',          label: 'Imperial', subtitle: 'lb, oz, fl oz, in — US & UK'         },
          ]}
        />

        <RadioGroup
          label="ENERGY DISPLAY"
          selected={energy}
          onSelect={setEnergy}
          options={[
            { value: 'kcal', icon: 'zap',     label: 'Kilocalories (kcal)', subtitle: 'Standard food energy unit'       },
            { value: 'kj',   icon: 'activity', label: 'Kilojoules (kJ)',     subtitle: 'Scientific energy unit'          },
          ]}
        />

        <RadioGroup
          label="LANGUAGE"
          selected={language}
          onSelect={setLanguage}
          options={[
            { value: 'en', icon: 'globe', label: 'English',  subtitle: 'en-US'  },
            { value: 'es', icon: 'globe', label: 'Español',  subtitle: 'es-ES'  },
            { value: 'fr', icon: 'globe', label: 'Français', subtitle: 'fr-FR'  },
            { value: 'de', icon: 'globe', label: 'Deutsch',  subtitle: 'de-DE'  },
          ]}
        />
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

  sectionBlock: { gap: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...Shadow.md, overflow: 'hidden',
  },

  radioRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  radioRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  radioIconBg: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  radioTitle: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  radioSubtitle: { fontSize: 12, color: Colors.onSurfaceMuted, marginTop: 2 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.outline,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },
});
