import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useColors } from '../theme/colors';

export const ThemeSwitcher: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.selectionAsync();
    const { pageX, pageY } = e.nativeEvent;

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.78, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 7 }),
    ]).start();

    toggleTheme(pageX, pageY);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.btn, { backgroundColor: c.cream }]}
      hitSlop={8}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name="contrast"
          size={19}
          color={isDark ? '#F0D060' : '#4A3828'}
        />
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
