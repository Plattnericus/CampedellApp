import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  size?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
}

// Real logo.png is used for full-size displays (showText=true).
// SVG icon recreation is used for small header icons (showText=false).
// The X mark: solid blade (\, upper-left→lower-right) + hollow blade (/,
// upper-right→lower-left). Hollow drawn on top so its bgColor fill creates
// the white diamond cutout at the center crossing.
const BLADE = "-2,-27 2,-27 9,-21 9,21 2,27 -2,27 -9,21 -9,-21";

const logoSource = require('../../assets/logo.png');

export const CampedelLogo: React.FC<Props> = ({
  size = 80,
  color = colors.primary,
  bgColor = colors.background,
  showText = true,
}) => {
  if (showText) {
    // Full logo: use the real logo.png (includes icon + "campedèl" wordmark)
    // Aspect ratio is approximately 420:230 ≈ 1.83:1
    const imgW = size * 1.83;
    const imgH = size;
    return (
      <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
        <Image
          source={logoSource}
          style={{ width: imgW, height: imgH }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Small icon mode: SVG recreation of just the X mark (no text)
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Solid blade: \ direction (upper-left → lower-right) */}
      <Polygon
        points={BLADE}
        fill={color}
        transform="translate(50,50) rotate(45)"
      />
      {/* Hollow blade: / direction (upper-right → lower-left), drawn on top */}
      <Polygon
        points={BLADE}
        fill={bgColor}
        stroke={color}
        strokeWidth="3.5"
        strokeLinejoin="round"
        transform="translate(50,50) rotate(-45)"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
