import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useColors } from '../theme/colors';

export const ThemeSwitcher: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors();

  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.selectionAsync();

    // Get click position for the root mask animation
    const { pageX, pageY } = e.nativeEvent;
    
    // Trigger global snapshot mask transition - No cooldown!
    toggleTheme(pageX, pageY);

    // Smooth icon rotation
    Animated.timing(rotation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => rotation.setValue(0));
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.btn, { backgroundColor: c.cream }]}
      hitSlop={6}
    >
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={18}
          color={isDark ? '#e8d8b0' : '#4A3828'}
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
