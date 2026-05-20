import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pressable, Animated, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useColors } from '../theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const ThemeSwitcher: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors();

  const btnScale    = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const iconScale   = useRef(new Animated.Value(1)).current;

  const isFirstRender = useRef(true);
  const [displayDark, setDisplayDark] = useState(isDark);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Fade + shrink out
    Animated.parallel([
      Animated.timing(iconOpacity, { toValue: 0,   duration: 90,  useNativeDriver: true }),
      Animated.timing(iconScale,   { toValue: 0.35, duration: 90,  useNativeDriver: true }),
    ]).start(() => {
      setDisplayDark(isDark);
      // Fade + grow in
      Animated.parallel([
        Animated.timing(iconOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(iconScale,   { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
    });
  }, [isDark]);

  const handlePress = useCallback((e: GestureResponderEvent) => {
    Haptics.selectionAsync();
    const { pageX, pageY } = e.nativeEvent;

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.78, duration: 70, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 7 }),
    ]).start();

    toggleTheme(pageX, pageY);
  }, [toggleTheme]);

  const iconName: IoniconName = displayDark ? 'sunny-outline' : 'moon-outline';
  const iconColor = displayDark ? '#F5EDE0' : '#1A1208';

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.btn, { backgroundColor: c.cream }]}
      hitSlop={8}
    >
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
          <Ionicons name={iconName} size={19} color={iconColor} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
