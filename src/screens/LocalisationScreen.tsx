import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../localisation/LanguageContext';
import { palette, useThemeColors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Language = {
  code: string;
  englishName: string;
  nativeName: string;
};

// Only these locales have reviewed translations (see src/localisation/i18n.ts).
// The header cycles through them to showcase the app's languages, independent
// of whichever language is actually selected below.
const HEADER_CYCLE_LANGUAGES = ['en', 'hi', 'bn', 'as'];
const HEADER_CYCLE_INTERVAL_MS = 3000;

const LANGUAGES: Language[] = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'as', englishName: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
  { code: 'brx', englishName: 'Bodo', nativeName: 'बड़ो' },
  { code: 'mni', englishName: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ' },
  { code: 'kha', englishName: 'Khasi', nativeName: 'Khasi' },
  { code: 'lus', englishName: 'Mizo', nativeName: 'Mizo ṭawng' },
  { code: 'grt', englishName: 'Garo', nativeName: 'A·chik' },
  { code: 'nag', englishName: 'Nagamese', nativeName: 'Nagamese' },
];

function LocalisationScreen() {
  const { background, text, subtext, primary, border, selected } =
    useThemeColors();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [cycleIndex, setCycleIndex] = useState(0);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Localisation'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'Localisation'>>();
  const fromSettings = route.params?.fromSettings ?? false;

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex(index => (index + 1) % HEADER_CYCLE_LANGUAGES.length);
    }, HEADER_CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const headerT = i18n.getFixedT(HEADER_CYCLE_LANGUAGES[cycleIndex]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: text }]}>
        {headerT('localisation.title')}
      </Text>
      <Text style={[styles.subtitle, { color: subtext }]}>
        {headerT('localisation.subtitle')}
      </Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = item.code === language;
          return (
            <Pressable
              onPress={() => setLanguage(item.code)}
              style={[
                styles.languageRow,
                {
                  borderColor: isSelected ? primary : border,
                  backgroundColor: isSelected ? selected : 'transparent',
                },
              ]}
            >
              <Text style={[styles.languageName, { color: text }]}>
                {item.nativeName}
              </Text>
              <Text style={[styles.languageSubName, { color: subtext }]}>
                {item.englishName}
              </Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={[styles.nextButton, { marginBottom: insets.bottom + 16 }]}
        onPress={() =>
          fromSettings
            ? navigation.goBack()
            : navigation.navigate('RoleSelection')
        }
      >
        <Text style={styles.nextButtonLabel}>
          {fromSettings ? t('localisation.change') : t('localisation.next')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  languageRow: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageSubName: {
    fontSize: 14,
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default LocalisationScreen;
