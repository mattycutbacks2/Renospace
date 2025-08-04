import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useArtPreviewWizard } from '../../contexts/ArtPreviewWizardContext';

const PURPLE = '#6B46C1';

export const RoomUploadStep: React.FC = () => {
  const { 
    state, 
    setRoomImage, 
    setRoomUploadStatus, 
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
        setRoomImage(result.assets[0].uri);
        setRoomUploadStatus('success');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      setRoomUploadStatus('error');
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
        setRoomImage(result.assets[0].uri);
        setRoomUploadStatus('success');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose photo');
      setRoomUploadStatus('error');
    }
  };

  const handleNext = () => {
    goToStep(2);
  };

  const canProceed = state.roomImageUri && state.roomUploadStatus === 'success';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upload Your Room</Text>
        <Text style={styles.subtitle}>
          Take a photo or choose from your gallery to get started
        </Text>
      </View>

      {/* Upload Area */}
      <View style={styles.uploadSection}>
        {state.roomImageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: state.roomImageUri }} style={styles.previewImage} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.actionButton} onPress={chooseFromGallery}>
                <Text style={styles.actionButtonText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <Text style={styles.actionButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.successIndicator}>
              <Text style={styles.successText}>✓ Room photo uploaded successfully</Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>🏠</Text>
            <Text style={styles.uploadText}>Upload Your Room</Text>
            <Text style={styles.uploadSubtext}>
              The space where you want to place artwork
            </Text>
            
            {state.roomUploadStatus === 'uploading' && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={PURPLE} size="large" />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            )}
            
            {state.roomUploadStatus === 'error' && (
              <Text style={styles.errorText}>Upload failed. Please try again.</Text>
            )}
            
            <View style={styles.uploadButtons}>
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={takePhoto}
                disabled={state.roomUploadStatus === 'uploading'}
              >
                <Text style={styles.uploadButtonText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={chooseFromGallery}
                disabled={state.roomUploadStatus === 'uploading'}
              >
                <Text style={styles.uploadButtonText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !canProceed && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.primaryButtonText}>
            {canProceed ? 'Next: Draw Placement Area' : 'Upload a room photo first'}
          </Text>
        </TouchableOpacity>
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
  uploadSection: {
    flex: 1,
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
}); 