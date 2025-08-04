import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useArtPreviewWizard } from '../../contexts/ArtPreviewWizardContext';

const PURPLE = '#6B46C1';

// Component to show composited image with artwork overlay
const CompositedImageView: React.FC<{
  roomImageUri: string;
  artworkImageUri: string;
  mask: any;
  fitMode: string;
}> = ({ roomImageUri, artworkImageUri, mask, fitMode }) => {
  if (!mask) {
    return (
      <Image 
        source={{ uri: roomImageUri }} 
        style={styles.resultImage} 
        resizeMode="contain" 
      />
    );
  }

  return (
    <View style={styles.compositeContainer}>
      {/* Background room image */}
      <Image 
        source={{ uri: roomImageUri }} 
        style={styles.roomImage} 
        resizeMode="cover" 
      />
      
      {/* Overlaid artwork */}
      <View style={[
        styles.artworkOverlay,
        {
          left: mask.x,
          top: mask.y,
          width: mask.width,
          height: mask.height,
        }
      ]}>
        <Image 
          source={{ uri: artworkImageUri }} 
          style={styles.artworkImage} 
          resizeMode={fitMode === 'letterbox' ? 'contain' : 'cover'} 
        />
      </View>
    </View>
  );
};

export const ResultsStep: React.FC = () => {
  const { 
    state, 
    resetWizard, 
    goToStep 
  } = useArtPreviewWizard();

  const [showBefore, setShowBefore] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my AI-generated room design!',
        url: state.resultUrl,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share result');
    }
  };

  const handleDownload = () => {
    // In a real app, you'd implement actual download functionality
    Alert.alert('Download', 'Result saved to your gallery!');
  };

  const handlePlaceMore = () => {
    Alert.alert(
      'Place More Artwork',
      'Would you like to start a new project?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Start New',
          onPress: () => {
            resetWizard();
            goToStep(1);
          }
        }
      ]
    );
  };

  const handleAdjustPlacement = () => {
    goToStep(2);
  };

  const handleBackToStudio = () => {
    Alert.alert(
      'Back to Studio',
      'Are you sure you want to leave? Your progress will be lost.',
      [
        {
          text: 'Stay Here',
          style: 'cancel'
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            resetWizard();
            // Navigate back to studio (you'll need to implement this)
          }
        }
      ]
    );
  };

  if (!state.roomImageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>No Result Available</Text>
          <Text style={styles.subtitle}>Something went wrong during processing</Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => goToStep(1)}>
            <Text style={styles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Artwork Preview</Text>
        <Text style={styles.subtitle}>
          See how your artwork looks in your room
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Before/After Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showBefore && styles.toggleButtonActive
            ]}
            onPress={() => setShowBefore(false)}
          >
            <Text style={[
              styles.toggleButtonText,
              !showBefore && styles.toggleButtonTextActive
            ]}>
              After
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showBefore && styles.toggleButtonActive
            ]}
            onPress={() => setShowBefore(true)}
          >
            <Text style={[
              styles.toggleButtonText,
              showBefore && styles.toggleButtonTextActive
            ]}>
              Before
            </Text>
          </TouchableOpacity>
        </View>

        {/* Result Image */}
        <View style={styles.imageContainer}>
          {showBefore ? (
            <Image
              source={{ uri: state.roomImageUri }}
              style={styles.resultImage}
              resizeMode="contain"
            />
          ) : (
            <CompositedImageView
              roomImageUri={state.roomImageUri}
              artworkImageUri={state.artworkImageUri}
              mask={state.mask}
              fitMode={state.fitMode}
            />
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.imageLabel}>
              {showBefore ? 'Original Room' : 'With Your Artwork'}
            </Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✨</Text>
          <Text style={styles.successTitle}>Artwork Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your artwork has been placed in your room. You can toggle between before and after to see the difference.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Text style={styles.actionButtonIcon}>💾</Text>
            <Text style={styles.actionButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Share Result</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAdjustPlacement}>
            <Text style={styles.secondaryButtonText}>Adjust Placement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePlaceMore}>
            <Text style={styles.primaryButtonText}>Place More Artwork</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.backButton} onPress={handleBackToStudio}>
          <Text style={styles.backButtonText}>← Back to Studio</Text>
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
  content: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#111827',
  },
  imageContainer: {
    margin: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: 400,
  },
  compositeContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  artworkOverlay: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  imageLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    margin: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    margin: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
    marginBottom: 16,
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
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
}); 