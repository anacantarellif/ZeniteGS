export interface User {
  name: string;
  city: string;
  timezone: string;
  missionStart: string;
  anchor: 'family' | 'nature' | 'music' | 'faith' | 'memory';
  supportNetwork: SupportPerson[];
}


export interface SupportPerson {
  id: string;
  name: string;
  relation: string;
}

export interface Checkin {
  id: string;
  date: string;
  timestamp: number;
  missionDay: number;
  q1: 0 | 1 | 2 | 3 | 4;
  q2: 0 | 1 | 2 | 3 | 4;
  q3: 'family' | 'sleep' | 'overload' | 'stable';
}

export interface DiaryEntry {
  id: string;
  date: string;
  missionDay: number;
  text: string;
  mood: Checkin['q1'] | null;
  timestamp: number;
}

export interface Message {
  id: number;
  sender: string;
  relation: string;
  type: 'text' | 'video' | 'audio' | 'photo';
  content: string;
  day: number;
}

export interface DeliveredMessage {
  messageId: number;
  deliveredAt: string;
  opened: boolean;
}

export interface BreathingSession {
  id: string;
  type: 'pre-sleep' | 'post-activity' | 'acute' | 'maintenance';
  duration: number;
  date: string;
}

export interface AppFlags {
  onboardingDone: boolean;
  terraDeliveryImmediate: boolean;
}

export type MoodLevel = 0 | 1 | 2 | 3 | 4;

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Breathing: { mode: BreathingSession['type'] };
  BreathingSession: { mode: BreathingSession['type']; duration: number; technique: string;};
  DiaryEntry: { entry: DiaryEntry };
  Estabilizar: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Checkin: undefined;
  Terra: undefined;
  Log: undefined;
  Constellation: undefined;
};