import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import {
  getWeeklyGameProgress,
  type GameWeeklyProgress,
} from '../data/gameProgress';

const GAME_BAR_MAX_HEIGHT = 48;
const GAME_LEVEL_CEILING = 8;

/**
 * Self-contained "Weekly Game Progress" section — one bar row per game, each
 * day colored by whether that day's level improved, declined, or held
 * steady versus the day before. Used by both the caretaker's and doctor's
 * patient detail screens so the two stay in sync.
 */
export function GameProgressChart({ patientId }: { patientId: string }) {
  const isDarkMode = useColorScheme() === 'dark';
  const { t } = useTranslation();
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const mutedBarColor = isDarkMode ? '#3A4C55' : '#D7E2E2';

  const gameProgress = getWeeklyGameProgress(patientId);

  return (
    <>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {t('gameProgress.title')}
      </Text>
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        {gameProgress.map(game => (
          <GameProgressRow
            key={game.gameName}
            game={game}
            textColor={textColor}
            mutedBarColor={mutedBarColor}
          />
        ))}
        <View style={styles.dayLabelRow}>
          {(gameProgress[0]?.days ?? []).map(d => (
            <Text
              key={d.day}
              style={[styles.dayLabel, { color: subTextColor }]}
            >
              {d.day.charAt(0)}
            </Text>
          ))}
        </View>
        <View style={styles.legendRow}>
          <LegendDot color="#2E9E5B" />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            {t('gameProgress.legendIncrease')}
          </Text>
          <LegendDot color="#D64545" />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            {t('gameProgress.legendDecrease')}
          </Text>
          <LegendDot color={mutedBarColor} />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            {t('gameProgress.legendSame')}
          </Text>
        </View>
      </View>
    </>
  );
}

function LegendDot({ color }: { color: string }) {
  return <View style={[styles.legendDot, { backgroundColor: color }]} />;
}

function GameProgressRow({
  game,
  textColor,
  mutedBarColor,
}: {
  game: GameWeeklyProgress;
  textColor: string;
  mutedBarColor: string;
}) {
  return (
    <View style={styles.gameRow}>
      <Text style={[styles.gameName, { color: textColor }]}>
        {game.gameName}
      </Text>
      <View style={styles.gameBars}>
        {game.days.map((entry, index) => {
          const previousLevel = index > 0 ? game.days[index - 1].level : null;
          const color =
            previousLevel === null
              ? mutedBarColor
              : entry.level > previousLevel
              ? '#2E9E5B'
              : entry.level < previousLevel
              ? '#D64545'
              : mutedBarColor;
          const height = Math.max(
            (entry.level / GAME_LEVEL_CEILING) * GAME_BAR_MAX_HEIGHT,
            4,
          );
          return (
            <View
              key={entry.day}
              style={[styles.gameBar, { height, backgroundColor: color }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  gameRow: {
    marginBottom: 14,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  gameBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: GAME_BAR_MAX_HEIGHT,
  },
  gameBar: {
    width: 16,
    borderRadius: 4,
  },
  dayLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    width: 16,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    marginRight: 10,
  },
});
