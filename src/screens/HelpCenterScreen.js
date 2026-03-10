// src/screens/HelpCenterScreen.js
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

const FAQS = [
  {
    q: 'How does FoodSafe analyze products?',
    a: 'FoodSafe fetches product data from the Open Food Facts database using the barcode you scan. Our engine then cross-checks the ingredient list against 60+ flagged ingredients across your selected health conditions and returns a SAFE, CAUTION, or UNSAFE verdict.',
  },
  {
    q: 'Why was my product not found?',
    a: 'Open Food Facts has 3M+ products but some regional or niche items may be missing. You can use the Manual Entry feature to type in the ingredient list directly and still get a full analysis.',
  },
  {
    q: 'How do I add a health condition?',
    a: 'Go to Profile → Dietary Preferences. Tap any condition card to toggle it on or off. FoodSafe immediately applies your active conditions to all future scans.',
  },
  {
    q: 'Is my scan history stored in the cloud?',
    a: 'No. All scan history is stored locally on your device using AsyncStorage. Your data never leaves your phone unless you choose to export it in Privacy & Security settings.',
  },
  {
    q: 'What does the Safety Score mean?',
    a: 'The Safety Score on your Home dashboard shows the percentage of products you have scanned that came back as SAFE. A score of 100% means every product you scanned was safe for your conditions.',
  },
  {
    q: 'Can I scan without selecting a health condition?',
    a: 'Yes. Without any condition selected FoodSafe will still show you the product\'s full ingredient list and Nutri-Score, but it won\'t flag any specific ingredients. We recommend setting at least one condition for the best experience.',
  },
  {
    q: 'How accurate is the ingredient analysis?',
    a: 'Our analysis is based on the ingredient data provided by Open Food Facts contributors and our curated ingredient database. Always consult a medical professional for serious dietary or allergy decisions.',
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <Text style={styles.faqQuestion}>{item.q}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.onSurfaceMuted} />
      </TouchableOpacity>
      {open && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </View>
  );
}

export default function HelpCenterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : FAQS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help Center</Text>
        <View style={styles.topBarBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.onSurfaceMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor={Colors.onSurfaceMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={Colors.onSurfaceMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ section */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <View key={idx}>
                <FAQItem item={item} />
                {idx < filtered.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No questions match "{search}"</Text>
            </View>
          )}
        </View>

        {/* Contact support */}
        <Text style={styles.sectionLabel}>STILL NEED HELP?</Text>
        <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.85}
          onPress={() => Linking.openURL('mailto:support@foodsafe.app')}
        >
          <View style={styles.contactIcon}>
            <Feather name="mail" size={22} color={Colors.primary} />
          </View>
          <View style={styles.contactBody}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSubtitle}>support@foodsafe.app · replies within 24h</Text>
          </View>
          <Feather name="external-link" size={16} color={Colors.onSurfaceMuted} />
        </TouchableOpacity>
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

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    marginHorizontal: Spacing.md, marginBottom: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    gap: 10, ...SHADOW.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZE.md, color: Colors.onSurface, padding: 0 },

  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1,
    color: Colors.onSurfaceMuted, paddingHorizontal: 4,
  },

  faqCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...SHADOW.md, overflow: 'hidden',
  },
  faqItem: { paddingHorizontal: Spacing.md, paddingVertical: 14 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQuestion: { flex: 1, fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  faqAnswer: {
    marginTop: 10, fontSize: FONT_SIZE.sm, color: Colors.onSurfaceVariant,
    lineHeight: 20, paddingRight: 28,
  },

  divider: { height: 1, backgroundColor: Colors.outlineVariant },

  noResults: { padding: Spacing.lg, alignItems: 'center' },
  noResultsText: { fontSize: FONT_SIZE.md, color: Colors.onSurfaceMuted, fontFamily: FONTS.bodyMedium },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...SHADOW.md,
  },
  contactIcon: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  contactBody: { flex: 1 },
  contactTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  contactSubtitle: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
});
