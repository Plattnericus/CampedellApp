import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Animated, Easing, StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';

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
const MAX_RADIUS = Math.sqrt(width * width + height * height) + 50;

// Created once outside component — never recreated
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SnapshotLayer = {
  id: string;
  uri: string;
  x: number;
  y: number;
  oldBg: string;
};

const MaskLayer = ({ layer, onRemove }: {
  layer: SnapshotLayer;
  onRemove: (id: string) => void;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: MAX_RADIUS,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onRemove(layer.id);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
            <Defs>
              <Mask id={`mask-${layer.id}`}>
                <Rect x="0" y="0" width={width} height={height} fill="white" />
                <AnimatedCircle cx={layer.x} cy={layer.y} r={anim} fill="black" />
              </Mask>
            </Defs>
            <Rect x="0" y="0" width={width} height={height} fill="white" mask={`url(#mask-${layer.id})`} />
          </Svg>
        }
      >
        <Image
          source={{ uri: layer.uri }}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: layer.oldBg }]}
          fadeDuration={0}
        />
      </MaskedView>
    </View>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [layers, setLayers] = useState<SnapshotLayer[]>([]);
  const viewShotRef = useRef<ViewShot>(null);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const toggleTheme = useCallback(async (x: number = 0, y: number = 0) => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const oldBg = isDarkRef.current ? '#1A1208' : '#FAF6F1';

      setIsDark((prev) => {
        const next = !prev;
        AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
        return next;
      });

      setLayers((prev) => [
        {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          uri,
          x,
          y,
          oldBg,
        },
        ...prev,
      ]);
    } catch (e) {
      console.warn('Mask transition failed', e);
      setIsDark((prev) => !prev);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#1A1208' : '#FAF6F1' }}>
        <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: 'jpg', quality: 0.75 }}>
          {children}
        </ViewShot>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {layers.map((layer) => (
            <MaskLayer key={layer.id} layer={layer} onRemove={removeLayer} />
          ))}
        </View>
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
