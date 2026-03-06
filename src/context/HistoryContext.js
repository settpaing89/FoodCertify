// src/context/HistoryContext.js
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@foodsafe:history';
const MAX_HISTORY = 50;

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState = { history: [], isLoading: true };

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { history: action.payload, isLoading: false };
    case 'ADD':
      return { ...state, history: [action.payload, ...state.history].slice(0, MAX_HISTORY) };
    case 'REMOVE':
      return { ...state, history: state.history.filter(e => e.id !== action.id) };
    case 'CLEAR':
      return { ...state, history: [] };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isLoadingRef = useRef(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY)
      .then(raw => {
        const parsed = raw ? JSON.parse(raw) : [];
        dispatch({ type: 'LOAD', payload: Array.isArray(parsed) ? parsed : [] });
      })
      .catch(() => {
        dispatch({ type: 'LOAD', payload: [] });
      });
  }, []);

  // Persist every time history changes — but skip the initial load
  useEffect(() => {
    if (state.isLoading) {
      isLoadingRef.current = true;
      return;
    }
    if (isLoadingRef.current) {
      // First time isLoading flips to false — this is the load completing, not a user action
      isLoadingRef.current = false;
      return;
    }
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)).catch(err =>
      console.warn('[HistoryContext] persist failed:', err)
    );
  }, [state.history, state.isLoading]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const addScan = (entry) => {
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
  };

  const removeEntry = (id) => {
    dispatch({ type: 'REMOVE', id });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR' });
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
