import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, Dimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { RootStackParamList, BreathingSession } from '../types';
import { saveBreathingSession } from '../utils/storage';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';

type Nav   = StackNavigationProp<RootStackParamList, 'Breathing'>;
type Route = RouteProp<RootStackParamList, 'Breathing'>;

const { width } = Dimensions.get('window');
const RADIUS       = 110;
const STROKE_WIDTH = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE     = RADIUS * 2 + STROKE_WIDTH * 2 + 20;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PhaseLabel = 'INSPIRE' | 'SEGURE' | 'EXPIRE';
interface Phase { label: PhaseLabel; duration: number; color: string; }

interface ModeConfig {
  key: BreathingSession['type'];
  index: string;
  label: string;
  sublabel: string;
  desc: string;
  duration: string;
  totalCycles: number;
  phases: Phase[];
  icon: string;
}

const MODES: ModeConfig[] = [
  {
    key: 'pre-sleep', index: '01', label: 'PRÉ-SONO',
    sublabel: 'Pré-sono  4·7·8', desc: 'Ritmo circadiano. 12 minutos.',
    duration: '12m', totalCycles: 6, icon: '◗',
    phases: [
      { label: 'INSPIRE', duration: 4, color: COLORS.orange },
      { label: 'SEGURE',  duration: 7, color: COLORS.teal },
      { label: 'EXPIRE',  duration: 8, color: COLORS.textSecondary },
    ],
  },
  {
    key: 'post-activity', index: '02', label: 'PÓS-EVA',
    sublabel: 'Decompressão pós-EVA',
    desc: 'Após atividade extravehicular ou alta carga cognitiva.',
    duration: '8m', totalCycles: 6, icon: '⚡',
    phases: [
      { label: 'INSPIRE', duration: 4, color: COLORS.orange },
      { label: 'SEGURE',  duration: 4, color: COLORS.teal },
      { label: 'EXPIRE',  duration: 8, color: COLORS.textSecondary },
    ],
  },
  {
    key: 'acute', index: '03', label: 'CRISE',
    sublabel: 'Estabilização aguda', desc: 'Box breathing 4·4·4·4  2 minutos.',
    duration: '2m', totalCycles: 4, icon: '⚠',
    phases: [
      { label: 'INSPIRE', duration: 4, color: COLORS.orange },
      { label: 'SEGURE',  duration: 4, color: COLORS.teal },
      { label: 'EXPIRE',  duration: 4, color: COLORS.textSecondary },
      { label: 'SEGURE',  duration: 4, color: COLORS.teal },
    ],
  },
  {
    key: 'maintenance', index: '04', label: 'DIÁRIO',
    sublabel: 'Manutenção diária', desc: 'Meditação guiada. Voz: Comandante Sato.',
    duration: '10m', totalCycles: 8, icon: '✦',
    phases: [
      { label: 'INSPIRE', duration: 4, color: COLORS.orange },
      { label: 'SEGURE',  duration: 4, color: COLORS.teal },
      { label: 'EXPIRE',  duration: 4, color: COLORS.textSecondary },
    ],
  },
];

