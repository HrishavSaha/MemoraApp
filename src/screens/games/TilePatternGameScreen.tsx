import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemiMascot } from '../../components/RemiMascot';
import {
  generatePattern,
  type TilePatternProgress,
} from '../../data/tilePatternGame';
import { useTilePatternGame } from '../../hooks/useTilePatternGame';
import { PATIENTS } from '../../data/mockPeople';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import { palette, useThemeColors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const CURRENT_PATIENT = PATIENTS[0];

const FLASH_ON_MS = 650;
const FLASH_GAP_MS = 300;
const TAP_FEEDBACK_MS = 300;
const ROUND_RESULT_DISPLAY_MS = 2000;

const TILE_SIZE = 96;
const TILE_GAP = 14;

// One emoji per tile, keyed by position. Grids can outgrow this list as the
// player levels up (gridSize climbs past 3x3), so tile identities wrap
// around back to the start rather than running out.
const TILE_EMOJIS = ['🦏', '☕', '🌺', '🪈', '⛰️', '🌧️', '🛶', '🧶', '🍵'];

function emojiForTile(index: number): string {
  return TILE_EMOJIS[index % TILE_EMOJIS.length];
}

// Cycled (not repeated back-to-back) on every tile light-up, so the flash
// sequence and each correct tap feel colorful rather than a single hue.
const TOUCH_COLORS = [
  '#497D59', // primary green
  '#C8A74C', // accent gold
  '#C1653A', // terracotta
  '#3E8E8E', // teal
  '#8B5E83', // plum
  '#A6763A', // bronze
  '#5C7A99', // slate blue
  '#6B8E4E', // moss
];

type Phase = 'ready' | 'showing' | 'input' | 'success' | 'fail';

function vibrateIfEnabled(pattern?: number | number[]) {
  if (isHapticsEnabled()) {
    Vibration.vibrate(pattern);
  }
}

function TilePatternGameScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'TilePatternGame'>
    >();
  const { progress, recordResult } = useTilePatternGame(CURRENT_PATIENT.id);

  const [phase, setPhase] = useState<Phase>('ready');
  const [pattern, setPattern] = useState<number[]>([]);
  const [litTile, setLitTile] = useState<number | null>(null);
  const [litColor, setLitColor] = useState(TOUCH_COLORS[0]);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [inputCount, setInputCount] = useState(0);
  const [lastRoundSeconds, setLastRoundSeconds] = useState<number | null>(null);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundStartRef = useRef<number | null>(null);
  const touchColorIndexRef = useRef(0);

  const nextTouchColor = () => {
    const color =
      TOUCH_COLORS[touchColorIndexRef.current % TOUCH_COLORS.length];
    touchColorIndexRef.current += 1;
    return color;
  };

  const {
    background: backgroundColor,
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    muted: tileColor,
    primary,
    danger,
  } = useThemeColors();

  const clearTimers = () => {
    timeouts.current.forEach(id => clearTimeout(id));
    timeouts.current = [];
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  };

  useEffect(() => clearTimers, []);

  const playPattern = (sequence: number[]) => {
    sequence.forEach((tileIndex, step) => {
      schedule(() => {
        setLitColor(nextTouchColor());
        setLitTile(tileIndex);
        schedule(() => setLitTile(null), FLASH_ON_MS - 150);
      }, step * (FLASH_ON_MS + FLASH_GAP_MS));
    });
    schedule(() => {
      setInputCount(0);
      setWrongTile(null);
      roundStartRef.current = Date.now();
      setPhase('input');
    }, sequence.length * (FLASH_ON_MS + FLASH_GAP_MS));
  };

  const startRound = (forProgress: TilePatternProgress) => {
    clearTimers();
    const next = generatePattern(
      forProgress.gridSize,
      forProgress.patternLength,
    );
    setPattern(next);
    setLastRoundSeconds(null);
    setLitTile(null);
    setWrongTile(null);
    setInputCount(0);
    setPhase('showing');
    playPattern(next);
  };

  const handleStart = () => {
    vibrateIfEnabled(20);
    startRound(progress);
  };

  const handleTilePress = (tileIndex: number) => {
    if (phase !== 'input') {
      return;
    }

    if (tileIndex === pattern[inputCount]) {
      vibrateIfEnabled(15);
      setLitColor(nextTouchColor());
      setLitTile(tileIndex);
      schedule(() => setLitTile(null), TAP_FEEDBACK_MS);

      const nextCount = inputCount + 1;
      setInputCount(nextCount);

      if (nextCount === pattern.length) {
        const elapsedSeconds =
          (Date.now() - (roundStartRef.current ?? Date.now())) / 1000;
        setLastRoundSeconds(elapsedSeconds);
        const nextProgress = recordResult('win', elapsedSeconds);
        setPhase('success');
        schedule(() => startRound(nextProgress), ROUND_RESULT_DISPLAY_MS);
      }
      return;
    }

    vibrateIfEnabled([0, 80, 60, 80]);
    setWrongTile(tileIndex);
    const elapsedSeconds =
      (Date.now() - (roundStartRef.current ?? Date.now())) / 1000;
    const nextProgress = recordResult('loss', elapsedSeconds);
    setPhase('fail');
    schedule(() => startRound(nextProgress), ROUND_RESULT_DISPLAY_MS);
  };

  const promptForPhase = () => {
    switch (phase) {
      case 'showing':
        return t('tilePatternGame.watchPrompt');
      case 'input':
        return t('tilePatternGame.repeatPrompt');
      case 'success':
        return lastRoundSeconds !== null
          ? t('tilePatternGame.successSubtitle', {
              seconds: lastRoundSeconds.toFixed(1),
            })
          : t('tilePatternGame.successTitle');
      case 'fail':
        return t('tilePatternGame.failSubtitle', {
          matched: inputCount,
          total: pattern.length,
        });
      default:
        return t('tilePatternGame.subtitle');
    }
  };

  const tiles = Array.from({ length: progress.gridSize * progress.gridSize });

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
            {t('tilePatternGame.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
            {t('tilePatternGame.level', {
              size: progress.gridSize,
              length: progress.patternLength,
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
                    ? primary
                    : phase === 'fail'
                    ? danger
                    : textColor,
              },
            ]}
          >
            {phase === 'success'
              ? t('tilePatternGame.successTitle')
              : phase === 'fail'
              ? t('tilePatternGame.failTitle')
              : t('tilePatternGame.title')}
          </Text>
          <Text style={[styles.statusSubtitle, { color: subTextColor }]}>
            {promptForPhase()}
          </Text>
        </View>

        {(phase === 'input' || phase === 'success' || phase === 'fail') && (
          <RemiMascot
            pose={
              phase === 'success'
                ? 'win'
                : phase === 'fail'
                ? 'fail'
                : 'playing'
            }
            message={
              phase === 'success'
                ? t('remi.win')
                : phase === 'fail'
                ? t('remi.fail')
                : undefined
            }
            size={56}
          />
        )}

        <View
          style={[
            styles.grid,
            {
              width:
                progress.gridSize * TILE_SIZE +
                (progress.gridSize - 1) * TILE_GAP,
            },
          ]}
        >
          {tiles.map((_, index) => {
            const isLit = litTile === index;
            const isWrong = wrongTile === index;
            const backgroundColorForTile = isWrong
              ? danger
              : isLit
              ? litColor
              : tileColor;
            return (
              <Pressable
                key={index}
                disabled={phase !== 'input'}
                onPress={() => handleTilePress(index)}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: backgroundColorForTile },
                  pressed && phase === 'input' && styles.tilePressed,
                ]}
              >
                <Text style={styles.tileEmoji}>{emojiForTile(index)}</Text>
              </Pressable>
            );
          })}
        </View>

        {phase === 'input' && (
          <Text style={[styles.progressLabel, { color: subTextColor }]}>
            {t('tilePatternGame.progress', {
              matched: inputCount,
              total: pattern.length,
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
              {t('tilePatternGame.start')}
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
    gap: 28,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
    justifyContent: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: {
    fontSize: 40,
  },
  tilePressed: {
    opacity: 0.8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: palette.primary,
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

export default TilePatternGameScreen;
