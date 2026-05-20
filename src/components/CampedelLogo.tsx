import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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

const logoBlack = require('../../assets/logo.png');
const logoWhite = require('../../assets/logo-white.png');

const CampedelLogoInner: React.FC<Props> = ({
  size = 80,
  color = lightColors.primary,
  bgColor = lightColors.background,
  showText = true,
}) => {
  const { isDark } = useTheme();

  // Crossfade: black fades out while white fades in — never both fully visible
  const blackOpacity = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const whiteOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(blackOpacity, {
        toValue: isDark ? 0 : 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(whiteOpacity, {
        toValue: isDark ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDark]);

  if (showText) {
    const imgW = size * 1.83;
    const imgH = size;
    return (
      <View style={{ width: imgW, height: imgH }}>
        <Animated.Image
          source={logoBlack}
          style={{ width: imgW, height: imgH, opacity: blackOpacity }}
          resizeMode="contain"
        />
        <Animated.Image
          source={logoWhite}
          style={[StyleSheet.absoluteFillObject, { width: imgW, height: imgH, opacity: whiteOpacity }]}
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

const styles = StyleSheet.create({});
