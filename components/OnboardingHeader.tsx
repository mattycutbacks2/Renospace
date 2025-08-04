import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export function OnboardingHeader({ step, total, title, onBack }: { step: number; total: number; title: string; onBack?: () => void }) {
  const progress = (step / total) * 100;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {step} of {total}</Text>
          <Text style={styles.percentageText}>{Math.round(progress)}% complete</Text>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        
        {/* Question header */}
        <Text style={styles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121212',
  },
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#121212',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBackground: {
    height: 8,
    width: '100%',
    backgroundColor: '#333333',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
  },
}); 