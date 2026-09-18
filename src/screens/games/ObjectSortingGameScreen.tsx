import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  PanResponder,
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
  type CategoryId,
  type ObjectSortingProgress,
  type SortableObject,
} from '../../data/objectSortingGame';
import { useObjectSortingGame } from '../../hooks/useObjectSortingGame';
import { PATIENTS } from '../../data/mockPeople';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import type { RootStackParamList } from '../../navigation/types';

const CURRENT_PATIENT = PATIENTS[0];

const ROUND_RESULT_DISPLAY_MS = 2000;

type Phase = 'ready' | 'input' | 'success' | 'fail';

type BinRect = { x: number; y: number; width: number; height: number };

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
  const [bins, setBins] = useState<CategoryId[]>([]);
  const [objects, setObjects] = useState<SortableObject[]>([]);
  const [sortedIds, setSortedIds] = useState<Set<string>>(new Set());
  const [wrongBin, setWrongBin] = useState<CategoryId | null>(null);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const binRefs = useRef<
    Partial<Record<CategoryId, ComponentRef<typeof View> | null>>
  >({});
  const binLayouts = useRef<Partial<Record<CategoryId, BinRect>>>({});

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
    setSortedIds(new Set());
    setWrongBin(null);
    setPhase('input');
  };

  const handleStart = () => {
    vibrateIfEnabled(20);
    startRound(progress);
  };

  const measureBin = (category: CategoryId) => {
    binRefs.current[category]?.measure(
      (_x, _y, width, height, pageX, pageY) => {
        binLayouts.current[category] = { x: pageX, y: pageY, width, height };
      },
    );
  };

  // `onLayout` only fires when a bin's position/size actually changes, so a
  // basket that lands in the same spot as last round (same category, same
  // slot) never re-fires it. Re-measure every basket after each round's
  // layout commits so drop targets can't go stale between rounds.
  useEffect(() => {
    bins.forEach(measureBin);
  }, [bins]);

  const findBinAt = (pageX: number, pageY: number): CategoryId | null => {
    for (const category of bins) {
      const rect = binLayouts.current[category];
      if (
        rect &&
        pageX >= rect.x &&
        pageX <= rect.x + rect.width &&
        pageY >= rect.y &&
        pageY <= rect.y + rect.height
      ) {
        return category;
      }
    }
    return null;
  };

  const handleObjectDropped = (
    object: SortableObject,
    pageX: number,
    pageY: number,
  ) => {
    if (phase !== 'input') {
      return;
    }

    const bin = findBinAt(pageX, pageY);
    if (!bin) {
      return;
    }

    if (bin === object.category) {
      vibrateIfEnabled(15);
      const nextSortedIds = new Set(sortedIds);
      nextSortedIds.add(object.id);
      setSortedIds(nextSortedIds);

      if (nextSortedIds.size === objects.length) {
        const nextProgress = recordResult('win');
        setPhase('success');
        schedule(() => startRound(nextProgress), ROUND_RESULT_DISPLAY_MS);
      }
      return;
    }

    vibrateIfEnabled([0, 80, 60, 80]);
    setWrongBin(bin);
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
          sorted: sortedIds.size,
          total: objects.length,
        });
      default:
        return t('objectSortingGame.subtitle');
    }
  };

  const visibleObjects = objects.filter(object => !sortedIds.has(object.id));

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

        {phase !== 'ready' && (
          <>
            <View style={styles.pool}>
              {visibleObjects.map(object => (
                <DraggableObject
                  key={object.id}
                  object={object}
                  disabled={phase !== 'input'}
                  cardColor={cardColor}
                  onDropped={handleObjectDropped}
                />
              ))}
            </View>

            <View style={styles.bins}>
              {bins.map(category => (
                <View
                  key={category}
                  ref={el => {
                    binRefs.current[category] = el;
                  }}
                  onLayout={() => measureBin(category)}
                  style={[
                    styles.bin,
                    { backgroundColor: cardColor },
                    wrongBin === category && styles.binWrong,
                  ]}
                >
                  <Text style={[styles.binLabel, { color: textColor }]}>
                    {t(`objectSortingGame.categories.${category}`)}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.progressLabel, { color: subTextColor }]}>
              {t('objectSortingGame.progress', {
                sorted: sortedIds.size,
                total: objects.length,
              })}
            </Text>
          </>
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

function DraggableObject({
  object,
  disabled,
  cardColor,
  onDropped,
}: {
  object: SortableObject;
  disabled: boolean;
  cardColor: string;
  onDropped: (object: SortableObject, pageX: number, pageY: number) => void;
}) {
  const { t } = useTranslation();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const disabledRef = useRef(disabled);
  const onDroppedRef = useRef(onDropped);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onDroppedRef.current = onDropped;
  }, [onDropped]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_event, gestureState) => {
        setIsDragging(false);
        onDroppedRef.current(object, gestureState.moveX, gestureState.moveY);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      accessibilityLabel={t(`objectSortingGame.items.${object.itemId}`)}
      style={[
        styles.objectChip,
        { backgroundColor: cardColor, transform: pan.getTranslateTransform() },
        isDragging && styles.objectChipDragging,
      ]}
    >
      <Text style={styles.objectEmoji}>{object.emoji}</Text>
    </Animated.View>
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
  pool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
  },
  objectChip: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectEmoji: {
    fontSize: 28,
  },
  objectChipDragging: {
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  bin: {
    width: 96,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  binWrong: {
    backgroundColor: '#D64545',
  },
  binLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
