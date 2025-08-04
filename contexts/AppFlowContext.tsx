import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type FlowState = {
  hasSeenSplash: boolean;
  hasCompletedWelcome: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedReview: boolean;
  hasPaid: boolean;
  devSkipFlow?: boolean;
};

const defaultState: FlowState = {
  hasSeenSplash: false,
  hasCompletedWelcome: false,
  hasCompletedOnboarding: false,
  hasCompletedReview: false,
  hasPaid: false,
  devSkipFlow: false,
};

const AppFlowContext = createContext<{
  flowState: FlowState;
  loading: boolean;
  error: string | null;
  completeSplash: () => void;
  completeWelcome: () => void;
  completeOnboarding: () => void;
  completeReview: () => void;
  completePaywall: () => void;
  setDevSkipFlow: (val: boolean) => void;
  resetFlow: () => void;
}>(
  {
    flowState: defaultState,
    loading: true,
    error: null,
    completeSplash: () => {},
    completeWelcome: () => {},
    completeOnboarding: () => {},
    completeReview: () => {},
    completePaywall: () => {},
    setDevSkipFlow: () => {},
    resetFlow: () => {},
  }
);

const STORAGE_KEY = 'appFlowState';

export function getNextOnboardingRoute(flowState: FlowState): string {
  console.log('getNextOnboardingRoute: Checking flow state:', flowState);
  
  if (!flowState.hasSeenSplash) {
    console.log('getNextOnboardingRoute: Returning /splash');
    return '/splash';
  }
  if (!flowState.hasCompletedWelcome) {
    console.log('getNextOnboardingRoute: Returning /welcome (new user)');
    return '/welcome';
  }
  if (!flowState.hasCompletedOnboarding) {
    console.log('getNextOnboardingRoute: Returning /onboarding (after welcome)');
    return '/onboarding';
  }
  if (!flowState.hasCompletedReview) {
    console.log('getNextOnboardingRoute: Returning /review');
    return '/review';
  }
  if (!flowState.hasPaid) {
    console.log('getNextOnboardingRoute: Returning /paywall (educated but unpaid)');
    return '/paywall';
  }
  // If all onboarding is complete, go to main tabs
  console.log('getNextOnboardingRoute: Returning /(tabs)/studio (paid user)');
  return '/(tabs)/studio';
}

export const AppFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flowState, setFlowState] = useState<FlowState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from AsyncStorage
  useEffect(() => {
    console.log('AppFlowContext: Loading flow state...');
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        console.log('AppFlowContext: Loaded value:', val);
        if (val) {
          const parsed = JSON.parse(val);
          console.log('AppFlowContext: Parsed state:', parsed);
          setFlowState({ ...defaultState, ...parsed });
        } else {
          console.log('AppFlowContext: No saved state, using default');
        }
      })
      .catch((e) => {
        console.error('AppFlowContext: Error loading flow state:', e);
        setError('Failed to load flow state');
      })
      .finally(() => {
        console.log('AppFlowContext: Loading complete, setting loading to false');
        setLoading(false);
      });
  }, []);

  // Persist to AsyncStorage
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flowState)).catch(() => {});
    }
  }, [flowState, loading]);

  // Methods to advance steps
  const completeSplash = () => setFlowState((s) => ({ ...s, hasSeenSplash: true }));
  const completeWelcome = () => setFlowState((s) => ({ ...s, hasCompletedWelcome: true }));
  const completeOnboarding = () => setFlowState((s) => ({ ...s, hasCompletedOnboarding: true }));
  const completeReview = () => setFlowState((s) => ({ ...s, hasCompletedReview: true }));
  const completePaywall = () => setFlowState((s) => ({ ...s, hasPaid: true }));
  const setDevSkipFlow = (val: boolean) => setFlowState((s) => ({ ...s, devSkipFlow: val }));
  const resetFlow = () => setFlowState(defaultState);

  return (
    <AppFlowContext.Provider
      value={{
        flowState,
        loading,
        error,
        completeSplash,
        completeWelcome,
        completeOnboarding,
        completeReview,
        completePaywall,
        setDevSkipFlow,
        resetFlow,
      }}
    >
      {children}
    </AppFlowContext.Provider>
  );
};

export const useAppFlow = () => useContext(AppFlowContext); 