import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function ScanLine() {
  const translateY = useRef(new Animated.Value(-2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateY, { toValue: height, duration: 5000, useNativeDriver: true })
    ).start();
  }, [translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 999, transform: [{ translateY }] }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(232,101,42,0.12)', 'rgba(232,101,42,0.06)', 'transparent']}
        style={{ height: 2, width: '100%' }}
      />
    </Animated.View>
  );
}