// src/screens/NotificationsScreen.js
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [master, setMaster] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notifications</Text>
        <View style={styles.topBarBtn} />
      </View>

      <View style={{ padding: Spacing.md }}>
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconBg}>
              <Feather name="bell" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.masterTitle}>Enable Notifications</Text>
              <Text style={styles.masterSubtitle}>Receive alerts from Vett</Text>
            </View>
          </View>
          <Switch
            value={master}
            onValueChange={setMaster}
            trackColor={{ false: Colors.outline, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
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

  masterCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...SHADOW.md,
  },
  masterLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  masterIconBg: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  masterTitle: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bodySemibold, color: Colors.onSurface },
  masterSubtitle: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
});
