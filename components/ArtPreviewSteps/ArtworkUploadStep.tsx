import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useArtPreviewWizard } from '../../contexts/ArtPreviewWizardContext';

const PURPLE = '#6B46C1';

const FIT_MODES = [
  { key: 'fill', label: 'Fill Area', description: 'Stretch to fill the entire area' },
  { key: 'letterbox', label: 'Letterbox', description: 'Fit within area, maintain aspect ratio' },
  { key: 'crop', label: 'Crop Center', description: 'Crop from center to fit area' },
];

export const ArtworkUploadStep: React.FC = () => {
  const { 
    state, 
    setArtworkImage, 
    setArtworkUploadStatus, 
    setFitMode,
    goToStep 
  } = useArtPreviewWizard();

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setArtworkImage(result.assets[0].uri);
        setArtworkUploadStatus('success');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      setArtworkUploadStatus('error');
    }
  };

  const chooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to choose photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setArtworkImage(result.assets[0].uri);
        setArtworkUploadStatus('success');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose photo');
      setArtworkUploadStatus('error');
    }
  };

  const handleFitModeSelect = (mode: 'fill' | 'letterbox' | 'crop') => {
    setFitMode(mode);
  };

  const handleNext = () => {
    if (!state.artworkImageUri) {
      Alert.alert('No Artwork', 'Please upload artwork first');
      return;
    }
    goToStep(4);
  };

  const handleBack = () => {
    goToStep(2);
  };

  const canProceed = state.artworkImageUri && state.artworkUploadStatus === 'success';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upload Your Artwork</Text>
        <Text style={styles.subtitle}>
          Choose the artwork you want to place in your room
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artwork Upload */}
        <View style={styles.uploadSection}>
          {state.artworkImageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: state.artworkImageUri }} style={styles.previewImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.actionButton} onPress={chooseFromGallery}>
                  <Text style={styles.actionButtonText}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                  <Text style={styles.actionButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.successIndicator}>
                <Text style={styles.successText}>✓ Artwork uploaded successfully</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>🎨</Text>
              <Text style={styles.uploadText}>Upload Your Artwork</Text>
              <Text style={styles.uploadSubtext}>
                The artwork you want to place in your room
              </Text>
              
              {state.artworkUploadStatus === 'uploading' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={PURPLE} size="large" />
                  <Text style={styles.loadingText}>Uploading...</Text>
                </View>
              )}
              
              {state.artworkUploadStatus === 'error' && (
                <Text style={styles.errorText}>Upload failed. Please try again.</Text>
              )}
              
              <View style={styles.uploadButtons}>
                <TouchableOpacity 
                  style={styles.uploadButton} 
                  onPress={takePhoto}
                  disabled={state.artworkUploadStatus === 'uploading'}
                >
                  <Text style={styles.uploadButtonText}>📷 Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.uploadButton} 
                  onPress={chooseFromGallery}
                  disabled={state.artworkUploadStatus === 'uploading'}
                >
                  <Text style={styles.uploadButtonText}>🖼️ Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Fit Mode Selection */}
        {state.artworkImageUri && (
          <View style={styles.fitModeSection}>
            <Text style={styles.sectionTitle}>How should the artwork fit?</Text>
            <Text style={styles.sectionSubtitle}>
              Choose how your artwork will be placed in the selected area
            </Text>
            
            {FIT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.fitModeOption,
                  state.fitMode === mode.key && styles.fitModeSelected
                ]}
                onPress={() => handleFitModeSelect(mode.key as any)}
              >
                <View style={styles.fitModeContent}>
                  <Text style={[
                    styles.fitModeLabel,
                    state.fitMode === mode.key && styles.fitModeLabelSelected
                  ]}>
                    {mode.label}
                  </Text>
                  <Text style={[
                    styles.fitModeDescription,
                    state.fitMode === mode.key && styles.fitModeDescriptionSelected
                  ]}>
                    {mode.description}
                  </Text>
                </View>
                {state.fitMode === mode.key && (
                  <Text style={styles.selectedIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canProceed && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={styles.primaryButtonText}>
              {canProceed ? 'Next: Generate Preview' : 'Upload artwork first'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  content: {
    flex: 1,
  },
  uploadSection: {
    padding: 24,
  },
  uploadPlaceholder: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: PURPLE,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  successIndicator: {
    backgroundColor: '#10B981',
    padding: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fitModeSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  fitModeOption: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fitModeSelected: {
    borderColor: PURPLE,
    borderWidth: 2,
  },
  fitModeContent: {
    flex: 1,
  },
  fitModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fitModeLabelSelected: {
    color: PURPLE,
  },
  fitModeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  fitModeDescriptionSelected: {
    color: '#6B7280',
  },
  selectedIcon: {
    fontSize: 20,
    color: PURPLE,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
}); 