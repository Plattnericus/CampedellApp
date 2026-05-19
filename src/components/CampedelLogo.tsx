import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { lightColors } from '../theme/colors';

interface Props {
  size?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
}

const BLADE = "-2,-27 2,-27 9,-21 9,21 2,27 -2,27 -9,21 -9,-21";

const logoSource = require('../../assets/logo.png');

const CampedelLogoInner: React.FC<Props> = ({
  size = 80,
  color = lightColors.primary,
  bgColor = lightColors.background,
  showText = true,
}) => {
  if (showText) {
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

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon
        points={BLADE}
        fill={color}
        transform="translate(50,50) rotate(45)"
      />
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

export const CampedelLogo = React.memo(CampedelLogoInner);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
