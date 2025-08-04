import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PURPLE = '#6B46C1';

interface ArtPreviewWizardNavigationProps {
  currentStep: number;
  onStepPress: (step: number) => void;
  canGoBack: boolean;
}

const STEPS = [
  { number: 1, title: 'Upload Room', icon: '🏠' },
  { number: 2, title: 'Draw Area', icon: '✏️' },
  { number: 3, title: 'Upload Art', icon: '🎨' },
  { number: 4, title: 'Processing', icon: '⚡' },
  { number: 5, title: 'Result', icon: '✨' },
];

export const ArtPreviewWizardNavigation: React.FC<ArtPreviewWizardNavigationProps> = ({
  currentStep,
  onStepPress,
  canGoBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / STEPS.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {STEPS.length}
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isClickable = step.number < currentStep && canGoBack;

          return (
            <TouchableOpacity
              key={step.number}
              style={[
                styles.stepIndicator,
                isActive && styles.stepActive,
                isCompleted && styles.stepCompleted,
                isClickable && styles.stepClickable,
              ]}
              onPress={() => isClickable && onStepPress(step.number)}
              disabled={!isClickable}
            >
              <Text style={[
                styles.stepIcon,
                isActive && styles.stepIconActive,
                isCompleted && styles.stepIconCompleted,
              ]}>
                {isCompleted ? '✓' : step.icon}
              </Text>
              <Text style={[
                styles.stepTitle,
                isActive && styles.stepTitleActive,
                isCompleted && styles.stepTitleCompleted,
              ]}>
                {step.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  stepActive: {
    // Active step styling
  },
  stepCompleted: {
    // Completed step styling
  },
  stepClickable: {
    // Clickable step styling
  },
  stepIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#9CA3AF',
  },
  stepIconActive: {
    color: PURPLE,
  },
  stepIconCompleted: {
    color: '#10B981',
  },
  stepTitle: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepTitleActive: {
    color: PURPLE,
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
}); 