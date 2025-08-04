import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PURPLE = '#6B46C1';

interface Props {
  originalImageUri: string;
  processedImageUri: string;
  selectedColor: string;
  surfaceType: string;
  onTryDifferentColor: () => void;
  onStartOver: () => void;
}

const ResultsScreen: React.FC<Props> = ({
  originalImageUri,
  processedImageUri,
  selectedColor,
  surfaceType,
  onTryDifferentColor,
  onStartOver,
}) => {

  const handleSaveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to save images');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(processedImageUri);
      Alert.alert('Success', 'Image saved to your photo library!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleShareImage = async () => {
    try {
      await Share.share({
        url: processedImageUri,
        message: `Check out my redesigned ${surfaceType} with ${selectedColor} color!`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Results</Text>
          <Text style={styles.subtitle}>
            {surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)} changed to {selectedColor}
          </Text>
        </View>

        {/* Before/After Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Before & After</Text>
          
          <View style={styles.imageRow}>
            {/* Before Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: originalImageUri }} style={styles.image} />
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>Before</Text>
              </View>
            </View>

            {/* After Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: processedImageUri }} style={styles.image} />
              <View style={styles.imageLabel}>
                <View style={styles.colorIndicator}>
                  <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
                </View>
                <Text style={styles.imageLabelText}>After</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Transformation Details</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Surface Modified:</Text>
              <Text style={styles.detailValue}>
                {surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>New Color:</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: selectedColor }]} />
                <Text style={styles.detailValue}>{selectedColor}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveImage}>
            <Text style={styles.primaryButtonText}>💾 Save to Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShareImage}>
            <Text style={styles.secondaryButtonText}>📤 Share Result</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={onTryDifferentColor}>
            <Text style={styles.tertiaryButtonText}>🎨 Try Different Color</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={onStartOver}>
            <Text style={styles.tertiaryButtonText}>🔄 Start Over</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: PURPLE,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: PURPLE,
    fontSize: 18,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ResultsScreen; 