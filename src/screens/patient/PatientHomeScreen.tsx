import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REMI_IMAGES, RemiMascot } from '../../components/RemiMascot';
import type { Appointment } from '../../data/appointments';
import { CARETAKER, PATIENTS } from '../../data/mockPeople';
import { useAppointments } from '../../hooks/useAppointments';
import { useReminders } from '../../hooks/useReminders';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import { palette, useThemeColors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const WELCOME_BUBBLE_DURATION_MS = 4000;

const CURRENT_PATIENT = PATIENTS[0];

function vibrateIfEnabled(pattern?: number | number[]) {
  if (isHapticsEnabled()) {
    Vibration.vibrate(pattern);
  }
}

const DAILY_STREAK = 7;
const GAME_PLACEHOLDER_COUNT = 4;

function PatientHomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { reminders, toggle: toggleReminderState } = useReminders(
    CURRENT_PATIENT.id,
  );
  const { appointments } = useAppointments(CURRENT_PATIENT.id);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PatientHome'>
    >();
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const gamesSectionY = useRef(0);
  const welcomeBubbleTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  const {
    background: backgroundColor,
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    border,
    danger,
  } = useThemeColors();

  useEffect(() => {
    welcomeBubbleTimeout.current = setTimeout(
      () => setShowWelcomeBubble(false),
      WELCOME_BUBBLE_DURATION_MS,
    );
    return () => {
      if (welcomeBubbleTimeout.current) {
        clearTimeout(welcomeBubbleTimeout.current);
      }
    };
  }, []);

  const handleRemiPress = () => {
    vibrateIfEnabled(15);
    if (welcomeBubbleTimeout.current) {
      clearTimeout(welcomeBubbleTimeout.current);
    }
    setShowWelcomeBubble(true);
    welcomeBubbleTimeout.current = setTimeout(
      () => setShowWelcomeBubble(false),
      WELCOME_BUBBLE_DURATION_MS,
    );
  };

  const toggleReminder = (id: string) => {
    vibrateIfEnabled(20);
    toggleReminderState(id);
  };

  const handleCallCaretaker = () => {
    Alert.alert(t('patientHome.callCaretaker'), CARETAKER.name, [
      { text: t('patientHome.cancel'), style: 'cancel' },
      {
        text: t('patientHome.call'),
        onPress: () => {
          vibrateIfEnabled(20);
          Linking.openURL(`tel:${CARETAKER.phone}`).catch(() => {
            Alert.alert(t('patientHome.callFailed'));
          });
        },
      },
    ]);
  };

  const handleSos = () => {
    Alert.alert(
      t('patientHome.sosConfirmTitle'),
      t('patientHome.sosConfirmMessage'),
      [
        { text: t('patientHome.cancel'), style: 'cancel' },
        {
          text: t('patientHome.sosConfirmSend'),
          style: 'destructive',
          onPress: () => {
            vibrateIfEnabled([0, 200, 100, 200]);
            Alert.alert(
              t('patientHome.sosSentTitle'),
              t('patientHome.sosSentMessage', { name: CARETAKER.name }),
            );
          },
        },
      ],
    );
  };

  const handleStreakPress = () => {
    vibrateIfEnabled(20);
    Alert.alert(
      t('patientHome.streak', { count: DAILY_STREAK }),
      t('patientHome.streakDetail'),
    );
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    vibrateIfEnabled(20);
    Alert.alert(
      appointment.doctorName,
      `${appointment.specialty} · ${appointment.date} · ${appointment.time}`,
      [
        { text: t('patientHome.close'), style: 'cancel' },
        {
          text: t('patientHome.getDirections'),
          onPress: () => {
            const query = encodeURIComponent(
              `${appointment.doctorName} ${appointment.specialty}`,
            );
            Linking.openURL(`https://maps.google.com/?q=${query}`);
          },
        },
      ],
    );
  };

  const handleGamePress = (index: number) => {
    vibrateIfEnabled(20);
    if (index === 0) {
      navigation.navigate('TilePatternGame');
      return;
    }
    if (index === 1) {
      navigation.navigate('ObjectSortingGame');
      return;
    }
    if (index === 2) {
      navigation.navigate('FlashcardsGame');
      return;
    }
    Alert.alert(
      t('patientHome.gameComingSoonTitle', { number: index + 1 }),
      t('patientHome.comingSoon'),
    );
  };

  const handleNewGamePress = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(gamesSectionY.current - 12, 0),
      animated: true,
    });
  };

  const handleGamesSectionLayout = (event: LayoutChangeEvent) => {
    gamesSectionY.current = event.nativeEvent.layout.y;
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>
              {CURRENT_PATIENT.avatarInitial}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: textColor }]}>
              {CURRENT_PATIENT.name}
            </Text>
            <Text style={[styles.userRole, { color: subTextColor }]}>
              {t('roleSelection.patient')}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={t('patientHome.callCaretaker')}
            onPress={handleCallCaretaker}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.iconGlyph}>📞</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('patientHome.settings')}
            onPress={() => navigation.navigate('Settings')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.iconGlyph}>⚙️</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('patientHome.sos')}
            onPress={handleSos}
            style={({ pressed }) => [
              styles.sosButton,
              { backgroundColor: danger },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.sosLabel}>{t('patientHome.sos')}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handleStreakPress}
          style={({ pressed }) => [
            styles.streakCard,
            { backgroundColor: cardColor },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.streakGlyph}>🔥</Text>
          <View>
            <Text style={[styles.streakCount, { color: textColor }]}>
              {t('patientHome.streak', { count: DAILY_STREAK })}
            </Text>
            <Text style={[styles.streakSubtitle, { color: subTextColor }]}>
              {t('patientHome.keepItUp')}
            </Text>
          </View>
        </Pressable>

        <SectionTitle color={textColor}>
          {t('patientHome.remindersTitle')}
        </SectionTitle>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {reminders.map((reminder, index) => (
            <Pressable
              key={reminder.id}
              onPress={() => toggleReminder(reminder.id)}
              style={[
                styles.reminderRow,
                { borderBottomColor: border },
                index === reminders.length - 1 && styles.reminderRowLast,
              ]}
            >
              <Text style={styles.reminderIcon}>{reminder.icon}</Text>
              <View style={styles.reminderTextGroup}>
                <Text
                  style={[
                    styles.reminderLabel,
                    { color: textColor },
                    reminder.done && styles.reminderLabelDone,
                  ]}
                >
                  {reminder.name}
                </Text>
                <Text style={[styles.reminderTime, { color: subTextColor }]}>
                  {reminder.dosage
                    ? `${reminder.time} · ${reminder.dosage}`
                    : reminder.time}
                </Text>
              </View>
              <View
                style={[styles.checkbox, reminder.done && styles.checkboxDone]}
              >
                {reminder.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          ))}
        </View>

        <SectionTitle color={textColor}>
          {t('patientHome.appointmentsTitle')}
        </SectionTitle>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {appointments.length === 0 ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('patientHome.noAppointments')}
            </Text>
          ) : (
            appointments.map((appointment, index) => (
              <Pressable
                key={appointment.id}
                onPress={() => handleAppointmentPress(appointment)}
                style={({ pressed }) => [
                  styles.appointmentRow,
                  { borderBottomColor: border },
                  index === appointments.length - 1 &&
                    styles.appointmentRowLast,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.appointmentGlyphWrap}>
                  <Text style={styles.appointmentGlyph}>🗓️</Text>
                </View>
                <View style={styles.reminderTextGroup}>
                  <Text style={[styles.reminderLabel, { color: textColor }]}>
                    {appointment.doctorName}
                  </Text>
                  <Text style={[styles.reminderTime, { color: subTextColor }]}>
                    {appointment.specialty} · {appointment.date} ·{' '}
                    {appointment.time}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View onLayout={handleGamesSectionLayout}>
          <SectionTitle color={textColor}>
            {t('patientHome.gamesTitle')}
          </SectionTitle>
          <View style={styles.remiNudge}>
            <RemiMascot
              pose="newGames"
              message={t('remi.newGames')}
              size={52}
            />
          </View>
          <GamesGrid
            count={GAME_PLACEHOLDER_COUNT}
            cardColor={cardColor}
            textColor={subTextColor}
            availableTextColor={textColor}
            availableGames={[
              { glyph: '🧩', label: t('tilePatternGame.title') },
              { glyph: '🎯', label: t('objectSortingGame.title') },
              { glyph: '🗂️', label: t('flashcardsGame.title') },
            ]}
            label={t('patientHome.comingSoon')}
            onPressGame={handleGamePress}
          />
        </View>

        <View style={[styles.promoCard, { backgroundColor: cardColor }]}>
          <View style={styles.promoTextGroup}>
            <Text style={[styles.promoTitle, { color: textColor }]}>
              {appointments.length > 0
                ? t('patientHome.appointmentComingUp')
                : t('patientHome.newGamePromptTitle')}
            </Text>
            {appointments.length > 0 && (
              <Text style={[styles.promoSubtitle, { color: subTextColor }]}>
                {appointments[0].doctorName} · {appointments[0].date} ·{' '}
                {appointments[0].time}
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleNewGamePress}
            style={({ pressed }) => [
              styles.newGameButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.newGameButtonLabel}>
              {t('patientHome.newGame')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {showWelcomeBubble && (
        <View
          style={[
            styles.remiBubbleWrap,
            { bottom: insets.bottom + 24 + 64 + 10 },
          ]}
        >
          <View
            style={[
              styles.remiBubble,
              { backgroundColor: cardColor, borderColor: border },
            ]}
          >
            <Text style={[styles.remiBubbleText, { color: textColor }]}>
              {t('remi.welcome')}
            </Text>
          </View>
          <View
            style={[styles.remiBubbleTail, { borderTopColor: cardColor }]}
          />
        </View>
      )}
      <Pressable
        accessibilityLabel={t('remi.welcome')}
        onPress={handleRemiPress}
        style={[
          styles.remiFab,
          { backgroundColor: cardColor, borderColor: border },
          { bottom: insets.bottom + 24 },
        ]}
      >
        <Image
          source={REMI_IMAGES.welcome}
          style={styles.remiFabImage}
          resizeMode="cover"
        />
      </Pressable>
    </View>
  );
}

function SectionTitle({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  return <Text style={[styles.sectionTitle, { color }]}>{children}</Text>;
}

type AvailableGame = {
  glyph: string;
  label: string;
};

function GamesGrid({
  count,
  cardColor,
  textColor,
  availableTextColor,
  availableGames,
  label,
  onPressGame,
}: {
  count: number;
  cardColor: string;
  textColor: string;
  availableTextColor: string;
  availableGames: AvailableGame[];
  label: string;
  onPressGame: (index: number) => void;
}) {
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 2) {
    rows.push([i, i + 1].filter(index => index < count));
  }

  return (
    <View style={styles.gamesGrid}>
      {rows.map(row => (
        <View key={row[0]} style={styles.gamesRow}>
          {row.map(index => {
            const available = availableGames[index];
            return (
              <Pressable
                key={index}
                onPress={() => onPressGame(index)}
                style={({ pressed }) => [
                  styles.gameCard,
                  available && styles.gameCardAvailable,
                  { backgroundColor: cardColor },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.placeholderGlyph}>
                  {available ? available.glyph : '🎮'}
                </Text>
                <Text
                  style={[
                    styles.placeholderLabel,
                    { color: available ? availableTextColor : textColor },
                  ]}
                >
                  {available ? available.label : label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 20,
  },
  sosButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  streakGlyph: {
    fontSize: 32,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  streakSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  reminderRowLast: {
    borderBottomWidth: 0,
  },
  reminderIcon: {
    fontSize: 22,
  },
  reminderTextGroup: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderLabelDone: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  reminderTime: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: palette.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  appointmentRowLast: {
    borderBottomWidth: 0,
  },
  appointmentGlyphWrap: {
    width: 36,
    alignItems: 'center',
  },
  appointmentGlyph: {
    fontSize: 22,
  },
  emptyText: {
    fontSize: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  gamesGrid: {
    gap: 12,
  },
  gamesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: palette.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gameCardAvailable: {
    borderStyle: 'solid',
  },
  placeholderGlyph: {
    fontSize: 28,
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },
  promoTextGroup: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  promoSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  newGameButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  newGameButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  remiNudge: {
    marginBottom: 12,
  },
  remiFab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
  },
  remiFabImage: {
    width: 64,
    height: 64,
  },
  remiBubbleWrap: {
    position: 'absolute',
    right: 12,
    alignItems: 'flex-end',
    maxWidth: 220,
  },
  remiBubble: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  remiBubbleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  remiBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginRight: 24,
  },
});

export default PatientHomeScreen;
