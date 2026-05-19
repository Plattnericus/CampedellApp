import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
import { colors } from '../theme/colors';
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

// ── Custom header: logo links (gross), Sprachauswahl exakt zentriert ──
function AppHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Status bar spacer */}
      <View style={{ height: insets.top }} />

      {/* Navigation bar */}
      <View style={styles.navBar}>
        {/* Logo — links, gross */}
        <CampedelLogo
          size={54}
          color={colors.primary}
          bgColor={colors.background}
          showText={true}
        />

        {/* Sprachauswahl — absolut zentriert im navBar */}
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, styles.langCenter]}
        >
          <LanguageSwitcher />
        </View>
      </View>

      <View style={styles.headerBorder} />
    </View>
  );
}

function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <AppHeader />,

        // Tab bar
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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tertiary,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.surface,
          elevation: 0,
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
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
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main"   component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    position: 'relative',
  },
  langCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
});
