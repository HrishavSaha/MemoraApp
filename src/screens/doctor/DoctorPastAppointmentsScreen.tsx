import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import type { RootStackParamList } from '../../navigation/types';

type PastAppointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  summary: string;
};

const PAST_APPOINTMENTS: PastAppointment[] = [
  {
    id: '1',
    patientName: 'Anita Devi',
    date: 'Mon, 8 Sep',
    time: '10:30 AM',
    summary: 'Routine check-in, no change in medication',
  },
  {
    id: '2',
    patientName: 'Ramesh Gogoi',
    date: 'Thu, 4 Sep',
    time: '3:00 PM',
    summary: 'Initial cognitive assessment',
  },
  {
    id: '3',
    patientName: 'Anita Devi',
    date: 'Mon, 25 Aug',
    time: '10:30 AM',
    summary: 'Follow-up on early-stage diagnosis',
  },
];

function DoctorPastAppointmentsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'DoctorPastAppointments'>
    >();

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityLabel={t('settings.back')}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: cardColor }]}
        >
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {t('doctorPastAppointments.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {PAST_APPOINTMENTS.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.row,
                index === PAST_APPOINTMENTS.length - 1 && styles.rowLast,
              ]}
            >
              <Text style={styles.rowGlyph}>🗓️</Text>
              <View style={styles.rowTextGroup}>
                <Text style={[styles.rowName, { color: textColor }]}>
                  {entry.patientName}
                </Text>
                <Text style={[styles.rowTime, { color: subTextColor }]}>
                  {entry.date} · {entry.time}
                </Text>
                <Text style={[styles.rowSummary, { color: subTextColor }]}>
                  {entry.summary}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.2)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowGlyph: {
    fontSize: 20,
    marginTop: 2,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowTime: {
    fontSize: 13,
    marginTop: 2,
  },
  rowSummary: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DoctorPastAppointmentsScreen;
