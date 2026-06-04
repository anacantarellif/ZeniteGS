import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { RootStackParamList, User, SupportPerson } from '../types';
import { saveUser, setFlag } from '../utils/storage';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import { getTimezoneFromCity } from '../utils/missionTime';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const ANCHORS: { key: User['anchor']; emoji: string; label: string }[] = [
  { key: 'family',  emoji: '👨‍👩‍👧', label: 'Família'  },
  { key: 'nature',  emoji: '🌿',     label: 'Natureza' },
  { key: 'music',   emoji: '🎵',     label: 'Música'   },
  { key: 'faith',   emoji: '✦',      label: 'Fé'       },
  { key: 'memory',  emoji: '◈',      label: 'Memória'  },
];

export default function OnboardingScreen({ navigation }: { navigation: Nav }) {
  const [phase, setPhase] = useState<'launch' | 'form'>('launch');
  const [countdown, setCountdown] = useState(3);
  const countAnim  = useRef(new Animated.Value(1)).current;
  const missionAnim = useRef(new Animated.Value(0)).current;

  const [name, setName]               = useState('');
  const [city, setCity]               = useState('');
  const [missionStart, setMissionStart] = useState(new Date().toISOString().split('T')[0]);
  const [anchor, setAnchor]           = useState<User['anchor'] | null>(null);
  const [supportNetwork, setSupportNetwork] = useState<SupportPerson[]>([
    { id: '1', name: '', relation: '' },
  ]);

  useEffect(() => {
    if (phase !== 'launch') return;
    let count = 3;
    const tick = () => {
      Animated.sequence([
        Animated.timing(countAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(countAnim, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          countAnim.setValue(1);
          setTimeout(tick, 100);
        } else {
          Animated.timing(missionAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
          setTimeout(() => setPhase('form'), 1600);
        }
      });
    };
    setTimeout(tick, 500);
  }, [phase, countAnim, missionAnim]);

  const addSupport = () =>
    setSupportNetwork(prev => [...prev, { id: String(Date.now()), name: '', relation: '' }]);

  const updateSupport = (id: string, field: 'name' | 'relation', value: string) =>
    setSupportNetwork(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  const handleStart = async () => {
    if (!name.trim() || !city.trim() || !anchor) return;
    const user: User = {
      name: name.trim(), city: city.trim(),
      timezone: getTimezoneFromCity(city.trim()),
      missionStart, anchor,
      supportNetwork: supportNetwork.filter(p => p.name.trim()),
    };
    await saveUser(user);
    await setFlag('onboardingDone', true);
    navigation.replace('Main');
  };

  // --- LAUNCH PHASE ---
  if (phase === 'launch') {
    return (
      <View style={s.launch}>
        <StarField />
        <ScanLine />
        {countdown > 0 ? (
          <Animated.Text style={[s.countdown, { transform: [{ scale: countAnim }] }]}>
            {countdown}
          </Animated.Text>
        ) : (
          <Animated.Text style={[s.missionText, { opacity: missionAnim }]}>
            MISSÃO INICIADA
          </Animated.Text>
        )}
      </View>
    );
  }

  // --- FORM PHASE ---
  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StarField />
      <ScanLine />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.formHeader}>
          <Text style={s.formTitle}>CONFIGURAÇÃO{'\n'}DE MISSÃO</Text>
          <Text style={s.formSub}>Identificação do astronauta</Text>
        </View>

        {/* Nome */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>NOME DO ASTRONAUTA</Text>
          <TextInput style={s.input} value={name} onChangeText={setName}
            placeholder="Seu nome completo" placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="words" accessibilityLabel="Nome do astronauta" />
        </View>

        {/* Cidade */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>CIDADE NATAL</Text>
          <TextInput style={s.input} value={city} onChangeText={setCity}
            placeholder="Ex: São Paulo" placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="words" accessibilityLabel="Cidade natal" />
        </View>

        {/* Data de início */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>INÍCIO DA MISSÃO</Text>
          <TextInput style={s.input} value={missionStart} onChangeText={setMissionStart}
            placeholder="AAAA-MM-DD" placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric" accessibilityLabel="Data de início" />
        </View>

        {/* Âncora */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>ÂNCORA PESSOAL</Text>
          <Text style={s.fieldHint}>O que te conecta com a Terra</Text>
          <View style={s.anchorGrid}>
            {ANCHORS.map(a => (
              <TouchableOpacity key={a.key}
                style={[s.anchorCard, anchor === a.key && s.anchorCardActive]}
                onPress={() => setAnchor(a.key)}
                accessibilityRole="button" accessibilityLabel={`Âncora: ${a.label}`}
              >
                <Text style={s.anchorEmoji}>{a.emoji}</Text>
                <Text style={[s.anchorLabel, anchor === a.key && { color: COLORS.orange }]}>
                  {a.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rede de apoio */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>REDE DE APOIO</Text>
          <Text style={s.fieldHint}>Quem está na Terra aguardando você</Text>
          {supportNetwork.map(person => (
            <View key={person.id} style={s.supportRow}>
              <TextInput style={[s.input, { flex: 1.5 }]}
                value={person.name} onChangeText={v => updateSupport(person.id, 'name', v)}
                placeholder="Nome" placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words" accessibilityLabel="Nome" />
              <TextInput style={[s.input, { flex: 1 }]}
                value={person.relation} onChangeText={v => updateSupport(person.id, 'relation', v)}
                placeholder="Relação" placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words" accessibilityLabel="Relação" />
            </View>
          ))}
          <TouchableOpacity style={s.addBtn} onPress={addSupport}
            accessibilityRole="button" accessibilityLabel="Adicionar pessoa">
            <Text style={s.addBtnText}>+ ADICIONAR PESSOA</Text>
          </TouchableOpacity>
        </View>

        {/* Botão iniciar */}
        <TouchableOpacity
          style={[s.startBtn, (!name.trim() || !city.trim() || !anchor) && s.startBtnDisabled]}
          onPress={handleStart} disabled={!name.trim() || !city.trim() || !anchor}
          accessibilityRole="button" accessibilityLabel="Iniciar missão"
        >
          <Text style={s.startBtnText}>INICIAR MISSÃO</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  launch:     { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  countdown:  { fontSize: 80, fontWeight: '300', letterSpacing: 10, color: COLORS.orange },
  missionText:{ fontSize: 24, fontWeight: '300', letterSpacing: 6, color: COLORS.textPrimary, textTransform: 'uppercase' },
  container:  { flex: 1, backgroundColor: COLORS.background },
  scroll:     { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  formHeader: { marginBottom: 32 },
  formTitle:  { fontSize: 28, fontWeight: '300', letterSpacing: 4, color: COLORS.textPrimary, textTransform: 'uppercase', lineHeight: 36 },
  formSub:    { fontSize: 12, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 8 },
  field:      { marginBottom: 24 },
  fieldLabel: { fontSize: 10, letterSpacing: 4, color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  fieldHint:  { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12, fontWeight: '300' },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 4, padding: 16, color: COLORS.textPrimary, fontSize: 14, fontWeight: '300',
  },
  anchorGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  anchorCard:      { width: (width - 56) / 3, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, alignItems: 'center' },
  anchorCardActive:{ borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)' },
  anchorEmoji:     { fontSize: 24, marginBottom: 6 },
  anchorLabel:     { fontSize: 9, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase', textAlign: 'center' },
  supportRow:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addBtn:          { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  addBtnText:      { fontSize: 10, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase' },
  startBtn:        { borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', borderRadius: 4, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  startBtnDisabled:{ borderColor: COLORS.border, backgroundColor: 'transparent', opacity: 0.4 },
  startBtnText:    { fontSize: 12, letterSpacing: 4, color: COLORS.orange, textTransform: 'uppercase' },
});