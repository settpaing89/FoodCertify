// src/screens/PersonalInformationScreen.js
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

const INFO_KEY = '@foodsafe:personalInfo';
const GENDER_OPTIONS = ['Prefer not to say', 'Male', 'Female', 'Non-binary'];

export default function PersonalInformationScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [dob,     setDob]     = useState('');
  const [gender,  setGender]  = useState('Prefer not to say');
  const [genderOpen, setGenderOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(INFO_KEY).then(raw => {
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name)   setName(d.name);
      if (d.email)  setEmail(d.email);
      if (d.phone)  setPhone(d.phone);
      if (d.dob)    setDob(d.dob);
      if (d.gender) setGender(d.gender);
    });
  }, []);

  const handleSave = async () => {
    await AsyncStorage.setItem(INFO_KEY, JSON.stringify({ name, email, phone, dob, gender }));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Personal Information</Text>
        <TouchableOpacity style={styles.topBarBtn} onPress={handleSave}>
          <Text style={styles.saveBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      {showSaved && (
        <View style={styles.savedBanner}>
          <Feather name="check-circle" size={15} color={Colors.accent} />
          <Text style={styles.savedBannerText}>Changes saved</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Feather name="user" size={36} color="#fff" />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>BASIC INFO</Text>
          <InputField
            icon="user"
            label="Display Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <Divider />
          <InputField
            icon="mail"
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Divider />
          <InputField
            icon="phone"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 000 000 0000"
            keyboardType="phone-pad"
          />
        </View>

        {/* Personal Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>
          <InputField
            icon="calendar"
            label="Date of Birth"
            value={dob}
            onChangeText={setDob}
            placeholder="MM / DD / YYYY"
            keyboardType="numbers-and-punctuation"
          />
          <Divider />
          {/* Gender picker */}
          <TouchableOpacity
            style={styles.rowField}
            onPress={() => setGenderOpen(o => !o)}
          >
            <View style={styles.rowFieldIcon}>
              <Feather name="users" size={16} color={Colors.primary} />
            </View>
            <View style={styles.rowFieldBody}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <Text style={styles.fieldValue}>{gender}</Text>
            </View>
            <Feather
              name={genderOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.onSurfaceMuted}
            />
          </TouchableOpacity>
          {genderOpen && (
            <View style={styles.genderOptions}>
              {GENDER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.genderOption}
                  onPress={() => { setGender(opt); setGenderOpen(false); }}
                >
                  <Text style={[styles.genderOptionText, opt === gender && styles.genderOptionActive]}>
                    {opt}
                  </Text>
                  {opt === gender && (
                    <Feather name="check" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveCard} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveCardText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InputField({ icon, label, value, onChangeText, placeholder, keyboardType, autoCapitalize }) {
  return (
    <View style={styles.rowField}>
      <View style={styles.rowFieldIcon}>
        <Feather name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={styles.rowFieldBody}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.onSurfaceMuted}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'words'}
        />
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  topBarBtn: { width: 44, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  saveBtn: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.primary },

  avatarSection: { alignItems: 'center', paddingVertical: Spacing.md, gap: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  changePhotoBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary,
  },
  changePhotoText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.primary },

  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...SHADOW.md, overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, letterSpacing: 1, color: Colors.onSurfaceMuted,
    paddingHorizontal: Spacing.md, paddingTop: 14, paddingBottom: 8,
  },

  rowField: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 14,
  },
  rowFieldIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  rowFieldBody: { flex: 1 },
  fieldLabel: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.bodySemibold, color: Colors.onSurfaceMuted, marginBottom: 3 },
  fieldInput: { fontSize: FONT_SIZE.md, color: Colors.onSurface, padding: 0 },
  fieldValue: { fontSize: FONT_SIZE.md, color: Colors.onSurface, fontFamily: FONTS.bodyMedium },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 60 },

  genderOptions: { backgroundColor: Colors.surfaceVariant, borderTopWidth: 1, borderTopColor: Colors.outline },
  genderOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant,
  },
  genderOptionText: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodyMedium, color: Colors.onSurfaceVariant },
  genderOptionActive: { color: Colors.primary, fontFamily: FONTS.bodySemibold },

  savedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.accentLight, paddingVertical: 10,
  },
  savedBannerText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.bodySemibold, color: Colors.accent },

  saveCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center', ...SHADOW.md,
  },
  saveCardText: { color: Colors.textInverse, fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold },
});
