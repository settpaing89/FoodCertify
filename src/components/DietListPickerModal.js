// src/components/DietListPickerModal.js
import { useEffect, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  Animated, TouchableWithoutFeedback, Alert, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONT_SIZE, FONT_WEIGHT, SHADOW } from '../utils/tokens';
import { Colors, Radius, Spacing } from '../theme';
import { useDietLists } from '../hooks/useDietLists';

export function DietListPickerModal({ visible, onClose, product }) {
  const { lists, addProduct } = useDietLists();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handleSelect = (list) => {
    Alert.alert(
      'Add to Diet List',
      `Add "${product?.productName || 'this product'}" to "${list.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            addProduct(list.id, product);
            onClose();
            setTimeout(() => {
              Alert.alert('Saved', `Product added to "${list.name}".`);
            }, 350);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />

        <Text style={styles.title}>Save to Diet List</Text>
        <Text style={styles.subtitle}>Choose a list to add this product to</Text>

        <FlatList
          data={lists || []}
          keyExtractor={item => item.id}
          style={styles.listContainer}
          scrollEnabled={(lists?.length || 0) > 4}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <View style={styles.listIconWrap}>
                <Feather name="list" size={18} color={Colors.primary} />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listCount}>
                  {item.products.length} {item.products.length === 1 ? 'product' : 'products'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No lists yet. Create one in the Explore tab.</Text>
            </View>
          }
        />

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
    ...SHADOW.lg,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outline,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    maxHeight: 260,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  listIconWrap: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
  },
  listInfo: { flex: 1 },
  listName: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: Colors.onSurface },
  listCount: { fontSize: FONT_SIZE.sm, color: Colors.onSurfaceMuted, marginTop: 2 },
  emptyRow: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZE.md, color: Colors.onSurfaceMuted, textAlign: 'center' },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: Colors.onSurfaceMuted },
});
