import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';
import 'react-native-reanimated';

import { Slot } from 'expo-router';
import FlowManager from '../components/FlowManager';
import { AuthProvider } from '../contexts/AuthContext';
import { SubscriptionProvider } from '../utils/subscriptionContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Configure RevenueCat
  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        await Purchases.configure({
          apiKey: 'appl_bQBFCHeWkjwYtxGJraUxoMRstyA'
        });
        
        // Set debug logging for testing
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        console.log('✅ RevenueCat configured successfully');
      } catch (error) {
        console.log('❌ RevenueCat configuration error:', error);
      }
    };
    
    configureRevenueCat();
  }, []);

  if (!loaded) {
    return null;
  }

  // Hide splash screen once fonts are loaded
  SplashScreen.hideAsync();

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <SubscriptionProvider>
          <FlowManager>
            <Slot />
          </FlowManager>
          <StatusBar style="auto" />
        </SubscriptionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
