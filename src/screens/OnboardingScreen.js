// src/screens/OnboardingScreen.js
import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { useConditions } from '../hooks/useStorage';
import { CONDITIONS } from '../engine/analyzer';

const { width, height } = Dimensions.get('window');
const TOTAL_STEPS = 3;

// ─── Progress bar (slides 1 & 2) ─────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <View style={pb.row}>
      <Text style={pb.label}>Onboarding Progress</Text>
      <Text style={pb.count}>{step} of {TOTAL_STEPS}</Text>
    </View>
  );
}

function ProgressTrack({ step }) {
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
    </View>
  );
}

const pb = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },
  count: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  track: { height: 6, backgroundColor: Colors.outline, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.lg },
  fill:  { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
});

// ─── Main Component ───────────────────────────────────────────────────────────
// completeOnboarding is passed from RootNavigator so both share the same state
export default function OnboardingScreen({ completeOnboarding }) {
  const insets = useSafeAreaInsets();
  const { setConditions } = useConditions();

  const [step, setStep] = useState(0);
  const [selectedConditions, setSelectedConditions] = useState([]);

  // Name, email, password for sign-up slide
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);

  const skip = async () => {
    if (selectedConditions.length > 0) await setConditions(selectedConditions);
    await completeOnboarding();
  };

  const goNext = async () => {
    if (step === 1) {
      // Save conditions before moving to sign-up
      if (selectedConditions.length > 0) await setConditions(selectedConditions);
    }
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => s - 1);

  const finish = async () => {
    if (selectedConditions.length > 0) await setConditions(selectedConditions);
    await completeOnboarding();
  };

  const toggleCondition = (id) => {
    setSelectedConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // ── Slide 0: Welcome ──────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={[styles.slide, { paddingBottom: insets.bottom }]}>
        {/* Skip */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.topBarBtn} onPress={skip}>
            <Feather name="x" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>FoodSafe</Text>
          <TouchableOpacity style={styles.topBarSkip} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero image */}
        <LinearGradient colors={['#1C2B1C', '#2A3D2A', '#1a301a']} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji1}>🥦</Text>
            <Text style={styles.heroEmoji2}>🍅</Text>
            <Text style={styles.heroEmoji3}>🥑</Text>
            <Text style={styles.heroEmoji4}>🌽</Text>
            <Text style={styles.heroEmoji5}>🥕</Text>
            <Text style={styles.heroEmoji6}>🥗</Text>
          </View>
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.heroFade}
          />
        </LinearGradient>

        {/* Content */}
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Eat with Confidence</Text>
          <Text style={styles.welcomeSubtitle}>
            Your personal companion for food safety, nutrition tracking, and healthy eating habits.
          </Text>

          {/* Dots */}
          <View style={styles.dots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInRow} onPress={skip}>
            <Text style={styles.signInLabel}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Slide 1: Choose Conditions ────────────────────────────────────────────
  if (step === 1) {
    return (
      <View style={[styles.slide, { paddingTop: insets.top }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarBtn} onPress={goBack}>
            <Feather name="chevron-left" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>FoodSafe</Text>
          <TouchableOpacity style={styles.topBarSkip} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.conditionsContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <ProgressBar step={2} />
          <ProgressTrack step={2} />

          <Text style={styles.slideTitle}>Choose Your Filters</Text>
          <Text style={styles.slideSubtitle}>
            Select any dietary requirements or allergies we should watch out for.
          </Text>

          {/* 2-column grid */}
          <View style={styles.conditionsGrid}>
            {CONDITIONS.map(cond => {
              const active = selectedConditions.includes(cond.id);
              return (
                <TouchableOpacity
                  key={cond.id}
                  style={[styles.condCard, active && styles.condCardActive]}
                  onPress={() => toggleCondition(cond.id)}
                  activeOpacity={0.8}
                >
                  {active && (
                    <View style={styles.condCheck}>
                      <Feather name="check-circle" size={18} color={Colors.primary} />
                    </View>
                  )}
                  <View style={[styles.condIconBg, active && styles.condIconBgActive]}>
                    <Text style={styles.condIcon}>{cond.icon}</Text>
                  </View>
                  <Text style={[styles.condLabel, active && styles.condLabelActive]}>
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.updateNote}>You can update these anytime in settings.</Text>
        </ScrollView>

        {/* Fixed bottom button */}
        <View style={[styles.bottomFixed, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Slide 2: Create Account ───────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.slide, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={goBack}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Create Your Account</Text>
        <TouchableOpacity style={styles.topBarSkip} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.signUpContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar step={3} />
        <ProgressTrack step={3} />

        <Text style={styles.slideTitle}>Join FoodSafe</Text>
        <Text style={styles.slideSubtitle}>
          Enter your details to start your food safety journey.
        </Text>

        {/* Form */}
        <View style={styles.formBlock}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={16} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.onSurfaceMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={16} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={Colors.onSurfaceMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={16} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor={Colors.onSurfaceMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Feather name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.onSurfaceMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <TouchableOpacity style={styles.socialBtnGoogle} onPress={finish} activeOpacity={0.85}>
          <Text style={styles.socialIcon}>🌐</Text>
          <Text style={styles.socialBtnTextDark}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtnApple} onPress={finish} activeOpacity={0.85}>
          <Feather name="smartphone" size={18} color="#fff" />
          <Text style={styles.socialBtnTextLight}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <TouchableOpacity style={styles.primaryBtn} onPress={finish} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  topBarBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  topBarSkip: { paddingHorizontal: 4, paddingVertical: 8 },
  skipText: { fontSize: 14, fontWeight: '600', color: Colors.onSurfaceMuted },

  // ── Slide 0 ──
  hero: {
    width: '100%',
    height: height * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    position: 'relative',
  },
  heroEmoji1: { position: 'absolute', fontSize: 64, top: 20,  left: 20  },
  heroEmoji2: { position: 'absolute', fontSize: 56, top: 60,  right: 30 },
  heroEmoji3: { position: 'absolute', fontSize: 60, top: 120, left: 80  },
  heroEmoji4: { position: 'absolute', fontSize: 52, bottom: 60, left: 30  },
  heroEmoji5: { position: 'absolute', fontSize: 58, top: 30,  right: 100 },
  heroEmoji6: { position: 'absolute', fontSize: 64, bottom: 40, right: 40 },
  heroFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
  },

  welcomeContent: {
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
  welcomeTitle: {
    fontSize: 28, fontWeight: '800', color: Colors.onSurface,
    letterSpacing: -0.5, marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22, marginBottom: Spacing.lg,
  },
  dots: {
    flexDirection: 'row', gap: 8, marginBottom: Spacing.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.outline,
  },
  dotActive: {
    width: 24, backgroundColor: Colors.primary, borderRadius: 4,
  },

  // ── Slide 1 ──
  conditionsContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  slideTitle: {
    fontSize: 26, fontWeight: '800', color: Colors.onSurface,
    letterSpacing: -0.3, marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20, marginBottom: Spacing.lg,
  },

  conditionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4,
  },
  condCard: {
    width: (width - Spacing.md * 2 - 12) / 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 10,
    ...Shadow.sm,
    position: 'relative',
  },
  condCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  condCheck: {
    position: 'absolute', top: 10, right: 10,
  },
  condIconBg: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  condIconBgActive: {
    backgroundColor: Colors.primarySurface,
  },
  condIcon: { fontSize: 26 },
  condLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.onSurface, textAlign: 'center',
  },
  condLabelActive: { color: Colors.primary },

  updateNote: {
    textAlign: 'center', fontSize: 12, color: Colors.onSurfaceMuted,
    fontWeight: '500', marginTop: Spacing.lg,
  },

  bottomFixed: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
  },

  // ── Slide 2 ──
  signUpContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },

  formBlock: { gap: 12 },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.onSurface, marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  inputIcon: {},
  input: {
    flex: 1, fontSize: 15, color: Colors.onSurface, padding: 0,
  },
  eyeBtn: { padding: 2 },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.outline },
  dividerText: {
    fontSize: 11, fontWeight: '700', color: Colors.onSurfaceMuted, letterSpacing: 0.5,
  },

  socialBtnGoogle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    ...Shadow.sm,
  },
  socialIcon: { fontSize: 18 },
  socialBtnTextDark: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },

  socialBtnApple: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: '#111',
    borderRadius: Radius.lg,
    paddingVertical: 15,
  },
  socialBtnTextLight: { fontSize: 15, fontWeight: '700', color: '#fff' },

  termsText: {
    textAlign: 'center', fontSize: 12, color: Colors.onSurfaceMuted, lineHeight: 18,
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },

  // Shared
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
    ...Shadow.md,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  signInRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.md,
  },
  signInLabel: { fontSize: 14, color: Colors.onSurfaceVariant },
  signInLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
