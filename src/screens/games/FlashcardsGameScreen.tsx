import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  generateDeck,
  type CardResult,
  type Flashcard,
  type FlashcardsProgress,
} from '../../data/flashcardsGame';
import { useFlashcardsGame } from '../../hooks/useFlashcardsGame';
import { PATIENTS } from '../../data/mockPeople';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import type { RootStackParamList } from '../../navigation/types';

const CURRENT_PATIENT = PATIENTS[0];

const DECK_COMPLETE_DISPLAY_MS = 2200;

type Phase = 'ready' | 'front' | 'back' | 'deckComplete';

function vibrateIfEnabled(pattern?: number | number[]) {
  if (isHapticsEnabled()) {
    Vibration.vibrate(pattern);
  }
}

function FlashcardsGameScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'FlashcardsGame'>
    >();
  const { progress, recordResult } = useFlashcardsGame(CURRENT_PATIENT.id);

  const [phase, setPhase] = useState<Phase>('ready');
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckCorrectCount, setDeckCorrectCount] = useState(0);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const clearTimers = () => {
    timeouts.current.forEach(id => clearTimeout(id));
    timeouts.current = [];
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  };

  useEffect(() => clearTimers, []);

  const startDeck = (forProgress: FlashcardsProgress) => {
    clearTimers();
    setDeck(generateDeck(forProgress.cardCount));
    setCardIndex(0);
    setDeckCorrectCount(0);
    setPhase('front');
  };

  const handleStart = () => {
    vibrateIfEnabled(20);
    startDeck(progress);
  };

  const handleReveal = () => {
    if (phase !== 'front') {
      return;
    }
    vibrateIfEnabled(15);
    setPhase('back');
  };

  const handleGrade = (result: CardResult) => {
    if (phase !== 'back') {
      return;
    }
    vibrateIfEnabled(result === 'correct' ? 15 : [0, 80, 60, 80]);
    const nextProgress = recordResult(result);
    const nextDeckCorrectCount =
      deckCorrectCount + (result === 'correct' ? 1 : 0);
    setDeckCorrectCount(nextDeckCorrectCount);

    const nextIndex = cardIndex + 1;
    if (nextIndex === deck.length) {
      setPhase('deckComplete');
      schedule(() => startDeck(nextProgress), DECK_COMPLETE_DISPLAY_MS);
      return;
    }
    setCardIndex(nextIndex);
    setPhase('front');
  };

  const currentCard = deck[cardIndex];

  const promptForPhase = () => {
    switch (phase) {
      case 'front':
        return t('flashcardsGame.whatIsThis');
      case 'back':
        return t('flashcardsGame.didYouRemember');
      case 'deckComplete':
        return t('flashcardsGame.deckCompleteSubtitle', {
          correct: deckCorrectCount,
          total: deck.length,
        });
      default:
        return t('flashcardsGame.subtitle');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: cardColor }]}
        >
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {t('flashcardsGame.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
            {t('flashcardsGame.level', { count: progress.cardCount })}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.statusGroup}>
          <Text style={[styles.statusTitle, { color: textColor }]}>
            {phase === 'deckComplete'
              ? t('flashcardsGame.deckCompleteTitle')
              : t('flashcardsGame.title')}
          </Text>
          <Text style={[styles.statusSubtitle, { color: subTextColor }]}>
            {promptForPhase()}
          </Text>
        </View>

        {(phase === 'front' || phase === 'back') && currentCard && (
          <Pressable
            disabled={phase !== 'front'}
            onPress={handleReveal}
            style={[styles.card, { backgroundColor: cardColor }]}
          >
            <Text style={styles.cardEmoji}>{currentCard.emoji}</Text>
            {phase === 'front' ? (
              <Text style={[styles.cardHint, { color: subTextColor }]}>
                {t('flashcardsGame.tapToReveal')}
              </Text>
            ) : (
              <Text style={[styles.cardWord, { color: textColor }]}>
                {t(`flashcardsGame.words.${currentCard.id}`)}
              </Text>
            )}
          </Pressable>
        )}

        {phase === 'back' && (
          <View style={styles.gradeRow}>
            <Pressable
              onPress={() => handleGrade('wrong')}
              style={({ pressed }) => [
                styles.gradeButton,
                styles.gradeButtonWrong,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.gradeButtonLabel}>
                {t('flashcardsGame.wrong')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleGrade('correct')}
              style={({ pressed }) => [
                styles.gradeButton,
                styles.gradeButtonCorrect,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.gradeButtonLabel}>
                {t('flashcardsGame.correct')}
              </Text>
            </Pressable>
          </View>
        )}

        {(phase === 'front' || phase === 'back') && (
          <Text style={[styles.progressLabel, { color: subTextColor }]}>
            {t('flashcardsGame.progress', {
              current: cardIndex + 1,
              total: deck.length,
            })}
          </Text>
        )}

        {phase === 'ready' && (
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.startButtonLabel}>
              {t('flashcardsGame.start')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  statusGroup: {
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    width: 220,
    height: 240,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  cardEmoji: {
    fontSize: 72,
  },
  cardHint: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardWord: {
    fontSize: 26,
    fontWeight: '700',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gradeButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  gradeButtonWrong: {
    backgroundColor: '#D64545',
  },
  gradeButtonCorrect: {
    backgroundColor: '#2E9E5B',
  },
  gradeButtonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#1B7A6D',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  startButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FlashcardsGameScreen;
