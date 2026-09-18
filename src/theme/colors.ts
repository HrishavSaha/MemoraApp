import { useColorScheme } from 'react-native';

/**
 * The four brand colors, as given. Everything else in the theme is derived
 * from these — surfaces, muted/divider tones, and dark mode all stay inside
 * this family rather than introducing unrelated hues.
 */
export const palette = {
  text: '#1C1208',
  background: '#F4EDDB',
  accent: '#C8A74C',
  primary: '#497D59',
} as const;

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  muted: string;
  border: string;
  primary: string;
  primaryTint: string;
  /** A deepened shade of primary, used to give the doctor role its own
   * identity color without leaving the palette family. */
  primaryDark: string;
  accent: string;
  accentTint: string;
  danger: string;
  dangerTint: string;
  /** Selected-row background for the role/language picker screens. */
  selected: string;
  /** Modal backdrop. */
  overlay: string;
  /** Text/labels that sit on a solid primary/accent/danger fill. */
  onColor: string;
};

const light: ThemeColors = {
  background: palette.background,
  card: '#FFFDF6',
  text: palette.text,
  subtext: '#7A6A52',
  muted: '#E4D9BC',
  border: 'rgba(28,18,8,0.12)',
  primary: palette.primary,
  primaryTint: 'rgba(73,125,89,0.12)',
  primaryDark: '#345D42',
  accent: palette.accent,
  accentTint: 'rgba(200,167,76,0.18)',
  danger: '#B3423A',
  dangerTint: 'rgba(179,66,58,0.14)',
  selected: '#E3ECE2',
  overlay: 'rgba(28,18,8,0.5)',
  onColor: '#FFFFFF',
};

const dark: ThemeColors = {
  // Dark mode swaps the two neutral roles rather than switching families,
  // so both modes read as the same warm palette instead of two apps.
  background: palette.text,
  card: '#2B2014',
  text: palette.background,
  subtext: '#C9B896',
  muted: '#4A3D28',
  border: 'rgba(244,237,219,0.14)',
  primary: palette.primary,
  primaryTint: 'rgba(73,125,89,0.24)',
  primaryDark: '#5C9670',
  accent: palette.accent,
  accentTint: 'rgba(200,167,76,0.24)',
  danger: '#D9695F',
  dangerTint: 'rgba(217,105,95,0.2)',
  selected: '#233225',
  overlay: 'rgba(0,0,0,0.6)',
  onColor: '#FFFFFF',
};

export function useThemeColors(): ThemeColors {
  const isDarkMode = useColorScheme() === 'dark';
  return isDarkMode ? dark : light;
}
