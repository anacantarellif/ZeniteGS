import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Ellipse, RadialGradient, Defs, Stop } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { MoodLevel } from '../types';

const PLANETS = [
  { label: 'Colapso', color: '#1a0a0a', glowColor: COLORS.red,    hasRing: false, size: 24 },
  { label: 'Pesada',  color: '#0a0a12', glowColor: '#5555aa',     hasRing: false, size: 28 },
  { label: 'Estável', color: '#c8850a', glowColor: COLORS.orange,  hasRing: true,  size: 32 },
  { label: 'Energia', color: '#2a8a7a', glowColor: COLORS.teal,    hasRing: false, size: 34 },
  { label: 'Órbita!', color: '#b8960a', glowColor: '#e8c52a',     hasRing: false, size: 38 },
];

function PlanetItem({ planet, index, selected, onSelect }: {
  planet: typeof PLANETS[0]; index: number; selected: boolean; onSelect: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: selected ? 1.05 : 1, tension: 80, friction: selected ? 4 : 6, useNativeDriver: true }).start();
  }, [selected, scale]);

  const svgSize = planet.size * 2 + 20;
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8} accessibilityRole="button"
      accessibilityLabel={`Humor: ${planet.label}`}
      style={[styles.planetContainer, selected && styles.planetSelected]}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          <Defs>
            <RadialGradient id={`g${index}`} cx="40%" cy="35%" r="60%">
              <Stop offset="0%" stopColor={planet.glowColor} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={planet.color} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          {index >= 3 && <Circle cx={svgSize/2} cy={svgSize/2} r={planet.size+6} fill={planet.glowColor} opacity={0.12} />}
          {planet.hasRing && <Ellipse cx={svgSize/2} cy={svgSize/2} rx={planet.size+8} ry={6} fill="none" stroke="rgba(232,101,42,0.35)" strokeWidth="2" />}
          <Circle cx={svgSize/2} cy={svgSize/2} r={planet.size} fill={`url(#g${index})`} />
        </Svg>
        <Text style={[styles.label, selected && { color: COLORS.orange }]}>{planet.label.toUpperCase()}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PlanetSelector({ selected, onSelect }: { selected: MoodLevel | null; onSelect: (v: MoodLevel) => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}>
      {PLANETS.map((p, i) => (
        <PlanetItem key={i} planet={p} index={i} selected={selected === i} onSelect={() => onSelect(i as MoodLevel)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  planetContainer: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: 'transparent', borderRadius: 4, marginHorizontal: 2 },
  planetSelected: { borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)' },
  label: { fontSize: 8, letterSpacing: 1, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
});