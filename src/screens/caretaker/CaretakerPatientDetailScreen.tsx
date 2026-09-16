import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameProgressChart } from '../../components/GameProgressChart';
import type { Appointment } from '../../data/appointments';
import { PATIENTS } from '../../data/mockPeople';
import type { Reminder, ReminderType } from '../../data/reminders';
import {
  useAppointments,
  type AppointmentInput,
} from '../../hooks/useAppointments';
import { useReminders, type NewReminderInput } from '../../hooks/useReminders';
import type { RootStackParamList } from '../../navigation/types';

type ReminderModalState = {
  type: ReminderType;
  reminder?: Reminder;
};

function CaretakerPatientDetailScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CaretakerPatientDetail'>
    >();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CaretakerPatientDetail'>>();
  const patient = PATIENTS.find(p => p.id === route.params.patientId);

  const {
    reminders,
    toggle: toggleReminder,
    add: addReminder,
    update: updateReminder,
    remove: removeReminder,
  } = useReminders(route.params.patientId);
  const {
    appointments,
    add: addAppointment,
    update: updateAppointment,
    remove: removeAppointment,
  } = useAppointments(route.params.patientId);

  const [reminderModal, setReminderModal] = useState<ReminderModalState | null>(
    null,
  );
  const [editingAppointment, setEditingAppointment] = useState<
    Appointment | 'new' | null
  >(null);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  if (!patient) {
    return null;
  }

  const handleDeleteReminder = (reminder: Reminder) => {
    Alert.alert(
      t('caretakerPatient.deleteReminderConfirmTitle'),
      t('caretakerPatient.deleteReminderConfirmMessage'),
      [
        { text: t('caretakerPatient.cancel'), style: 'cancel' },
        {
          text: t('caretakerPatient.delete'),
          style: 'destructive',
          onPress: () => removeReminder(reminder.id),
        },
      ],
    );
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    Alert.alert(
      t('caretakerPatient.deleteAppointmentConfirmTitle'),
      t('caretakerPatient.deleteAppointmentConfirmMessage'),
      [
        { text: t('caretakerPatient.cancel'), style: 'cancel' },
        {
          text: t('caretakerPatient.delete'),
          style: 'destructive',
          onPress: () => removeAppointment(appointment.id),
        },
      ],
    );
  };

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
        <View style={[styles.activityCard, { backgroundColor: cardColor }]}>
          <Text style={styles.activityGlyph}>🕘</Text>
          <Text style={[styles.activityText, { color: textColor }]}>
            {t('caretakerPatient.weeklyActivity', {
              hours: patient.weeklyActiveHours,
            })}
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('caretakerPatient.remindersTitle')}
          </Text>
          <View style={styles.sectionActions}>
            <Pressable
              onPress={() => setReminderModal({ type: 'task' })}
              style={({ pressed }) => [
                styles.addChip,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.addChipLabel}>
                {t('caretakerPatient.addTask')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setReminderModal({ type: 'medicine' })}
              style={({ pressed }) => [
                styles.addChip,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.addChipLabel}>
                {t('caretakerPatient.addMedicine')}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {reminders.map((reminder, index) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderRow,
                index === reminders.length - 1 && styles.rowLast,
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
                {!!reminder.description && (
                  <Text style={[styles.reminderTime, { color: subTextColor }]}>
                    {reminder.description}
                  </Text>
                )}
              </View>
              <Pressable
                accessibilityLabel={t('caretakerPatient.editReminder')}
                onPress={() =>
                  setReminderModal({ type: reminder.type, reminder })
                }
                style={({ pressed }) => [
                  styles.rowActionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.rowActionGlyph}>✏️</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={t('caretakerPatient.deleteReminder')}
                onPress={() => handleDeleteReminder(reminder)}
                style={({ pressed }) => [
                  styles.rowActionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.rowActionGlyph}>🗑️</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleReminder(reminder.id)}
                style={[styles.checkbox, reminder.done && styles.checkboxDone]}
              >
                {reminder.done && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('caretakerPatient.appointmentsTitle')}
          </Text>
          <Pressable
            onPress={() => setEditingAppointment('new')}
            style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}
          >
            <Text style={styles.addChipLabel}>
              {t('caretakerPatient.addAppointment')}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {appointments.length === 0 ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('caretakerPatient.noAppointments')}
            </Text>
          ) : (
            appointments.map((appointment, index) => (
              <View
                key={appointment.id}
                style={[
                  styles.appointmentRow,
                  index === appointments.length - 1 && styles.rowLast,
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
                <Pressable
                  accessibilityLabel={t('caretakerPatient.editAppointment')}
                  onPress={() => setEditingAppointment(appointment)}
                  style={({ pressed }) => [
                    styles.rowActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.rowActionGlyph}>✏️</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={t('caretakerPatient.deleteAppointment')}
                  onPress={() => handleDeleteAppointment(appointment)}
                  style={({ pressed }) => [
                    styles.rowActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.rowActionGlyph}>🗑️</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <GameProgressChart patientId={patient.id} />
      </ScrollView>

      <ReminderFormModal
        visible={reminderModal !== null}
        type={reminderModal?.type ?? 'task'}
        initial={reminderModal?.reminder}
        onClose={() => setReminderModal(null)}
        onSubmit={input => {
          if (reminderModal?.reminder) {
            updateReminder(reminderModal.reminder.id, input);
          } else {
            addReminder(input);
          }
          setReminderModal(null);
        }}
      />

      <AppointmentFormModal
        visible={editingAppointment !== null}
        initial={
          editingAppointment && editingAppointment !== 'new'
            ? editingAppointment
            : undefined
        }
        onClose={() => setEditingAppointment(null)}
        onSubmit={input => {
          if (editingAppointment && editingAppointment !== 'new') {
            updateAppointment(editingAppointment.id, input);
          } else {
            addAppointment(input);
          }
          setEditingAppointment(null);
        }}
      />
    </View>
  );
}

function ReminderFormModal({
  visible,
  type,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  type: ReminderType;
  initial?: Reminder;
  onClose: () => void;
  onSubmit: (input: NewReminderInput) => void;
}) {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setTime(initial?.time ?? '');
      setDescription(initial?.description ?? '');
      setDosage(initial?.dosage ?? '');
    }
  }, [visible, initial]);

  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const inputBackground = isDarkMode ? '#0F1A24' : '#F5F8F8';

  const handleSave = () => {
    if (
      !name.trim() ||
      !time.trim() ||
      (type === 'medicine' && !dosage.trim())
    ) {
      Alert.alert(t('caretakerPatient.validationRequired'));
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      time: time.trim(),
      description: description.trim() || undefined,
      dosage: type === 'medicine' ? dosage.trim() : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {initial
              ? type === 'medicine'
                ? t('caretakerPatient.editMedicineTitle')
                : t('caretakerPatient.editTaskTitle')
              : type === 'medicine'
              ? t('caretakerPatient.addMedicineTitle')
              : t('caretakerPatient.addTaskTitle')}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormField
              label={t('caretakerPatient.fieldName')}
              value={name}
              onChangeText={setName}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
            <FormField
              label={t('caretakerPatient.fieldTime')}
              value={time}
              onChangeText={setTime}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
            {type === 'medicine' && (
              <FormField
                label={t('caretakerPatient.fieldDosage')}
                value={dosage}
                onChangeText={setDosage}
                textColor={textColor}
                subTextColor={subTextColor}
                inputBackground={inputBackground}
              />
            )}
            <FormField
              label={t('caretakerPatient.fieldDescription')}
              value={description}
              onChangeText={setDescription}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
              multiline
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modalButtonLabel, { color: subTextColor }]}>
                {t('caretakerPatient.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalButtonPrimaryLabel}>
                {t('caretakerPatient.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AppointmentFormModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial?: Appointment;
  onClose: () => void;
  onSubmit: (input: AppointmentInput) => void;
}) {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (visible) {
      setDoctorName(initial?.doctorName ?? '');
      setSpecialty(initial?.specialty ?? '');
      setDate(initial?.date ?? '');
      setTime(initial?.time ?? '');
    }
  }, [visible, initial]);

  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const inputBackground = isDarkMode ? '#0F1A24' : '#F5F8F8';

  const handleSave = () => {
    if (
      !doctorName.trim() ||
      !specialty.trim() ||
      !date.trim() ||
      !time.trim()
    ) {
      Alert.alert(t('caretakerPatient.validationRequired'));
      return;
    }
    onSubmit({
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      date: date.trim(),
      time: time.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {initial
              ? t('caretakerPatient.editAppointmentTitle')
              : t('caretakerPatient.addAppointmentTitle')}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormField
              label={t('caretakerPatient.fieldDoctorName')}
              value={doctorName}
              onChangeText={setDoctorName}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
            <FormField
              label={t('caretakerPatient.fieldSpecialty')}
              value={specialty}
              onChangeText={setSpecialty}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
            <FormField
              label={t('caretakerPatient.fieldDate')}
              value={date}
              onChangeText={setDate}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
            <FormField
              label={t('caretakerPatient.fieldTime')}
              value={time}
              onChangeText={setTime}
              textColor={textColor}
              subTextColor={subTextColor}
              inputBackground={inputBackground}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modalButtonLabel, { color: subTextColor }]}>
                {t('caretakerPatient.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalButtonPrimaryLabel}>
                {t('caretakerPatient.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  textColor,
  subTextColor,
  inputBackground,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  textColor: string;
  subTextColor: string;
  inputBackground: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.formField}>
      <Text style={[styles.formLabel, { color: subTextColor }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[
          styles.formInput,
          multiline && styles.formInputMultiline,
          { backgroundColor: inputBackground, color: textColor },
        ]}
      />
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
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  activityGlyph: {
    fontSize: 28,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addChip: {
    backgroundColor: 'rgba(27,122,109,0.12)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B7A6D',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  rowLast: {
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
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.2)',
  },
  appointmentGlyphWrap: {
    width: 30,
    alignItems: 'center',
  },
  appointmentGlyph: {
    fontSize: 22,
  },
  rowActionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActionGlyph: {
    fontSize: 16,
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
  formField: {
    marginBottom: 14,
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
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
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

export default CaretakerPatientDetailScreen;
