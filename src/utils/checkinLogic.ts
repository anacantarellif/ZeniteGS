import { Checkin } from '../types';
import { getLastCheckins, getFlags, setFlag, getDeliveredMessages, markMessageDelivered } from './storage';
import { MESSAGES } from './messages';
import { getMissionDay } from './missionTime';

export async function checkAndSetEmergencyDelivery(): Promise<void> {
  const last2 = await getLastCheckins(2);
  if (last2.length < 2) return;
  const [prev, latest] = last2;
  if (prev.q1 <= 1 && latest.q1 <= 1) await setFlag('terraDeliveryImmediate', true);
}

export async function getMessageForToday(missionStart: string): Promise<typeof MESSAGES[0] | null> {
  const flags = await getFlags();
  const delivered = await getDeliveredMessages();
  const deliveredIds = new Set(delivered.map(d => d.messageId));
  const undelivered = MESSAGES.filter(m => !deliveredIds.has(m.id));
  if (undelivered.length === 0) return null;

  const today = new Date().toISOString().split('T')[0];
  const deliveredToday = delivered.find(d => d.deliveredAt.startsWith(today));

  if (flags.terraDeliveryImmediate) {
    await setFlag('terraDeliveryImmediate', false);
    const msg = undelivered[0];
    await markMessageDelivered(msg.id);
    return msg;
  }
  if (!deliveredToday) {
    const missionDay = getMissionDay(missionStart);
    const closest = undelivered.reduce((p, c) =>
      Math.abs(c.day - missionDay) < Math.abs(p.day - missionDay) ? c : p);
    await markMessageDelivered(closest.id);
    return closest;
  }
  return null;
}

export function getCheckinInsight(checkins: Checkin[]): string {
  if (checkins.length === 0) return 'Sem dados suficientes para análise.';
  const last3 = checkins.slice(-3);
  const avgMood = last3.reduce((s, c) => s + c.q1, 0) / last3.length;
  const avgEnergy = last3.reduce((s, c) => s + c.q2, 0) / last3.length;
  if (avgMood <= 1) return 'Sua trajetória mostra sinais de sobrecarga emocional. Considere uma sessão de respiração e conecte-se com sua rede de apoio.';
  if (avgMood >= 3 && avgEnergy >= 3) return 'Padrão positivo detectado nos últimos registros. Sua órbita emocional está se estabilizando. Continue assim.';
  if (avgEnergy <= 1) return 'Energia de propulsão abaixo do ideal. Priorize descanso e recuperação antes de operações exigentes.';
  return 'Trajetória moderada nos últimos dias. Pequenas ações consistentes mantêm a missão nos trilhos.';
}

export function getResultMessage(q1: Checkin['q1']): string {
  const msgs: Record<Checkin['q1'], string> = {
    0: 'Detectamos queda na trajetória. Sua rede de apoio foi ativada silenciosamente.',
    1: 'Órbita pesada detectada. Sugerimos uma sessão de respiração.',
    2: 'Trajetória estável. Você está mantendo o curso da missão.',
    3: 'Energia positiva detectada. Continue alimentando esse estado.',
    4: 'Órbita perfeita! Sua constelação ganhou uma nova estrela hoje.',
  };
  return msgs[q1];
}

export function getDiaryPrompt(lastMood: Checkin['q1'] | null): string {
  if (lastMood === null || lastMood === 2) return 'Qual foi o momento em que você se sentiu mais você mesmo hoje?';
  if (lastMood <= 1) return 'O que você faria diferente hoje se soubesse que a Terra estava te observando?';
  return 'O que aconteceu hoje que te fez lembrar por que essa missão importa?';
}