// src/screens/LanguageScreen.js
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

const LANG_KEY = '@foodsafe:language';
const LANGUAGES = [
  { value: 'en', label: 'English',  subtitle: 'en-US' },
  { value: 'fr', label: 'Français', subtitle: 'fr-FR' },
];

export default function LanguageScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(val => { if (val) setSelected(val); });
  }, []);

  const handleSelect = async (val) => {
    setSelected(val);
    await AsyncStorage.setItem(LANG_KEY, val);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Language</Text>
        <View style={styles.topBarBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>SELECT LANGUAGE</Text>
          <View style={styles.sectionCard}>
            {LANGUAGES.map((lang, idx) => (
              <View key={lang.value}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleSelect(lang.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBg}>
                      <Feather name="globe" size={16} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.rowTitle}>{lang.label}</Text>
                      <Text style={styles.rowSubtitle}>{lang.subtitle}</Text>
                    </View>
                  </View>
                  <View style={[styles.radio, selected === lang.value && styles.radioActive]}>
                    {selected === lang.value && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
                {idx < LANGUAGES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
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

  sectionBlock: { gap: 8 },
  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...SHADOW.md, overflow: 'hidden',
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBg: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  rowSubtitle: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.outline,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },
});
