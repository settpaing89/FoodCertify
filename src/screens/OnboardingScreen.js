// src/screens/OnboardingScreen.js
import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useConditions } from '../hooks/useStorage';
import { CONDITIONS } from '../engine/analyzer';

const { width, height } = Dimensions.get('window');
const TOTAL_STEPS = 3;

// ─── Progress pills ───────────────────────────────────────────────────────────
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
  label: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.textSecondary },
  count: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.accent },
  track: { height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.lg },
  fill:  { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },
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
          <Text style={styles.topBarTitle}>Vett</Text>
          <TouchableOpacity style={styles.topBarSkip} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero image */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary, Colors.primaryDark]} style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={[styles.heroIcon, styles.heroEmoji1]}><MaterialCommunityIcons name="food-apple"    size={42} color="rgba(255,255,255,0.55)" /></View>
            <View style={[styles.heroIcon, styles.heroEmoji2]}><MaterialCommunityIcons name="leaf"          size={34} color="rgba(255,255,255,0.45)" /></View>
            <View style={[styles.heroIcon, styles.heroEmoji3]}><MaterialCommunityIcons name="shield-check"  size={38} color="rgba(255,255,255,0.50)" /></View>
            <View style={[styles.heroIcon, styles.heroEmoji4]}><MaterialCommunityIcons name="heart-pulse"   size={32} color="rgba(255,255,255,0.45)" /></View>
            <View style={[styles.heroIcon, styles.heroEmoji5]}><MaterialCommunityIcons name="barcode-scan"  size={36} color="rgba(255,255,255,0.40)" /></View>
            <View style={[styles.heroIcon, styles.heroEmoji6]}><MaterialCommunityIcons name="check-circle"  size={38} color="rgba(255,255,255,0.50)" /></View>
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
          <Text style={styles.topBarTitle}>Vett</Text>
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
                      <Feather name="check-circle" size={18} color={Colors.accent} />
                    </View>
                  )}
                  <View style={[styles.condIconBg, active && styles.condIconBgActive]}>
                    <MaterialCommunityIcons
                      name={cond.icon}
                      size={26}
                      color={active ? Colors.accent : Colors.heroText}
                    />
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

        <Text style={styles.slideTitle}>Join Vett</Text>
        <Text style={styles.slideSubtitle}>
          Enter your details to start your food safety journey.
        </Text>

        {/* Form */}
        <View style={styles.formBlock}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={16} color={Colors.accent} style={styles.inputIcon} />
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
            <Feather name="mail" size={16} color={Colors.accent} style={styles.inputIcon} />
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
            <Feather name="lock" size={16} color={Colors.accent} style={styles.inputIcon} />
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
          <Feather name="globe" size={18} color={Colors.textPrimary} />
          <Text style={styles.socialBtnTextDark}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtnApple} onPress={finish} activeOpacity={0.85}>
          <Feather name="smartphone" size={18} color={Colors.textInverse} />
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

  // ── Top bar ───────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  topBarBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary },
  topBarSkip: { paddingHorizontal: 4, paddingVertical: 8 },
  skipText: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.textSecondary },

  // ── Slide 0 ───────────────────────────────────────────────────────────────────
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
  heroIcon:   { position: 'absolute' },
  heroEmoji1: { top: 20,  left: 20  },
  heroEmoji2: { top: 60,  right: 30 },
  heroEmoji3: { top: 120, left: 80  },
  heroEmoji4: { bottom: 60, left: 30  },
  heroEmoji5: { top: 30,  right: 100 },
  heroEmoji6: { bottom: 40, right: 40 },
  heroFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
  },

  welcomeContent: {
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, color: Colors.textPrimary,
    letterSpacing: -0.5, marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZE.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg,
  },
  dots: {
    flexDirection: 'row', gap: 8, marginBottom: Spacing.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24, backgroundColor: Colors.accent, borderRadius: Radius.full,
  },

  // ── Slide 1 ───────────────────────────────────────────────────────────────────
  conditionsContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  slideTitle: {
    fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, color: Colors.textPrimary,
    letterSpacing: -0.3, marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: FONT_SIZE.md, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg,
  },

  conditionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4,
  },
  condCard: {
    width: (width - Spacing.md * 2 - 12) / 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 10,
    ...SHADOW.sm,
    position: 'relative',
  },
  condCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  condCheck: {
    position: 'absolute', top: 10, right: 10,
  },
  condIconBg: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.hero,
    alignItems: 'center', justifyContent: 'center',
  },
  condIconBgActive: {
    backgroundColor: Colors.accentLight,
  },
  condLabel: {
    fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary, textAlign: 'center',
  },
  condLabelActive: { color: Colors.accent },

  updateNote: {
    textAlign: 'center', fontSize: FONT_SIZE.sm, color: Colors.textSecondary,
    fontFamily: FONTS.bodyMedium, marginTop: Spacing.lg,
  },

  bottomFixed: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },

  // ── Slide 2 ───────────────────────────────────────────────────────────────────
  signUpContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },

  formBlock: { gap: 12 },
  fieldLabel: {
    fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary, marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW.sm,
  },
  inputIcon: {},
  input: {
    flex: 1, fontSize: FONT_SIZE.md, color: Colors.textPrimary, padding: 0,
  },
  eyeBtn: { padding: 2 },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, color: Colors.textSecondary, letterSpacing: 0.5,
  },

  socialBtnGoogle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...SHADOW.sm,
  },
  socialBtnTextDark: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.textPrimary },

  socialBtnApple: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
  },
  socialBtnTextLight: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.textInverse },

  termsText: {
    textAlign: 'center', fontSize: FONT_SIZE.sm, color: Colors.textSecondary, lineHeight: 18,
  },
  termsLink: { color: Colors.accent, fontFamily: FONTS.bodySemibold },

  // ── Shared ────────────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  primaryBtnText: { color: Colors.textInverse, fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, letterSpacing: 0.2 },

  signInRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.md,
  },
  signInLabel: { fontSize: FONT_SIZE.md, color: Colors.textSecondary },
  signInLink: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.accent },
});
