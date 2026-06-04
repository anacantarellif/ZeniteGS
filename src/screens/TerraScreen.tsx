import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { DeliveredMessage, Message, User } from '../types';
import { getUser, getDeliveredMessages, markMessageOpened } from '../utils/storage';
import { getMessageForToday } from '../utils/checkinLogic';
import { getMissionDay } from '../utils/missionTime';
import { MESSAGES } from '../utils/messages';
import BottomSheet from '../components/BottomSheet';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

function typeIcon(type: Message['type']) {
  return { video: '▶', audio: '♪', photo: '▣', text: '✉' }[type];
}

export default function TerraScreen() {
  const [user, setUser]               = useState<User | null>(null);
  const [missionDay, setMissionDay]   = useState(1);
  const [delivered, setDelivered]     = useState<DeliveredMessage[]>([]);
  const [todayMessage, setTodayMessage] = useState<Message | null>(null);
  const [selected, setSelected]       = useState<Message | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  const envY   = useRef(new Animated.Value(0)).current;
  const envRot = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(envY,   { toValue: -10, duration: 1750, useNativeDriver: true }),
        Animated.timing(envY,   { toValue: 0,   duration: 1750, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(envRot, { toValue: 1,  duration: 1750, useNativeDriver: true }),
        Animated.timing(envRot, { toValue: -1, duration: 1750, useNativeDriver: true }),
        Animated.timing(envRot, { toValue: 0,  duration: 1750, useNativeDriver: true }),
      ]),
    ])).start();
  }, [envY, envRot]);

  const envRotDeg = envRot.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-2deg', '0deg', '2deg'] });

  async function loadData() {
    const u = await getUser();
    setUser(u);
    if (u) {
      setMissionDay(getMissionDay(u.missionStart));
      const msg = await getMessageForToday(u.missionStart);
      setTodayMessage(msg);
    }
    setDelivered(await getDeliveredMessages());
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    setSheetVisible(true);
    markMessageOpened(msg.id);
  }

  function openEnvelope() {
    if (!todayMessage) return;
    setEnvelopeOpened(true);
    openMessage(todayMessage);
  }

  const deliveredWithData = delivered
    .map(d => { const msg = MESSAGES.find(m => m.id === d.messageId); return msg ? { ...d, msg } : null; })
    .filter(Boolean) as (DeliveredMessage & { msg: Message })[];

  const pendingCount = MESSAGES.length - delivered.length;

  return (
    <View style={s.container}>
      <StarField /><ScanLine /><MarsGlow />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.headerTitle}>SINAL DA TERRA</Text>
          <Text style={s.headerSub}>
            <Text style={{ color: COLORS.orange }}>{deliveredWithData.length}</Text> mensagens · Dia {missionDay}
          </Text>
        </View>

        {/* Envelope hero */}
        <View style={s.heroCard}>
          <Animated.Text style={[s.envIcon, { transform: [{ translateY: envY }, { rotate: envRotDeg }] }]}>
            ✉
          </Animated.Text>
          <Text style={s.heroTitle}>SURPRESA ESPECIAL DE HOJE</Text>
          <Text style={s.heroSub}>O ORBIT escolheu o momento certo para entregar esta mensagem</Text>
          <TouchableOpacity
            style={[s.openBtn, envelopeOpened && s.openBtnDone]}
            onPress={openEnvelope}
            disabled={!todayMessage}
            accessibilityRole="button" accessibilityLabel="Abrir mensagem de hoje"
          >
            <Text style={[s.openBtnText, (!todayMessage || envelopeOpened) && { color: COLORS.textSecondary }]}>
              {envelopeOpened ? 'MENSAGEM ABERTA' : todayMessage ? 'ABRIR AGORA' : 'NENHUMA NOVA MENSAGEM'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fila */}
        <View style={s.queueCard}>
          <Text style={s.queueIcon}>⏱</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.queueCount}>{pendingCount} MENSAGENS AGUARDANDO</Text>
            <Text style={s.queueSub}>O ORBIT entrega no momento certo · delay respeitado</Text>
          </View>
        </View>

        {/* Lista de entregues */}
        {deliveredWithData.length > 0 && (
          <>
            <Text style={s.sectionLabel}>MENSAGENS RECEBIDAS</Text>
            {deliveredWithData.map(item => (
              <TouchableOpacity key={item.messageId} style={s.msgCard}
                onPress={() => openMessage(item.msg)}
                accessibilityRole="button" accessibilityLabel={`Mensagem de ${item.msg.sender}`}
              >
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.msg.sender.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.msgSender}>{item.msg.sender.toUpperCase()}</Text>
                  <Text style={s.msgPreview} numberOfLines={2}>{item.msg.content}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={s.msgMeta}>{typeIcon(item.msg.type)} {item.msg.type}</Text>
                    <Text style={[s.msgMeta, { color: COLORS.orange }]}>D{item.msg.day}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

      </ScrollView>

      {/* Bottom sheet da mensagem */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} sheetHeight={500}>
        {selected && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.sheetTag}>
              <View style={s.tagLine} />
              <Text style={s.tagText}>SINAL DA TERRA · DIA {selected.day}</Text>
              <View style={s.tagLine} />
            </View>
            <View style={s.sheetSender}>
              <View style={s.sheetAvatar}>
                <Text style={s.sheetAvatarText}>{selected.sender.charAt(0)}</Text>
              </View>
              <View>
                <Text style={s.sheetSenderName}>{selected.sender.toUpperCase()}</Text>
                <Text style={s.sheetRelation}>{selected.relation}</Text>
              </View>
            </View>
            <View style={s.sheetMsg}>
              <Text style={s.sheetMsgText}>{selected.content}</Text>
            </View>
            <Text style={s.sheetNote}>▲ O ORBIT entregou esta mensagem no momento certo ▲</Text>
          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  scroll:         { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header:         { marginBottom: 20 },
  headerTitle:    { fontSize: 22, fontWeight: '300', letterSpacing: 5, color: COLORS.textPrimary, textTransform: 'uppercase', marginBottom: 4 },
  headerSub:      { fontSize: 12, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  heroCard:       { backgroundColor: 'rgba(232,101,42,0.03)', borderWidth: 1, borderColor: 'rgba(232,101,42,0.2)', borderRadius: 4, padding: 32, alignItems: 'center', marginBottom: 16 },
  envIcon:        { fontSize: 56, marginBottom: 16 },
  heroTitle:      { fontSize: 14, letterSpacing: 3, color: COLORS.textPrimary, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 },
  heroSub:        { fontSize: 12, color: COLORS.textSecondary, fontWeight: '300', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  openBtn:        { borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', borderRadius: 4, height: 56, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  openBtnDone:    { borderColor: COLORS.teal, backgroundColor: 'rgba(74,158,142,0.06)' },
  openBtnText:    { fontSize: 11, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase' },
  queueCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 16, marginBottom: 24 },
  queueIcon:      { fontSize: 20, color: COLORS.textSecondary },
  queueCount:     { fontSize: 10, letterSpacing: 3, color: COLORS.textPrimary, textTransform: 'uppercase' },
  queueSub:       { fontSize: 11, color: COLORS.textSecondary, fontWeight: '300', marginTop: 2 },
  sectionLabel:   { fontSize: 9, letterSpacing: 4, color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
  msgCard:        { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 14, marginBottom: 8 },
  avatar:         { width: 40, height: 40, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(232,101,42,0.3)', backgroundColor: 'rgba(232,101,42,0.06)', alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 18, color: COLORS.orange },
  msgSender:      { fontSize: 10, letterSpacing: 2, color: COLORS.textPrimary, marginBottom: 4 },
  msgPreview:     { fontSize: 12, color: COLORS.textSecondary, fontWeight: '300', lineHeight: 18 },
  msgMeta:        { fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1 },
  // Sheet
  sheetTag:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  tagLine:        { flex: 1, height: 1, backgroundColor: COLORS.border },
  tagText:        { fontSize: 9, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase' },
  sheetSender:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetAvatar:    { width: 48, height: 48, borderRadius: 4, borderWidth: 1, borderColor: COLORS.orange, backgroundColor: 'rgba(232,101,42,0.06)', alignItems: 'center', justifyContent: 'center' },
  sheetAvatarText:{ fontSize: 22, color: COLORS.orange },
  sheetSenderName:{ fontSize: 12, letterSpacing: 2, color: COLORS.textPrimary, textTransform: 'uppercase' },
  sheetRelation:  { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  sheetMsg:       { borderLeftWidth: 2, borderLeftColor: COLORS.orange, paddingLeft: 16, marginBottom: 20 },
  sheetMsgText:   { fontSize: 14, color: COLORS.textPrimary, fontStyle: 'italic', fontWeight: '300', lineHeight: 22 },
  sheetNote:      { fontSize: 10, color: 'rgba(232,101,42,0.7)', textAlign: 'center', letterSpacing: 1, marginBottom: 8 },
});