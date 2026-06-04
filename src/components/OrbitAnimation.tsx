import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const SIZE = 220, CENTER = 110, EARTH_R = 36, RX = 90, RY = 28;

export default function OrbitAnimation() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 7000, useNativeDriver: true })
    ).start();
  }, [rotation]);

  const angle = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <Ellipse cx={CENTER} cy={CENTER} rx={RX} ry={RY} fill="none" stroke="rgba(232,101,42,0.15)" strokeWidth="1" />
        <Ellipse cx={CENTER} cy={CENTER} rx={RX*1.25} ry={RY*1.25} fill="none" stroke="rgba(232,101,42,0.07)" strokeWidth="1" />
        <Ellipse cx={CENTER} cy={CENTER} rx={RX*1.5} ry={RY*1.5} fill="none" stroke="rgba(232,101,42,0.04)" strokeWidth="1" />
        <Circle cx={CENTER} cy={CENTER} r={EARTH_R} fill="#0a1628" />
        <Circle cx={CENTER} cy={CENTER} r={EARTH_R} fill="rgba(30,80,160,0.5)" />
        <Circle cx={CENTER-8} cy={CENTER-6} r={10} fill="rgba(60,140,80,0.6)" />
        <Circle cx={CENTER+10} cy={CENTER+4} r={8} fill="rgba(60,140,80,0.5)" />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: angle }] }]}>
        <View style={{ position: 'absolute', top: CENTER - RY - 4, left: CENTER - 6, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 10, height: 2, backgroundColor: COLORS.orange, opacity: 0.7, marginRight: 2 }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.orange }} />
          <View style={{ width: 10, height: 2, backgroundColor: COLORS.orange, opacity: 0.7, marginLeft: 2 }} />
        </View>
      </Animated.View>
    </View>
  );
}