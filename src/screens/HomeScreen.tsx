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

const modules = [
  {
    title: 'SINAL DA TERRA',
    sub: '3 mensagens esperando',
    badge: '3',
    tab: 'Terra' as const,
    icon: Radio,
  },
  {
    title: 'ESTABILIZAR',
    sub: 'Saúde mental',
    action: 'estabilizar' as const,
    icon: Brain,
  },
  {
    title: 'LOG DE MISSÃO',
    sub: `Último: D${missionDay - 1}`,
    badge: `D${missionDay}`,
    badgeColor: COLORS.teal,
    tab: 'Log' as const,
    icon: NotebookPen,
  },
  {
    title: 'CONSTELAÇÃO',
    sub: 'Mapa emocional',
    tab: 'Constellation' as const,
    icon: Waypoints,
  },
];

  return (
<View style={s.grid}>
  {modules.map((m, i) => (
    <TouchableOpacity
      key={i}
      style={s.moduleCard}
      onPress={() => {
        if ('action' in m && m.action === 'estabilizar') {
          rootNav.navigate('Estabilizar');
          return;
        }

        if ('tab' in m && m.tab) {
          navigation.navigate(m.tab);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={m.title}
    >
      <View style={{ marginBottom: 12 }}>
        <m.icon
          size={22}
          color={COLORS.orange}
          strokeWidth={1.5}
        />
      </View>

      {!!m.badge && (
        <View
          style={[
            s.moduleBadge,
            {
              backgroundColor:
                m.badgeColor ?? COLORS.orange,
            },
          ]}
        >
          <Text style={s.moduleBadgeText}>
            {m.badge}
          </Text>
        </View>
      )}

      <Text style={s.moduleTitle}>
        {m.title}
      </Text>

      <Text style={s.moduleSub}>
        {m.sub}
      </Text>
    </TouchableOpacity>
  ))}
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