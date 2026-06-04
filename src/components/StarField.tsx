import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: Math.abs((i * 137.508 + 23) % width),
  y: Math.abs((i * 97.3 + 47) % height),
  size: i % 3 === 0 ? 2 : i % 5 === 0 ? 1.5 : 1,
  opacity: 0.3 + (i % 5) * 0.12,
  delay: (i * 300) % 3000,
}));

export default function StarField({ style }: { style?: object }) {
  const anims = useRef<Animated.Value[]>(
    STARS.map(s => new Animated.Value(s.opacity))
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(STARS[i].delay),
          Animated.timing(anim, { toValue: STARS[i].opacity * 0.2, duration: 1500 + (i % 4) * 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: STARS[i].opacity, duration: 1500 + (i % 4) * 500, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [anims]);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {STARS.map((star, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', backgroundColor: '#FFF',
          left: star.x, top: star.y,
          width: star.size, height: star.size, borderRadius: star.size,
          opacity: anims[i],
        }} />
      ))}
    </View>
  );
}