import { useRouter } from 'expo-router';
import React from 'react';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useFlow } from '../components/FlowManager';

interface PaywallScreenProps {
  onComplete?: () => void;
}

export default function PaywallScreen({ onComplete }: PaywallScreenProps) {
  const router = useRouter();
  const { markPaid } = useFlow();

  React.useEffect(() => {
    async function showPaywall() {
      try {
        const result = await RevenueCatUI.presentPaywall();
        
        console.log('📱 RevenueCat paywall result:', result);
        
        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          console.log('✅ Purchase successful');
          markPaid();
          onComplete?.();
          router.push('/(tabs)/studio');
        } else if (result === PAYWALL_RESULT.CANCELLED) {
          console.log('❌ User cancelled');
          // For testing, let them continue anyway
          markPaid();
          onComplete?.();
          router.push('/(tabs)/studio');
        }
      } catch (error) {
        console.error('Paywall error:', error);
        // Fallback - let them continue
        markPaid();
        onComplete?.();
        router.push('/(tabs)/studio');
      }
    }

    showPaywall();
  }, []);

  return null; // RevenueCat handles the UI
}


