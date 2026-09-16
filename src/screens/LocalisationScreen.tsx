import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../localisation/LanguageContext';

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
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex(index => (index + 1) % HEADER_CYCLE_LANGUAGES.length);
    }, HEADER_CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const headerT = i18n.getFixedT(HEADER_CYCLE_LANGUAGES[cycleIndex]);

  const backgroundColor = isDarkMode ? '#0F1A24' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1B4B4B';
  const subTextColor = isDarkMode ? '#B8CFCF' : '#5A7A7A';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingTop: insets.top + 24 },
      ]}>
      <Text style={[styles.title, { color: textColor }]}>
        {headerT('localisation.title')}
      </Text>
      <Text style={[styles.subtitle, { color: subTextColor }]}>
        {headerT('localisation.subtitle')}
      </Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = item.code === language;
          return (
            <Pressable
              onPress={() => setLanguage(item.code)}
              style={[
                styles.languageRow,
                {
                  borderColor: isSelected ? '#1B7A6D' : '#DDE7E7',
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? '#123832'
                      : '#EAF6F3'
                    : 'transparent',
                },
              ]}>
              <Text style={[styles.languageName, { color: textColor }]}>
                {item.nativeName}
              </Text>
              <Text style={[styles.languageSubName, { color: subTextColor }]}>
                {item.englishName}
              </Text>
            </Pressable>
          );
        }}
      />
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
});

export default LocalisationScreen;
