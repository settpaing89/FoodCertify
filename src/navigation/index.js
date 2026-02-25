// src/navigation/index.js
import { createContext, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadow, Spacing } from '../theme';
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
import PrivacySecurityScreen       from '../screens/PrivacySecurityScreen';
import HelpCenterScreen            from '../screens/HelpCenterScreen';
import AboutFoodSafeScreen         from '../screens/AboutFoodSafeScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tabs: Home | Scan (modal action) | History | Explore | Profile
const TABS = [
  { name: 'Home',    label: 'Home',    icon: 'home'       },
  { name: 'Scan',    label: 'Scan',    icon: 'maximize-2' }, // opens Scanner modal
  { name: 'History', label: 'History', icon: 'file-text'  },
  { name: 'Explore', label: 'Explore', icon: 'compass'    },
  { name: 'Profile', label: 'Profile', icon: 'user'       },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation, insets }) {
  // Map tab index to screen name (Scan is not a real tab screen)
  const tabNames = TABS.map(t => t.name).filter(n => n !== 'Scan');

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        // For non-Scan tabs, check the actual navigator state index
        const screenIndex = tabNames.indexOf(tab.name);
        const isFocused = tab.name !== 'Scan' && state.index === screenIndex;

        const onPress = () => {
          if (tab.name === 'Scan') {
            // Open scanner as a modal, staying on current tab
            navigation.navigate('Scanner');
          } else {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <Feather
              name={tab.icon}
              size={22}
              color={isFocused ? Colors.primary : Colors.onSurfaceMuted}
            />
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

// ─── Main Tab Navigator (3 real tabs) ────────────────────────────────────────
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} insets={insets} />}
    >
      <Tab.Screen name="Home"    component={HomeScreen}      />
      <Tab.Screen name="History" component={HistoryScreen}   />
      <Tab.Screen name="Explore" component={ExploreScreen}   />
      <Tab.Screen name="Profile" component={ProfileScreen}   />
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
export default function RootNavigator() {
  const { hasOnboarded, completeOnboarding, resetOnboarding } = useOnboarding();

  // Still reading from AsyncStorage — render nothing to avoid flash
  if (hasOnboarded === null) return null;

  return (
    <AppContext.Provider value={{ completeOnboarding, resetOnboarding }}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!hasOnboarded ? (
          // ── Onboarding (first launch only) ──────────────────────────────────
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} completeOnboarding={completeOnboarding} />}
          </Stack.Screen>
        ) : (
          // ── Main app ─────────────────────────────────────────────────────────
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
    borderTopColor: '#F0F4F8',
    paddingTop: Spacing.sm,
    ...Shadow.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceMuted,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabActiveDot: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
