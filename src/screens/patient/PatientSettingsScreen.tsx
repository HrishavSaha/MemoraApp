import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AUDIO_SUPPORT_KEY,
  HAPTICS_KEY,
  MUSIC_KEY,
  readToggle,
} from '../../settings/preferenceKeys';
import { storage } from '../../storage/mmkv';
import type { RootStackParamList } from '../../navigation/types';

function PatientSettingsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PatientSettings'>
    >();

  const [musicEnabled, setMusicEnabled] = useState(() =>
    readToggle(MUSIC_KEY, true),
  );
  const [audioSupportEnabled, setAudioSupportEnabled] = useState(() =>
    readToggle(AUDIO_SUPPORT_KEY, true),
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(() =>
    readToggle(HAPTICS_KEY, true),
  );

  const backgroundColor = isDarkMode ? '#0F1A24' : '#F5F8F8';
  const cardColor = isDarkMode ? '#152631' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  const toggleMusic = (value: boolean) => {
    setMusicEnabled(value);
    storage.set(MUSIC_KEY, value);
  };
  const toggleAudioSupport = (value: boolean) => {
    setAudioSupportEnabled(value);
    storage.set(AUDIO_SUPPORT_KEY, value);
  };
  const toggleHaptics = (value: boolean) => {
    setHapticsEnabled(value);
    storage.set(HAPTICS_KEY, value);
  };

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityLabel={t('patientSettings.back')}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: cardColor }]}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {t('patientSettings.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🎵</Text>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t('patientSettings.music')}
            </Text>
            <Switch value={musicEnabled} onValueChange={toggleMusic} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🗣️</Text>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t('patientSettings.audioSupport')}
            </Text>
            <Switch
              value={audioSupportEnabled}
              onValueChange={toggleAudioSupport}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>📳</Text>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t('patientSettings.haptics')}
            </Text>
            <Switch value={hapticsEnabled} onValueChange={toggleHaptics} />
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate('Localisation', { fromSettings: true })
            }
            style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              {t('patientSettings.switchLanguage')}
            </Text>
            <Text style={[styles.chevron, { color: subTextColor }]}>›</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutLabel}>{t('patientSettings.logout')}</Text>
        </Pressable>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,170,170,0.2)',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#D64545',
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PatientSettingsScreen;
