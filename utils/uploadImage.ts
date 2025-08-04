import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from '../utils/supabaseClient';

const supabaseUrl = Constants.expoConfig!.extra!.SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig!.extra!.SUPABASE_ANON_KEY!;

// Helper to resolve ph:// URIs on iOS to file:// URIs
async function ensureFileUri(uri: string): Promise<string> {
  console.log('[ensureFileUri] called with:', uri);
  if (uri.startsWith('ph://')) {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log('[uploadImageToSupabase] Resolved ph:// to asset.uri:', asset.uri);
      return asset.uri;
    } catch (e) {
      console.warn('[uploadImageToSupabase] Could not resolve ph:// URI via MediaLibrary:', e);
      throw e;
    }
  }
  return uri;
}

// Simple image validation and format detection
function getImageInfo(uri: string): { extension: string; contentType: string } {
  const lowerUri = uri.toLowerCase();
  
  if (lowerUri.includes('.heic') || lowerUri.includes('.heif')) {
    return { extension: 'jpg', contentType: 'image/jpeg' };
  } else if (lowerUri.includes('.png')) {
    return { extension: 'png', contentType: 'image/png' };
  } else if (lowerUri.includes('.webp')) {
    return { extension: 'jpg', contentType: 'image/jpeg' };
  } else {
    // Default to JPEG for everything else
    return { extension: 'jpg', contentType: 'image/jpeg' };
  }
}

export async function uploadImageToSupabase(fileUri: string) {
  console.log('[uploadImageToSupabase] called with:', fileUri);
  console.log('🛠 uploadAsync helper called with →', fileUri);

  try {
    const resolvedUri = await ensureFileUri(fileUri);
    const imageInfo = getImageInfo(resolvedUri);
    const filename = `${Date.now()}.${imageInfo.extension}`;
    const filePath = `uploads/${filename}`;
    
    console.log('🛠 will upload to bucket: uploads, path:', filePath);

    const { data, error } = await supabase
      .storage
      .from('uploads')
      .upload(filePath, resolvedUri, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageInfo.contentType,
    });

    if (error) {
      console.error('[uploadImageToSupabase] Supabase error:', error);
      throw error;
    }

    console.log('[uploadImageToSupabase] Upload successful:', data);
    return data.path;
  } catch (error) {
    console.error('[uploadImageToSupabase] Error:', error);
    throw error;
  }
}

// Helper function to decode base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function getMimeType(extension: string): string {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export async function uploadViaEdge(uri: string): Promise<string> {
  console.log('[uploadViaEdge] Starting upload for:', uri);
  
  try {
    // 1. Read file as base64
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // 2. Get extension and content type
    const imageInfo = getImageInfo(uri);
    const filename = `${Date.now()}.${imageInfo.extension}`;

    console.log('[uploadViaEdge] Calling edge function with:', { filename, contentType: imageInfo.contentType, b64len: b64.length });

    // Use Supabase client's functions.invoke method for proper authentication
    const { data, error } = await supabase.functions.invoke('upload-image', {
      body: {
        image: b64,
        filename,
        contentType: imageInfo.contentType,
      },
    });

    if (error) {
      console.error('[uploadViaEdge] Supabase function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('[uploadViaEdge] Edge function success:', data);
    return data.path; // e.g. 'uploads/1234567890.jpg'
  } catch (err: any) {
    console.error('[uploadViaEdge] Error:', err);
    console.error('[uploadViaEdge] Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    throw err;
  }
}

// New function that tries edge function first, falls back to direct upload
export async function uploadImageWithFallback(uri: string): Promise<string> {
  console.log('[uploadImageWithFallback] Starting upload with fallback for:', uri);
  
  try {
    // Try edge function first (more reliable)
    console.log('[uploadImageWithFallback] Attempting edge function upload...');
    const result = await uploadViaEdge(uri);
    console.log('[uploadImageWithFallback] Edge function upload successful:', result);
    return result;
  } catch (edgeError: any) {
    console.warn('[uploadImageWithFallback] Edge function failed, trying direct upload:', edgeError);
    
    try {
      // Fallback to direct upload
      console.log('[uploadImageWithFallback] Attempting direct upload...');
      const result = await uploadImageToSupabase(uri);
      console.log('[uploadImageWithFallback] Direct upload successful:', result);
      return result;
    } catch (directError: any) {
      console.error('[uploadImageWithFallback] Both upload methods failed:');
      console.error('Edge error:', edgeError);
      console.error('Direct error:', directError);
      throw new Error(`Upload failed: Edge function error: ${edgeError.message}, Direct upload error: ${directError.message}`);
    }
  }
}

export async function uploadImage(
  fileUri: string,
  userId: string,
  module: string
): Promise<string> {
  // 1️⃣ Prove user.id is available
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('❌ supabase.auth.getUser error:', userError);
  } else {
    console.log('👉 Uploading as user:', user?.id);
  }

  const parts = fileUri.split("/");
  const originalName = parts[parts.length - 1];
  const ext = originalName.split(".").pop();
  const filename = `${Date.now()}.${ext}`;
  const filePath = `${userId}/${module}/${filename}`;
  console.log('👉 Full storage path →', filePath);

  const { data, error } = await supabase
    .storage
    .from("uploads")
    .upload(filePath, fileUri, {
      cacheControl: "3600",
      upsert: false,
      contentType: `image/${ext}`,
    });

  if (error) throw error;
  return data.path;
} 