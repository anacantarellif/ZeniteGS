import React, { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { DiaryEntry, Checkin } from '../types';
import { saveDiaryEntry, getDiaryEntries, getUser, getTodayCheckin } from '../utils/storage';
import { getMissionDay } from '../utils/missionTime';
import { getDiaryPrompt } from '../utils/checkinLogic';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

const MOOD_EMOJIS = ['💀', '😔', '😐', '🙂', '⭐'];

export default function LogScreen() {
  const [text, setText]           = useState('');
  const [mood, setMood]           = useState<Checkin['q1'] | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [entries, setEntries]     = useState<DiaryEntry[]>([]);
  const [missionDay, setMissionDay] = useState(1);
  const [prompt, setPrompt]       = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [modalVisible, setModalVisible]   = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    const u = await getUser();
    if (u) setMissionDay(getMissionDay(u.missionStart));
    const checkin = await getTodayCheckin();
    setPrompt(getDiaryPrompt(checkin?.q1 ?? null));
    const all = await getDiaryEntries();
    setEntries(all.slice().reverse());
  }

  async function handleSave() {
    if (!text.trim()) return;
    await saveDiaryEntry({
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      missionDay, text: text.trim(), mood,
      timestamp: Date.now(),
    });
    setText(''); setMood(null);
    await loadData();
  }

  return (
    <View style={s.container}>
      <StarField /><ScanLine /><MarsGlow />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.headerTitle}>LOG DE MISSÃO</Text>
          <Text style={s.headerSub}>Dia <Text style={{ color: COLORS.orange }}>{missionDay}</Text> · Registro de hoje</Text>
        </View>

        {/* Prompt */}
        <View style={s.promptCard}>
          <View style={s.promptHeader}>
            <View style={s.promptDot} />
            <Text style={s.promptLabel}>PROMPT DO DIA · BASEADO NO SEU HUMOR</Text>
          </View>
          <Text style={s.promptText}>{prompt}</Text>
        </View>

        {/* Input */}
        <TextInput
          style={s.input} value={text} onChangeText={setText}
          multiline textAlignVertical="top"
          placeholder="Escreva seus pensamentos aqui, astronauta. Este espaço é só seu..."
          placeholderTextColor={COLORS.textSecondary}
          accessibilityLabel="Campo de entrada do diário"
        />

        {/* Toolbar */}
        <View style={s.toolbar}>
          <TouchableOpacity style={s.toolbarBtn} accessibilityRole="button" accessibilityLabel="Gravar voz">
            <Text style={s.toolbarBtnText}>♪ VOZ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toolbarBtn, showMoodPicker && { borderColor: COLORS.teal }]}
            onPress={() => setShowMoodPicker(v => !v)}
            accessibilityRole="button" accessibilityLabel="Selecionar humor"
          >
            <Text style={[s.toolbarBtnText, showMoodPicker && { color: COLORS.teal }]}>
              {mood !== null ? MOOD_EMOJIS[mood] : '● HUMOR'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={!text.trim()}
            accessibilityRole="button" accessibilityLabel="Salvar log">
            <Text style={s.saveBtnText}>SALVAR LOG</Text>
          </TouchableOpacity>
        </View>

        {/* Mood picker */}
        {showMoodPicker && (
          <View style={s.moodPicker}>
            {MOOD_EMOJIS.map((emoji, i) => (
              <TouchableOpacity key={i}
                style={[s.moodOption, mood === i && { borderColor: COLORS.teal }]}
                onPress={() => { setMood(i as Checkin['q1']); setShowMoodPicker(false); }}
                accessibilityRole="button" accessibilityLabel={`Humor nível ${i + 1}`}
              >
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Entradas anteriores */}
        {entries.length > 0 && (
          <>
            <Text style={s.sectionLabel}>ENTRADAS ANTERIORES</Text>
            {entries.map(entry => (
              <TouchableOpacity key={entry.id} style={s.entryCard}
                onPress={() => { setSelectedEntry(entry); setModalVisible(true); }}
                accessibilityRole="button" accessibilityLabel={`Entrada dia ${entry.missionDay}`}
              >
                <View style={s.entryDay}>
                  <Text style={s.entryDayNum}>{entry.missionDay}</Text>
                  <Text style={s.entryDayLabel}>DIA</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.entryPreview} numberOfLines={2}>{entry.text}</Text>
                  {entry.mood !== null && (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{MOOD_EMOJIS[entry.mood]}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

      </ScrollView>

      {/* Modal entrada completa */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text style={s.modalDay}>DIA {selectedEntry?.missionDay}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, flex: 1 }}>{selectedEntry?.date}</Text>
              {selectedEntry?.mood !== null && selectedEntry?.mood !== undefined && (
                <Text style={{ fontSize: 20 }}>{MOOD_EMOJIS[selectedEntry.mood]}</Text>
              )}
            </View>
            <ScrollView>
              <Text style={s.modalText}>{selectedEntry?.text}</Text>
            </ScrollView>
            <TouchableOpacity style={s.modalClose} onPress={() => setModalVisible(false)}
              accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={s.modalCloseText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  scroll:       { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header:       { marginBottom: 20 },
  headerTitle:  { fontSize: 22, fontWeight: '300', letterSpacing: 5, color: COLORS.textPrimary, textTransform: 'uppercase', marginBottom: 4 },
  headerSub:    { fontSize: 12, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  promptCard:   { backgroundColor: 'rgba(74,158,142,0.03)', borderWidth: 1, borderColor: 'rgba(74,158,142,0.15)', borderRadius: 4, padding: 16, marginBottom: 16 },
  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  promptDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.teal },
  promptLabel:  { fontSize: 9, letterSpacing: 3, color: COLORS.teal, textTransform: 'uppercase' },
  promptText:   { fontSize: 13, color: COLORS.textMedium, fontWeight: '300', fontStyle: 'italic', lineHeight: 20 },
  input:        { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 16, color: COLORS.textPrimary, fontSize: 15, fontWeight: '300', lineHeight: 24, minHeight: 180, marginBottom: 12 },
  toolbar:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toolbarBtn:   { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, paddingHorizontal: 14, height: 40, alignItems: 'center', justifyContent: 'center' },
  toolbarBtnText:{ fontSize: 10, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  saveBtn:      { flex: 1, backgroundColor: COLORS.teal, borderRadius: 4, height: 40, alignItems: 'center', justifyContent: 'center' },
  saveBtnText:  { fontSize: 10, letterSpacing: 3, color: COLORS.background, textTransform: 'uppercase', fontWeight: '700' },
  moodPicker:   { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  moodOption:   { width: 48, height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 9, letterSpacing: 4, color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 16, marginBottom: 12 },
  entryCard:    { flexDirection: 'row', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 14, marginBottom: 8, gap: 14 },
  entryDay:     { alignItems: 'center', justifyContent: 'center', minWidth: 40 },
  entryDayNum:  { fontSize: 22, color: COLORS.teal, fontWeight: '300', lineHeight: 26 },
  entryDayLabel:{ fontSize: 8, letterSpacing: 2, color: COLORS.textSecondary, textTransform: 'uppercase' },
  entryPreview: { fontSize: 12, color: COLORS.textMedium, fontWeight: '300', lineHeight: 18 },
  modalBackdrop:{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet:   { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, borderTopLeftRadius: 4, borderTopRightRadius: 4, padding: 20, paddingBottom: 40, maxHeight: '80%' },
  modalHandle:  { width: 40, height: 3, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalDay:     { fontSize: 18, color: COLORS.teal, fontWeight: '300' },
  modalText:    { fontSize: 14, color: COLORS.textPrimary, fontWeight: '300', lineHeight: 22, paddingBottom: 16 },
  modalClose:   { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalCloseText:{ fontSize: 10, letterSpacing: 3, color: COLORS.textSecondary, textTransform: 'uppercase' },
});