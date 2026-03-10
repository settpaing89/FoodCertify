// src/navigation/index.js
import { createContext, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { usePremiumContext } from '../context/PremiumContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { useOnboarding } from '../hooks/useStorage';

export const AppContext = createContext({});
export const useAppContext = () => useContext(AppContext);

// Screens
import OnboardingScreen  from '../screens/OnboardingScreen';
import HomeScreen        from '../screens/HomeScreen';
import ScannerScreen     from '../screens/ScannerScreen';
import ResultScreen      from '../screens/ResultScreen';
import HistoryScreen     from '../screens/HistoryScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import ManualEntryScreen          from '../screens/ManualEntryScreen';
import ExploreScreen               from '../screens/ExploreScreen';
import EducationScreen             from '../screens/EducationScreen';
import DietaryPreferencesScreen    from '../screens/DietaryPreferencesScreen';
import PersonalInformationScreen   from '../screens/PersonalInformationScreen';
import NotificationsScreen         from '../screens/NotificationsScreen';
import UnitsScreen                 from '../screens/UnitsScreen';
import LanguageScreen              from '../screens/LanguageScreen';
import PrivacySecurityScreen       from '../screens/PrivacySecurityScreen';
import HelpCenterScreen            from '../screens/HelpCenterScreen';
import AboutFoodSafeScreen         from '../screens/AboutFoodSafeScreen';
import PaywallScreen               from '../screens/PaywallScreen';
import DietListDetailScreen        from '../screens/DietListDetailScreen';
import ScoringExplainerScreen      from '../screens/ScoringExplainerScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// 5 visual tabs — Scan (center) is a floating FAB, not a real screen
const TABS = [
  { name: 'Home',    label: 'Home',    icon: 'home'      },
  { name: 'History', label: 'History', icon: 'file-text' },
  { name: 'Scan',    label: 'Scan',    icon: 'camera'    },
  { name: 'Explore', label: 'Explore', icon: 'compass'   },
  { name: 'Profile', label: 'Profile', icon: 'user'      },
];

// ─── Scan FAB with sonar ripple ───────────────────────────────────────────────
function ScanFab({ onPress, showBadge, remaining }) {
  const breathe = useRef(new Animated.Value(1)).current;
  const sonar   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathe on the button itself
    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.07,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Sonar ring: expands outward and fades (radar ping)
    const sonarAnim = Animated.loop(
      Animated.timing(sonar, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    breatheAnim.start();
    sonarAnim.start();
    return () => {
      breatheAnim.stop();
      sonarAnim.stop();
    };
  }, [breathe, sonar]);

  const sonarScale   = sonar.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const sonarOpacity = sonar.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.45, 0] });

  return (
    <View style={styles.fabContainer}>
      {/* Sonar ring */}
      <Animated.View
        style={[
          styles.sonarRing,
          { transform: [{ scale: sonarScale }], opacity: sonarOpacity },
        ]}
      />
      {/* Button */}
      <Animated.View style={{ transform: [{ scale: breathe }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={styles.fabButton}
        >
          <Feather name="camera" size={24} color="#FFFFFF" />
          {showBadge && (
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{remaining}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation, insets }) {
  const { isPremium, remaining } = usePremiumContext();
  const showScanBadge = !isPremium && remaining <= 5 && remaining > 0;

  // Real tab screens in navigator order (excludes Scan)
  const realTabs = TABS.filter(t => t.name !== 'Scan').map(t => t.name);

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        if (tab.name === 'Scan') {
          return (
            <View key="Scan" style={styles.tabItem}>
              <ScanFab
                onPress={() => navigation.navigate('Scanner')}
                showBadge={showScanBadge}
                remaining={remaining}
              />
            </View>
          );
        }

        const isFocused = state.index === realTabs.indexOf(tab.name);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <View style={styles.tabIconWrap}>
              <Feather
                name={tab.icon}
                size={22}
                color={isFocused ? Colors.accent : Colors.onSurfaceMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={styles.tabActiveDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} insets={insets} />}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
export default function RootNavigator() {
  const { hasOnboarded, completeOnboarding, resetOnboarding } = useOnboarding();

  if (hasOnboarded === null) return null;

  return (
    <AppContext.Provider value={{ completeOnboarding, resetOnboarding }}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} completeOnboarding={completeOnboarding} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="ManualEntry"
              component={ManualEntryScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Search"
              component={ManualEntryScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Education"
              component={EducationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="DietaryPreferences"
              component={DietaryPreferencesScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="PersonalInformation"
              component={PersonalInformationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Units"
              component={UnitsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="PrivacySecurity"
              component={PrivacySecurityScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="HelpCenter"
              component={HelpCenterScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="AboutFoodSafe"
              component={AboutFoodSafeScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="DietListDetail"
              component={DietListDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="ScoringExplainer"
              component={ScoringExplainerScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    overflow: 'visible',   // lets the FAB float above
    ...SHADOW.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodySemibold,
    color: Colors.onSurfaceMuted,
  },
  tabLabelActive: {
    color: Colors.accent,
    fontFamily: FONTS.bodySemibold,
  },
  tabActiveDot: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Floating Scan FAB ────────────────────────────────────────────────────────
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  fabButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
    shadowColor: Colors.hero,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  sonarRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: Colors.hero,
  },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.avoid,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  fabBadgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontFamily: FONTS.bodySemibold,
  },
});
