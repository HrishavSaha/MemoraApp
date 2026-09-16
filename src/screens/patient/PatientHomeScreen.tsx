import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
const MOCA_PLACEHOLDER_COUNT = 5;

function PatientHomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const toggleReminder = (id: string) => {
    setReminders(current =>
      current.map(reminder =>
        reminder.id === id ? { ...reminder, done: !reminder.done } : reminder,
      ),
    );
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
            style={[styles.iconButton, { backgroundColor: cardColor }]}>
            <Text style={styles.iconGlyph}>📞</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('patientHome.settings')}
            style={[styles.iconButton, { backgroundColor: cardColor }]}>
            <Text style={styles.iconGlyph}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.streakCard, { backgroundColor: cardColor }]}>
          <Text style={styles.streakGlyph}>🔥</Text>
          <View>
            <Text style={[styles.streakCount, { color: textColor }]}>
              {t('patientHome.streak', { count: DAILY_STREAK })}
            </Text>
            <Text style={[styles.streakSubtitle, { color: subTextColor }]}>
              {t('patientHome.keepItUp')}
            </Text>
          </View>
        </View>

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
            <View
              key={appointment.id}
              style={[
                styles.appointmentRow,
                index === APPOINTMENTS.length - 1 &&
                  styles.appointmentRowLast,
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
            </View>
          ))}
        </View>

        <SectionTitle color={textColor}>
          {t('patientHome.gamesTitle')}
        </SectionTitle>
        <PlaceholderRow
          count={GAME_PLACEHOLDER_COUNT}
          glyph="🎮"
          accentColor="#1B7A6D"
          cardColor={cardColor}
          textColor={subTextColor}
          label={t('patientHome.comingSoon')}
        />

        <SectionTitle color={textColor}>
          {t('patientHome.mocaTitle')}
        </SectionTitle>
        <PlaceholderRow
          count={MOCA_PLACEHOLDER_COUNT}
          glyph="🧠"
          accentColor="#5B4FCF"
          cardColor={cardColor}
          textColor={subTextColor}
          label={t('patientHome.comingSoon')}
        />
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

function PlaceholderRow({
  count,
  glyph,
  accentColor,
  cardColor,
  textColor,
  label,
}: {
  count: number;
  glyph: string;
  accentColor: string;
  cardColor: string;
  textColor: string;
  label: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.placeholderRow}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.placeholderCard,
            { backgroundColor: cardColor, borderColor: accentColor },
          ]}>
          <Text style={[styles.placeholderGlyph, { color: accentColor }]}>
            {glyph}
          </Text>
          <Text style={[styles.placeholderLabel, { color: textColor }]}>
            {label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  placeholderRow: {
    gap: 12,
    paddingBottom: 4,
  },
  placeholderCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 1.5,
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
});

export default PatientHomeScreen;
