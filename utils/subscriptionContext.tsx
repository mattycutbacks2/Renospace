import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

interface SubscriptionInfo {
  isActive: boolean;
  planType?: 'annual' | 'weekly';
  expiresAt?: string;
  // Add other subscription details as needed
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  checkSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  // New one-off purchase properties
  isSubscribed: boolean;
  offerings: PurchasesOffering | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  purchaseOneOff: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  hasOneOffCredits: boolean;
  oneOffCreditsRemaining: number;
  consumeCredit: () => Promise<boolean>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [hasOneOffCredits, setHasOneOffCredits] = useState(false);
  const [oneOffCreditsRemaining, setOneOffCreditsRemaining] = useState(0);

  useEffect(() => {
    checkSubscription();
    fetchOfferings();
  }, []);

  const checkSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Implement RevenueCat subscription check
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = customerInfo.entitlements.active['premium'] !== undefined;
      const hasCredits = customerInfo.entitlements.active['tour_credits'] !== undefined;
      
      setIsSubscribed(hasActiveSubscription);
      setHasOneOffCredits(hasCredits);
      
      if (hasActiveSubscription) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const subscriptionData: SubscriptionInfo = {
          isActive: true,
          planType: entitlement.productIdentifier.includes('annual') ? 'annual' : 'weekly',
          expiresAt: entitlement.expirationDate || undefined,
        };
        
        setSubscription(subscriptionData);
        await AsyncStorage.setItem('subscription', JSON.stringify(subscriptionData));
      } else {
        // No active subscription found
        const subscriptionData: SubscriptionInfo = { isActive: false };
        setSubscription(subscriptionData);
        await AsyncStorage.setItem('subscription', JSON.stringify(subscriptionData));
      }

      // Check stored credits
      const storedCredits = await AsyncStorage.getItem('tourCredits');
      if (storedCredits) {
        setOneOffCreditsRemaining(parseInt(storedCredits));
      }
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      
      // Fallback to stored subscription data
      const storedSubscription = await AsyncStorage.getItem('subscription');
      if (storedSubscription) {
        const subData = JSON.parse(storedSubscription);
        setSubscription(subData);
        return subData.isActive;
      }
      
      // No subscription found
      const subscriptionData: SubscriptionInfo = { isActive: false };
      setSubscription(subscriptionData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings.current);
    } catch (error) {
      console.log('Error fetching offerings:', error);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = customerInfo.entitlements.active['premium'] !== undefined;
      setIsSubscribed(isActive);
      return isActive;
    } catch (error) {
      console.log('Purchase error:', error);
      return false;
    }
  };

  const purchaseOneOff = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      // Check for one-off purchase entitlement
      const hasCredits = customerInfo.entitlements.active['tour_credits'] !== undefined;
      setHasOneOffCredits(hasCredits);
      
      // Set credits (e.g., 5 tours per purchase)
      if (hasCredits) {
        const currentCredits = await AsyncStorage.getItem('tourCredits');
        const newCredits = (currentCredits ? parseInt(currentCredits) : 0) + 5;
        setOneOffCreditsRemaining(newCredits);
        await AsyncStorage.setItem('tourCredits', newCredits.toString());
      }
      
      return hasCredits;
    } catch (error) {
      console.log('One-off purchase error:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = customerInfo.entitlements.active['premium'] !== undefined;
      const hasCredits = customerInfo.entitlements.active['tour_credits'] !== undefined;
      
      setIsSubscribed(isActive);
      setHasOneOffCredits(hasCredits);
      
      // Check stored credits
      const storedCredits = await AsyncStorage.getItem('tourCredits');
      if (storedCredits) {
        setOneOffCreditsRemaining(parseInt(storedCredits));
      }
      
      return isActive;
    } catch (error) {
      console.log('Restore error:', error);
      return false;
    }
  };

  const consumeCredit = async (): Promise<boolean> => {
    if (isSubscribed) return true; // Unlimited for subscribers
    
    if (oneOffCreditsRemaining > 0) {
      const newCredits = oneOffCreditsRemaining - 1;
      setOneOffCreditsRemaining(newCredits);
      await AsyncStorage.setItem('tourCredits', newCredits.toString());
      return true;
    }
    
    return false; // No credits left
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  const value = {
    subscription,
    isLoading,
    checkSubscription,
    refreshSubscription,
    isSubscribed,
    offerings,
    purchasePackage,
    purchaseOneOff,
    restorePurchases,
    hasOneOffCredits,
    oneOffCreditsRemaining,
    consumeCredit,
    loading: isLoading,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 