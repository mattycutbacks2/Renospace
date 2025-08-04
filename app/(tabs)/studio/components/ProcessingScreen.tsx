import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const PURPLE = '#6B46C1';

interface Props {
  selectedColor: string;
  surfaceType: string;
  photoUri: string;
}

const ProcessingScreen: React.FC<Props> = ({
  selectedColor,
  surfaceType,
  photoUri,
}) => {
  const [progressStep, setProgressStep] = useState(0);
  const progressSteps = [
    'Analyzing your image...',
    'Identifying surfaces...',
    'Applying color changes...',
    'Finalizing results...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < progressSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Processing your image</Text>
          <Text style={styles.subtitle}>
            Changing {surfaceType} to {selectedColor}
          </Text>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <View style={[styles.colorIndicator, { backgroundColor: selectedColor }]} />
            <Text style={styles.imageLabel}>Original</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ActivityIndicator size="large" color={PURPLE} />
          
          <Text style={styles.progressText}>
            {progressSteps[progressStep]}
          </Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((progressStep + 1) / progressSteps.length) * 100}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.progressPercent}>
            {Math.round(((progressStep + 1) / progressSteps.length) * 100)}%
          </Text>
        </View>

        {/* Status Info */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>What's happening:</Text>
          <Text style={styles.statusText}>
            Our AI is carefully analyzing your image and applying the color changes 
            to only the selected surface while preserving all other details.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: 'bold',
  },
  
  statusSection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: PURPLE,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ProcessingScreen; 