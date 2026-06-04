import { differenceInDays, format, parseISO } from 'date-fns';

export function getMissionDay(missionStart: string): number {
  const diff = differenceInDays(new Date(), parseISO(missionStart));
  return Math.max(1, diff + 1);
}

export function getEarthTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit',
      timeZone: timezone, hour12: false,
    }).format(new Date());
  } catch {
    return format(new Date(), 'HH:mm');
  }
}

export function getTimezoneFromCity(city: string): string {
  const map: Record<string, string> = {
    'São Paulo': 'America/Sao_Paulo',
    'Rio de Janeiro': 'America/Sao_Paulo',
    'Brasília': 'America/Sao_Paulo',
    'Manaus': 'America/Manaus',
    'Fortaleza': 'America/Fortaleza',
    'Recife': 'America/Recife',
    'Salvador': 'America/Bahia',
    'Porto Alegre': 'America/Sao_Paulo',
    'Curitiba': 'America/Sao_Paulo',
    'Belo Horizonte': 'America/Sao_Paulo',
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles',
    'London': 'Europe/London',
    'Paris': 'Europe/Paris',
    'Tokyo': 'Asia/Tokyo',
  };
  return map[city] ?? 'America/Sao_Paulo';
}

export function getWeekDays(): { date: string; hasCheckin: boolean }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().split('T')[0], hasCheckin: false };
  });
}