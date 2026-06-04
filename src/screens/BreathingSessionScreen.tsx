import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RouteProp, useRoute } from '@react-navigation/native';

import { COLORS } from '../constants/colors';

import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;

const PHASES = [
  {
    label: 'INSPIRAR',
    duration: 4,
    action: 'expand',
  },
  {
    label: 'SEGURAR',
    duration: 4,
    action: 'hold',
  },
  {
    label: 'EXPIRAR',
    duration: 4,
    action: 'shrink',
  },
  {
    label: 'SEGURAR',
    duration: 4,
    action: 'hold',
  },
];

export default function BreathingSessionScreen() {
  const route = useRoute<RouteProp<any>>();

  const scale = useRef(
    new Animated.Value(MIN_SCALE)
  ).current;


  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(
    PHASES[0].duration
  );

  const currentPhase = PHASES[phaseIndex];

useEffect(() => {
  const phase = PHASES[phaseIndex];

  if (phase.action === 'expand') {
    Animated.timing(scale, {
      toValue: MAX_SCALE,
      duration: phase.duration * 1000,
      useNativeDriver: true,
    }).start();
  }

  if (phase.action === 'shrink') {
    Animated.timing(scale, {
      toValue: MIN_SCALE,
      duration: phase.duration * 1000,
      useNativeDriver: true,
    }).start();
  }

  setSeconds(phase.duration);

  const countdown = setInterval(() => {
    setSeconds(prev => {
      if (prev <= 1) return 0;
      return prev - 1;
    });
  }, 1000);

  const timer = setTimeout(() => {
    setPhaseIndex(prev =>
      (prev + 1) % PHASES.length
    );
  }, phase.duration * 1000);

  return () => {
    clearInterval(countdown);
    clearTimeout(timer);
  };
}, [phaseIndex]);

  return (
    
    <View style={styles.container}>
      <StarField />
      <ScanLine />
      <MarsGlow />

    <Text style={styles.phaseCounter}>
        FASE {phaseIndex + 1} / 4
    </Text>

     <View style={styles.orbitRing}>
    <Animated.View
        style={[
        styles.outerCircle,
        {
            transform: [{ scale }],
        },
        ]}
    >
    <View style={styles.innerCircle}>
      <Text style={styles.seconds}>
        {seconds}
      </Text>
    </View>
  </Animated.View>

  <View style={styles.progressContainer}>
    {PHASES.map((_, index) => (
        <View
                key={index}
                style={[
                    styles.progressDot,
                    index <= phaseIndex &&
                    styles.progressDotActive,
                ]}
                />
            ))}
        </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  orbitRing: {
    width: 320,
    height: 320,

    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 160,

    borderWidth: 1,
    borderColor: 'rgba(232,101,42,0.15)',
  },

  phaseCounter: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 16,
    },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  mission: {
    color: COLORS.orange,
    letterSpacing: 4,
    fontSize: 12,
    marginBottom: 24,
  },

  progressContainer: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 40,
},

    progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,

    borderWidth: 1,
    borderColor: COLORS.border,
    },

    progressDotActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
    },

  phase: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 6,
    marginBottom: 80,
  },

  outerCircle: {
  width: 220,
  height: 220,
  borderRadius: 110,

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 1,
  borderColor: COLORS.orange,

  backgroundColor: 'rgba(232,101,42,0.08)',
},

  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'rgba(232,101,42,0.3)',
},

  seconds: {
    fontSize: 72,
    fontWeight: '200',
    color: COLORS.textPrimary,
  },

  instruction: {
    marginTop: 90,
    color: COLORS.textSecondary,
    fontSize: 15,
    letterSpacing: 2,
  },
});