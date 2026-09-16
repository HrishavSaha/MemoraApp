import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAverageAdherence, getWeeklyAdherence } from '../../data/adherence';
import { readAppointments } from '../../data/appointments';
import { CALL_LOG } from '../../data/callLog';
import {
  getWeeklyGameProgress,
  type GameWeeklyProgress,
} from '../../data/gameProgress';
import { PATIENTS } from '../../data/mockPeople';
import {
  MOCA_DOMAINS,
  MOCA_DOMAIN_MAX,
  MOCA_MAX_TOTAL,
  getMocaAssessments,
  type MocaAssessment,
  type MocaDomain,
} from '../../data/mocaAssessments';
import { readCallNotes } from '../../data/callNotes';
import { parseAppointmentDateTime } from '../../utils/appointmentDate';
import type { RootStackParamList } from '../../navigation/types';

const MOCA_BAR_MAX_HEIGHT = 64;
const GAME_BAR_MAX_HEIGHT = 48;
const GAME_LEVEL_CEILING = 8;

function DoctorPatientDetailScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'DoctorPatientDetail'>
    >();
  const route =
    useRoute<RouteProp<RootStackParamList, 'DoctorPatientDetail'>>();
  const patient = PATIENTS.find(p => p.id === route.params.patientId);

  const [mocaModalVisible, setMocaModalVisible] = useState(false);
  const [adherenceModalVisible, setAdherenceModalVisible] = useState(false);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const mutedBarColor = isDarkMode ? '#3A4C55' : '#D7E2E2';

  const nextAppointment = useMemo(() => {
    if (!patient) {
      return null;
    }
    const appointments = readAppointments(patient.id);
    if (appointments.length === 0) {
      return null;
    }
    return [...appointments].sort(
      (a, b) =>
        parseAppointmentDateTime(a.date, a.time) -
        parseAppointmentDateTime(b.date, b.time),
    )[0];
  }, [patient]);

  const mocaAssessments = patient ? getMocaAssessments(patient.id) : [];
  const previousAssessment: MocaAssessment | undefined = mocaAssessments[0];
  const latestAssessment: MocaAssessment | undefined = mocaAssessments[1];

  const weeklyAdherence = patient ? getWeeklyAdherence(patient.id) : [];
  const averageAdherence = patient ? getAverageAdherence(patient.id) : 0;

  const gameProgress = patient ? getWeeklyGameProgress(patient.id) : [];

  const callNotes = readCallNotes();
  const patientNotes = patient
    ? CALL_LOG.filter(
        entry => entry.patientId === patient.id && !!callNotes[entry.id],
      ).map(entry => ({ dateTime: entry.dateTime, note: callNotes[entry.id] }))
    : [];

  if (!patient) {
    return null;
  }

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
            {patient.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
            {patient.condition}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming appointment */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.upcomingAppointmentTitle')}
        </Text>
        <View
          style={[
            styles.card,
            styles.appointmentCard,
            { backgroundColor: cardColor },
          ]}
        >
          <Text style={styles.appointmentGlyph}>🗓️</Text>
          {nextAppointment ? (
            <View style={styles.reminderTextGroup}>
              <Text style={[styles.appointmentText, { color: textColor }]}>
                {nextAppointment.date} · {nextAppointment.time}
              </Text>
              <Text
                style={[styles.appointmentSubtext, { color: subTextColor }]}
              >
                {nextAppointment.specialty}
              </Text>
            </View>
          ) : (
            <Text style={[styles.appointmentSubtext, { color: subTextColor }]}>
              {t('doctorPatient.noUpcomingAppointment')}
            </Text>
          )}
        </View>

        {/* MoCA progression */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.mocaTitle')}
        </Text>
        <Pressable
          onPress={() => setMocaModalVisible(true)}
          style={({ pressed }) => [
            styles.card,
            styles.chartCard,
            { backgroundColor: cardColor },
            pressed && styles.pressed,
          ]}
        >
          {latestAssessment ? (
            <Text style={[styles.chartSubtitle, { color: subTextColor }]}>
              {t('doctorPatient.mocaLatestTotal', {
                score: latestAssessment.totalScore,
                max: MOCA_MAX_TOTAL,
              })}
            </Text>
          ) : (
            <Text style={[styles.chartSubtitle, { color: subTextColor }]}>
              {t('doctorPatient.mocaNoData')}
            </Text>
          )}

          <View style={styles.mocaChartRow}>
            {MOCA_DOMAINS.map(domain => {
              const max = MOCA_DOMAIN_MAX[domain];
              const prevHeight = previousAssessment
                ? (previousAssessment.scores[domain] / max) *
                  MOCA_BAR_MAX_HEIGHT
                : 0;
              const latestHeight = latestAssessment
                ? (latestAssessment.scores[domain] / max) * MOCA_BAR_MAX_HEIGHT
                : 0;
              return (
                <View key={domain} style={styles.mocaGroup}>
                  <View style={styles.mocaBars}>
                    <View
                      style={[
                        styles.mocaBar,
                        {
                          height: Math.max(prevHeight, 2),
                          backgroundColor: mutedBarColor,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.mocaBar,
                        styles.mocaBarLatest,
                        { height: Math.max(latestHeight, 2) },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.mocaDomainLabel, { color: subTextColor }]}
                    numberOfLines={2}
                  >
                    {t(`doctorPatient.domain.${domain}`)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <LegendDot color={mutedBarColor} />
            <Text style={[styles.legendLabel, { color: subTextColor }]}>
              {t('doctorPatient.mocaLegendPrevious')}
            </Text>
            <LegendDot color="#1B7A6D" />
            <Text style={[styles.legendLabel, { color: subTextColor }]}>
              {t('doctorPatient.mocaLegendLatest')}
            </Text>
          </View>
        </Pressable>

        {/* Medication adherence */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.adherenceTitle')}
        </Text>
        <Pressable
          onPress={() => setAdherenceModalVisible(true)}
          style={({ pressed }) => [
            styles.card,
            styles.adherenceCard,
            { backgroundColor: cardColor },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.adherencePercentage}>{averageAdherence}%</Text>
          <Text style={[styles.chartSubtitle, { color: subTextColor }]}>
            {t('doctorPatient.adherenceSubtitle')}
          </Text>
        </Pressable>

        {/* Weekly game progress */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.gameProgressTitle')}
        </Text>
        <View
          style={[
            styles.card,
            styles.chartCard,
            { backgroundColor: cardColor },
          ]}
        >
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
              {t('doctorPatient.legendIncrease')}
            </Text>
            <LegendDot color="#D64545" />
            <Text style={[styles.legendLabel, { color: subTextColor }]}>
              {t('doctorPatient.legendDecrease')}
            </Text>
            <LegendDot color={mutedBarColor} />
            <Text style={[styles.legendLabel, { color: subTextColor }]}>
              {t('doctorPatient.legendSame')}
            </Text>
          </View>
        </View>

        {/* Caretaker notes */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.caretakerNotesTitle')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {patientNotes.length === 0 ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('doctorPatient.noNotes')}
            </Text>
          ) : (
            patientNotes.map((entry, index) => (
              <View
                key={`${entry.dateTime}-${index}`}
                style={[
                  styles.noteRow,
                  index === patientNotes.length - 1 && styles.rowLast,
                ]}
              >
                <Text style={styles.noteGlyph}>📝</Text>
                <View style={styles.reminderTextGroup}>
                  <Text style={[styles.noteText, { color: textColor }]}>
                    {entry.note}
                  </Text>
                  <Text
                    style={[styles.appointmentSubtext, { color: subTextColor }]}
                  >
                    {entry.dateTime}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <MocaDetailModal
        visible={mocaModalVisible}
        onClose={() => setMocaModalVisible(false)}
        previous={previousAssessment}
        latest={latestAssessment}
      />

      <AdherenceDetailModal
        visible={adherenceModalVisible}
        onClose={() => setAdherenceModalVisible(false)}
        days={weeklyAdherence}
      />
    </View>
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

function MocaDetailModal({
  visible,
  onClose,
  previous,
  latest,
}: {
  visible: boolean;
  onClose: () => void;
  previous?: MocaAssessment;
  latest?: MocaAssessment;
}) {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const renderAssessment = (
    label: string,
    assessment: MocaAssessment | undefined,
  ) => (
    <View style={styles.modalSection}>
      <Text style={[styles.modalSectionTitle, { color: textColor }]}>
        {label}
      </Text>
      {assessment ? (
        <>
          <Text style={[styles.modalRow, { color: subTextColor }]}>
            {t('doctorPatient.mocaDetailDate')}: {assessment.date}
          </Text>
          <Text style={[styles.modalRow, { color: subTextColor }]}>
            {t('doctorPatient.mocaDetailTotal')}: {assessment.totalScore}/
            {MOCA_MAX_TOTAL}
          </Text>
          <Text style={[styles.modalRow, { color: subTextColor }]}>
            {t('doctorPatient.mocaDetailResponseTime')}:{' '}
            {assessment.responseTimeSec}s
          </Text>
          <Text style={[styles.modalRow, { color: subTextColor }]}>
            {t('doctorPatient.mocaDetailAccuracy')}: {assessment.accuracy}%
          </Text>
          <Text style={[styles.modalRow, { color: subTextColor }]}>
            {t('doctorPatient.mocaDetailUploadedBy')}: {assessment.uploadedBy}
          </Text>
          {MOCA_DOMAINS.map((domain: MocaDomain) => (
            <Text
              key={domain}
              style={[styles.modalSubRow, { color: subTextColor }]}
            >
              {t(`doctorPatient.domain.${domain}`)}: {assessment.scores[domain]}
              /{MOCA_DOMAIN_MAX[domain]}
            </Text>
          ))}
        </>
      ) : (
        <Text style={[styles.modalRow, { color: subTextColor }]}>
          {t('doctorPatient.mocaNoData')}
        </Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {t('doctorPatient.mocaDetailTitle')}
          </Text>
          <ScrollView>
            {renderAssessment(t('doctorPatient.mocaLegendPrevious'), previous)}
            {renderAssessment(t('doctorPatient.mocaLegendLatest'), latest)}
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalButton,
              styles.modalButtonPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.modalButtonPrimaryLabel}>
              {t('doctorPatient.close')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AdherenceDetailModal({
  visible,
  onClose,
  days,
}: {
  visible: boolean;
  onClose: () => void;
  days: { day: string; percentage: number }[];
}) {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {t('doctorPatient.adherenceDetailTitle')}
          </Text>
          <ScrollView>
            {days.map(entry => (
              <View key={entry.day} style={styles.adherenceDetailRow}>
                <Text style={[styles.modalRow, { color: textColor }]}>
                  {entry.day}
                </Text>
                <Text style={[styles.modalRow, { color: subTextColor }]}>
                  {entry.percentage}%
                </Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalButton,
              styles.modalButtonPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.modalButtonPrimaryLabel}>
              {t('doctorPatient.close')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  scrollContent: {
    paddingHorizontal: 24,
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
  reminderTextGroup: {
    flex: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  appointmentGlyph: {
    fontSize: 26,
  },
  appointmentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  chartCard: {
    padding: 16,
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  mocaChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mocaGroup: {
    alignItems: 'center',
    flex: 1,
  },
  mocaBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: MOCA_BAR_MAX_HEIGHT,
    gap: 4,
  },
  mocaBar: {
    width: 12,
    borderRadius: 4,
  },
  mocaBarLatest: {
    backgroundColor: '#1B7A6D',
  },
  mocaDomainLabel: {
    fontSize: 10,
    marginTop: 6,
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
  adherenceCard: {
    padding: 18,
    alignItems: 'center',
  },
  adherencePercentage: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1B7A6D',
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
  emptyText: {
    fontSize: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  noteRow: {
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
  noteGlyph: {
    fontSize: 18,
    marginTop: 2,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalRow: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalSubRow: {
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 8,
  },
  adherenceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.15)',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  modalButtonPrimary: {
    backgroundColor: '#1B7A6D',
  },
  modalButtonPrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DoctorPatientDetailScreen;
