export const COLORS = {
  background: '#080808',
  surface: '#111111',
  surfaceSecondary: '#161616',
  border: '#1E1E1E',
  borderActive: '#E8652A',
  orange: '#E8652A',
  red: '#C23B22',
  teal: '#4A9E8E',
  textPrimary: '#F0EDE8',
  textSecondary: '#7A7570',
  textMedium: '#A09890',
} as const;

export type ColorKey = keyof typeof COLORS;