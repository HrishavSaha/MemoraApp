import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import {
  getMonthlyGameProgress,
  getWeeklyGameProgress,
} from '../data/gameProgress';
import { palette, useThemeColors } from '../theme/colors';

const GAME_LINE_HEIGHT = 56;
const GAME_LEVEL_CEILING = 8;
const DOT_RADIUS = 5;
const STROKE_WIDTH = 3;
const AXIS_LABEL_WIDTH = 20;

type GameLine = {
  gameName: string;
  points: number[];
};

/**
 * Self-contained "Weekly Game Progress" section — one line per game, plotted
 * left-to-right, with each segment colored by whether the level improved,
 * declined, or held steady versus the point before it. Used by both the
 * caretaker's and doctor's patient detail screens so the two stay in sync.
 *
 * `period` picks the x-axis: "daily" plots the last 7 days (caretaker's
 * view), "weekly" plots the last 4 weeks, one point per week (doctor's view).
 */
export function GameProgressChart({
  patientId,
  period = 'daily',
}: {
  patientId: string;
  period?: 'daily' | 'weekly';
}) {
  const { t } = useTranslation();
  const {
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    muted: mutedLineColor,
    primary,
    danger,
  } = useThemeColors();

  const [chartWidth, setChartWidth] = useState(0);

  let games: GameLine[];
  let labels: string[];
  if (period === 'daily') {
    const weeklyProgress = getWeeklyGameProgress(patientId);
    games = weeklyProgress.map(game => ({
      gameName: game.gameName,
      points: game.days.map(d => d.level),
    }));
    labels = weeklyProgress[0]?.days.map(d => d.day.charAt(0)) ?? [];
  } else {
    const monthlyProgress = getMonthlyGameProgress(patientId);
    games = monthlyProgress.map(game => ({
      gameName: game.gameName,
      points: game.weeks.map(w => w.level),
    }));
    labels = monthlyProgress[0]?.weeks.map(w => w.week) ?? [];
  }

  const handleChartAreaLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {period === 'daily'
          ? t('gameProgress.title')
          : t('gameProgress.titleMonthly')}
      </Text>
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View onLayout={handleChartAreaLayout}>
          {games.map(game => (
            <GameLineRow
              key={game.gameName}
              game={game}
              width={chartWidth}
              textColor={textColor}
              mutedLineColor={mutedLineColor}
              increaseColor={primary}
              decreaseColor={danger}
            />
          ))}
        </View>
        <AxisLabelRow labels={labels} width={chartWidth} color={subTextColor} />
        <View style={styles.legendRow}>
          <LegendDot color={primary} />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            {t('gameProgress.legendIncrease')}
          </Text>
          <LegendDot color={danger} />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            {t('gameProgress.legendDecrease')}
          </Text>
          <LegendDot color={mutedLineColor} />
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

/** Positions each label at the exact same x as its line point (index * stepX). */
function AxisLabelRow({
  labels,
  width,
  color,
}: {
  labels: string[];
  width: number;
  color: string;
}) {
  const stepX = labels.length > 1 ? width / (labels.length - 1) : 0;
  return (
    <View style={styles.axisLabelRow}>
      {width > 0 &&
        labels.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={[
              styles.axisLabel,
              { color, left: index * stepX - AXIS_LABEL_WIDTH / 2 },
            ]}
          >
            {label}
          </Text>
        ))}
    </View>
  );
}

function GameLineRow({
  game,
  width,
  textColor,
  mutedLineColor,
  increaseColor,
  decreaseColor,
}: {
  game: GameLine;
  width: number;
  textColor: string;
  mutedLineColor: string;
  increaseColor: string;
  decreaseColor: string;
}) {
  const { points } = game;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((level, index) => ({
    x: index * stepX,
    y:
      GAME_LINE_HEIGHT -
      Math.min(level / GAME_LEVEL_CEILING, 1) * GAME_LINE_HEIGHT,
  }));

  return (
    <View style={styles.gameRow}>
      <Text style={[styles.gameName, { color: textColor }]}>
        {game.gameName}
      </Text>
      <View style={[styles.lineArea, { height: GAME_LINE_HEIGHT }]}>
        {width > 0 &&
          coords.slice(1).map((point, index) => {
            const previousPoint = coords[index];
            const previousLevel = points[index];
            const level = points[index + 1];
            const color =
              level > previousLevel
                ? increaseColor
                : level < previousLevel
                ? decreaseColor
                : mutedLineColor;
            const dx = point.x - previousPoint.x;
            const dy = point.y - previousPoint.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            return (
              <View
                key={index}
                style={[
                  styles.lineSegment,
                  {
                    left: previousPoint.x,
                    top: previousPoint.y - STROKE_WIDTH / 2,
                    width: length,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 50%',
                  },
                ]}
              />
            );
          })}
        {width > 0 &&
          coords.map((point, index) => (
            <View
              key={index}
              style={[
                styles.lineDot,
                {
                  left: point.x - DOT_RADIUS,
                  top: point.y - DOT_RADIUS,
                },
              ]}
            />
          ))}
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
  lineArea: {
    position: 'relative',
  },
  lineSegment: {
    position: 'absolute',
    height: STROKE_WIDTH,
    borderRadius: STROKE_WIDTH / 2,
  },
  lineDot: {
    position: 'absolute',
    width: DOT_RADIUS * 2,
    height: DOT_RADIUS * 2,
    borderRadius: DOT_RADIUS,
    backgroundColor: palette.primary,
  },
  axisLabelRow: {
    position: 'relative',
    height: 16,
    marginTop: 2,
    marginBottom: 4,
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    width: AXIS_LABEL_WIDTH,
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
