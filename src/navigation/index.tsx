import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { DrinksScreen } from '../screens/DrinksScreen';
import { WinesScreen } from '../screens/WinesScreen';
import { CampedelLogo } from '../components/CampedelLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useLanguage } from '../i18n';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home:   { active: 'home',                 inactive: 'home-outline' },
  Menu:   { active: 'restaurant',           inactive: 'restaurant-outline' },
  Drinks: { active: 'cafe',                 inactive: 'cafe-outline' },
  Wines:  { active: 'wine',                 inactive: 'wine-outline' },
};

function AppHeader() {
  const insets = useSafeAreaInsets();
  const c = useColors();

  return (
    <View style={{ backgroundColor: c.background }}>
      <View style={{ height: insets.top }} />
      <View style={[styles.navBar, { backgroundColor: c.background }]}>
        {/* Logo — links, größer */}
        <CampedelLogo
          size={66}
          color={c.primary}
          bgColor={c.background}
          showText={true}
        />

        {/* Sprachauswahl — absolut zentriert im navBar */}
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, styles.langCenter]}
        >
          <LanguageSwitcher />
        </View>

        {/* Theme Switcher — rechts oben */}
        <View style={styles.rightActions}>
          <ThemeSwitcher />
        </View>
      </View>

      <View style={[styles.headerBorder, { backgroundColor: c.borderLight }]} />
    </View>
  );
}

function MainTabs() {
  const { t } = useLanguage();
  const c = useColors();
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: c.background }}
      screenOptions={({ route }) => ({
        header: () => <AppHeader />,

        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons?.active : icons?.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.tertiary,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : c.surface,
          elevation: 0,
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => (
              <BlurView
                intensity={75}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFillObject}
              />
            )
          : undefined,
        tabBarLabelStyle: {
          ...typography.caption2,
          fontWeight: '600',
          marginBottom: 2,
          letterSpacing: 0.2,
        },
      })}
    >
      <Tab.Screen name="Home"   component={HomeScreen}   options={{ tabBarLabel: t.tabs.home }} />
      <Tab.Screen name="Menu"   component={MenuScreen}   options={{ tabBarLabel: t.tabs.menu }} />
      <Tab.Screen name="Drinks" component={DrinksScreen} options={{ tabBarLabel: t.tabs.drinks }} />
      <Tab.Screen name="Wines"  component={WinesScreen}  options={{ tabBarLabel: t.tabs.wines }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isDark } = useTheme();
  const c = useColors();

  const CustomDarkTheme = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.borderLight,
    },
  };

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.borderLight,
    },
  };

  return (
    <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main"   component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 64,
    paddingLeft: 0,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  langCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
  },
  rightActions: {
    marginLeft: 'auto',
  },
});
