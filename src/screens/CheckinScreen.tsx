import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Line } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { Checkin, MoodLevel } from '../types';
import { saveCheckin, getTodayCheckin, getUser, getLastCheckins } from '../utils/storage';
import { getMissionDay } from '../utils/missionTime';
import { getResultMessage, getCheckinInsight, checkAndSetEmergencyDelivery } from '../utils/checkinLogic';
import PlanetSelector from '../components/PlanetSelector';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

type Q3 = Checkin['q3'];
const Q3_OPTIONS: { key: Q3; label: string }[] = [
  { key: 'family',   label: 'Saudade da família' },
  { key: 'sleep',    label: 'Sono prejudicado' },
  { key: 'overload', label: 'Sobrecarga operacional' },
  { key: 'stable',   label: 'Tudo tranquilo — órbita estável' },
];

export default function CheckinScreen() {
  const [step, setStep]           = useState(0);
  const [q1, setQ1]               = useState<MoodLevel | null>(null);
  const [q2, setQ2]               = useState<MoodLevel | null>(null);
  const [q3, setQ3]               = useState<Q3 | null>(null);
  const [missionDay, setMissionDay] = useState(1);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [insight, setInsight]     = useState('');
  const planetFloat = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => { loadInitial(); }, []));

  useEffect(() => {
    if (step !== 3) return;
    Animated.loop(Animated.sequence([
      Animated.timing(planetFloat, { toValue: -14, duration: 2000, useNativeDriver: true }),
      Animated.timing(planetFloat, { toValue: 0,   duration: 2000, useNativeDriver: true }),
    ])).start();
  }, [step, planetFloat]);

  async function loadInitial() {
    const u = await getUser();
    if (u) setMissionDay(getMissionDay(u.missionStart));
    const done = await getTodayCheckin();
    if (done) { setAlreadyDone(true); setQ1(done.q1); }
    setInsight(getCheckinInsight(await getLastCheckins(3)));
  }

  async function handleConfirm() {
    if (q1 === null || q2 === null || q3 === null) return;
    await saveCheckin({
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      missionDay, q1, q2, q3,
    });
    await checkAndSetEmergencyDelivery();
    setInsight(getCheckinInsight(await getLastCheckins(3)));
    setStep(3);
  }

  // --- JÁ FEZ CHECK-IN ---
  if (alreadyDone) {
    return (
      <View style={s.container}>
        <StarField /><ScanLine /><MarsGlow />
        <View style={s.doneContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Circle cx={30} cy={30} r={28} fill="none" stroke={COLORS.teal} strokeWidth={1.5} />
            <Line x1={18} y1={30} x2={26} y2={39} stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" />
            <Line x1={26} y1={39} x2={42} y2={21} stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={s.doneTitle}>SINAL JÁ REGISTRADO</Text>
          <Text style={s.doneSub}>Check-in concluído hoje · Dia {missionDay}</Text>
          {q1 !== null && (
            <View style={s.doneCard}>
              <Text style={s.doneCardTitle}>ESTADO DE HOJE</Text>
              <Text style={s.doneCardText}>{getResultMessage(q1)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // --- RESULTADO ---
  if (step === 3 && q1 !== null) {
    return (
      <View style={s.container}>
        <StarField /><ScanLine /><MarsGlow />
        <ScrollView contentContainerStyle={s.resultScroll}>
          <Animated.View style={{ transform: [{ translateY: planetFloat }], marginBottom: 24, alignItems: 'center' }}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle cx={60} cy={60} r={50} fill="rgba(232,101,42,0.15)" />
              <Circle cx={60} cy={60} r={38} fill="#c8850a" />
              <Circle cx={60} cy={60} r={38} fill="rgba(232,101,42,0.3)" />
            </Svg>
          </Animated.View>
          <Text style={s.registeredText}>SINAL REGISTRADO</Text>
          <Text style={s.resultMsg}>{getResultMessage(q1)}</Text>
          <View style={s.insightCard}>
            <Text style={s.insightTitle}>ANÁLISE DE TRAJETÓRIA</Text>
            <Text style={s.insightText}>{insight}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- FORMULÁRIO ---
  return (
    <View style={s.container}>
      <StarField /><ScanLine /><MarsGlow />
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <Text style={s.headerTitle}>SINAL DE VIDA</Text>
          <Text style={s.headerSub}>
            Check-in · <Text style={{ color: COLORS.orange }}>Dia {missionDay}</Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={s.progressBar}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[
              s.progressSeg,
              i < step  && s.progressDone,
              i === step && s.progressActive,
            ]} />
          ))}
        </View>

        {/* Pergunta 1 */}
        {step === 0 && (
          <View style={s.questionSection}>
            <Text style={s.questionTitle}>
              Como está sua <Text style={{ color: COLORS.orange }}>PRESSÃO INTERNA</Text> hoje, astronauta?
            </Text>
            <PlanetSelector selected={q1} onSelect={setQ1} />
            <TouchableOpacity
              style={[s.nextBtn, q1 === null && s.nextBtnDisabled]}
              onPress={() => setStep(1)} disabled={q1 === null}
              accessibilityRole="button" accessibilityLabel="Próxima pergunta"
            >
              <Text style={[s.nextBtnText, q1 === null && { color: COLORS.textSecondary }]}>
                PRÓXIMA PERGUNTA →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pergunta 2 */}
        {step === 1 && (
          <View style={s.questionSection}>
            <Text style={s.questionTitle}>
              Sua <Text style={{ color: COLORS.orange }}>ENERGIA DE PROPULSÃO</Text> está em qual nível?
            </Text>
            <PlanetSelector selected={q2} onSelect={setQ2} />
            <TouchableOpacity
              style={[s.nextBtn, q2 === null && s.nextBtnDisabled]}
              onPress={() => setStep(2)} disabled={q2 === null}
              accessibilityRole="button" accessibilityLabel="Próxima pergunta"
            >
              <Text style={[s.nextBtnText, q2 === null && { color: COLORS.textSecondary }]}>
                PRÓXIMA PERGUNTA →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pergunta 3 */}
        {step === 2 && (
          <View style={s.questionSection}>
            <Text style={s.questionTitle}>
              Algo <Text style={{ color: COLORS.orange }}>INTERFERINDO NA SUA TRAJETÓRIA</Text> hoje?
            </Text>
            {Q3_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.key}
                style={[s.q3Option, q3 === opt.key && s.q3OptionActive]}
                onPress={() => setQ3(opt.key)}
                accessibilityRole="button" accessibilityLabel={opt.label}
              >
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Circle cx={8} cy={8} r={6}
                    fill={q3 === opt.key ? COLORS.orange : 'none'}
                    stroke={q3 === opt.key ? COLORS.orange : COLORS.textSecondary}
                    strokeWidth={1.2}
                  />
                </Svg>
                <Text style={[s.q3Text, q3 === opt.key && { color: COLORS.textPrimary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.confirmBtn, q3 === null && s.nextBtnDisabled]}
              onPress={handleConfirm} disabled={q3 === null}
              accessibilityRole="button" accessibilityLabel="Registrar sinal de vida"
            >
              <Text style={[s.nextBtnText, q3 === null && { color: COLORS.textSecondary }]}>
                REGISTRAR SINAL DE VIDA ✓
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  scroll:         { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header:         { marginBottom: 24 },
  headerTitle:    { fontSize: 22, fontWeight: '300', letterSpacing: 5, color: COLORS.textPrimary, textTransform: 'uppercase', marginBottom: 4 },
  headerSub:      { fontSize: 12, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  progressBar:    { flexDirection: 'row', gap: 6, marginBottom: 32 },
  progressSeg:    { flex: 1, height: 2, backgroundColor: COLORS.border, borderRadius: 1 },
  progressDone:   { backgroundColor: COLORS.orange },
  progressActive: { backgroundColor: 'rgba(232,101,42,0.4)' },
  questionSection:{ gap: 16 },
  questionTitle:  { fontSize: 16, fontWeight: '300', color: COLORS.textPrimary, lineHeight: 24 },
  nextBtn:        { borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', borderRadius: 4, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  nextBtnDisabled:{ borderColor: COLORS.border, backgroundColor: 'transparent', opacity: 0.4 },
  nextBtnText:    { fontSize: 11, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase' },
  q3Option:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, minHeight: 56 },
  q3OptionActive: { borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)' },
  q3Text:         { fontSize: 14, color: COLORS.textMedium, fontWeight: '300', flex: 1 },
  confirmBtn:     { borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', borderRadius: 4, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  // Resultado
  resultScroll:   { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  registeredText: { fontSize: 18, letterSpacing: 5, color: COLORS.textPrimary, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 },
  resultMsg:      { fontSize: 14, color: COLORS.textMedium, fontWeight: '300', lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  insightCard:    { width: '100%', borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.04)', borderRadius: 4, padding: 16 },
  insightTitle:   { fontSize: 9, letterSpacing: 4, color: COLORS.orange, textTransform: 'uppercase', marginBottom: 8 },
  insightText:    { fontSize: 13, color: COLORS.textMedium, fontWeight: '300', lineHeight: 20 },
  // Já feito
  doneContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  doneTitle:      { fontSize: 18, letterSpacing: 4, color: COLORS.teal, textTransform: 'uppercase' },
  doneSub:        { fontSize: 13, color: COLORS.textSecondary, fontWeight: '300' },
  doneCard:       { width: '100%', borderWidth: 1, borderColor: 'rgba(74,158,142,0.3)', backgroundColor: 'rgba(74,158,142,0.04)', borderRadius: 4, padding: 16, marginTop: 8 },
  doneCardTitle:  { fontSize: 9, letterSpacing: 4, color: COLORS.teal, textTransform: 'uppercase', marginBottom: 8 },
  doneCardText:   { fontSize: 13, color: COLORS.textMedium, fontWeight: '300', lineHeight: 20 },
});