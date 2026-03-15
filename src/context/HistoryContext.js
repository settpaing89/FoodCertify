// src/context/HistoryContext.js
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const HISTORY_KEY      = '@foodsafe:history';
const MIGRATED_KEY     = '@foodsafe:history_migrated';
const MAX_HISTORY      = 50;

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState = { history: [], isLoading: true };

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { history: action.payload, isLoading: false };
    case 'ADD':
      return { ...state, history: [action.payload, ...state.history].slice(0, MAX_HISTORY) };
    case 'UPDATE_ENTRY': {
      const history = state.history.map(e =>
        e.id === action.payload.id ? action.payload : e
      );
      return { ...state, history };
    }
    case 'REMOVE':
      return { ...state, history: state.history.filter(e => e.id !== action.id) };
    case 'CLEAR':
      return { ...state, history: [] };
    default:
      return state;
  }
}

// ── Supabase helpers (fire-and-forget) ────────────────────────────────────────
async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

function entryToRow(userId, entry) {
  return {
    user_id:      userId,
    barcode:      entry.barcode      ?? '',
    product_name: entry.productName  ?? '',
    brand:        entry.brand        ?? '',
    image_url:    entry.imageUrl     ?? '',
    nutrition_data: entry,              // full entry stored as JSONB
    score:        entry.safetyRating ?? '',
    verdict:      entry.safetyRating ?? '',
    scanned_at:   entry.scannedAt    ?? new Date().toISOString(),
  };
}

async function pushEntryToSupabase(entry) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from('scan_history')
    .insert(entryToRow(user.id, entry))
    .select('id')
    .single();
  return data?.id ?? null;
}

async function deleteEntryFromSupabase(entry) {
  const user = await getCurrentUser();
  if (!user) return;
  if (entry.supabaseId) {
    await supabase.from('scan_history').delete().eq('id', entry.supabaseId);
  } else {
    // Fallback: match by scanned_at
    await supabase.from('scan_history')
      .delete()
      .eq('user_id', user.id)
      .eq('scanned_at', entry.scannedAt);
  }
}

async function clearHistoryFromSupabase() {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from('scan_history').delete().eq('user_id', user.id);
}

async function migrateToSupabase(userId, localHistory) {
  if (!localHistory.length) return;
  const rows = localHistory.map(e => entryToRow(userId, e));
  // Insert in chunks to avoid request size limits
  for (let i = 0; i < rows.length; i += 10) {
    await supabase.from('scan_history').upsert(rows.slice(i, i + 10), { ignoreDuplicates: true });
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isLoadingRef = useRef(true);

  // Load history on mount — AsyncStorage first, then Supabase if authenticated
  useEffect(() => {
    const load = async () => {
      // 1. Load local data immediately (fast initial render)
      const raw = await AsyncStorage.getItem(HISTORY_KEY).catch(() => null);
      const local = raw ? (JSON.parse(raw) ?? []) : [];
      dispatch({ type: 'LOAD', payload: Array.isArray(local) ? local : [] });

      // 2. Check for authenticated user
      const user = await getCurrentUser();
      if (!user) return;

      // 3. One-time migration: push existing local history to Supabase
      const migrated = await AsyncStorage.getItem(MIGRATED_KEY).catch(() => null);
      if (!migrated && local.length > 0) {
        await migrateToSupabase(user.id, local).catch(() => {});
        await AsyncStorage.setItem(MIGRATED_KEY, 'true');
      }

      // 4. Load from Supabase (source of truth for authenticated users)
      const { data: rows } = await supabase
        .from('scan_history')
        .select('id, nutrition_data')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(MAX_HISTORY);

      if (rows?.length) {
        // Attach supabaseId so deletes work correctly
        const remote = rows.map(r => ({ ...r.nutrition_data, supabaseId: r.id }));
        dispatch({ type: 'LOAD', payload: remote });
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(remote));
      }
    };

    load().catch(err => console.warn('[HistoryContext]', err));
  }, []);

  // Persist to AsyncStorage on every history change (skip initial load)
  useEffect(() => {
    if (state.isLoading) {
      isLoadingRef.current = true;
      return;
    }
    if (isLoadingRef.current) {
      isLoadingRef.current = false;
      return;
    }
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)).catch(err =>
      console.warn('[HistoryContext] persist failed:', err)
    );
  }, [state.history, state.isLoading]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const addScan = async (entry) => {
    const fullEntry = {
      id:                 Date.now().toString(),
      scannedAt:          new Date().toISOString(),
      barcode:            entry.barcode            ?? '',
      productName:        entry.productName        ?? '',
      brand:              entry.brand              ?? '',
      quantity:           entry.quantity           ?? '',
      imageUrl:           entry.imageUrl           ?? '',
      safetyRating:       entry.safetyRating       ?? 'SAFE',
      conditionsChecked:  entry.conditionsChecked  ?? 0,
      ingredientsFlagged: entry.ingredientsFlagged ?? 0,
      nutriScore:         entry.nutriScore         ?? null,
      flaggedIngredients: Array.isArray(entry.flaggedIngredients) ? entry.flaggedIngredients : [],
      fullIngredientList: entry.fullIngredientList ?? '',
      allergens:          Array.isArray(entry.allergens) ? entry.allergens : [],
      savedProduct:       entry.savedProduct       ?? null,
      savedAnalysis:      entry.savedAnalysis      ?? null,
    };
    dispatch({ type: 'ADD', payload: fullEntry });

    // Sync to Supabase and store returned UUID for future deletes
    pushEntryToSupabase(fullEntry)
      .then(supabaseId => {
        if (supabaseId) dispatch({ type: 'UPDATE_ENTRY', payload: { ...fullEntry, supabaseId } });
      })
      .catch(() => {});
  };

  const removeEntry = (id) => {
    const entry = state.history.find(e => e.id === id);
    dispatch({ type: 'REMOVE', id });
    if (entry) deleteEntryFromSupabase(entry).catch(() => {});
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR' });
    clearHistoryFromSupabase().catch(() => {});
  };

  return (
    <HistoryContext.Provider value={{
      history:   state.history,
      isLoading: state.isLoading,
      addScan,
      removeEntry,
      clearHistory,
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistoryContext must be used within a HistoryProvider');
  return ctx;
}
