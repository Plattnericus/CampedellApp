import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, Dimensions } from 'react-native';
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

// Altes Wave Design: Perfekt glatter, nativer SVG Kreis
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SnapshotLayer = {
  id: string;
  uri: string;
  x: number;
  y: number;
  anim: Animated.Value;
  oldBg: string;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [layers, setLayers] = useState<SnapshotLayer[]>([]);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async (x: number = 0, y: number = 0) => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      // Wir sichern die ALTE Farbe für den Bruchteil einer Sekunde
      const oldBg = isDark ? '#1A1208' : '#FAF6F1';

      // 1. SOFORT Umschalten. KEIN Timeout = absolut responsive und spamable!
      setIsDark((prev) => {
        const next = !prev;
        AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
        return next;
      });

      const newLayer: SnapshotLayer = {
        id: Math.random().toString(36),
        uri,
        x,
        y,
        anim: new Animated.Value(0),
        oldBg,
      };

      // 2. Layer drunterlegen für richtiges Stacking beim Spammen (neu unter alt)
      setLayers((prev) => [newLayer, ...prev]);

      // 3. Animation SOFORT starten, die Vektorkurven wachsen sauber und pixelperfekt aus
      Animated.timing(newLayer.anim, {
        toValue: MAX_RADIUS,
        duration: 650,
        useNativeDriver: false, // Erlaubt perfekten SVG Kreis!
      }).start(() => {
        setLayers((prev) => prev.filter((l) => l.id !== newLayer.id));
      });

    } catch (e) {
      console.warn('Mask transition failed', e);
      setIsDark((prev) => !prev);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* Root Background verhindert Black-Screen Flashes */}
      <View style={{ flex: 1, backgroundColor: isDark ? '#1A1208' : '#FAF6F1' }}>
        <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: 'jpg', quality: 0.6 }}>
          {children}
        </ViewShot>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {layers.map((layer) => (
            <View key={layer.id} style={StyleSheet.absoluteFill}>
              <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                  <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
                    <Defs>
                      <Mask id={`mask-${layer.id}`}>
                        <Rect x="0" y="0" width={width} height={height} fill="white" />
                        <AnimatedCircle cx={layer.x} cy={layer.y} r={layer.anim} fill="black" />
                      </Mask>
                    </Defs>
                    <Rect x="0" y="0" width={width} height={height} fill="white" mask={`url(#mask-${layer.id})`} />
                  </Svg>
                }
              >
                {/* 
                  DER ANTI-FLICKER TRICK:
                  Anstatt ein setTimeout() zu haben (was die App hart laggy machte),
                  fängt dieses 'backgroundColor' die 1-2 Frames dauernde JPG-Ladezeit ab.
                  Es füllt das noch leere Snapshot-Image kurz mit der alten Theme-Farbe.
                  Dadurch "blitzt" der neue Theme nicht vorzeitig auf = 100% sauberer Übergang instant!
                */}
                <Image 
                  source={{ uri: layer.uri }} 
                  style={[StyleSheet.absoluteFillObject, { backgroundColor: layer.oldBg }]} 
                  fadeDuration={0} 
                />
              </MaskedView>
            </View>
          ))}
        </View>
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
