import { useColorScheme } from 'react-native';

const lightTheme = {
  colors: {
    primary: '#6B46C1',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B35B1',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6C757D',
    textMuted: '#9CA3AF',
    shadow: '#22223B',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    border: '#E0E1DD',
    borderLight: '#F3F4F6',
  },
  roundness: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    captionBold: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 5,
    },
  },
};

const darkTheme = {
  colors: {
    primary: '#9F7AEA',
    primaryLight: '#B794F4',
    primaryDark: '#6B46C1',
    background: '#18181B',
    surface: '#23232A',
    surfaceSecondary: '#23232A',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    shadow: '#000000',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    border: '#27272A',
    borderLight: '#2D2D31',
  },
  roundness: lightTheme.roundness,
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  shadows: lightTheme.shadows,
};

// Theme preference: 'system' | 'light' | 'dark'
export function useTheme(preference = 'system') {
  const colorScheme = useColorScheme();
  if (preference === 'light') return lightTheme;
  if (preference === 'dark') return darkTheme;
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export { darkTheme, lightTheme };

