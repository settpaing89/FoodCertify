// src/hooks/useDietLists.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@foodsafe:dietlists';

const makeDefaultList = () => ({
  id: 'default',
  name: 'My Diet List',
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  products: [],
});

export function useDietLists() {
  const [lists, setLists] = useState(null); // null = loading

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        setLists(JSON.parse(raw));
      } else {
        const initial = [makeDefaultList()];
        setLists(initial);
        AsyncStorage.setItem(KEY, JSON.stringify(initial));
      }
    });
  }, []);

  const persist = useCallback((next) => {
    setLists(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const addList = useCallback((name) => {
    setLists(prev => {
      const next = [
        ...prev,
        {
          id: Date.now().toString(),
          name: name.trim(),
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          products: [],
        },
      ];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteList = useCallback((id) => {
    setLists(prev => {
      const next = prev.filter(l => l.isDefault || l.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addProduct = useCallback((listId, product) => {
    setLists(prev => {
      const next = prev.map(l => {
        if (l.id !== listId) return l;
        // Prevent duplicate barcodes in the same list
        if (product.barcode && l.products.some(p => p.barcode === product.barcode)) return l;
        return {
          ...l,
          updatedAt: new Date().toISOString(),
          products: [
            { id: Date.now().toString(), addedAt: new Date().toISOString(), ...product },
            ...l.products,
          ],
        };
      });
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeProduct = useCallback((listId, productId) => {
    setLists(prev => {
      const next = prev.map(l => {
        if (l.id !== listId) return l;
        return {
          ...l,
          updatedAt: new Date().toISOString(),
          products: l.products.filter(p => p.id !== productId),
        };
      });
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { lists, addList, deleteList, addProduct, removeProduct };
}
