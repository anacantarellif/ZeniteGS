import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY = {
  heading: {
    fontSize: 28,
    fontWeight: '300' as TextStyle['fontWeight'],
    letterSpacing: 4,
    color: COLORS.textPrimary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  subheading: {
    fontSize: 14,
    fontWeight: '300' as TextStyle['fontWeight'],
    letterSpacing: 3,
    color: COLORS.textSecondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  label: {
    fontSize: 10,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 4,
    color: COLORS.textSecondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  body: {
    fontSize: 14,
    fontWeight: '300' as TextStyle['fontWeight'],
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  mono: {
    fontFamily: 'monospace' as TextStyle['fontFamily'],
    letterSpacing: 2,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  counter: {
    fontSize: 80,
    fontWeight: '300' as TextStyle['fontWeight'],
    letterSpacing: 10,
    color: COLORS.orange,
  },
} as const;