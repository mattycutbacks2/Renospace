import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme';
import { runToolAndSave } from '../../../utils/runToolAndSave';
import { supabase } from '../../../utils/supabaseClient';

export default function ColorPopScreen() {
  const theme = useTheme();
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Prompt validation: non-empty, at least 8 chars
  const isPromptValid = prompt.trim().length >= 8;

  async function handlePickAndUpload(pickFn: () => Promise<string | null>) {
    const uri = await pickFn();
    if (uri) setImagePath(uri);
  }

  const handleRun = async () => {
    setError('');
    if (!imagePath) {
      setError('Please upload a photo.');
      return;
    }
    if (!isPromptValid) {
      setError('Please describe the color change (at least 8 characters).');
      return;
    }
    let effectivePrompt = prompt.trim();
    if (!effectivePrompt) {
      const filename = imagePath.split('/').pop() || 'image.jpg';
      effectivePrompt = `Tool: ColorPop\nImage: ${filename}\nTarget: "walls"\nNewColor: "light blue"\nMood: "fresh and airy"`;
    }
    const payload = {
      tool: 'colorpop',
      imageUrl: imagePath,
      prompt: effectivePrompt,
    };
    if (__DEV__) {
      console.log('🟢 Sending payload:', payload);
    }
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Please sign in first!');
        setLoading(false);
        return;
      }
      const { resultUrl } = await runToolAndSave({
        fileUri: imagePath,
        userId: user.id,
        module: 'colorpop',
        prompt: effectivePrompt,
        edgeFunction: 'run-tool',
      });
      setPrompt(''); // Optionally clear prompt on success
      setError('');
      router.push({ pathname: '/(tabs)/studio/result', params: { resultUrl } });
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles(theme).container}>
      {/* Image preview */}
      {imagePath && (
        <Image
          source={{ uri: imagePath }}
          style={styles(theme).image}
          resizeMode="cover"
        />
      )}
      {/* Prompt input */}
      <Text style={styles(theme).title}>Describe the color change</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="E.g. Make the walls light blue"
        placeholderTextColor={theme.colors.text}
        style={[styles(theme).input, error ? styles(theme).inputError : null]}
        editable={!loading}
      />
      {/* Inline error message */}
      {error ? <Text style={styles(theme).error}>{error}</Text> : null}
      {/* Run button */}
      <TouchableOpacity
        onPress={handleRun}
        disabled={loading || !imagePath || !isPromptValid}
        style={[styles(theme).runButton, (loading || !imagePath || !isPromptValid) && styles(theme).runButtonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles(theme).runButtonText}>Run</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[4],
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: theme.roundness,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E1DD',
    borderRadius: theme.roundness,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontWeight: '600',
  },
  runButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#BFC6E0',
  },
  runButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 