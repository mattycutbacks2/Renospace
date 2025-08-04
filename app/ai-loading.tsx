import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { runToolAndSave } from '../utils/runToolAndSave';
import { supabase } from '../utils/supabaseClient';

const LOADING_STEPS = [
  'Analyzing your room photo... 🏠✨',
  'Understanding your design preferences... 🎨',
  'Generating AI-powered transformations... ✨',
  'Applying your personalized design... 🎯',
  'Finalizing your new space... ✨',
];

export default function AILoading() {
  const theme = useTheme();
  const router = useRouter();
  const { image, roomType, style } = useLocalSearchParams();
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const pulseAnim = new Animated.Value(1);

  const callEdgeFunction = async () => {
    try {
      setError('');
      
      // Simulate progress through steps
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < LOADING_STEPS.length - 1) {
            setProgress(((prev + 1) / LOADING_STEPS.length) * 100);
            return prev + 1;
          }
          return prev;
        });
      }, 2000);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in first!');
      }

      // Combine room type and style into a prompt
      const prompt = `Room: ${roomType}, Style: ${style}`;
      
      const { resultUrl } = await runToolAndSave({
        fileUri: image as string,
        userId: user.id,
        module: 'redesign',
        prompt,
        edgeFunction: 'run-tool',
      });

      clearInterval(stepInterval);
      setProgress(100);
      setCurrentStep(LOADING_STEPS.length - 1);

      setTimeout(() => {
        router.replace({
          pathname: '/results-gallery',
          params: {
            redesignedImage: resultUrl,
            originalImage: image,
            roomType,
            style,
          },
        });
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setTimeout(() => {
        router.replace({
          pathname: '/results-gallery',
          params: {
            redesignedImage: '',
            originalImage: image,
            roomType,
            style,
            error: err.message || 'Something went wrong.'
          },
        });
      }, 1200);
    }
  };

  useEffect(() => {
    if (!image) {
      router.replace('/image-upload');
      return;
    }
    callEdgeFunction();
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerBackVisible: false }} />
      <View style={styles(theme).container}>
        <View style={styles(theme).content}>
          <Animated.View style={[styles(theme).iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles(theme).icon}>🎨</Text>
          </Animated.View>
          
          <Text style={styles(theme).title}>Design AI is working its magic</Text>
          
          <View style={styles(theme).progressContainer}>
            <View style={styles(theme).progressBar}>
              <View style={[styles(theme).progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles(theme).progressText}>{Math.round(progress)}%</Text>
          </View>

          <Text style={styles(theme).statusText}>
            {LOADING_STEPS[currentStep]}
          </Text>

          <View style={styles(theme).stepsContainer}>
            {LOADING_STEPS.map((step, index) => (
              <View key={index} style={styles(theme).stepRow}>
                <View style={[
                  styles(theme).stepDot,
                  index <= currentStep ? styles(theme).stepDotActive : styles(theme).stepDotInactive
                ]} />
                <Text style={[
                  styles(theme).stepText,
                  index <= currentStep ? styles(theme).stepTextActive : styles(theme).stepTextInactive
                ]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[5],
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: theme.spacing[6],
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing[5],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 4,
    marginRight: theme.spacing[3],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: theme.typography.bodyBold.fontWeight as any,
    color: theme.colors.primary,
    minWidth: 40,
  },
  statusText: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[5],
    lineHeight: theme.typography.h4.lineHeight,
  },
  stepsContainer: {
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing[3],
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepDotInactive: {
    backgroundColor: theme.colors.borderLight,
  },
  stepText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    flex: 1,
  },
  stepTextActive: {
    color: theme.colors.text,
    fontWeight: '500' as any,
  },
  stepTextInactive: {
    color: theme.colors.textMuted,
  },
});


