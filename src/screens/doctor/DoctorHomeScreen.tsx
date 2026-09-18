import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAppointments, type Appointment } from '../../data/appointments';
import { DOCTOR, PATIENTS, type MockPatient } from '../../data/mockPeople';
import { palette, useThemeColors } from '../../theme/colors';
import { parseAppointmentDateTime } from '../../utils/appointmentDate';
import type { RootStackParamList } from '../../navigation/types';

const DOCTOR_AVATAR_INITIAL = DOCTOR.name.replace(/^Dr\.?\s*/, '').charAt(0);

function nextAppointmentFor(patientId: string): Appointment | null {
  const appointments = readAppointments(patientId);
  if (appointments.length === 0) {
    return null;
  }
  return [...appointments].sort(
    (a, b) =>
      parseAppointmentDateTime(a.date, a.time) -
      parseAppointmentDateTime(b.date, b.time),
  )[0];
}

function DoctorHomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'DoctorHome'>
    >();

  const scheduledPatients = useMemo(() => {
    return PATIENTS.map(patient => ({
      patient,
      nextAppointment: nextAppointmentFor(patient.id),
    })).sort((a, b) => {
      const aTime = a.nextAppointment
        ? parseAppointmentDateTime(
            a.nextAppointment.date,
            a.nextAppointment.time,
          )
        : Number.POSITIVE_INFINITY;
      const bTime = b.nextAppointment
        ? parseAppointmentDateTime(
            b.nextAppointment.date,
            b.nextAppointment.time,
          )
        : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, []);

  const {
    background: backgroundColor,
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    border,
    primaryDark,
    primaryTint,
  } = useThemeColors();

  const handlePatientPress = (patient: MockPatient) => {
    navigation.navigate('DoctorPatientDetail', { patientId: patient.id });
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: primaryDark }]}>
            <Text style={styles.avatarLabel}>{DOCTOR_AVATAR_INITIAL}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: textColor }]}>
              {DOCTOR.name}
            </Text>
            <Text style={[styles.userRole, { color: subTextColor }]}>
              {DOCTOR.specialty}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={t('doctorHome.pastAppointments')}
            onPress={() => navigation.navigate('DoctorPastAppointments')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: cardColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.iconGlyph}>🗒️</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('doctorHome.settings')}
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
          {t('doctorHome.patientsTitle')}
        </Text>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {scheduledPatients.map(({ patient, nextAppointment }, index) => (
            <Pressable
              key={patient.id}
              onPress={() => handlePatientPress(patient)}
              style={({ pressed }) => [
                styles.patientRow,
                { borderBottomColor: border },
                index === scheduledPatients.length - 1 && styles.patientRowLast,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarLabel}>
                  {patient.avatarInitial}
                </Text>
              </View>
              <View style={styles.patientTextGroup}>
                <Text style={[styles.patientName, { color: textColor }]}>
                  {patient.name}
                </Text>
                <Text style={[styles.patientSubtitle, { color: subTextColor }]}>
                  {patient.condition}
                </Text>
              </View>
              <View
                style={[
                  styles.appointmentBadge,
                  { backgroundColor: primaryTint },
                  !nextAppointment && styles.appointmentBadgeMuted,
                ]}
              >
                <Text
                  style={[
                    styles.appointmentBadgeText,
                    !nextAppointment && { color: subTextColor },
                  ]}
                >
                  {nextAppointment
                    ? `${nextAppointment.date} · ${nextAppointment.time}`
                    : t('doctorHome.noAppointment')}
                </Text>
              </View>
            </Pressable>
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
  },
  patientRowLast: {
    borderBottomWidth: 0,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primary,
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
  appointmentBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    maxWidth: 140,
  },
  appointmentBadgeMuted: {
    backgroundColor: 'transparent',
  },
  appointmentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    textAlign: 'right',
  },
});

export default DoctorHomeScreen;
