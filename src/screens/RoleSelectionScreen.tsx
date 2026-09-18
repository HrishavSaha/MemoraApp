import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Role = 'patient' | 'caretaker' | 'doctor';

const ROLES: Role[] = ['patient', 'caretaker', 'doctor'];

function RoleSelectionScreen() {
  const { background, text, subtext, primary, border, selected } =
    useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>
    >();

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    if (role === 'patient') {
      navigation.navigate('PatientHome');
    } else if (role === 'caretaker') {
      navigation.navigate('CaretakerHome');
    } else if (role === 'doctor') {
      navigation.navigate('DoctorHome');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: text }]}>
        {t('roleSelection.title')}
      </Text>
      <Text style={[styles.subtitle, { color: subtext }]}>
        {t('roleSelection.subtitle')}
      </Text>

      {ROLES.map(role => {
        const isSelected = role === selectedRole;
        return (
          <Pressable
            key={role}
            onPress={() => handleSelectRole(role)}
            style={[
              styles.roleRow,
              {
                borderColor: isSelected ? primary : border,
                backgroundColor: isSelected ? selected : 'transparent',
              },
            ]}
          >
            <Text style={[styles.roleLabel, { color: text }]}>
              {t(`roleSelection.${role}`)}
            </Text>
          </Pressable>
        );
      })}
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
  roleRow: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;
