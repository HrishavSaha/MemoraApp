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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AUDIO_SUPPORT_KEY,
  HAPTICS_KEY,
  MUSIC_KEY,
  readToggle,
} from '../settings/preferenceKeys';
import { storage } from '../storage/mmkv';
import { useThemeColors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

function SettingsScreen() {
  const { background, card, text, subtext, border, danger } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Settings'>>();

  const [musicEnabled, setMusicEnabled] = useState(() =>
    readToggle(MUSIC_KEY, true),
  );
  const [audioSupportEnabled, setAudioSupportEnabled] = useState(() =>
    readToggle(AUDIO_SUPPORT_KEY, true),
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(() =>
    readToggle(HAPTICS_KEY, true),
  );

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

  const rowStyle = [styles.settingRow, { borderBottomColor: border }];

  return (
    <View style={[styles.screen, { backgroundColor: background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityLabel={t('settings.back')}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: card }]}
        >
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: card }]}>
          <View style={rowStyle}>
            <Text style={styles.settingIcon}>🎵</Text>
            <Text style={[styles.settingLabel, { color: text }]}>
              {t('settings.music')}
            </Text>
            <Switch value={musicEnabled} onValueChange={toggleMusic} />
          </View>

          <View style={rowStyle}>
            <Text style={styles.settingIcon}>🗣️</Text>
            <Text style={[styles.settingLabel, { color: text }]}>
              {t('settings.audioSupport')}
            </Text>
            <Switch
              value={audioSupportEnabled}
              onValueChange={toggleAudioSupport}
            />
          </View>

          <View style={rowStyle}>
            <Text style={styles.settingIcon}>📳</Text>
            <Text style={[styles.settingLabel, { color: text }]}>
              {t('settings.haptics')}
            </Text>
            <Switch value={hapticsEnabled} onValueChange={toggleHaptics} />
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate('Localisation', { fromSettings: true })
            }
            style={[rowStyle, styles.settingRowLast]}
          >
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={[styles.settingLabel, { color: text }]}>
              {t('settings.switchLanguage')}
            </Text>
            <Text style={[styles.chevron, { color: subtext }]}>›</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.logoutButton, { backgroundColor: danger }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutLabel}>{t('settings.logout')}</Text>
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
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SettingsScreen;
