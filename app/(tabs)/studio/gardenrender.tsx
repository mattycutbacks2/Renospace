import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { uploadImageFile } from '../../../utils/simpleUpload';


const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const PURPLE = '#6B46C1';

// Example prompts that users can tap to auto-fill
const EXAMPLE_PROMPTS = [
  "Transform this into a zen garden with stone paths",
  "Create a tropical paradise with palm trees",
  "Design a modern minimalist garden",
  "Make this a cottage garden with flowers",
  "Convert to a Mediterranean courtyard",
  "Style as a Japanese rock garden"
];

const GardenRenderWizard: React.FC = () => {
  const [photoUri, setPhotoUri] = useState('');
  const [prompt, setPrompt] = useState('');
  const [processedImageUri, setProcessedImageUri] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
        setPhotoUri(result.assets[0].uri);
        setPrompt(''); // Clear prompt when new photo is selected
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
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
        setPhotoUri(result.assets[0].uri);
        setPrompt(''); // Clear prompt when new photo is selected
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose photo');
    }
  };

  const handleApplyEdit = async () => {
    if (!photoUri || !prompt.trim()) {
      Alert.alert('Missing Info', 'Please upload a photo and enter a prompt');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🌿 Starting garden render...');
      
      // 1. Upload the image (like ColorTouch)
      const filename = `gardenrender_${Date.now()}.jpg`;
      const imagePath = await uploadImageFile(photoUri, filename);
      console.log('📤 Image uploaded:', imagePath);

      // 2. Call the FLUX tool
      const aiResponse = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/flux-tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          imagePath,
          prompt: prompt.trim(),
          tool: 'gardenrender'
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const { resultUrl } = await aiResponse.json();
      console.log('✅ Garden render complete:', resultUrl);

      // 3. Save to gallery (upload result to storage)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Upload the result image to storage
        const resultFilename = `gardenrender_result_${Date.now()}.jpg`;
        const resultResponse = await fetch(resultUrl);
        const resultBlob = await resultResponse.blob();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(resultFilename, resultBlob);
        
        if (uploadError) {
          console.error('❌ Failed to upload result:', uploadError);
        } else {
          console.log('✅ Result uploaded to storage');
        }

        await supabase.from('generated_images').insert({
          user_id: user.id,
          original_image_path: resultFilename,
          result_image_url: resultUrl,
          prompt: prompt.trim(),
          tool: 'gardenrender',
          created_at: new Date().toISOString()
        });
        console.log('💾 Saved to gallery');
      }

      setProcessedImageUri(resultUrl);
    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExamplePress = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleStartOver = () => {
    setPhotoUri('');
    setPrompt('');
    setProcessedImageUri('');
  };

  // If we have a processed image, show the results
  if (processedImageUri) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Transformation Complete!</Text>
            <Text style={styles.subtitle}>Your garden has been rendered</Text>
          </View>
          
          <View style={styles.content}>
            <View style={styles.resultCard}>
              <Image source={{ uri: processedImageUri }} style={styles.resultImage} />
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartOver}
            >
              <Text style={styles.primaryButtonText}>🔄 Render Another Garden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Garden Render</Text>
          <Text style={styles.subtitle}>Design beautiful outdoor spaces</Text>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          
          {/* Image Preview Section */}
          <View style={styles.imageSection}>
            {photoUri ? (
              <View style={styles.imageCard}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              </View>
            ) : (
              <View style={styles.uploadCard}>
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadIcon}>🌿</Text>
                  <Text style={styles.uploadTitle}>Upload a photo to get started</Text>
                  <Text style={styles.uploadSubtitle}>Take a photo or choose from your gallery</Text>
                </View>
                
                <View style={styles.uploadButtons}>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={takePhoto}
                  >
                    <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={chooseFromGallery}
                  >
                    <Text style={styles.secondaryButtonText}>🖼️ Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Prompt Input Section */}
          {photoUri && (
            <View style={styles.promptSection}>
              <Text style={styles.sectionLabel}>Describe the garden transformation...</Text>
              
              <View style={styles.promptCard}>
                <TextInput
                  style={styles.promptInput}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="Transform this into a zen garden with stone paths..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus={true}
                />
              </View>
              
              {/* Quick Examples */}
              <View style={styles.examplesSection}>
                <Text style={styles.examplesLabel}>Quick examples:</Text>
                <View style={styles.examplesList}>
                  {EXAMPLE_PROMPTS.slice(0, 3).map((example, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.exampleButton}
                      onPress={() => handleExamplePress(example)}
                    >
                      <Text style={styles.exampleText}>{example}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              (!photoUri || !prompt.trim() || isProcessing) && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyEdit}
            disabled={!photoUri || !prompt.trim() || isProcessing}
          >
            {isProcessing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.applyButtonText}>Rendering garden...</Text>
              </View>
            ) : (
              <View style={styles.applyButtonContent}>
                <Text style={styles.applyButtonIcon}>✨</Text>
                <Text style={styles.applyButtonText}>
                  {photoUri && prompt.trim() ? 'Render Garden' : 'Upload photo and enter prompt'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 32,
  },
  
  imageSection: {
    gap: 16,
  },
  imageCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  photoImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  
  uploadCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 24,
  },
  uploadContent: {
    alignItems: 'center',
    gap: 12,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  uploadButtons: {
    gap: 12,
  },
  
  promptSection: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  promptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  promptInput: {
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  
  examplesSection: {
    gap: 12,
  },
  examplesLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
  },
  
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applyButton: {
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
  applyButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonIcon: {
    fontSize: 16,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: PURPLE,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Results screen styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
});

export default GardenRenderWizard; 