import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Circle, Line } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { BottomTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import CheckinScreen from '../screens/CheckinScreen';
import TerraScreen from '../screens/TerraScreen';
import LogScreen from '../screens/LogScreen';
import ConstellationScreen from '../screens/ConstellationScreen';
import { Activity, Home, Earth, MessageSquareText, Waypoints} from 'lucide-react-native';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.icon, focused && styles.iconActive]}>
      {children}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.orange,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarLabelStyle: styles.tabLabel,
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: 'BASE',
        tabBarIcon: ({ focused, color }) => (

          <TabIcon focused={focused}>
            <Home size={24} stroke={color}/>
          </TabIcon>
        ),
      }} />
      <Tab.Screen name="Checkin" component={CheckinScreen} options={{
        tabBarLabel: 'CHECK-IN',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon focused={focused}>
            <Activity size={24} stroke={color}/>
          </TabIcon>
        ),
      }} />
      <Tab.Screen name="Terra" component={TerraScreen} options={{
        tabBarLabel: 'TERRA',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon focused={focused}>
            <Earth size={24} stroke={color} />
          </TabIcon>
        ),
      }} />
      <Tab.Screen name="Log" component={LogScreen} options={{
        tabBarLabel: 'LOG',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon focused={focused}>
            <MessageSquareText size={24} stroke={color} />
          </TabIcon>
        ),
      }} />
      <Tab.Screen name="Constellation" component={ConstellationScreen} options={{
        tabBarLabel: 'CONSTEL.',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon focused={focused}>
            <Waypoints size={24} stroke={color} />
          </TabIcon>
        ),
      }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border, height: 64, paddingBottom: 8, paddingTop: 4 },
  icon: { alignItems: 'center', justifyContent: 'center', paddingBottom: 2 },
  iconActive: { borderBottomWidth: 2, borderBottomColor: COLORS.orange },
  tabLabel: { fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '400' },
});