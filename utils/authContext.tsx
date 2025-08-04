import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';
import {
    getCurrentUser,
    onAuthStateChange,
    signInWithApple,
    signInWithGoogle,
    signInWithMagicLink,
    signOut as supabaseSignOut
} from './supabaseClient';

interface User {
  id: string;
  email: string;
  user_metadata?: any;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithApple: () => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  restorePurchase: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session on app start
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { user: currentUser } } = await getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          user_metadata: currentUser.user_metadata,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseSignOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchase = async (): Promise<boolean> => {
    try {
      // Implement RevenueCat restore purchase
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.entitlements.active['premium'] !== undefined;
    } catch (error) {
      console.error('Restore purchase error:', error);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    signInWithApple: () => signInWithApple(),
    signInWithGoogle: () => signInWithGoogle(),
    signInWithMagicLink: (email: string) => signInWithMagicLink(email),
    signOut,
    restorePurchase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 