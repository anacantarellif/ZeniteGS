import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Moon, Wind, Activity, Sparkles, ChevronRight } from 'lucide-react-native';

import { COLORS } from '../constants/colors';
import StarField from '../components/StarField';
import ScanLine from '../components/ScanLine';
import MarsGlow from '../components/MarsGlow';

const techniques = [
  {
    id: 'pre-sleep',
    category: 'PRÉ-SONO',
    title: 'Pré-sono · 4-7-8',
    description: 'Ritmo circadiano.',
    duration: '12m',
    icon: Moon,
  },
  {
    id: 'post-eva',
    category: 'PÓS-EVA',
    title: 'Descompressão pós-EVA',
    description: 'Após atividade extraveicular ou alta carga cognitiva.',
    duration: '8m',
    icon: Wind,
  },
  {
    id: 'crisis',
    category: 'CRISE',
    title: 'Estabilização aguda',
    description: 'Box breathing 4-4-4-4',
    duration: '2m',
    icon: Activity,
  },
  {
    id: 'daily',
    category: 'DIÁRIO',
    title: 'Manutenção diária',
    description: 'Meditação guiada. Voz: Comandante Sato.',
    duration: '10m',
    icon: Sparkles,
  },
];

export default function EstabilizarScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <StarField />
      <ScanLine />
      <MarsGlow />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.missionLabel}>
          MISSÃO • DIA 142
        </Text>

        <Text style={styles.sectionLabel}>
          ESTABILIZAR
        </Text>

        <Text style={styles.orangeLabel}>
          REGULAR PRESSÃO INTERNA
        </Text>

        <Text style={styles.title}>
          ESCOLHA UM CONTEXTO.
        </Text>

        <Text style={styles.subtitle}>
          Áudio adaptado para microgravidade. Use os fones.
        </Text>

        {techniques.map((item, index) => {
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('BreathingSession', {
                  technique: item.id,
                })
              }
            >
              <View style={styles.iconBox}>
                <Text style={styles.index}>
                  {String(index + 1).padStart(2, '0')}
                </Text>

                <Icon
                  size={28}
                  color={COLORS.textPrimary}
                  strokeWidth={1.5}
                />
              </View>

              <View style={styles.content}>
                <Text style={styles.category}>
                  {item.category}
                </Text>

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.description}>
                  {item.description}
                </Text>
              </View>

              <View style={styles.rightSide}>
                <Text style={styles.duration}>
                  {item.duration}
                </Text>

                <ChevronRight
                  size={18}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  missionLabel: {
    fontSize: 11,
    letterSpacing: 6,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 50,
    fontFamily: 'monospace',
  },

  sectionLabel: {
    fontSize: 22,
    letterSpacing: 6,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    marginBottom: 30,
    lineHeight: 28,
  },

  orangeLabel: {
    fontSize: 12,
    letterSpacing: 5,
    color: COLORS.orange,
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  title: {
    fontSize: 16,
    lineHeight: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '300',
    marginBottom: 40,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,

    padding: 18,
    marginBottom: 16,
    minHeight: 110,
  },

  iconBox: {
    width: 82,
    height: 82,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 18,
  },

  index: {
    position: 'absolute',
    top: 8,
    right: 8,

    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  content: {
    flex: 1,
  },

  category: {
    color: COLORS.orange,
    letterSpacing: 4,
    fontSize: 8,
    marginBottom: 8,
  },

  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  rightSide: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },

  duration: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});