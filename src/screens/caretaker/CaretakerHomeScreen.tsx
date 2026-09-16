import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
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
import {
  CARETAKER,
  PATIENTS,
  getPatientPriority,
  sortPatientsByPriority,
  type MockPatient,
  type PatientPriority,
} from '../../data/mockPeople';
import type { RootStackParamList } from '../../navigation/types';

const PRIORITY_COLORS: Record<
  PatientPriority,
  { solid: string; tint: string; onTint: string }
> = {
  high: { solid: '#D64545', tint: 'rgba(214,69,69,0.14)', onTint: '#D64545' },
  medium: {
    solid: '#C97A1A',
    tint: 'rgba(201,122,26,0.14)',
    onTint: '#C97A1A',
  },
  low: { solid: '#1B7A6D', tint: 'rgba(27,122,109,0.12)', onTint: '#1B7A6D' },
};

function CaretakerHomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CaretakerHome'>
    >();
  const sortedPatients = useMemo(() => sortPatientsByPriority(PATIENTS), []);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const handlePatientPress = (patient: MockPatient) => {
    navigation.navigate('CaretakerPatientDetail', { patientId: patient.id });
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{CARETAKER.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: textColor }]}>
              {CARETAKER.name}
            </Text>
            <Text style={[styles.userRole, { color: subTextColor }]}>
              {t('roleSelection.caretaker')}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={t('caretakerHome.callHistory')}
            onPress={() => navigation.navigate('CaretakerCallHistory')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.iconGlyph}>🕘</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('caretakerHome.settings')}
            onPress={() => navigation.navigate('Settings')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.iconGlyph}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('caretakerHome.patientsTitle')}
        </Text>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {sortedPatients.map((patient, index) => {
            const priority = getPatientPriority(patient);
            const colors = PRIORITY_COLORS[priority];
            return (
              <Pressable
                key={patient.id}
                onPress={() => handlePatientPress(patient)}
                style={({ pressed }) => [
                  styles.patientRow,
                  index === sortedPatients.length - 1 && styles.patientRowLast,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.patientAvatar,
                    { backgroundColor: colors.solid },
                  ]}
                >
                  <Text style={styles.patientAvatarLabel}>
                    {patient.avatarInitial}
                  </Text>
                </View>
                <View style={styles.patientTextGroup}>
                  <Text style={[styles.patientName, { color: textColor }]}>
                    {patient.name}
                  </Text>
                  <Text
                    style={[styles.patientSubtitle, { color: subTextColor }]}
                  >
                    {patient.condition} · {patient.lastActive}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: colors.tint },
                  ]}
                >
                  <Text
                    style={[styles.priorityBadgeText, { color: colors.onTint }]}
                  >
                    {priority === 'low'
                      ? `🔥 ${patient.streak}`
                      : priority === 'medium'
                      ? t('caretakerHome.checkIn')
                      : t('caretakerHome.needsAttention')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
    backgroundColor: '#5B4FCF',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.2)',
  },
  patientRowLast: {
    borderBottomWidth: 0,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B7A6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  patientTextGroup: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  patientSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  priorityBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default CaretakerHomeScreen;
