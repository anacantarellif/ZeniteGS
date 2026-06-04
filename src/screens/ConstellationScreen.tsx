import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Line, Text as SvgText, Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { User, Checkin } from '../types';
import { getUser, getCheckins } from '../utils/storage';
import { getMissionDay } from '../utils/missionTime';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

const { width } = Dimensions.get('window');
const SVG_H = 280;
const CENTER_X = width / 2;
const CENTER_Y = SVG_H / 2;

const STAR_POSITIONS = [
  { x: 60,  y: 80  },
  { x: 160, y: 60  },
  { x: 270, y: 90  },
  { x: 310, y: 170 },
  { x: 80,  y: 200 },
];

const MOOD_COLORS: Record<number, string> = {
  0: COLORS.red,
  1: '#7a3520',
  2: COLORS.orange,
  3: COLORS.teal,
  4: '#e8c52a',
};

export default function ConstellationScreen() {
  const [user, setUser]           = useState<User | null>(null);
  const [checkins, setCheckins]   = useState<Checkin[]>([]);
  const [missionDay, setMissionDay] = useState(1);
  const corePulse = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(corePulse, { toValue: 1.25, duration: 1200, useNativeDriver: true }),
      Animated.timing(corePulse, { toValue: 1,    duration: 1200, useNativeDriver: true }),
    ])).start();
  }, [corePulse]);

  async function loadData() {
    const u = await getUser();
    setUser(u);
    if (u) setMissionDay(getMissionDay(u.missionStart));
    const all = await getCheckins();
    setCheckins(all.slice(-14));
  }

  const network  = user?.supportNetwork ?? [];
  const last14   = checkins.slice(-14);
  const chartW   = width - 40;
  const chartH   = 80;
  const spacing  = last14.length > 1 ? chartW / (last14.length - 1) : 0;

  function buildPath() {
    if (last14.length === 0) return '';
    return 'M' + last14.map((c, i) => {
      const x = 20 + i * spacing;
      const y = chartH - (c.q1 / 4) * (chartH - 10) - 5;
      return `${x},${y}`;
    }).join(' L');
  }

  function getTrend() {
    if (last14.length < 3) return 'em avaliação';
    const recent = last14.slice(-3).reduce((s, c) => s + c.q1, 0) / 3;
    const older  = last14.slice(0,  3).reduce((s, c) => s + c.q1, 0) / 3;
    if (recent > older + 0.5) return 'em ascensão';
    if (recent < older - 0.5) return 'em queda';
    return 'estável';
  }

  return (
    <View style={s.container}>
      <StarField /><ScanLine /><MarsGlow />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.headerTitle}>CONSTELAÇÃO</Text>
          <Text style={s.headerSub}>Missão · {missionDay} dias</Text>
        </View>

        {/* SVG da constelação */}
        <View style={{ position: 'relative', marginBottom: 24 }}>
          <Svg width={width} height={SVG_H}>
            {/* Linhas centro → estrelas */}
            {network.slice(0, 5).map((_, i) => {
              const pos = STAR_POSITIONS[i] ?? { x: CENTER_X, y: CENTER_Y };
              return (
                <Line key={`ln${i}`}
                  x1={CENTER_X} y1={CENTER_Y} x2={pos.x} y2={pos.y}
                  stroke="rgba(232,101,42,0.15)" strokeWidth={0.8}
                />
              );
            })}

            {/* Estrelas da rede */}
            {network.slice(0, 5).map((person, i) => {
              const pos   = STAR_POSITIONS[i] ?? { x: 50, y: 50 };
              const color = i % 2 === 0 ? COLORS.orange : COLORS.teal;
              return (
                <React.Fragment key={`st${i}`}>
                  <Circle cx={pos.x} cy={pos.y} r={10} fill={`${color}22`} />
                  <Circle cx={pos.x} cy={pos.y} r={5}  fill={color} opacity={0.8} />
                  <SvgText x={pos.x} y={pos.y + 20} fontSize={7}
                    fill={COLORS.textSecondary} textAnchor="middle" letterSpacing={2}>
                    {person.name.toUpperCase().split(' ')[0]}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Centro — astronauta */}
            <Circle cx={CENTER_X} cy={CENTER_Y} r={22} fill="rgba(232,101,42,0.06)" />
            <Circle cx={CENTER_X} cy={CENTER_Y} r={14} fill="rgba(232,101,42,0.15)" />
            <Circle cx={CENTER_X} cy={CENTER_Y} r={7}  fill={COLORS.orange} />
          </Svg>

          {/* Pulso animado sobre o centro */}
          <Animated.View style={[s.corePulse, {
            left: CENTER_X - 22, top: CENTER_Y - 22,
            transform: [{ scale: corePulse }],
          }]} />
        </View>

        {/* Gráfico de trajetória */}
        <View style={s.chartSection}>
          <Text style={s.sectionLabel}>TRAJETÓRIA EMOCIONAL · ÚLTIMOS {last14.length} REGISTROS</Text>
          {last14.length > 0 ? (
            <Svg width={chartW} height={chartH + 30}>
              <Path d={buildPath()} fill="none" stroke="rgba(232,101,42,0.4)" strokeWidth={1.5} />
              {last14.map((c, i) => {
                const x = 20 + i * spacing;
                const y = chartH - (c.q1 / 4) * (chartH - 10) - 5;
                return (
                  <React.Fragment key={`pt${i}`}>
                    <Circle cx={x} cy={y} r={4} fill={MOOD_COLORS[c.q1] ?? COLORS.orange} />
                    <SvgText x={x} y={chartH + 16} fontSize={7} fill={COLORS.textSecondary} textAnchor="middle">
                      D{c.missionDay}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          ) : (
            <View style={s.emptyChart}>
              <Text style={s.emptyText}>Sem dados ainda. Faça seu primeiro check-in.</Text>
            </View>
          )}
        </View>

        {/* Card de insight */}
        <View style={s.insightCard}>
          <Text style={s.insightLabel}>ANÁLISE DE MISSÃO</Text>
          <Text style={s.insightText}>
            Nos últimos {last14.length} dias, sua trajetória esteve{' '}
            <Text style={{ color: COLORS.orange }}>{getTrend()}</Text>.
            {last14.length === 0 && ' Faça seu primeiro check-in para iniciar o mapeamento emocional.'}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  scroll:       { paddingBottom: 40 },
  header:       { paddingHorizontal: 20, paddingTop: 56, marginBottom: 16 },
  headerTitle:  { fontSize: 22, fontWeight: '300', letterSpacing: 5, color: COLORS.textPrimary, textTransform: 'uppercase', marginBottom: 4 },
  headerSub:    { fontSize: 12, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  corePulse:    { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(232,101,42,0.08)' },
  chartSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 9, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 16 },
  emptyChart:   { height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  emptyText:    { fontSize: 12, color: COLORS.textSecondary, fontWeight: '300' },
  insightCard:  { marginHorizontal: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: 4, padding: 16 },
  insightLabel: { fontSize: 9, letterSpacing: 4, color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  insightText:  { fontSize: 13, color: COLORS.textMedium, fontWeight: '300', lineHeight: 20 },
});