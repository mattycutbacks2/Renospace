import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFlow } from '../components/FlowManager';
import { supabase } from '../utils/supabaseClient';

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const router = useRouter();
  const { markAuthDone } = useFlow();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'email' | 'apple' | null>(null);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Please enter both email and password.');
      return;
    }

    setLoading('email');
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: 'exp://192.168.1.17:8081' // Update with your Expo dev server URL
          }
        });
        
        if (error) throw error;
        
        console.log('✅ Email sign-up successful');
        Alert.alert(
          'Check your email', 
          'We\'ve sent a confirmation link to your email. Please verify your account to continue.'
        );
        // For now, let them proceed to onboarding
        markAuthDone();
        onAuthSuccess?.();
        router.replace('/(tabs)/studio');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        console.log('✅ Email sign-in successful');
        markAuthDone();
        onAuthSuccess?.();
        router.replace('/(tabs)/studio');
      }
    } catch (error: any) {
      console.error('❌ Email auth error:', error);
      setError(error.message);
      Alert.alert(
        mode === 'signup' ? 'Sign Up Error' : 'Log In Error', 
        error.message
      );
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading('apple');
    setError('');

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const { identityToken } = credential;

      if (identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
        });

        if (error) throw error;

        console.log('✅ Apple sign-in successful');
        markAuthDone();
        onAuthSuccess?.();
        router.replace('/(tabs)/studio');
      }
    } catch (error: any) {
      console.error('❌ Apple sign-in error:', error);
      if (error.code === 'ERR_CANCELED') {
        // User canceled - don't show error
        setError('');
      } else {
        setError('Apple sign-in failed. Please try again.');
        Alert.alert('Apple Sign-In Error', error.message || error.toString());
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signup' 
            ? 'Sign up to start designing' 
            : 'Log in to continue designing'
          }
        </Text>
        
        {/* Email/Password Form */}
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={loading === null}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={loading === null}
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading === 'email' && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading !== null}
          >
            {loading === 'email' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'signup' ? 'Create Account' : 'Log In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Or separator */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple Sign-In (iOS only) */}
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              mode === 'signup'
                ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        {/* Toggle Mode */}
        <TouchableOpacity
          onPress={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
          }}
          style={styles.toggleContainer}
        >
          <Text style={styles.toggleText}>
            {mode === 'signup'
              ? 'Already have an account? Log In'
              : "Don't have an account? Sign Up"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  container: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a11cb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6a11cb',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  appleButton: {
    width: '100%',
    height: 48,
  },
  toggleContainer: {
    marginTop: 24,
    paddingVertical: 8,
  },
  toggleText: {
    color: '#6a11cb',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
}); 