import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameProgressChart } from '../../components/GameProgressChart';
import { getAverageAdherence, getWeeklyAdherence } from '../../data/adherence';
import { readAppointments } from '../../data/appointments';
import { CALL_LOG } from '../../data/callLog';
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
import { useCaretakerPatientNotes } from '../../hooks/useCaretakerPatientNotes';
import { useDoctorNotes } from '../../hooks/useDoctorNotes';
import { palette, useThemeColors } from '../../theme/colors';
import { parseAppointmentDateTime } from '../../utils/appointmentDate';
import type { RootStackParamList } from '../../navigation/types';

const MOCA_BAR_MAX_HEIGHT = 64;

function DoctorPatientDetailScreen() {
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
  const [editingNoteToCaretaker, setEditingNoteToCaretaker] = useState(false);

  const { notes: notesFromCaretaker } = useCaretakerPatientNotes();
  const { notes: notesToCaretaker, setNote: setNoteToCaretaker } =
    useDoctorNotes();

  const {
    background: backgroundColor,
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    muted: mutedBarColor,
    border,
    primaryTint,
  } = useThemeColors();

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

  const callNotes = readCallNotes();
  const patientNotes = patient
    ? CALL_LOG.filter(
        entry => entry.patientId === patient.id && !!callNotes[entry.id],
      ).map(entry => ({ dateTime: entry.dateTime, note: callNotes[entry.id] }))
    : [];

  if (!patient) {
    return null;
  }

  const noteFromCaretaker = notesFromCaretaker[patient.id];
  const noteToCaretaker = notesToCaretaker[patient.id];

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
            <LegendDot color={palette.primary} />
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

        {/* Game progress, last 4 weeks */}
        <GameProgressChart patientId={patient.id} period="weekly" />

        {/* Caretaker's general note for this patient */}
        {/* <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t('doctorPatient.noteFromCaretakerTitle')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {noteFromCaretaker ? (
            <Text style={[styles.noteCardText, { color: textColor }]}>
              {noteFromCaretaker}
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('doctorPatient.noNoteFromCaretaker')}
            </Text>
          )}
        </View> */}

        {/* Doctor's note for the caretaker */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('doctorPatient.noteToCaretakerTitle')}
          </Text>
          <Pressable
            onPress={() => setEditingNoteToCaretaker(true)}
            style={({ pressed }) => [
              styles.addChip,
              { backgroundColor: primaryTint },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addChipLabel}>
              {noteToCaretaker
                ? t('doctorPatient.editNoteToCaretaker')
                : t('doctorPatient.addNoteToCaretaker')}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {noteToCaretaker ? (
            <Text style={[styles.noteCardText, { color: textColor }]}>
              {noteToCaretaker}
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('doctorPatient.noNoteToCaretaker')}
            </Text>
          )}
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
                  { borderBottomColor: border },
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

      <NoteToCaretakerModal
        visible={editingNoteToCaretaker}
        initialNote={noteToCaretaker}
        onClose={() => setEditingNoteToCaretaker(false)}
        onSubmit={value => {
          setNoteToCaretaker(patient.id, value);
          setEditingNoteToCaretaker(false);
        }}
      />
    </View>
  );
}

function NoteToCaretakerModal({
  visible,
  initialNote,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initialNote?: string;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const { t } = useTranslation();
  const [note, setNoteText] = useState('');

  useEffect(() => {
    if (visible) {
      setNoteText(initialNote ?? '');
    }
  }, [visible, initialNote]);

  const {
    background: inputBackground,
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    overlay,
  } = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalOverlay, { backgroundColor: overlay }]}
      >
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {t('doctorPatient.noteToCaretakerModalTitle')}
          </Text>

          <Text style={[styles.formLabel, { color: subTextColor }]}>
            {t('doctorPatient.noteFieldLabel')}
          </Text>
          <TextInput
            value={note}
            onChangeText={setNoteText}
            multiline
            style={[
              styles.formInput,
              styles.formInputMultiline,
              { backgroundColor: inputBackground, color: textColor },
            ]}
          />

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.formButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.formButtonLabel, { color: subTextColor }]}>
                {t('doctorPatient.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit(note.trim())}
              style={({ pressed }) => [
                styles.formButton,
                styles.modalButtonPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalButtonPrimaryLabel}>
                {t('doctorPatient.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function LegendDot({ color }: { color: string }) {
  return <View style={[styles.legendDot, { backgroundColor: color }]} />;
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
  const {
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    overlay,
  } = useThemeColors();

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
      <View style={[styles.modalOverlay, { backgroundColor: overlay }]}>
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
  const {
    card: cardColor,
    text: textColor,
    subtext: subTextColor,
    border,
    overlay,
  } = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {t('doctorPatient.adherenceDetailTitle')}
          </Text>
          <ScrollView>
            {days.map(entry => (
              <View
                key={entry.day}
                style={[
                  styles.adherenceDetailRow,
                  { borderBottomColor: border },
                ]}
              >
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addChip: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  noteCardText: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    backgroundColor: palette.primary,
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
    color: palette.primary,
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
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  modalButtonPrimary: {
    backgroundColor: palette.primary,
  },
  modalButtonPrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  formInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  formButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DoctorPatientDetailScreen;
