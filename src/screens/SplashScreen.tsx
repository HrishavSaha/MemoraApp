import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const SPLASH_DURATION_MS = 2500;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

function SplashScreen({ navigation }: Props) {
  const isDarkMode = useColorScheme() === 'dark';
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Localisation');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0F1A24' : '#EAF4F4' },
      ]}>
      <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#1B4B4B' }]}>
        Memora
      </Text>
      <Text
        style={[styles.tagline, { color: isDarkMode ? '#B8CFCF' : '#3E6E6E' }]}>
        {t('splash.tagline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '400',
  },
});

export default SplashScreen;
