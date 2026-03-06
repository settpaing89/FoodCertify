// src/components/AnimatedCard.js
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * AnimatedCard — slides up + fades in on mount.
 * Re-focus is handled by the parent conditionally unmounting/remounting this component.
 * Props:
 *   delay  {number} ms stagger before animation starts (default 0)
 *   style  {object} additional styles
 */
export function AnimatedCard({ delay = 0, style, children }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
