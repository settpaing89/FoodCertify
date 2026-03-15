// src/hooks/useStorage.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const KEYS = {
  CONDITIONS: '@foodsafe:conditions',
  HISTORY:    '@foodsafe:history',
  ONBOARDED:  '@foodsafe:onboarded',
  DIETARY:    '@foodsafe:dietary',
};

const DEFAULT_DIETARY = {
  enabled:      false,
  preset:       'custom',
  calories:     { enabled: false, max: 500,  min: null },
  carbs:        { enabled: false, max: 30,   min: null },
  sugar:        { enabled: false, max: 10,   min: null },
  protein:      { enabled: false, max: null, min: 20   },
  fat:          { enabled: false, max: 15,   min: null },
  saturatedFat: { enabled: false, max: 5,    min: null },
  sodium:       { enabled: false, max: 600,  min: null },
  blacklist:         [],
  mutedIngredients:  [],
};

const MAX_HISTORY = 50;

// ── Supabase sync helpers ──────────────────────────────────────────────────────
async function getSupabaseUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

async function syncPrefToSupabase(type, value) {
  const user = await getSupabaseUser();
  if (!user) return;
  await supabase.from('dietary_preferences').upsert(
    { user_id: user.id, preference_type: type, preference_value: value },
    { onConflict: 'user_id,preference_type' }
  );
}

async function loadPrefFromSupabase(type) {
  const user = await getSupabaseUser();
  if (!user) return null;
  const { data } = await supabase
    .from('dietary_preferences')
    .select('preference_value')
    .eq('user_id', user.id)
    .eq('preference_type', type)
    .single();
  return data?.preference_value ?? null;
}

// ─── User Conditions ──────────────────────────────────────────────────────────
export function useConditions() {
  const [conditions, setConditionsState] = useState(['gluten', 'diabetes']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Local first
      const stored = await AsyncStorage.getItem(KEYS.CONDITIONS).catch(() => null);
      if (stored) setConditionsState(JSON.parse(stored));
      setLoading(false);

      // Then Supabase override if available
      const remote = await loadPrefFromSupabase('conditions').catch(() => null);
      if (remote && Array.isArray(remote)) {
        setConditionsState(remote);
        await AsyncStorage.setItem(KEYS.CONDITIONS, JSON.stringify(remote));
      }
    };
    load();
  }, []);

  const setConditions = useCallback(async (newConditions) => {
    setConditionsState(newConditions);
    await AsyncStorage.setItem(KEYS.CONDITIONS, JSON.stringify(newConditions));
    syncPrefToSupabase('conditions', newConditions).catch(() => {});
  }, []);

  const toggleCondition = useCallback(async (conditionId) => {
    setConditionsState(prev => {
      const next = prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId];
      AsyncStorage.setItem(KEYS.CONDITIONS, JSON.stringify(next));
      syncPrefToSupabase('conditions', next).catch(() => {});
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    const stored = await AsyncStorage.getItem(KEYS.CONDITIONS);
    if (stored) setConditionsState(JSON.parse(stored));
  }, []);

  return { conditions, setConditions, toggleCondition, loading, refresh };
}

// ─── Scan History ─────────────────────────────────────────────────────────────
export function useHistory() {
  const [history, setHistoryState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.HISTORY)
      .then(stored => {
        if (stored) setHistoryState(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, []);

  const addScan = useCallback(async (scanResult) => {
    setHistoryState(prev => {
      const entry = {
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        ...scanResult,
      };
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistoryState([]);
    await AsyncStorage.removeItem(KEYS.HISTORY);
  }, []);

  const removeItem = useCallback(async (id) => {
    setHistoryState(prev => {
      const next = prev.filter(item => item.id !== id);
      AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { history, addScan, clearHistory, removeItem, loading };
}

// ─── Dietary Preferences ──────────────────────────────────────────────────────
export function useDietaryPrefs() {
  const [prefs, setPrefsState] = useState(DEFAULT_DIETARY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Local first
      const raw = await AsyncStorage.getItem(KEYS.DIETARY).catch(() => null);
      setPrefsState(raw ? { ...DEFAULT_DIETARY, ...JSON.parse(raw) } : DEFAULT_DIETARY);
      setIsLoading(false);

      // Supabase override if available
      const remote = await loadPrefFromSupabase('dietary').catch(() => null);
      if (remote && typeof remote === 'object') {
        const merged = { ...DEFAULT_DIETARY, ...remote };
        setPrefsState(merged);
        await AsyncStorage.setItem(KEYS.DIETARY, JSON.stringify(merged));
      }
    };
    load();
  }, []);

  const savePrefs = useCallback(async (next) => {
    setPrefsState(next);
    await AsyncStorage.setItem(KEYS.DIETARY, JSON.stringify(next));
    syncPrefToSupabase('dietary', next).catch(() => {});
  }, []);

  return { prefs, savePrefs, isLoading };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export function useOnboarding() {
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.ONBOARDED).then(v => setHasOnboarded(v === 'true'));
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
  }, []);

  const resetOnboarding = useCallback(async () => {
    setHasOnboarded(false);
    await AsyncStorage.removeItem(KEYS.ONBOARDED);
  }, []);

  return { hasOnboarded, completeOnboarding, resetOnboarding };
}
