import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Checkin, DiaryEntry, DeliveredMessage, BreathingSession, AppFlags } from '../types';

const KEYS = {
  USER: '@orbit:user',
  CHECKINS: '@orbit:checkins',
  DIARY: '@orbit:diary',
  MESSAGES: '@orbit:messages',
  SESSIONS: '@orbit:sessions',
  FLAGS: '@orbit:flags',
} as const;

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}
export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function saveCheckin(checkin: Checkin): Promise<void> {
  const existing = await getCheckins();
  await AsyncStorage.setItem(KEYS.CHECKINS, JSON.stringify([...existing, checkin]));
}
export async function getCheckins(): Promise<Checkin[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHECKINS);
  return raw ? (JSON.parse(raw) as Checkin[]) : [];
}
export async function getLastCheckins(n: number): Promise<Checkin[]> {
  return (await getCheckins()).slice(-n);
}
export async function getTodayCheckin(): Promise<Checkin | null> {
  const today = new Date().toISOString().split('T')[0];
  return (await getCheckins()).find(c => c.date === today) ?? null;
}

export async function getStreak(): Promise<number> {
  const checkins = await getCheckins();
  if (checkins.length === 0) return 0;
  const dates = new Set(checkins.map(c => c.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (dates.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  return streak;
}

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  const existing = await getDiaryEntries();
  await AsyncStorage.setItem(KEYS.DIARY, JSON.stringify([...existing, entry]));
}
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.DIARY);
  return raw ? (JSON.parse(raw) as DiaryEntry[]) : [];
}

export async function getDeliveredMessages(): Promise<DeliveredMessage[]> {
  const raw = await AsyncStorage.getItem(KEYS.MESSAGES);
  return raw ? (JSON.parse(raw) as DeliveredMessage[]) : [];
}
export async function markMessageDelivered(messageId: number): Promise<void> {
  const existing = await getDeliveredMessages();
  const entry: DeliveredMessage = { messageId, deliveredAt: new Date().toISOString(), opened: false };
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify([...existing, entry]));
}
export async function markMessageOpened(messageId: number): Promise<void> {
  const existing = await getDeliveredMessages();
  const updated = existing.map(m => m.messageId === messageId ? { ...m, opened: true } : m);
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
}

export async function saveBreathingSession(session: BreathingSession): Promise<void> {
  const existing = await getBreathingSessions();
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify([...existing, session]));
}
export async function getBreathingSessions(): Promise<BreathingSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  return raw ? (JSON.parse(raw) as BreathingSession[]) : [];
}

export async function getFlags(): Promise<AppFlags> {
  const raw = await AsyncStorage.getItem(KEYS.FLAGS);
  const defaults: AppFlags = { onboardingDone: false, terraDeliveryImmediate: false };
  return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AppFlags>) } : defaults;
}
export async function setFlag<K extends keyof AppFlags>(key: K, value: AppFlags[K]): Promise<void> {
  const flags = await getFlags();
  flags[key] = value;
  await AsyncStorage.setItem(KEYS.FLAGS, JSON.stringify(flags));
}