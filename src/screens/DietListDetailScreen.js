// src/screens/DietListDetailScreen.js
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FONT_SIZE, FONTS, SHADOW } from '../utils/tokens';
import { RatingBadge } from '../components';
import { useDietLists } from '../hooks/useDietLists';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DietListDetailScreen({ route, navigation }) {
  const { listId } = route.params;
  const { lists, removeProduct } = useDietLists();
  const insets = useSafeAreaInsets();

  const list = lists?.find(l => l.id === listId);

  const handleRemove = (product) => {
    Alert.alert(
      'Remove Product',
      `Remove "${product.productName}" from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeProduct(listId, product.id) },
      ],
    );
  };

  // Loading state — lists not yet read from AsyncStorage
  if (!lists) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Feather name="loader" size={24} color={Colors.onSurfaceMuted} />
      </View>
    );
  }

  // List no longer exists (deleted)
  if (!list) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={32} color={Colors.onSurfaceMuted} />
        <Text style={styles.emptyTitle}>List not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnInline}>
          <Text style={styles.backBtnInlineText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>{list.name}</Text>
          <Text style={styles.topBarSub}>
            {list.products.length} {list.products.length === 1 ? 'product' : 'products'}
          </Text>
        </View>
        {/* Spacer to balance back button */}
        <View style={styles.topBarBtn} />
      </View>

      {/* ── Product list ── */}
      <FlatList
        data={list.products}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {/* Thumbnail */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.productImagePlaceholder]}>
                <Feather name="shopping-bag" size={22} color={Colors.onSurfaceMuted} />
              </View>
            )}

            {/* Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName || 'Unknown Product'}
              </Text>
              {item.brand ? (
                <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
              ) : null}
              <View style={styles.productMeta}>
                <RatingBadge rating={item.rating || 'SAFE'} />
                <Text style={styles.productDate}>{formatDate(item.addedAt)}</Text>
              </View>
            </View>

            {/* Delete */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="trash-2" size={18} color={Colors.avoid} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Feather name="inbox" size={32} color={Colors.onSurfaceMuted} />
            </View>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyBody}>
              Scan a product and tap "Add to Diet List" to save it here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topBarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  topBarTitle: {
    ...Typography.h2,
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bodySemibold,
  },
  topBarSub: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.onSurfaceMuted,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },

  // Product card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...SHADOW.md,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.onSurface,
  },
  productBrand: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.bodyMedium,
    color: Colors.onSurfaceMuted,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  productDate: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bodyMedium,
    color: Colors.onSurfaceMuted,
  },
  deleteBtn: {
    padding: 4,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.h2,
    textAlign: 'center',
  },
  emptyBody: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: 260,
  },
  backBtnInline: {
    marginTop: Spacing.sm,
  },
  backBtnInlineText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bodySemibold,
    color: Colors.primary,
  },
});
