// src/screens/EducationScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Shadow, Typography } from '../theme';

const ARTICLES = [
  {
    id: '1',
    icon: '🩺', tag: 'Diabetes', tagColor: '#e53935', tagBg: '#fce4ec',
    title: 'Understanding Glycemic Index',
    summary: 'How different carbs affect your blood sugar and what to choose instead.',
    content: `The glycemic index (GI) measures how quickly foods raise blood glucose. Foods scoring 70+ are high-GI and cause rapid spikes.\n\nHigh fructose corn syrup (HFCS) has a GI of ~87 — nearly as high as pure glucose. Maltodextrin scores an alarming 185. These ingredients are common in processed foods and can be particularly harmful for people managing diabetes.\n\nLower-risk sweeteners: stevia (GI=0), erythritol (GI=0), monk fruit (GI=0).\n\nAlways check nutrition labels for total carbohydrates and added sugars per serving.`,
  },
  {
    id: '2',
    icon: '🌾', tag: 'Gluten', tagColor: '#f57c00', tagBg: '#fff3e0',
    title: 'Hidden Gluten Sources',
    summary: 'Gluten hides in unexpected places — from soy sauce to medications.',
    content: `Gluten is found in wheat, barley, rye, and often oats (due to cross-contamination).\n\nSurprising hidden sources:\n• Soy sauce (wheat-based)\n• Malt vinegar and malt extract\n• Some spice mixes and seasonings\n• Licorice candy\n• Some medications use wheat starch as filler\n• Beer (barley)\n• Seitan (literally wheat gluten)\n\nSafe alternatives: Tamari (gluten-free soy sauce), rice vinegar, certified GF oats.\n\nAlways look for the "Certified Gluten-Free" seal for guaranteed safety.`,
  },
  {
    id: '3',
    icon: '🥜', tag: 'Peanut Allergy', tagColor: '#6d4c41', tagBg: '#efebe9',
    title: 'Peanut Allergy Safety Guide',
    summary: 'Cross-contamination risks, label reading, and emergency response.',
    content: `Peanut allergy is one of the most common and severe food allergies, affecting ~1% of the population.\n\nHidden names for peanuts:\n• Groundnuts / groundnut oil\n• Arachis oil\n• Mixed nuts\n• Monkey nuts\n\nCross-contamination warnings to watch:\n• "May contain peanuts"\n• "Made in a facility with peanuts"\n• "Processed on shared equipment"\n\nEmergency response: If experiencing anaphylaxis — use epinephrine auto-injector (EpiPen), call 911 immediately, lie flat with legs elevated.\n\nAlways carry your prescribed epinephrine. Never rely on antihistamines alone for anaphylaxis.`,
  },
  {
    id: '4',
    icon: '🌿', tag: 'Vegan', tagColor: '#2e7d32', tagBg: '#e8f5e9',
    title: 'Non-Vegan Additives to Avoid',
    summary: 'E120, E441, L-Cysteine — the hidden animal ingredients in processed foods.',
    content: `Many processed foods contain hidden animal derivatives:\n\n• E120 (Carmine/Cochineal): Red dye from crushed insects. Found in some juices, yogurts, and candies.\n\n• E441 (Gelatin): Boiled animal bones/skin. Found in gummies, marshmallows, some yogurts.\n\n• E904 (Shellac): Insect secretion used as glazing on some candies and produce.\n\n• Whey/Casein: Milk proteins hidden in protein bars, bread, crackers.\n\n• L-Cysteine (E920): Usually from duck feathers/animal hair. Used as dough conditioner in bread.\n\n• Natural flavors: Can legally include animal-derived compounds. Contact manufacturers.\n\nLook for Vegan Society certification or "100% Plant-Based" claims.`,
  },
  {
    id: '5',
    icon: '🔬', tag: 'General', tagColor: '#1565c0', tagBg: '#e3f2fd',
    title: 'How to Read a Food Label',
    summary: 'Serving sizes, % Daily Value, and ingredient order — demystified.',
    content: `Ingredients are listed by weight, highest first. If sugar is the first ingredient, the product is mostly sugar.\n\nKey label elements:\n\n• Serving size: All nutrition data is per serving — check how many servings are in the package.\n\n• % Daily Value (%DV): 5% or less = low; 20% or more = high.\n\n• Added sugars: Separate from natural sugars. Look for "0g added sugars" for diabetic-friendly products.\n\n• Total carbohydrates: Includes fiber, which doesn't spike blood sugar like net carbs do.\n\n• Allergen statement: "Contains: wheat, milk, peanuts" — required by law in many countries.\n\n• "May contain" statements: Voluntary cross-contamination warnings — take seriously if severely allergic.`,
  },
];

export default function EducationScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>📚 Learn</Text>
        <Text style={styles.headerSub}>Health & nutrition education</Text>
      </LinearGradient>

      <View style={styles.content}>
        {ARTICLES.map(article => (
          <View key={article.id} style={styles.articleCard}>
            <View style={[styles.articleHeader, { backgroundColor: article.tagBg }]}>
              <View style={styles.articleHeaderLeft}>
                <Text style={styles.articleIcon}>{article.icon}</Text>
                <View>
                  <View style={[styles.tag, { backgroundColor: article.tagColor }]}>
                    <Text style={styles.tagText}>{article.tag}</Text>
                  </View>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                </View>
              </View>
            </View>

            <View style={styles.articleBody}>
              <Text style={styles.articleSummary}>{article.summary}</Text>

              {expanded === article.id && (
                <View style={styles.articleContent}>
                  <View style={styles.contentDivider} />
                  <Text style={styles.contentText}>{article.content}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.readBtn, { borderColor: article.tagColor }]}
                onPress={() => setExpanded(expanded === article.id ? null : article.id)}
              >
                <Text style={[styles.readBtnText, { color: article.tagColor }]}>
                  {expanded === article.id ? '▲ Read Less' : '▼ Read More'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            Content is for educational purposes only and does not constitute medical advice.
            Always consult your healthcare provider for medical decisions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

  content: { padding: 16, gap: 14 },

  articleCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    overflow: 'hidden', ...Shadow.md,
  },
  articleHeader: { padding: 16 },
  articleHeaderLeft: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  articleIcon: { fontSize: 36, marginTop: 2 },
  tag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  articleTitle: { fontSize: 17, fontWeight: '800', color: Colors.onSurface, lineHeight: 22 },

  articleBody: { padding: 16, gap: 12 },
  articleSummary: { ...Typography.body, fontSize: 14 },

  articleContent: { gap: 10 },
  contentDivider: { height: 1, backgroundColor: Colors.outlineVariant },
  contentText: { ...Typography.body, fontSize: 13, lineHeight: 21, whiteSpace: 'pre-wrap' },

  readBtn: {
    borderWidth: 1.5, borderRadius: Radius.full,
    paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  readBtnText: { fontSize: 13, fontWeight: '700' },

  attribution: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.lg, padding: 14,
  },
  attributionText: { ...Typography.caption, textAlign: 'center', lineHeight: 18 },
});
