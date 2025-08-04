import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'studio') {
            return <MaterialCommunityIcons name="palette" size={size} color={color} />;
          }
          if (route.name === 'compose') {
            return <MaterialCommunityIcons name="plus-box-multiple" size={size} color={color} />;
          }
          if (route.name === 'me') {
            return <Ionicons name="person-circle" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen name="studio" options={{ title: 'Studio' }} />
      <Tabs.Screen name="compose" options={{ title: 'Compose' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
} 