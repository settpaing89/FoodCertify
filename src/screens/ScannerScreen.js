// src/screens/ScannerScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Animated, Dimensions, Platform, StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { fetchProductByBarcode } from '../engine/api';
import { analyzeIngredients } from '../engine/analyzer';
import { useConditions } from '../hooks/useStorage';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const { conditions } = useConditions();
  const insets = useSafeAreaInsets();

  // Animations
  const scanLineY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate scan line
    const loopScan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: SCAN_FRAME_SIZE - 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    loopScan.start();
    return () => loopScan.stop();
  }, []);

  useEffect(() => {
    // Pulse corners
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleBarCodeScanned = useCallback(async ({ type, data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const result = await fetchProductByBarcode(data);

      if (!result.found) {
        Alert.alert(
          'Product Not Found',
          `Barcode ${data} is not in our database yet.\n\nYou can manually enter the ingredient list instead.`,
          [
            { text: 'Enter Manually', onPress: () => navigation.navigate('ManualEntry') },
            { text: 'Scan Again', onPress: () => setScanned(false), style: 'cancel' },
          ]
        );
        setLoading(false);
        return;
      }

      const analysis = analyzeIngredients(result.product.ingredients, conditions);

      navigation.navigate('Result', {
        product: result.product,
        analysis,
        barcode: data,
      });

    } catch (error) {
      Alert.alert('Error', error.message, [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  }, [scanned, loading, conditions, navigation]);

  // Permission states
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={StyleSheet.absoluteFill} />
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionBody}>
          FoodSafe needs your camera to scan product barcodes. Your camera is only used for scanning — no photos are saved.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e',
            'code128', 'code39', 'qr', 'itf14',
          ],
        }}
      />

      {/* Dark overlay with scan window */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={[styles.overlaySection, { height: (height - SCAN_FRAME_SIZE) / 2 - 40 }]} />

        {/* Middle row */}
        <View style={styles.middleRow}>
          <View style={styles.overlaySide} />
          {/* Scan frame */}
          <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line */}
            {!loading && (
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
              />
            )}

            {/* Loading indicator */}
            {loading && (
              <View style={styles.scanLoadingContainer}>
                <View style={styles.scanLoadingPulse} />
                <Text style={styles.scanLoadingText}>Looking up product…</Text>
              </View>
            )}
          </Animated.View>
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom overlay */}
        <View style={[styles.overlaySection, { flex: 1 }]}>
          <Text style={styles.scanHint}>
            {loading ? '🔍 Fetching product data…' : 'Point at a barcode to scan'}
          </Text>
          {conditions.length === 0 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ No health conditions selected — go to Profile
              </Text>
            </View>
          )}
          <View style={styles.scanActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setTorch(!torch)}
            >
              <Text style={styles.actionBtnIcon}>{torch ? '🔦' : '💡'}</Text>
              <Text style={styles.actionBtnLabel}>{torch ? 'Flash On' : 'Flash Off'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('ManualEntry')}
            >
              <Text style={styles.actionBtnIcon}>📝</Text>
              <Text style={styles.actionBtnLabel}>Manual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.actionBtnIcon}>🔍</Text>
              <Text style={styles.actionBtnLabel}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topBarClose}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>🌿 Scan Product</Text>
        <View style={{ width: 32 }} />
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  overlaySection: { backgroundColor: 'rgba(0,0,0,0.62)', width: '100%' },
  middleRow: { flexDirection: 'row', height: SCAN_FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },

  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0, height: 2,
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // Corners
  corner: {
    position: 'absolute',
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: '#fff',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 6,
  },

  scanLoadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  scanLoadingPulse: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 3, borderColor: Colors.primaryLight,
    opacity: 0.8,
  },
  scanLoadingText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  scanHint: {
    color: 'rgba(255,255,255,0.85)', textAlign: 'center',
    fontSize: 16, fontWeight: '600', marginTop: 24,
  },
  warningBanner: {
    backgroundColor: 'rgba(255,152,0,0.85)',
    margin: 16, borderRadius: 12, padding: 12,
  },
  warningText: { color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: '600' },

  scanActions: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 32, marginTop: 32,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionBtnIcon: { fontSize: 28 },
  actionBtnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12,
  },
  topBarClose: { color: '#fff', fontSize: 20, fontWeight: '700', padding: 4 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Permissions
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  permissionIcon: { fontSize: 72, marginBottom: 20 },
  permissionTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  permissionBody: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permissionButton: {
    backgroundColor: '#fff', borderRadius: Radius.xl,
    paddingHorizontal: 32, paddingVertical: 16,
  },
  permissionButtonText: { color: Colors.primaryDark, fontSize: 16, fontWeight: '800' },
});
