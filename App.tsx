/**
 * Memora
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/localisation/i18n';
import { LanguageProvider } from './src/localisation/LanguageContext';
import LocalisationScreen from './src/screens/LocalisationScreen';
import PatientHomeScreen from './src/screens/patient/PatientHomeScreen';
import PatientSettingsScreen from './src/screens/patient/PatientSettingsScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import SplashScreen from './src/screens/SplashScreen';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
              name="Localisation"
              component={LocalisationScreen}
            />
            <Stack.Screen
              name="RoleSelection"
              component={RoleSelectionScreen}
            />
            <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
            <Stack.Screen
              name="PatientSettings"
              component={PatientSettingsScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
