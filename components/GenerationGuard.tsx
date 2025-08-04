import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useSubscription } from '../utils/subscriptionContext';

interface GenerationGuardProps {
  children: React.ReactNode;
  showCredits?: boolean;
}

export function GenerationGuard({ children, showCredits = true }: GenerationGuardProps) {
  const router = useRouter();
  const { isSubscribed, oneOffCreditsRemaining, consumeCredit } = useSubscription();

  const handleGeneration = async (): Promise<boolean> => {
    const canGenerate = await consumeCredit();
    
    if (!canGenerate) {
      // Redirect to paywall
      router.push('/paywall');
      return false;
    }
    
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      {/* Show credits remaining for non-subscribers */}
      {showCredits && !isSubscribed && oneOffCreditsRemaining > 0 && (
        <View style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            Tours: {oneOffCreditsRemaining}
          </Text>
        </View>
      )}
    </View>
  );
}

// Export the handleGeneration function for use in components
export const useGenerationGuard = () => {
  const router = useRouter();
  const { consumeCredit } = useSubscription();

  const checkAndConsumeCredit = async (): Promise<boolean> => {
    const canGenerate = await consumeCredit();
    
    if (!canGenerate) {
      router.push('/paywall');
      return false;
    }
    
    return true;
  };

  return { checkAndConsumeCredit };
}; 