import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Role = 'patient' | 'caretaker' | 'doctor';

const ROLES: Role[] = ['patient', 'caretaker', 'doctor'];

function RoleSelectionScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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
        {t('roleSelection.title')}
      </Text>
      <Text style={[styles.subtitle, { color: subTextColor }]}>
        {t('roleSelection.subtitle')}
      </Text>

      {ROLES.map(role => {
        const isSelected = role === selectedRole;
        return (
          <Pressable
            key={role}
            onPress={() => setSelectedRole(role)}
            style={[
              styles.roleRow,
              {
                borderColor: isSelected ? '#1B7A6D' : '#DDE7E7',
                backgroundColor: isSelected
                  ? isDarkMode
                    ? '#123832'
                    : '#EAF6F3'
                  : 'transparent',
              },
            ]}>
            <Text style={[styles.roleLabel, { color: textColor }]}>
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
