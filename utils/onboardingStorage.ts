import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingResponses {
  goal?: string;
  experience?: string;
  intent?: string;
  styles?: string[];
  budget?: string;
  magicMoment?: string;
  space?: string;
  style?: string[];
  palette?: string;
}

const ONBOARDING_KEY = 'onboarding_responses';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export const saveOnboardingResponses = async (responses: OnboardingResponses): Promise<void> => {
  try {
    console.log('saveOnboardingResponses: Saving responses:', responses);
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(responses));
    console.log('saveOnboardingResponses: Saved responses, marking as completed');
    // Mark onboarding as completed
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    console.log('saveOnboardingResponses: Marked onboarding as completed');
  } catch (error) {
    console.error('Error saving onboarding responses:', error);
    throw error;
  }
};

export const getOnboardingResponses = async (): Promise<OnboardingResponses | null> => {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting onboarding responses:', error);
    return null;
  }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding completion:', error);
  return false;
  }
};

export const clearOnboardingResponses = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Error clearing onboarding responses:', error);
    throw error;
  }
}; 