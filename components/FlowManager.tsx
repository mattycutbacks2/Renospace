import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type FlowState = {
  hasCompletedWelcome: boolean;
  hasCompletedReview: boolean;
  hasCompletedOnboarding: boolean;
  hasPaid: boolean;
  hasCompletedAuth: boolean;
};

const STORAGE_KEY = '@flow_state_v1';

interface FlowContextType {
  markWelcomeDone: () => void;
  markReviewDone: () => void;
  markOnboardingDone: () => void;
  markPaid: () => void;
  markAuthDone: () => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within FlowManager');
  }
  return context;
};

interface FlowManagerProps {
  children: React.ReactNode;
}

export default function FlowManager({ children }: FlowManagerProps) {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // 1) Load persisted flags on mount
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsedState = JSON.parse(json);
          setFlowState(parsedState);
        } else {
          // first-run defaults
          setFlowState({
            hasCompletedWelcome: false,
            hasCompletedReview: false,
            hasCompletedOnboarding: false,
            hasPaid: false,
            hasCompletedAuth: false,
          });
        }
      } catch (error) {
        console.error('❌ Error loading flow state:', error);
        // Fallback to default state on error
        setFlowState({
          hasCompletedWelcome: false,
          hasCompletedReview: false,
          hasCompletedOnboarding: false,
          hasPaid: false,
          hasCompletedAuth: false,
        });
      } finally {
        setHasInitialized(true);
      }
    })();
  }, []);

  // 2) Whenever flowState changes, persist it
  useEffect(() => {
    if (flowState !== null) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flowState))
        .catch(error => {
          console.error('❌ Error saving flow state:', error);
        });
    }
  }, [flowState]);

  // 3) Initial redirect logic - only run ONCE on app start
  useEffect(() => {
    if (!hasInitialized || flowState === null || hasRedirected) {
      return;
    }

    // Only redirect once when the app first loads
    setHasRedirected(true);

    // Determine the next route based on flow state
    let nextRoute: string;
    if (!flowState.hasCompletedWelcome) {
      nextRoute = '/welcome';
    } else if (!flowState.hasCompletedReview) {
      nextRoute = '/review';
    } else if (!flowState.hasCompletedOnboarding) {
      nextRoute = '/onboarding';
    } else if (!flowState.hasPaid) {
      nextRoute = '/paywall';
    } else if (!flowState.hasCompletedAuth) {
      nextRoute = '/auth';
    } else {
      nextRoute = '/(tabs)/studio';
    }

    console.log('🚀 FlowManager: Initial navigation to', nextRoute, 'based on state:', flowState);
    
    // Navigate to the next route
    router.replace(nextRoute as any);
  }, [hasInitialized, flowState, hasRedirected, router]);

  // 4) Handle navigation when flow state changes (for step completion)
  useEffect(() => {
    if (!hasInitialized || flowState === null) {
      return;
    }

    // Determine the next route based on current flow state
    let nextRoute: string;
    if (!flowState.hasCompletedWelcome) {
      nextRoute = '/welcome';
    } else if (!flowState.hasCompletedReview) {
      nextRoute = '/review';
    } else if (!flowState.hasCompletedOnboarding) {
      nextRoute = '/onboarding';
    } else if (!flowState.hasPaid) {
      nextRoute = '/paywall';
    } else if (!flowState.hasCompletedAuth) {
      nextRoute = '/auth';
    } else {
      nextRoute = '/(tabs)/studio';
    }

    // Get current route to avoid unnecessary navigation
    const currentRoute = router.canGoBack() ? 'current' : 'splash';
    
    // Only navigate if we're not already on the correct route
    if (currentRoute !== nextRoute) {
      console.log('🔄 FlowManager: Navigating to', nextRoute, 'based on updated state:', flowState);
      router.replace(nextRoute as any);
    }
  }, [flowState, hasInitialized, router]);

  // 4) Handlers you can pass into each screen
  const markWelcomeDone = () =>
    setFlowState((fs) => fs && { ...fs, hasCompletedWelcome: true });

  const markReviewDone = () =>
    setFlowState((fs) => fs && { ...fs, hasCompletedReview: true });

  const markOnboardingDone = () =>
    setFlowState((fs) => fs && { ...fs, hasCompletedOnboarding: true });

  const markPaid = () =>
    setFlowState((fs) => fs && { ...fs, hasPaid: true });

  const markAuthDone = () =>
    setFlowState((fs) => fs && { ...fs, hasCompletedAuth: true });

  // 5) While loading persisted state, show splash
  if (!hasInitialized) {
    return null; // Let Expo Router handle the splash
  }

  // Return children with flow context
  return (
    <FlowContext.Provider value={{
      markWelcomeDone,
      markReviewDone,
      markOnboardingDone,
      markPaid,
      markAuthDone,
    }}>
      {children}
    </FlowContext.Provider>
  );
} 