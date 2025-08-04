import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme';
import { useCompose } from './_layout';

export default function NotesStep() {
  const theme = useTheme();
  const { notes, setNotes } = useCompose();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (notes.trim().length < 4) {
      setError('Please add a bit more detail.');
      return;
    }
    setError('');
    router.push('/compose/result');
  };

  return (
    <KeyboardAvoidingView
      style={styles(theme).container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles(theme).content}>
        <Text style={styles(theme).title}>Any special requests?</Text>
        <Text style={styles(theme).subtitle}>
          Add notes for specific colors, furniture, or features
        </Text>
        <TextInput
          style={styles(theme).input}
          placeholder="E.g., I prefer warm colors, need space for a work area, want to incorporate existing furniture..."
          placeholderTextColor={theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={240}
        />
        {error ? <Text style={styles(theme).errorText}>{error}</Text> : null}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles(theme).nextButton,
          (notes.trim().length < 4 || pressed) && styles(theme).nextButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={notes.trim().length < 4}
      >
        <Text style={styles(theme).nextButtonText}>Generate Design</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[5],
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    lineHeight: 22,
  },
  input: {
    width: '100%',
    minHeight: 80,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing[4],
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: theme.spacing[4],
    textAlignVertical: 'top',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing[2],
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[4],
    width: '100%',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 