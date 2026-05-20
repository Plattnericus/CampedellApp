import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { lightColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  size?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
}

const BLADE = "-2,-27 2,-27 9,-21 9,21 2,27 -2,27 -9,21 -9,-21";

const logoLight = require('../../assets/logo.png');
const logoDark  = require('../../assets/logo-white.png');

const CampedelLogoInner: React.FC<Props> = ({
  size = 80,
  color = lightColors.primary,
  bgColor = lightColors.background,
  showText = true,
}) => {
  const { isDark } = useTheme();
  const darkOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(darkOpacity, {
      toValue: isDark ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  if (showText) {
    const imgW = size * 1.83;
    const imgH = size;
    return (
      <View style={[styles.wrapper, { backgroundColor: bgColor, width: imgW, height: imgH, overflow: 'hidden' }]}>
        <Image
          source={logoLight}
          style={{ width: imgW, height: imgH }}
          resizeMode="contain"
        />
        <Animated.Image
          source={logoDark}
          style={{ width: imgW, height: imgH, position: 'absolute', top: 0, left: 0, opacity: darkOpacity }}
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
