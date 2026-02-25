// src/screens/ManualEntryScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { PrimaryButton } from '../components';
import { analyzeIngredients } from '../engine/analyzer';
import { useConditions } from '../hooks/useStorage';

const EXAMPLES = [
  {
    name: 'White Bread',
    text: 'Enriched Wheat Flour (Wheat Flour, Niacin, Reduced Iron, Thiamine Mononitrate, Riboflavin, Folic Acid), Water, High Fructose Corn Syrup, Yeast, Soybean Oil, Salt, Wheat Gluten, Calcium Sulfate, Vinegar, Monoglycerides, Datem, Enzymes.',
  },
  {
    name: 'Peanut Butter Cookies',
    text: 'Enriched Flour (Flour, Niacin, Ferrous Sulfate, Thiamin Mononitrate, Riboflavin, Folic Acid), Butter, Peanut Butter (Ground Peanuts, Sugar, Partially Hydrogenated Vegetable Oil, Salt), Sugar, Egg, Vanilla, Baking Soda, Salt.',
  },
  {
    name: 'Plant-Based Burger',
    text: 'Water, Pea Protein, Expeller-Pressed Canola Oil, Refined Coconut Oil, Rice Starch, Natural Flavors, Methylcellulose, Potassium Chloride, Calcium Alginate, Salt, Yeast Extract, Sunflower Oil.',
  },
];

export default function ManualEntryScreen({ navigation }) {
  const [text, setText] = useState('');
  const [productName, setProductName] = useState('');
  const insets = useSafeAreaInsets();
  const { conditions } = useConditions();

  const canAnalyze = text.trim().length > 10 && conditions.length > 0;

  const handleAnalyze = () => {
    const analysis = analyzeIngredients(text, conditions);
    navigation.navigate('Result', {
      product: {
        name: productName || 'Manual Entry',
        brand: '',
        ingredients: text,
        imageUrl: null,
        nutriments: {},
        allergens: [],
      },
      analysis,
      barcode: 'manual',
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manual Entry</Text>
          <Text style={styles.subtitle}>Paste or type the ingredient list from the product label</Text>
        </View>

        <View style={styles.content}>
          {/* Product name (optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>Product Name (optional)</Text>
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="e.g. Chewy Granola Bars"
              style={styles.nameInput}
              returnKeyType="next"
              placeholderTextColor={Colors.onSurfaceMuted}
            />
          </View>

          {/* Ingredient text */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Ingredients * <Text style={styles.labelNote}>{text.length} chars</Text>
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={8}
              placeholder="E.g. Enriched wheat flour, water, sugar, yeast, salt, soybean oil, whey, eggs, natural flavors…"
              style={styles.textArea}
              textAlignVertical="top"
              placeholderTextColor={Colors.onSurfaceMuted}
            />
          </View>

          {conditions.length === 0 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ You haven't selected any health conditions. Go to Profile to set them up first.
              </Text>
            </View>
          )}

          {/* Quick examples */}
          <Text style={styles.examplesTitle}>Try an Example</Text>
          {EXAMPLES.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={styles.exampleCard}
              onPress={() => { setText(ex.text); setProductName(ex.name); }}
              activeOpacity={0.8}
            >
              <Text style={styles.exampleName}>{ex.name}</Text>
              <Text style={styles.examplePreview} numberOfLines={1}>
                {ex.text.substring(0, 60)}…
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sticky analyze button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={conditions.length === 0 ? 'Select conditions in Profile first' : 'Analyze Ingredients'}
          icon={canAnalyze ? '🔍' : undefined}
          onPress={handleAnalyze}
          disabled={!canAnalyze}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 20, paddingBottom: 24,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  backText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 20 },

  content: { padding: 16, gap: 16 },

  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  labelNote: { fontWeight: '400', color: Colors.onSurfaceMuted },

  nameInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.outline,
    padding: 14, fontSize: 15, color: Colors.onSurface,
  },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.outline,
    padding: 14, fontSize: 14, color: Colors.onSurface,
    minHeight: 160, lineHeight: 21,
  },

  warningBanner: {
    backgroundColor: Colors.cautionBg, borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.cautionBorder,
  },
  warningText: { color: Colors.caution, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  examplesTitle: { ...Typography.title, marginBottom: -4 },
  exampleCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1.5, borderColor: Colors.outlineVariant,
  },
  exampleName: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  examplePreview: { fontSize: 12, color: Colors.onSurfaceMuted, lineHeight: 18 },

  bottomBar: {
    backgroundColor: Colors.surface, paddingTop: 12,
    paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
  },
});
