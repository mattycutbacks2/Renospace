import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  surfaceType: string;
  setSurfaceType: (surface: string) => void;
  onProceed: () => void;
  currentStep: number;
  totalSteps: number;
}

const surfaces = [
  { id: 'wall', label: 'Wall', icon: '🧱' },
  { id: 'floor', label: 'Floor', icon: '🏠' },
  { id: 'countertop', label: 'Countertop', icon: '🍽️' },
  { id: 'cabinet', label: 'Cabinet', icon: '🗄️' },
  { id: 'door', label: 'Door', icon: '🚪' },
  { id: 'window', label: 'Window Frame', icon: '🪟' },
  { id: 'ceiling', label: 'Ceiling', icon: '☁️' },
  { id: 'furniture', label: 'Furniture', icon: '🪑' },
];

const SurfaceSelectionStep: React.FC<Props> = ({
  surfaceType,
  setSurfaceType,
  onProceed,
  currentStep,
  totalSteps,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What would you like to change?</Text>
        <Text style={styles.subtitle}>Step {currentStep} of {totalSteps}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.surfaceGrid}>
          {surfaces.map((surface) => (
            <TouchableOpacity
              key={surface.id}
              style={[
                styles.surfaceButton,
                surfaceType === surface.id && styles.selectedSurface,
              ]}
              onPress={() => setSurfaceType(surface.id)}
            >
              <Text style={styles.surfaceIcon}>{surface.icon}</Text>
              <Text style={[
                styles.surfaceLabel,
                surfaceType === surface.id && styles.selectedSurfaceLabel,
              ]}>
                {surface.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !surfaceType && styles.disabledButton,
          ]}
          onPress={onProceed}
          disabled={!surfaceType}
        >
          <Text style={styles.nextButtonText}>Next: Draw Your Mask</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  surfaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  surfaceButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSurface: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  surfaceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  surfaceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedSurfaceLabel: {
    color: '#FFF',
  },
  footer: {
    padding: 20,
  },
  nextButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SurfaceSelectionStep; 