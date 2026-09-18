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
  generateRound,
  type ObjectCategory,
  type ObjectSortingProgress,
  type SortableObject,
} from '../../data/objectSortingGame';
import { useObjectSortingGame } from '../../hooks/useObjectSortingGame';
import { PATIENTS } from '../../data/mockPeople';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import type { RootStackParamList } from '../../navigation/types';

const CURRENT_PATIENT = PATIENTS[0];

const TAP_FEEDBACK_MS = 300;
const ROUND_RESULT_DISPLAY_MS = 2000;

const CATEGORY_COLORS: Record<ObjectCategory, string> = {
  red: '#D64545',
  blue: '#2E6FDE',
  green: '#2E9E5B',
  yellow: '#E0B400',
  purple: '#8A4FD6',
  orange: '#E07A2E',
  pink: '#E0559B',
  teal: '#1B9E9E',
};

type Phase = 'ready' | 'input' | 'success' | 'fail';

function vibrateIfEnabled(pattern?: number | number[]) {
  if (isHapticsEnabled()) {
    Vibration.vibrate(pattern);
  }
}

function ObjectSortingGameScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'ObjectSortingGame'>
    >();
  const { progress, recordResult } = useObjectSortingGame(CURRENT_PATIENT.id);

  const [phase, setPhase] = useState<Phase>('ready');
  const [bins, setBins] = useState<ObjectCategory[]>([]);
  const [objects, setObjects] = useState<SortableObject[]>([]);
  const [sortedCount, setSortedCount] = useState(0);
  const [litBin, setLitBin] = useState<ObjectCategory | null>(null);
  const [wrongBin, setWrongBin] = useState<ObjectCategory | null>(null);

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

  const startRound = (forProgress: ObjectSortingProgress) => {
    clearTimers();
    const round = generateRound(forProgress.objectCount, forProgress.binCount);
    setBins(round.bins);
    setObjects(round.objects);
    setSortedCount(0);
    setLitBin(null);
    setWrongBin(null);
    setPhase('input');
  };

  const handleStart = () => {
    vibrateIfEnabled(20);
    startRound(progress);
  };

  const handleBinPress = (category: ObjectCategory) => {
    if (phase !== 'input') {
      return;
    }

    const currentObject = objects[sortedCount];

    if (category === currentObject.category) {
      vibrateIfEnabled(15);
      setLitBin(category);
      schedule(() => setLitBin(null), TAP_FEEDBACK_MS);

      const nextCount = sortedCount + 1;
      setSortedCount(nextCount);

      if (nextCount === objects.length) {
        const nextProgress = recordResult('win');
        setPhase('success');
        schedule(() => startRound(nextProgress), ROUND_RESULT_DISPLAY_MS);
      }
      return;
    }

    vibrateIfEnabled([0, 80, 60, 80]);
    setWrongBin(category);
    const nextProgress = recordResult('loss');
    setPhase('fail');
    schedule(() => startRound(nextProgress), ROUND_RESULT_DISPLAY_MS);
  };

  const promptForPhase = () => {
    switch (phase) {
      case 'input':
        return t('objectSortingGame.prompt');
      case 'success':
        return t('objectSortingGame.successSubtitle', {
          total: objects.length,
        });
      case 'fail':
        return t('objectSortingGame.failSubtitle', {
          sorted: sortedCount,
          total: objects.length,
        });
      default:
        return t('objectSortingGame.subtitle');
    }
  };

  const currentObject = phase === 'input' ? objects[sortedCount] : null;

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
            {t('objectSortingGame.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
            {t('objectSortingGame.level', {
              objects: progress.objectCount,
              bins: progress.binCount,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.statusGroup}>
          <Text
            style={[
              styles.statusTitle,
              {
                color:
                  phase === 'success'
                    ? '#2E9E5B'
                    : phase === 'fail'
                    ? '#D64545'
                    : textColor,
              },
            ]}
          >
            {phase === 'success'
              ? t('objectSortingGame.successTitle')
              : phase === 'fail'
              ? t('objectSortingGame.failTitle')
              : t('objectSortingGame.title')}
          </Text>
          <Text style={[styles.statusSubtitle, { color: subTextColor }]}>
            {promptForPhase()}
          </Text>
        </View>

        {currentObject && (
          <View
            style={[
              styles.currentObject,
              { backgroundColor: CATEGORY_COLORS[currentObject.category] },
            ]}
          />
        )}

        <View style={styles.bins}>
          {bins.map(category => {
            const isLit = litBin === category;
            const isWrong = wrongBin === category;
            return (
              <Pressable
                key={category}
                disabled={phase !== 'input'}
                accessibilityLabel={t(`objectSortingGame.colors.${category}`)}
                onPress={() => handleBinPress(category)}
                style={({ pressed }) => [
                  styles.bin,
                  { backgroundColor: cardColor },
                  pressed && phase === 'input' && styles.binPressed,
                ]}
              >
                <View
                  style={[
                    styles.binSwatch,
                    {
                      backgroundColor: CATEGORY_COLORS[category],
                      borderColor: isWrong
                        ? '#D64545'
                        : isLit
                        ? '#2E9E5B'
                        : 'transparent',
                    },
                  ]}
                />
                <Text style={[styles.binLabel, { color: textColor }]}>
                  {t(`objectSortingGame.colors.${category}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {phase === 'input' && (
          <Text style={[styles.progressLabel, { color: subTextColor }]}>
            {t('objectSortingGame.progress', {
              sorted: sortedCount,
              total: objects.length,
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
              {t('objectSortingGame.start')}
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
  currentObject: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  bins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  bin: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
  },
  binPressed: {
    opacity: 0.8,
  },
  binSwatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 3,
  },
  binLabel: {
    fontSize: 12,
    fontWeight: '600',
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

export default ObjectSortingGameScreen;
