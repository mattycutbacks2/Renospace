import React, { useRef } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

interface Props {
  photoUri: string;
  surfaceType: string;
  maskUri: string;
  setMaskUri: (uri: string) => void;
  onProceed: () => void;
  currentStep: number;
  totalSteps: number;
}

const MaskDrawStep: React.FC<Props> = ({
  photoUri,
  surfaceType,
  maskUri,
  setMaskUri,
  onProceed,
  currentStep,
  totalSteps,
}) => {
  const shotRef = useRef<ViewShot>(null);

  const handleCaptureMask = async () => {
    try {
      if (shotRef.current?.capture) {
        const uri = await shotRef.current.capture();
        setMaskUri(uri);
        console.log('✅ Mask captured:', uri);
      }
    } catch (error) {
      console.error('❌ Mask capture failed:', error);
      Alert.alert('Error', 'Failed to capture mask. Please try again.');
    }
  };

  const handleNext = () => {
    if (!maskUri) {
      Alert.alert('No Mask', 'Please draw a mask first by tapping the "Capture Mask" button');
      return;
    }
    onProceed();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Draw Your Mask</Text>
        <Text style={styles.subtitle}>Step {currentStep} of {totalSteps}</Text>
        <Text style={styles.instruction}>
          Draw over the {surfaceType} you want to change
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />
        
        {/* Drawing overlay - for now, just a simple colored overlay */}
        <ViewShot
          ref={shotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.drawingOverlay}
        >
          <View style={styles.drawingCanvas}>
            {/* This is a placeholder - in a real implementation, you'd add a drawing library */}
            <View style={styles.placeholderMask}>
              <Text style={styles.placeholderText}>
                Draw here on the {surfaceType}
              </Text>
            </View>
          </View>
        </ViewShot>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCaptureMask}
        >
          <Text style={styles.captureButtonText}>Capture Mask</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !maskUri && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!maskUri}
        >
          <Text style={styles.nextButtonText}>Next: Pick Color</Text>
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
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    margin: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  drawingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawingCanvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholderMask: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(107, 70, 193, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  captureButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
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

export default MaskDrawStep; 