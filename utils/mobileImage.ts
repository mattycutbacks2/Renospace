import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export interface MaskRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function optimizeForUpload(uri: string): Promise<string> {
  try {
    console.log('🔄 Optimizing image for upload...');
    
    const { uri: resized } = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { 
        compress: 0.8, 
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    
    console.log('✅ Image optimized successfully');
    return resized;
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    throw new Error('Failed to optimize image for upload');
  }
}

export async function uploadToSupabase(localUri: string, filename: string): Promise<string> {
  try {
    console.log('📤 Uploading image to Supabase...');
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Supabase upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log('✅ Image uploaded successfully:', data.path);
    return data.path;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw new Error('Failed to upload image to storage');
  }
}

export async function placeArtwork(
  roomImagePath: string, 
  artworkImagePath: string, 
  mask: MaskRect,
  placementInstructions: string
): Promise<string> {
  try {
    console.log('🎨 Placing artwork with mask:', mask);
    
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/flux-tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        tool: 'artpreview',
        roomImagePath,
        artworkImagePath,
        mask,
        placementInstructions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place artwork');
    }

    const data = await response.json();
    console.log('📥 Artwork placement response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Artwork placement failed');
    }
    
    return data.resultUrl;
  } catch (error) {
    console.error('❌ Artwork placement failed:', error);
    throw error;
  }
}

// Helper function to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
} 