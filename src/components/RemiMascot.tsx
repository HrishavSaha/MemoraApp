import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useThemeColors } from '../theme/colors';

export type RemiPose = 'welcome' | 'newGames' | 'win' | 'playing' | 'fail';

export const REMI_IMAGES: Record<RemiPose, ImageSourcePropType> = {
  welcome: require('../../assets/mascot-images/Gemini_Generated_Image_bp9drobp9drobp9d.png'),
  newGames: require('../../assets/mascot-images/Gemini_Generated_Image_easzuneaszuneasz2.png'),
  win: require('../../assets/mascot-images/Gemini_Generated_Image_ydya5cydya5cydya4.png'),
  playing: require('../../assets/mascot-images/Gemini_Generated_Image_ydya5cydya5cydya3.png'),
  fail: require('../../assets/mascot-images/Gemini_Generated_Image_ydya5cydya5cydya.png'),
};

const DEFAULT_SIZE = 64;

/**
 * Remi, the app's red-panda mascot — a round avatar with an optional speech
 * bubble to its right. Pass `message` for poses that "speak" (win/fail/
 * newGames/welcome); omit it for silent poses (e.g. "playing").
 */
export function RemiMascot({
  pose,
  message,
  size = DEFAULT_SIZE,
}: {
  pose: RemiPose;
  message?: string;
  size?: number;
}) {
  const { card, text, border } = useThemeColors();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: card,
            borderColor: border,
          },
        ]}
      >
        <Image
          source={REMI_IMAGES[pose]}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
      {!!message && (
        <View style={styles.bubbleRow}>
          <View style={[styles.tail, { borderRightColor: card }]} />
          <View
            style={[
              styles.bubble,
              { backgroundColor: card, borderColor: border },
            ]}
          >
            <Text style={[styles.bubbleText, { color: text }]}>{message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: -1,
  },
  tail: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubble: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexShrink: 1,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
