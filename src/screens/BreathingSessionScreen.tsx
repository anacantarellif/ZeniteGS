import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '../constants/colors';

import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

import { RootStackParamList } from '../types';

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

type Nav =
  StackNavigationProp<RootStackParamList>;

export default function BreathingSessionScreen() {
  const navigation = useNavigation<Nav>();

  const route =
    useRoute<RouteProp<any>>();

  const mode =
    route.params?.mode ?? 'maintenance';

  const scale = useRef(
    new Animated.Value(MIN_SCALE)
  ).current;

  const fade = useRef(
    new Animated.Value(0)
  ).current;

  const [started, setStarted] =
    useState(false);

  const [phaseIndex, setPhaseIndex] =
    useState(0);

  const [seconds, setSeconds] =
    useState(PHASES[0].duration);

  const currentPhase =
    PHASES[phaseIndex];

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!started) return;

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
      setSeconds(prev =>
        prev <= 1 ? 0 : prev - 1
      );
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
  }, [phaseIndex, started]);

  return (
    <View style={styles.container}>
      <StarField />
      <ScanLine />
      <MarsGlow />

      <Animated.View
        style={[
          styles.content,
          { opacity: fade },
        ]}
      >
        <Text style={styles.mission}>
          {mode === 'panic'
            ? 'PROTOCOLO DE EMERGÊNCIA'
            : 'ESTABILIZAÇÃO ORBITAL'}
        </Text>

        {!started ? (
          <>
            <Text style={styles.phase}>
              PREPARE-SE
            </Text>

            <Text style={styles.instruction}>
              Encontre uma posição confortável.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() =>
                setStarted(true)
              }
            >
              <Text
                style={
                  styles.startButtonText
                }
              >
                INICIAR SESSÃO
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text
              style={
                styles.phaseCounter
              }
            >
              FASE {phaseIndex + 1} / 4
            </Text>

            <Text style={styles.phase}>
              {currentPhase.label}
            </Text>

            <View style={styles.orbitRing}>
              <Animated.View
                style={[
                  styles.outerCircle,
                  {
                    transform: [
                      { scale },
                    ],
                  },
                ]}
              >
                <View
                  style={
                    styles.innerCircle
                  }
                >
                  <Text
                    style={
                      styles.seconds
                    }
                  >
                    {seconds}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <View
              style={
                styles.progressContainer
              }
            >
              {PHASES.map(
                (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index <=
                        phaseIndex &&
                        styles.progressDotActive,
                    ]}
                  />
                )
              )}
            </View>

            <TouchableOpacity
              style={
                styles.finishButton
              }
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text
                style={
                  styles.finishButtonText
                }
              >
                ENCERRAR
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
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

startButton: {
  marginTop: 40,
  borderWidth: 1,
  borderColor: COLORS.orange,
  paddingHorizontal: 28,
  paddingVertical: 14,
  borderRadius: 4,
},

startButtonText: {
  color: COLORS.orange,
  letterSpacing: 3,
  fontSize: 12,
},

finishButton: {
  marginTop: 40,
  borderWidth: 1,
  borderColor: COLORS.border,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 4,
},

finishButtonText: {
  color: COLORS.textSecondary,
  letterSpacing: 2,
  fontSize: 11,
},
});