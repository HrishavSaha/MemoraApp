import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
  useColorScheme,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isHapticsEnabled } from '../../settings/preferenceKeys';
import type { RootStackParamList } from '../../navigation/types';

const CARETAKER_NAME = 'Priya Devi';
const CARETAKER_PHONE = '+919876543210';

function vibrateIfEnabled(pattern?: number | number[]) {
  if (isHapticsEnabled()) {
    Vibration.vibrate(pattern);
  }
}

type Reminder = {
  id: string;
  icon: string;
  labelKey: string;
  time: string;
  done: boolean;
};

type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
};

const INITIAL_REMINDERS: Reminder[] = [
  { id: 'water', icon: '💧', labelKey: 'water', time: '8:00 AM', done: true },
  {
    id: 'medicineMorning',
    icon: '💊',
    labelKey: 'medicineMorning',
    time: '9:00 AM',
    done: true,
  },
  {
    id: 'walk',
    icon: '🚶',
    labelKey: 'walk',
    time: '5:00 PM',
    done: false,
  },
  {
    id: 'medicineEvening',
    icon: '💊',
    labelKey: 'medicineEvening',
    time: '8:00 PM',
    done: false,
  },
];

const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Anjali Sharma',
    specialty: 'Neurologist',
    dateTime: 'Mon, 22 Sep · 10:30 AM',
  },
  {
    id: '2',
    doctorName: 'Dr. Bikash Bora',
    specialty: 'General Physician',
    dateTime: 'Fri, 26 Sep · 4:00 PM',
  },
];

const DAILY_STREAK = 7;
const GAME_PLACEHOLDER_COUNT = 4;

function PatientHomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PatientHome'>
    >();
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const gamesSectionY = useRef(0);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const toggleReminder = (id: string) => {
    vibrateIfEnabled(20);
    setReminders(current =>
      current.map(reminder =>
        reminder.id === id ? { ...reminder, done: !reminder.done } : reminder,
      ),
    );
  };

  const handleCallCaretaker = () => {
    Alert.alert(t('patientHome.callCaretaker'), CARETAKER_NAME, [
      { text: t('patientHome.cancel'), style: 'cancel' },
      {
        text: t('patientHome.call'),
        onPress: () => {
          vibrateIfEnabled(20);
          Linking.openURL(`tel:${CARETAKER_PHONE}`).catch(() => {
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
              t('patientHome.sosSentMessage', { name: CARETAKER_NAME }),
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
      `${appointment.specialty} · ${appointment.dateTime}`,
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
            <Text style={styles.avatarLabel}>A</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: textColor }]}>
              Anita Devi
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
            ]}>
            <Text style={styles.iconGlyph}>📞</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('patientHome.settings')}
            onPress={() => navigation.navigate('PatientSettings')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}>
            <Text style={styles.iconGlyph}>⚙️</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('patientHome.sos')}
            onPress={handleSos}
            style={({ pressed }) => [
              styles.sosButton,
              pressed && styles.pressed,
            ]}>
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
        showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={handleStreakPress}
          style={({ pressed }) => [
            styles.streakCard,
            { backgroundColor: cardColor },
            pressed && styles.pressed,
          ]}>
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
                index === reminders.length - 1 && styles.reminderRowLast,
              ]}>
              <Text style={styles.reminderIcon}>{reminder.icon}</Text>
              <View style={styles.reminderTextGroup}>
                <Text
                  style={[
                    styles.reminderLabel,
                    { color: textColor },
                    reminder.done && styles.reminderLabelDone,
                  ]}>
                  {t(`patientHome.reminders.${reminder.labelKey}`)}
                </Text>
                <Text
                  style={[styles.reminderTime, { color: subTextColor }]}>
                  {reminder.time}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  reminder.done && styles.checkboxDone,
                ]}>
                {reminder.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          ))}
        </View>

        <SectionTitle color={textColor}>
          {t('patientHome.appointmentsTitle')}
        </SectionTitle>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {APPOINTMENTS.map((appointment, index) => (
            <Pressable
              key={appointment.id}
              onPress={() => handleAppointmentPress(appointment)}
              style={({ pressed }) => [
                styles.appointmentRow,
                index === APPOINTMENTS.length - 1 &&
                  styles.appointmentRowLast,
                pressed && styles.pressed,
              ]}>
              <View style={styles.appointmentGlyphWrap}>
                <Text style={styles.appointmentGlyph}>🗓️</Text>
              </View>
              <View style={styles.reminderTextGroup}>
                <Text style={[styles.reminderLabel, { color: textColor }]}>
                  {appointment.doctorName}
                </Text>
                <Text style={[styles.reminderTime, { color: subTextColor }]}>
                  {appointment.specialty} · {appointment.dateTime}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View onLayout={handleGamesSectionLayout}>
          <SectionTitle color={textColor}>
            {t('patientHome.gamesTitle')}
          </SectionTitle>
          <GamesGrid
            count={GAME_PLACEHOLDER_COUNT}
            cardColor={cardColor}
            textColor={subTextColor}
            label={t('patientHome.comingSoon')}
            onPressGame={handleGamePress}
          />
        </View>

        <View
          style={[styles.promoCard, { backgroundColor: cardColor }]}>
          <View style={styles.promoTextGroup}>
            <Text style={[styles.promoTitle, { color: textColor }]}>
              {t('patientHome.appointmentComingUp')}
            </Text>
            <Text style={[styles.promoSubtitle, { color: subTextColor }]}>
              {APPOINTMENTS[0].doctorName} · {APPOINTMENTS[0].dateTime}
            </Text>
          </View>
          <Pressable
            onPress={handleNewGamePress}
            style={({ pressed }) => [
              styles.newGameButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.newGameButtonLabel}>
              {t('patientHome.newGame')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  return (
    <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
  );
}

function GamesGrid({
  count,
  cardColor,
  textColor,
  label,
  onPressGame,
}: {
  count: number;
  cardColor: string;
  textColor: string;
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
          {row.map(index => (
            <Pressable
              key={index}
              onPress={() => onPressGame(index)}
              style={({ pressed }) => [
                styles.gameCard,
                { backgroundColor: cardColor },
                pressed && styles.pressed,
              ]}>
              <Text style={styles.placeholderGlyph}>🎮</Text>
              <Text style={[styles.placeholderLabel, { color: textColor }]}>
                {label}
              </Text>
            </Pressable>
          ))}
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
    backgroundColor: '#1B7A6D',
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
    backgroundColor: '#D64545',
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
    borderBottomColor: 'rgba(150,170,170,0.2)',
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
    borderColor: '#1B7A6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#1B7A6D',
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
    borderBottomColor: 'rgba(150,170,170,0.2)',
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
    borderColor: '#1B7A6D',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    backgroundColor: '#1B7A6D',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  newGameButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PatientHomeScreen;
