import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import MaskedView from '@react-native-masked-view/masked-view';

interface ThemeCtx {
  isDark: boolean;
  toggleTheme: (x: number, y: number) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'campedel_theme';
const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(width * width + height * height);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  
  const viewShotRef = useRef<ViewShot>(null);
  const maskRadius = useRef(new Animated.Value(MAX_RADIUS)).current;
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async (x: number = 0, y: number = 0) => {
    try {
      // 1. Snapshot the CURRENT screen (even if mid-transition, this bakes the rings together!)
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) throw new Error('Snapshot failed');

      // 2. We instantly switch the theme behind the scenes
      setIsDark((prev) => {
        const next = !prev;
        AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
        return next;
      });

      // 3. Keep the snapshot in the background, set new origin
      setSnapshotUri(uri);
      setOrigin({ x, y });
      
      // Stop previous expansion and immediately shrink the mask to 0 at the new coords
      maskRadius.stopAnimation();
      maskRadius.setValue(0);
      
      // 4. Start the new wave immediately (this allows "spamming" beautifully!)
      requestAnimationFrame(() => {
        Animated.timing(maskRadius, {
          toValue: MAX_RADIUS,
          duration: 700,
          useNativeDriver: true,
        }).start(({ finished }) => {
          // Only clear if this animation wasn't interrupted by a new spam click
          if (finished) {
            setSnapshotUri(null);
          }
        });
      });
    } catch (e) {
      console.warn('Mask transition failed', e);
      // Fallback
      setIsDark((prev) => !prev);
    }
  };

  const maskScale = maskRadius.interpolate({
    inputRange: [0, MAX_RADIUS],
    outputRange: [0, 1],
  });

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* 
        Background layer: The snapshot (old UI). 
        If spammed, this image literally contains the 'frozen' half-transitioned wave!
      */}
      {snapshotUri && (
        <Image
          source={{ uri: snapshotUri }}
          style={StyleSheet.absoluteFillObject}
          fadeDuration={0}
        />
      )}
      
      <MaskedView
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
        maskElement={
          <View style={StyleSheet.absoluteFill}>
            {snapshotUri ? (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: origin.x - MAX_RADIUS,
                  top: origin.y - MAX_RADIUS,
                  width: MAX_RADIUS * 2,
                  height: MAX_RADIUS * 2,
                  borderRadius: MAX_RADIUS,
                  backgroundColor: 'black',
                  transform: [{ scale: maskScale }],
                }}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]} />
            )}
          </View>
        }
      >
        <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: 'jpg', quality: 0.8 }}>
          {children}
        </ViewShot>
      </MaskedView>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
