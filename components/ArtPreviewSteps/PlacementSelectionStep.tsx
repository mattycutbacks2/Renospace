import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useArtPreviewWizard } from '../../contexts/ArtPreviewWizardContext';
import { MobileMaskDrawer } from '../MobileMaskDrawer';

const PURPLE = '#6B46C1';

export const PlacementSelectionStep: React.FC = () => {
  const { 
    state, 
    setMask, 
    setIsDrawing, 
    goToStep 
  } = useArtPreviewWizard();

  const handleMaskComplete = (mask: any) => {
    console.log('🎯 Mask completed, setting mask and advancing to step 3');
    setMask(mask);
    console.log('🎯 Mask selected:', mask);
    // Automatically advance to the next step
    goToStep(3);
  };

  const handleMaskCancel = () => {
    goToStep(1);
  };

  const handleReset = () => {
    setMask(null);
    setIsDrawing(false);
  };

  const handleNext = () => {
    if (!state.mask) {
      Alert.alert('No Placement Area', 'Please draw a placement area first');
      return;
    }
    goToStep(3);
  };

  const handleBack = () => {
    goToStep(1);
  };

  // Show mask drawer if no room image or mask not selected
  if (!state.roomImageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>No Room Image</Text>
          <Text style={styles.subtitle}>Please upload a room image first</Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBack}>
            <Text style={styles.primaryButtonText}>Back to Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show mask drawer for placement selection
  return (
    <MobileMaskDrawer
      roomUri={state.roomImageUri}
      onComplete={handleMaskComplete}
      onCancel={handleMaskCancel}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: PURPLE,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 