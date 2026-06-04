import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MarsGlow() {
  return (
    <LinearGradient
      colors={['rgba(232,101,42,0.08)', 'rgba(194,59,34,0.04)', 'transparent']}
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 1 }}
    />
  );
}