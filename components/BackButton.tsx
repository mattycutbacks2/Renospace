import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface BackButtonProps {
  style?: ViewStyle;
  onPress?: () => void;
  color?: string;
  size?: number;
}

export default function BackButton({ 
  style = {}, 
  onPress,
  color,
  size = 32 
}: BackButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles(theme).wrap, style]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles(theme).button, pressed && styles(theme).pressed]}
        hitSlop={12}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons 
          name="chevron-left" 
          size={size} 
          color={color || theme.colors.text} 
          style={styles(theme).icon} 
        />
      </Pressable>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    ...theme.shadows.md,
  },
  button: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  icon: {
    marginLeft: -2,
  },
}); 