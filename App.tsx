import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { decode, encode } from 'base-64';
import { Buffer } from 'buffer';
import { ExpoRoot } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import 'react-native-url-polyfill/auto';
import { ArtPreviewWizardProvider } from './contexts/ArtPreviewWizardContext';
if (!global.Buffer) {
  // @ts-ignore
  global.Buffer = Buffer;
}
if (!global.btoa) global.btoa = encode
if (!global.atob) global.atob = decode

const fontConfig = {
  displayLarge:    { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  displayMedium:   { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  displaySmall:    { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  headlineLarge:   { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  headlineMedium:  { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  headlineSmall:   { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  titleLarge:      { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  titleMedium:     { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  titleSmall:      { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  labelLarge:      { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  labelMedium:     { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  labelSmall:      { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  bodyLarge:       { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  bodyMedium:      { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  bodySmall:       { fontFamily: 'Inter_400Regular', fontWeight: '400' },
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6B46C1', // Brand purple
    secondary: '#7C4DFF',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    onSurface: '#22223B',
    onPrimary: '#fff',
  },
  roundness: 12,
  fonts: fontConfig,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || 'YOUR_IOS_API_KEY' });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || 'YOUR_ANDROID_API_KEY' });
    }
  }, []);

  useEffect(() => {
    // Optionally, you can do something when fonts are loaded
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <ArtPreviewWizardProvider>
          <ExpoRoot />
        </ArtPreviewWizardProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
} 