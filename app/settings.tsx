import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useAuth } from '../utils/authContext';
import { useSubscription } from '../utils/subscriptionContext';

const USER = {
  name: 'Design AI User',
  email: 'user@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
};

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const [dark, setDark] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme-preference');
      if (savedTheme) {
        setDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleDark = async () => {
    const newTheme = !dark;
    setDark(newTheme);
    try {
      await AsyncStorage.setItem('theme-preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).header}>Settings</Text>
      <View style={styles(theme).profileCard}>
        <Image source={{ uri: USER.avatar }} style={styles(theme).avatar} />
        <View>
          <Text style={styles(theme).name}>{user?.email || USER.name}</Text>
          <Text style={styles(theme).email}>{user?.email || USER.email}</Text>
          {subscription?.isActive && (
            <Text style={styles(theme).subscription}>
              {subscription.planType === 'annual' ? 'Annual' : 'Weekly'} Plan Active
            </Text>
          )}
        </View>
      </View>
      <View style={styles(theme).section}>
        <View style={styles(theme).row}>
          <Ionicons name="moon" size={22} color={theme.colors.primary} style={{ marginRight: theme.spacing[3] }} />
          <Text style={styles(theme).optionLabel}>Dark Mode</Text>
          <View style={{ flex: 1 }} />
          <Switch
            value={dark}
            onValueChange={toggleDark}
            thumbColor={dark ? theme.colors.primary : '#eee'}
            trackColor={{ true: theme.colors.primary + '88', false: theme.colors.border }}
          />
        </View>
      </View>
      <View style={styles(theme).section}>
        <Pressable style={styles(theme).row} onPress={() => {}}>
          <Ionicons name="person-outline" size={22} color={theme.colors.primary} style={{ marginRight: theme.spacing[3] }} />
          <Text style={styles(theme).optionLabel}>Account</Text>
        </Pressable>
        <Pressable style={styles(theme).row} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} style={{ marginRight: theme.spacing[3] }} />
          <Text style={styles(theme).optionLabel}>Notifications</Text>
        </Pressable>
        <Pressable style={styles(theme).row} onPress={() => {}}>
          <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: theme.spacing[3] }} />
          <Text style={styles(theme).optionLabel}>About</Text>
        </Pressable>
        <Pressable style={[styles(theme).row, { marginTop: theme.spacing[2] }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} style={{ marginRight: theme.spacing[3] }} />
          <Text style={[styles(theme).optionLabel, { color: theme.colors.error }]}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: theme.spacing[5],
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing[5],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[5],
    ...theme.shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: theme.spacing[4],
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  subscription: {
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: 4,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    marginBottom: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    ...theme.shadows.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  optionLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
}); 