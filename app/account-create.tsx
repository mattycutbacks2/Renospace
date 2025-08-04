import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import Button from '../components/ui/Button';
import { useTheme } from '../theme';
import { supabase } from '../utils/supabaseClient';

export default function AccountCreateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = email.trim().length > 0 || phone.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      // Create Supabase user (email or phone) with random password
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      let result;
      if (email.trim()) {
        result = await supabase.auth.signUp({ email: email.trim(), password: randomPassword });
      } else if (phone.trim()) {
        result = await supabase.auth.signUp({ phone: phone.trim(), password: randomPassword });
      }
      if (result?.error) throw result.error;
      // Success: route to main app
      router.replace({ pathname: '/(tabs)/studio' });
    } catch (e: any) {
      setError(e.message || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: theme.spacing[6] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.primary, marginBottom: theme.spacing[2], textAlign: 'center' }}>
        Thank you for subscribing!
      </Text>
      <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing[6], textAlign: 'center' }}>
        Create your account to save your designs and get updates. Enter your email or phone (SMS) to continue.
      </Text>
      <View style={{ width: '100%', marginBottom: theme.spacing[4] }}>
        <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 4 }}>Email</Text>
        <TextInput
          style={{
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.roundness.md,
            padding: 14,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            marginBottom: theme.spacing[4],
          }}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 4 }}>Phone (SMS)</Text>
        <TextInput
          style={{
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.roundness.md,
            padding: 14,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          }}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      {error && <Text style={{ color: theme.colors.error, marginBottom: theme.spacing[3] }}>{error}</Text>}
      <Button
        title={loading ? 'Creating Account...' : 'Continue'}
        variant="primary"
        size="lg"
        fullWidth
        disabled={!isValid || loading}
        onPress={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
} 