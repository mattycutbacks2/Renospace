// app/image-upload.tsx
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme'
import { pickImageFromCamera, pickImageFromGallery } from '../utils/imagePicker'
import { supabase } from '../utils/supabaseClient'

export const screenOptions = {
  title: 'Upload Photo',
}

// Helper: Convert base64 to Blob
function base64ToBlob(base64, contentType = '') {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}

// Helper function for uploading image to Supabase
async function uploadImageToSupabase(uri: string) {
  try {
    // 1. Read the file as a Base64 string
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Convert Base64 to Uint8Array (more reliable than Buffer in React Native)
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // 3. Use .jpeg extension for all uploads
    const fileName = `${Date.now()}.jpeg`;

    // 4. Upload the buffer to Supabase (no Blobs involved)
    const { data, error } = await supabase.storage
      .from('testbucket')
      .upload(`uploads/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) throw error;

    // 5. Return the public URL
    const { data: urlData } = supabase.storage
      .from('testbucket')
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
}

export default function ImageUploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { roomType } = useLocalSearchParams();
  const [imagePath, setImagePath] = useState<string | null>(null);

  // Ask permission on mount
  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow media library access to pick a photo.')
      }
    })
  }, [])

  async function handlePickAndUpload(pickFn: () => Promise<string | null>) {
    const uri = await pickFn();
    if (uri) {
      setImagePath(uri);
      router.push({
        pathname: '/ai-loading',
        params: { image: uri, roomType },
      });
    }
  }

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).content}>
        <Text style={styles(theme).title}>Upload a Photo</Text>
        <Text style={styles(theme).subtitle}>
          Show us the {roomType || 'room'} you want to redesign
        </Text>

        {imagePath && (
          <View style={styles(theme).imageContainer}>
            <Image source={{ uri: imagePath }} style={styles(theme).previewImage} />
          </View>
        )}

        <View style={styles(theme).buttonContainer}>
          <Pressable
            onPress={() => handlePickAndUpload(pickImageFromGallery)}
            style={({ pressed }) => [
              styles(theme).button,
              styles(theme).primaryButton,
              pressed && styles(theme).buttonPressed
            ]}
          >
            <Text style={styles(theme).buttonText}>Select from Gallery</Text>
          </Pressable>

          <Pressable
            onPress={() => handlePickAndUpload(pickImageFromCamera)}
            style={({ pressed }) => [
              styles(theme).button,
              styles(theme).secondaryButton,
              pressed && styles(theme).buttonPressed
            ]}
          >
            <Text style={[styles(theme).buttonText, styles(theme).secondaryButtonText]}>
              Take a Photo
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#EEE',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#333',
  },
});