export default function BreathingScreen({ navigation, route }: { navigation: Nav; route: Route }) {
  const [selectedMode, setSelectedMode] = useState<ModeConfig | null>(
    route.params?.mode ? MODES.find(m => m.key === route.params.mode) ?? null : null
  );
  const [isActive,    setIsActive]    = useState(false);
  const [phaseIndex,  setPhaseIndex]  = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycleCount,  setCycleCount]  = useState(1);

  const phaseIndexRef  = useRef(0);
  const secondsRef     = useRef(0);
  const cycleCountRef  = useRef(1);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim   = useRef(new Animated.Value(0)).current;
  const circleScale    = useRef(new Animated.Value(1)).current;

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Animação de escala do círculo sincronizada com a fase
  useEffect(() => {
    if (!isActive || !selectedMode) return;
    const phase = selectedMode.phases[phaseIndex];
    const toScale = phase.label === 'INSPIRE' ? 1.06
                  : phase.label === 'EXPIRE'  ? 0.96
                  : 1.02;
    Animated.timing(circleScale, {
      toValue: toScale,
      duration: phase.duration * 1000 * 0.9,
      useNativeDriver: true,
    }).start();
  }, [phaseIndex, isActive]);

  // Animação da barra de progresso circular por segundo
  useEffect(() => {
    if (!isActive || !selectedMode) return;
    const phase = selectedMode.phases[phaseIndex];
    const progress = 1 - secondsLeft / phase.duration;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [secondsLeft, phaseIndex, isActive]);

  function startSession() {
    if (!selectedMode) return;
    phaseIndexRef.current  = 0;
    secondsRef.current     = selectedMode.phases[0].duration;
    cycleCountRef.current  = 1;
    setPhaseIndex(0);
    setSecondsLeft(selectedMode.phases[0].duration);
    setCycleCount(1);
    progressAnim.setValue(0);
    circleScale.setValue(1);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      secondsRef.current -= 1;

      if (secondsRef.current <= 0) {
        const nextIdx = (phaseIndexRef.current + 1) % selectedMode.phases.length;

        if (nextIdx === 0) {
          const newCycle = cycleCountRef.current + 1;
          if (newCycle > selectedMode.totalCycles) {
            finishSession(); return;
          }
          cycleCountRef.current = newCycle;
          setCycleCount(newCycle);
        }

        phaseIndexRef.current = nextIdx;
        setPhaseIndex(nextIdx);
        secondsRef.current = selectedMode.phases[nextIdx].duration;
        setSecondsLeft(selectedMode.phases[nextIdx].duration);
        progressAnim.setValue(0);
      } else {
        setSecondsLeft(secondsRef.current);
      }
    }, 1000);
  }

  async function finishSession() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    if (selectedMode) {
      await saveBreathingSession({
        id: String(Date.now()), type: selectedMode.key,
        duration: selectedMode.totalCycles * selectedMode.phases.reduce((t, p) => t + p.duration, 0),
        date: new Date().toISOString(),
      });
    }
    navigation.goBack();
  }

  function stopSession() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsLeft(selectedMode?.phases[0].duration ?? 0);
    setCycleCount(1);
    progressAnim.setValue(0);
    circleScale.setValue(1);
    setSelectedMode(null);
  }

  const currentPhase = selectedMode?.phases[phaseIndex];
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // ─── TELA DE SELEÇÃO ──────────────────────────────────────
  if (!selectedMode) {
    return (
      <View style={s.container}>
        <StarField />
        <ScanLine />

        <View style={s.selHeader}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}
            accessibilityRole="button" accessibilityLabel="Voltar">
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.selTitle}>ESTABILIZAR ÓRBITA</Text>
            <Text style={s.selSubtitle}>REGULAR PRESSÃO INTERNA</Text>
          </View>
        </View>

        <Text style={s.selHeading}>{'ESCOLHA UM\nCONTEXTO.'}</Text>
        <Text style={s.selHint}>Áudio adaptado para microgravidade. Use os fones.</Text>

        <ScrollView contentContainerStyle={s.modeList} showsVerticalScrollIndicator={false}>
          {MODES.map(mode => (
            <TouchableOpacity key={mode.key} style={s.modeCard}
              onPress={() => { setSelectedMode(mode); setSecondsLeft(mode.phases[0].duration); }}
              accessibilityRole="button" accessibilityLabel={mode.label}
            >
              <View style={s.modeLeft}>
                <Text style={s.modeIndex}>{mode.index}</Text>
                <Text style={s.modeIcon}>{mode.icon}</Text>
              </View>
              <View style={s.modeContent}>
                <Text style={s.modeLabel}>{mode.label}</Text>
                <Text style={s.modeSublabel}>{mode.sublabel}</Text>
                <Text style={s.modeDesc}>{mode.desc}</Text>
              </View>
              <View style={s.modeRight}>
                <Text style={s.modeDuration}>{mode.duration}</Text>
                <Text style={s.modeArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─── TELA DE SESSÃO ATIVA ─────────────────────────────────
  return (
    <View style={s.container}>
      <StarField />
      <ScanLine />

      {/* Header */}
      <View style={s.sessionHeader}>
        <TouchableOpacity style={s.backBtn} onPress={stopSession}
          accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.sessionMode}>{selectedMode.label}</Text>
        <Text style={s.sessionCycle}>CICLO {cycleCount}/{selectedMode.totalCycles}</Text>
      </View>

      {/* Círculo de respiração */}
      <View style={s.circleArea}>
        <Animated.View style={{ transform: [{ scale: circleScale }] }}>
          <Svg width={SVG_SIZE} height={SVG_SIZE}>
            {/* Trilha de fundo */}
            <Circle
              cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS}
              fill="transparent"
              stroke="rgba(232,101,42,0.1)"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Barra de progresso animada */}
            <AnimatedCircle
              cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS}
              fill="transparent"
              stroke={currentPhase?.color ?? COLORS.orange}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
            />
          </Svg>

          {/* Texto central */}
          <View style={s.circleCenter}>
            <Text style={[s.phaseLabel, { color: currentPhase?.color ?? COLORS.orange }]}>
              {isActive ? currentPhase?.label : selectedMode.phases[0].label}
            </Text>
            <Text style={[s.countdown, { color: currentPhase?.color ?? COLORS.orange }]}>
              {isActive ? secondsLeft : selectedMode.phases[0].duration}
            </Text>
            <Text style={s.segundos}>SEGUNDOS</Text>
          </View>
        </Animated.View>
      </View>

      {/* Botão */}
      <View style={s.sessionBottom}>
        {!isActive ? (
          <TouchableOpacity style={s.iniciarBtn} onPress={startSession}
            accessibilityRole="button" accessibilityLabel="Iniciar">
            <Text style={s.iniciarIcon}>▶</Text>
            <Text style={s.iniciarText}>INICIAR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.encerrarBtn} onPress={finishSession}
            accessibilityRole="button" accessibilityLabel="Encerrar">
            <Text style={s.encerrarText}>ENCERRAR SESSÃO</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },

  // Seleção
  selHeader:     { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  selTitle:      { fontSize: 13, letterSpacing: 3, color: COLORS.textPrimary, textTransform: 'uppercase' },
  selSubtitle:   { fontSize: 9, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase', marginTop: 2 },
  selHeading:    { fontSize: 34, fontWeight: '300', letterSpacing: 2, color: COLORS.textPrimary, paddingHorizontal: 20, marginTop: 8, lineHeight: 42 },
  selHint:       { fontSize: 12, color: COLORS.textSecondary, paddingHorizontal: 20, marginTop: 8, marginBottom: 24, fontWeight: '300' },
  modeList:      { paddingHorizontal: 20, paddingBottom: 40, gap: 1 },
  modeCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 18, paddingHorizontal: 16, gap: 14 },
  modeLeft:      { width: 36, alignItems: 'center', gap: 4 },
  modeIndex:     { fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1 },
  modeIcon:      { fontSize: 16, color: COLORS.textMedium },
  modeContent:   { flex: 1 },
  modeLabel:     { fontSize: 9, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase', marginBottom: 2 },
  modeSublabel:  { fontSize: 14, color: COLORS.textPrimary, fontWeight: '300', marginBottom: 2 },
  modeDesc:      { fontSize: 11, color: COLORS.textSecondary, fontWeight: '300' },
  modeRight:     { alignItems: 'flex-end', gap: 4 },
  modeDuration:  { fontSize: 13, color: COLORS.textMedium, letterSpacing: 1 },
  modeArrow:     { fontSize: 18, color: COLORS.textSecondary },

  // Sessão
  sessionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  sessionMode:   { fontSize: 13, letterSpacing: 4, color: COLORS.textPrimary, textTransform: 'uppercase', flex: 1, marginLeft: 12 },
  sessionCycle:  { fontSize: 11, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  circleArea:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circleCenter:  {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  phaseLabel:    { fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 },
  countdown:     { fontSize: 64, fontWeight: '200', lineHeight: 68 },
  segundos:      { fontSize: 9, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 4 },
  sessionBottom: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16 },
  iniciarBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', borderRadius: 4, height: 56 },
  iniciarIcon:   { fontSize: 12, color: COLORS.orange },
  iniciarText:   { fontSize: 13, letterSpacing: 4, color: COLORS.orange, textTransform: 'uppercase' },
  encerrarBtn:   { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, height: 56, alignItems: 'center', justifyContent: 'center' },
  encerrarText:  { fontSize: 11, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase' },
  backBtn:       { width: 40, height: 40, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  backBtnText:   { color: COLORS.textPrimary, fontSize: 18 },
});