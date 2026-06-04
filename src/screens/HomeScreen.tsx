import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Svg, { Circle, Line } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { BottomTabParamList, RootStackParamList, User } from '../types';
import { getUser, getTodayCheckin, getStreak, getCheckins } from '../utils/storage';
import { getMissionDay, getEarthTime, getWeekDays } from '../utils/missionTime';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';
import OrbitAnimation from '../components/OrbitAnimation';
import { StackNavigationProp } from '@react-navigation/stack';
import {  Radio,  Brain,  NotebookPen,  Waypoints } from 'lucide-react-native';


type Nav = BottomTabNavigationProp<BottomTabParamList>;
type RootNav = StackNavigationProp<RootStackParamList>;


export default function HomeScreen() {
  const rootNav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = useNavigation<Nav>();
  const [user, setUser]                 = useState<User | null>(null);
  const [missionDay, setMissionDay]     = useState(1);
  const [streak, setStreak]             = useState(0);
  const [hasCheckinToday, setHasCheckinToday] = useState(false);
  const [earthTime, setEarthTime]       = useState('--:--');
  const [weekDays, setWeekDays]         = useState(getWeekDays());
  const [notifVisible, setNotifVisible] = useState(false);

  const pipScale   = useRef(new Animated.Value(1)).current;
  const pipOpacity = useRef(new Animated.Value(1)).current;
  const dotAnim    = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(pipScale,   { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pipScale,   { toValue: 1,   duration: 700, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(pipOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(pipOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(dotAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      Animated.timing(dotAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
    ])).start();
    const interval = setInterval(() => {
      if (user?.timezone) setEarthTime(getEarthTime(user.timezone));
    }, 10000);
    return () => clearInterval(interval);
  }, [pipScale, pipOpacity, dotAnim, user]);

  async function loadData() {
    const u = await getUser();
    setUser(u);
    if (u) {
      setMissionDay(getMissionDay(u.missionStart));
      setEarthTime(getEarthTime(u.timezone));
    }
    setHasCheckinToday(!!(await getTodayCheckin()));
    setStreak(await getStreak());
    const checkins = await getCheckins();
    const dates = new Set(checkins.map(c => c.date));
    setWeekDays(getWeekDays().map(d => ({ ...d, hasCheckin: dates.has(d.date) })));
  }

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'BOM DIA,' : h < 18 ? 'BOA TARDE,' : 'BOA NOITE,';
  };

  return (
    <View style={s.container}>
      <StarField />
      <ScanLine />
      <MarsGlow />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.badge}>
            <Text style={s.badgeText}>ISS · MISSÃO ATIVA</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => rootNav.navigate('Breathing', { mode: 'maintenance' })}
            accessibilityRole="button" accessibilityLabel="Notificações">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Circle cx={11} cy={5} r={7} fill="none" stroke={COLORS.textMedium} strokeWidth={1.2} />
              <Line x1={8} y1={19} x2={14} y2={19} stroke={COLORS.textMedium} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
            <Animated.View style={[s.pip, { transform: [{ scale: pipScale }], opacity: pipOpacity }]} />
          </TouchableOpacity>
        </View>

        {/* Órbita */}
        <View style={s.orbitSection}>
          <OrbitAnimation />
          <Text style={s.orbitLabel}>408 KM · 27.600 KM/H</Text>
        </View>

        {/* Saudação */}
        <View style={s.greetingSection}>
          <Text style={s.astronautLabel}>ASTRONAUTA · {user?.name?.toUpperCase() ?? '---'}</Text>
          <Text style={s.greetingTitle}>
            {greeting()}{'\n'}COMO ESTÁ SUA <Text style={{ color: COLORS.orange }}>ÓRBITA</Text> HOJE?
          </Text>
          <View style={s.missionPill}>
            <Animated.View style={[s.missionDot, { opacity: dotAnim }]} />
            <Text style={s.missionPillText}>DIA {missionDay} DE MISSÃO</Text>
          </View>
        </View>

        {/* Card check-in */}
        {!hasCheckinToday ? (
          <TouchableOpacity style={s.checkinCard} onPress={() => navigation.navigate('Checkin')}
            accessibilityRole="button" accessibilityLabel="Ir para check-in">
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Circle cx={10} cy={10} r={8} fill="none" stroke={COLORS.orange} strokeWidth={1.2} />
              <Circle cx={10} cy={10} r={3} fill={COLORS.orange} />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={s.checkinTitle}>CHECK-IN PENDENTE</Text>
              <Text style={s.checkinSub}>Registre seu sinal de vida — Dia {missionDay}</Text>
            </View>
            <Text style={{ fontSize: 20, color: COLORS.orange }}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={[s.checkinCard, s.checkinDone]}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Circle cx={10} cy={10} r={8} fill="none" stroke={COLORS.teal} strokeWidth={1.2} />
              <Line x1={6} y1={10} x2={9} y2={13} stroke={COLORS.teal} strokeWidth={1.5} strokeLinecap="round" />
              <Line x1={9} y1={13} x2={14} y2={7} stroke={COLORS.teal} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={[s.checkinTitle, { color: COLORS.teal }]}>SINAL REGISTRADO</Text>
              <Text style={s.checkinSub}>Check-in concluído hoje · Dia {missionDay}</Text>
            </View>
          </View>
        )}

        {/* Grid de módulos */}
        <View style={s.grid}>
          {[
            { title: 'SINAL DA TERRA', sub: '3 mensagens esperando', badge: '3', tab: 'Terra' as const, icon: Radio, },
            { title: 'ESTABILIZAR', sub: 'Saúde mental', badge: '', tab: 'Checkin' as const, icon: Brain,},
            { title: 'LOG DE MISSÃO', sub: `Último: D${missionDay-1}`, badge: `D${missionDay}`, badgeColor: COLORS.teal, tab: 'Log' as const, icon: NotebookPen, },
            { title: 'CONSTELAÇÃO', sub: 'Mapa emocional', badge: '', tab: 'Constellation' as const, icon: Waypoints, },
          ].map((m, i) => (
            <TouchableOpacity key={i} style={s.moduleCard}
              onPress={() => navigation.navigate(m.tab)}
              accessibilityRole="button" accessibilityLabel={m.title}>
              {!!m.badge && (
                <View style={[s.moduleBadge, { backgroundColor: m.badgeColor ?? COLORS.orange }]}>
                  <Text style={s.moduleBadgeText}>{m.badge}</Text>
                </View>
              )}
              <Text style={s.moduleTitle}>{m.title}</Text>
              <Text style={s.moduleSub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Streak */}
        <View style={s.streakCard}>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.streakNum}>{streak}</Text>
            <Text style={s.streakLabel}>dias consecutivos</Text>
          </View>
          <View style={s.streakDots}>
            {weekDays.map((d, i) => (
              <View key={i} style={[
                s.streakDot,
                d.hasCheckin && s.streakDotFilled,
                d.date === new Date().toISOString().split('T')[0] && s.streakDotToday,
              ]} />
            ))}
          </View>
        </View>

        {/* Hora na Terra */}
        <View style={s.earthCard}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Circle cx={10} cy={10} r={8} fill="none" stroke={COLORS.textMedium} strokeWidth={1.2} />
            <Line x1={2}  y1={10} x2={18} y2={10} stroke={COLORS.textMedium} strokeWidth={0.8} />
            <Line x1={10} y1={2}  x2={10} y2={18} stroke={COLORS.textMedium} strokeWidth={0.8} />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={s.earthLabel}>HORA NA CIDADE NATAL</Text>
            <Text style={s.earthCity}>{user?.city ?? '---'}</Text>
          </View>
          <Text style={s.earthTime}>{earthTime}</Text>
        </View>

      </ScrollView>

      {/* Modal de notificação */}
      <Modal visible={notifVisible} transparent animationType="slide" onRequestClose={() => setNotifVisible(false)}>
        <TouchableOpacity style={s.backdrop} onPress={() => setNotifVisible(false)} accessibilityRole="button">
          <View style={s.notifSheet}>
            <View style={s.notifHandle} />
            <Text style={s.notifTitle}>ALERTAS DA MISSÃO</Text>
            <View style={{ padding: 12, backgroundColor: COLORS.background, borderRadius: 4 }}>
              <Text style={{ fontSize: 13, color: COLORS.textMedium, fontWeight: '300' }}>
                Novo sinal da Terra disponível no módulo Terra.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  scroll:         { paddingBottom: 32 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8, zIndex: 10 },
  badge:          { borderWidth: 1, borderColor: 'rgba(232,101,42,0.25)', backgroundColor: 'rgba(232,101,42,0.04)', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText:      { fontSize: 9, letterSpacing: 4, color: COLORS.orange, textTransform: 'uppercase' },
  bellBtn:        { padding: 8, position: 'relative' },
  pip:            { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange },
  orbitSection:   { alignItems: 'center', paddingVertical: 16 },
  orbitLabel:     { fontSize: 10, color: COLORS.orange, letterSpacing: 2, textTransform: 'uppercase', marginTop: 8, fontFamily: 'monospace' },
  greetingSection:{ paddingHorizontal: 20, marginBottom: 20 },
  astronautLabel: { fontSize: 10, letterSpacing: 5, color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  greetingTitle:  { fontSize: 26, fontWeight: '300', letterSpacing: 2, color: COLORS.textPrimary, textTransform: 'uppercase', lineHeight: 34, marginBottom: 12 },
  missionPill:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(232,101,42,0.2)', backgroundColor: 'rgba(232,101,42,0.04)', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start', gap: 8 },
  missionDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.orange },
  missionPillText:{ fontSize: 9, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase' },
  checkinCard:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(232,101,42,0.3)', backgroundColor: 'rgba(232,101,42,0.04)', borderRadius: 4, gap: 12, minHeight: 56 },
  checkinDone:    { borderColor: 'rgba(74,158,142,0.3)', backgroundColor: 'rgba(74,158,142,0.04)' },
  checkinTitle:   { fontSize: 11, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase', marginBottom: 2 },
  checkinSub:     { fontSize: 12, color: COLORS.textSecondary, fontWeight: '300' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  moduleCard:     { width: '47.5%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 16, minHeight: 100, position: 'relative' },
  moduleBadge:    { position: 'absolute', top: 10, right: 10, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  moduleBadgeText:{ fontSize: 9, fontWeight: '700', color: COLORS.background },
  moduleTitle:    { fontSize: 10, letterSpacing: 2, color: COLORS.textPrimary, textTransform: 'uppercase', marginTop: 10, marginBottom: 4 },
  moduleSub:      { fontSize: 11, color: COLORS.textSecondary, fontWeight: '300' },
  streakCard:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, marginBottom: 12, gap: 16 },
  streakNum:      { fontSize: 32, fontWeight: '300', color: COLORS.orange, lineHeight: 36 },
  streakLabel:    { fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1 },
  streakDots:     { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  streakDot:      { width: 20, height: 20, borderRadius: 3, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  streakDotFilled:{ backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  streakDotToday: { borderColor: COLORS.orange, borderWidth: 2 },
  earthCard:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, gap: 12 },
  earthLabel:     { fontSize: 9, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase' },
  earthCity:      { fontSize: 13, color: COLORS.textMedium, fontWeight: '300', marginTop: 2 },
  earthTime:      { fontSize: 22, letterSpacing: 3, color: COLORS.teal, fontFamily: 'monospace', fontWeight: '300' },
  backdrop:       { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  notifSheet:     { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, borderTopLeftRadius: 4, borderTopRightRadius: 4, padding: 20, paddingBottom: 40 },
  notifHandle:    { width: 40, height: 3, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  notifTitle:     { fontSize: 11, letterSpacing: 4, color: COLORS.textPrimary, textTransform: 'uppercase', marginBottom: 16 },
});