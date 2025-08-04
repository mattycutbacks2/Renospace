import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFlow } from '../components/FlowManager';
import { supabase } from '../utils/supabaseClient';

export default function MagicLinkScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { markAuthDone } = useFlow();

  async function sendMagicLink() {
    if (!email || !email.includes('@')) {
      setMessage('❌ Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: 'designai-app://auth/callback'
        }
      });

      if (error) {
        setMessage('❌ ' + error.message);
      } else {
        setMessage('✅ Check your inbox for the magic link!');
        Alert.alert(
          'Magic Link Sent!',
          'Check your email and click the link to sign in.',
          [
            {
              text: 'OK',
              onPress: () => {
                // For testing, we can mark auth as done
                // In production, you'd wait for the actual email click
                markAuthDone();
                router.replace('/(tabs)/studio');
              }
            }
          ]
        );
      }
    } catch (error) {
      setMessage('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Renospace</Text>
          <Text style={styles.subtitle}>
            Enter your email to get started with passwordless sign-in
          </Text>
          
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={sendMagicLink}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Text>
          </TouchableOpacity>
          
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}
          
          <Text style={styles.footer}>
            No password needed! We'll send you a secure link to sign in.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a11cb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#6a11cb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
}); 