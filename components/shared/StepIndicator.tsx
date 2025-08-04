import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default StepIndicator; 