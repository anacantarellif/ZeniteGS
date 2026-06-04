import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from './src/types';
import { getFlags } from './src/utils/storage';
import { COLORS } from './src/constants/colors';

import OnboardingScreen from './src/screens/OnboardingScreen';
import EstabilizarScreen from './src/screens/EstabilizarScreen';
import BreathingSessionScreen from './src/screens/BreathingSessionScreen';

import MainTabs from './src/navigation/MainTabs';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] =
    useState<'Onboarding' | 'Main' | null>(null);

  useEffect(() => {
    (async () => {
      const flags = await getFlags();
      setInitialRoute(flags.onboardingDone ? 'Main' : 'Onboarding');
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar
          style="light"
          backgroundColor={COLORS.background}
        />

        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
          />

          <Stack.Screen
            name="Main"
            component={MainTabs}
          />

          <Stack.Screen
            name="Estabilizar"
            component={EstabilizarScreen}
          />

          <Stack.Screen
            name="BreathingSession"
            component={BreathingSessionScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}