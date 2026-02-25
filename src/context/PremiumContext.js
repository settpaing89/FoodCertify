// src/context/PremiumContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── RevenueCat setup ─────────────────────────────────────────────────────────
// TODO: Replace with your actual keys from https://app.revenuecat.com
const RC_API_KEY_IOS     = 'YOUR_REVENUECAT_IOS_API_KEY';
const RC_API_KEY_ANDROID = 'YOUR_REVENUECAT_ANDROID_API_KEY';
const ENTITLEMENT_ID     = 'premium';
const PRODUCT_ID         = 'foodsafe_premium_monthly';
const FREE_SCAN_LIMIT    = 20;

// Lazy-require so the app doesn't crash if the package isn't linked yet
let Purchases = null;
try { Purchases = require('react-native-purchases').default; } catch { /* Expo Go / not yet installed */ }

// ─── Week key (resets counter every Monday) ───────────────────────────────────
function getWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split('T')[0];
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const PremiumContext = createContext({
  isPremium:          false,
  isLoading:          true,
  scanCount:          0,
  remaining:          FREE_SCAN_LIMIT,
  canScan:            true,
  purchasePremium:    async () => false,
  restorePurchases:   async () => false,
  incrementScanCount: async () => 0,
});

export const usePremiumContext = () => useContext(PremiumContext);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium]   = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [scanCount, setScanCount]   = useState(0);
  const [weekKey,   setWeekKey]     = useState('');

  useEffect(() => {
    let removeListener = null;

    const init = async () => {
      // ── RevenueCat ──────────────────────────────────────────────────────────
      if (Purchases) {
        try {
          Purchases.configure({
            apiKey: Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID,
          });
          const info = await Purchases.getCustomerInfo();
          setIsPremium(!!info.entitlements.active[ENTITLEMENT_ID]);
          removeListener = Purchases.addCustomerInfoUpdateListener(i => {
            setIsPremium(!!i.entitlements.active[ENTITLEMENT_ID]);
          });
        } catch (e) {
          console.warn('[RevenueCat]', e.message);
        }
      }
      setIsLoading(false);

      // ── Scan counter ────────────────────────────────────────────────────────
      const currentWeek = getWeekKey();
      const [[, storedCount], [, storedWeek]] = await AsyncStorage.multiGet([
        '@foodsafe:scan_count',
        '@foodsafe:scan_week',
      ]);
      if (storedWeek === currentWeek) {
        setScanCount(Number(storedCount) || 0);
      } else {
        setScanCount(0);
        await AsyncStorage.multiSet([
          ['@foodsafe:scan_count', '0'],
          ['@foodsafe:scan_week', currentWeek],
        ]);
      }
      setWeekKey(currentWeek);
    };

    init();
    return () => removeListener?.();
  }, []);

  // ── Purchase ────────────────────────────────────────────────────────────────
  const purchasePremium = useCallback(async () => {
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases require a development build (not Expo Go).');
      return false;
    }
    try {
      const { customerInfo } = await Purchases.purchaseProduct(PRODUCT_ID);
      const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
      setIsPremium(active);
      return active;
    } catch (e) {
      if (e.userCancelled) return false;
      throw e;
    }
  }, []);

  // ── Restore ─────────────────────────────────────────────────────────────────
  const restorePurchases = useCallback(async () => {
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases require a development build (not Expo Go).');
      return false;
    }
    try {
      const info = await Purchases.restorePurchases();
      const active = !!info.entitlements.active[ENTITLEMENT_ID];
      setIsPremium(active);
      Alert.alert(
        active ? 'Purchase Restored!' : 'No Active Subscription',
        active
          ? 'Your Premium subscription has been restored.'
          : 'No previous purchase was found for this account.',
      );
      return active;
    } catch (e) {
      Alert.alert('Restore Failed', e.message);
      return false;
    }
  }, []);

  // ── Increment scan counter ──────────────────────────────────────────────────
  const incrementScanCount = useCallback(async () => {
    const currentWeek = getWeekKey();
    const newCount = weekKey === currentWeek ? scanCount + 1 : 1;
    setScanCount(newCount);
    setWeekKey(currentWeek);
    await AsyncStorage.multiSet([
      ['@foodsafe:scan_count', String(newCount)],
      ['@foodsafe:scan_week', currentWeek],
    ]);
    return newCount;
  }, [scanCount, weekKey]);

  const remaining = Math.max(0, FREE_SCAN_LIMIT - scanCount);
  const canScan   = isPremium || scanCount < FREE_SCAN_LIMIT;

  return (
    <PremiumContext.Provider value={{
      isPremium,
      isLoading,
      scanCount,
      remaining,
      canScan,
      purchasePremium,
      restorePurchases,
      incrementScanCount,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}
