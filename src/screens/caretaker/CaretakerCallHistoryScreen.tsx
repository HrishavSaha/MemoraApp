import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CALL_LOG, type CallDirection } from '../../data/callLog';
import { useCallNotes } from '../../hooks/useCallNotes';
import type { RootStackParamList } from '../../navigation/types';

const DIRECTION_GLYPH: Record<CallDirection, string> = {
  outgoing: '📞',
  incoming: '📲',
  missed: '📵',
};

function CaretakerCallHistoryScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CaretakerCallHistory'>
    >();
  const { notes, setNote } = useCallNotes();
  const [editingCallId, setEditingCallId] = useState<string | null>(null);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const missedColor = '#D64545';

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
          {t('callHistory.title')}
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
          {CALL_LOG.map((entry, index) => {
            const note = notes[entry.id];
            return (
              <View
                key={entry.id}
                style={[
                  styles.callRow,
                  index === CALL_LOG.length - 1 && styles.callRowLast,
                ]}
              >
                <View style={styles.callRowTop}>
                  <Text style={styles.callGlyph}>
                    {DIRECTION_GLYPH[entry.direction]}
                  </Text>
                  <View style={styles.callTextGroup}>
                    <Text style={[styles.callName, { color: textColor }]}>
                      {entry.patientName}
                    </Text>
                    <Text style={[styles.callTime, { color: subTextColor }]}>
                      {entry.dateTime}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.callDuration,
                      {
                        color:
                          entry.direction === 'missed'
                            ? missedColor
                            : subTextColor,
                      },
                    ]}
                  >
                    {entry.direction === 'missed'
                      ? t('callHistory.missed')
                      : entry.duration}
                  </Text>
                </View>

                {!!note && (
                  <Text
                    style={[styles.noteText, { color: subTextColor }]}
                    numberOfLines={2}
                  >
                    📝 {note}
                  </Text>
                )}

                <Pressable
                  onPress={() => setEditingCallId(entry.id)}
                  style={({ pressed }) => [
                    styles.noteButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.noteButtonLabel}>
                    {note
                      ? t('callHistory.editNote')
                      : t('callHistory.addNote')}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <NoteFormModal
        visible={editingCallId !== null}
        initialNote={editingCallId ? notes[editingCallId] : undefined}
        onClose={() => setEditingCallId(null)}
        onSubmit={value => {
          if (editingCallId) {
            setNote(editingCallId, value);
          }
          setEditingCallId(null);
        }}
      />
    </View>
  );
}

function NoteFormModal({
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
  const isDarkMode = useColorScheme() === 'dark';
  const [note, setNoteText] = useState('');

  useEffect(() => {
    if (visible) {
      setNoteText(initialNote ?? '');
    }
  }, [visible, initialNote]);

  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';
  const inputBackground = isDarkMode ? '#0F1A24' : '#F5F8F8';

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
            {t('callHistory.noteModalTitle')}
          </Text>

          <Text style={[styles.formLabel, { color: subTextColor }]}>
            {t('callHistory.noteFieldLabel')}
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
                styles.modalButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modalButtonLabel, { color: subTextColor }]}>
                {t('callHistory.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit(note.trim())}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalButtonPrimaryLabel}>
                {t('callHistory.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  callRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.2)',
    gap: 8,
  },
  callRowLast: {
    borderBottomWidth: 0,
  },
  callRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callGlyph: {
    fontSize: 20,
  },
  callTextGroup: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
  },
  callTime: {
    fontSize: 13,
    marginTop: 2,
  },
  callDuration: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.6,
  },
  noteButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(27,122,109,0.12)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  noteButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B7A6D',
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

export default CaretakerCallHistoryScreen;
