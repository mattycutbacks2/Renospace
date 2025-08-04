import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Debug blob size locally before any upload
 */
async function debugBlob(uri: string): Promise<Blob> {
  console.log('🔍 DEBUG: Starting blob debug for:', uri);
  
  let blob: Blob;
  
  // Handle different URI types
  if (uri.startsWith('data:')) {
    // Data URL - use fetch
    const res = await fetch(uri);
    blob = await res.blob();
  } else if (uri.startsWith('file://') || uri.startsWith('content://')) {
    // Local file - read as base64 and convert to blob
    console.log('📁 Reading local file as base64...');
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    console.log('📏 Base64 length:', base64.length);
    
    // Convert base64 to blob using data URL approach
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    console.log('🔗 Data URL created, length:', dataUrl.length);
    console.log('🔗 Data URL preview:', dataUrl.substring(0, 100) + '...');
    
    const res = await fetch(dataUrl);
    console.log('📡 Fetch response status:', res.status);
    console.log('📡 Fetch response ok:', res.ok);
    
    blob = await res.blob();
    console.log('📦 Blob created from data URL:', { size: blob.size, type: blob.type });
  } else {
    // Remote URL - use fetch
    const res = await fetch(uri);
    blob = await res.blob();
  }
  
  console.log('📦 Blob bytes for', uri, '→', blob.size, 'type:', blob.type);
  
  if (blob.size === 0) {
    throw new Error(`🚨 ${uri} is bad or inaccessible - 0 bytes!`);
  }
  
  return blob;
}

/**
 * Handle common URI pitfalls (Android content://, iOS file://)
 * Use Expo's FileSystem to normalize any URI before fetching
 */
async function getBlobFromUri(uri: string): Promise<Blob> {
  console.log('🔄 Normalizing URI:', uri);
  let fileUri = uri;

  // Android content URIs need copying
  if (fileUri.startsWith('content://')) {
    console.log('📱 Android content URI detected, copying to documents...');
    const filename = fileUri.split('/').pop() || 'image.jpg';
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: fileUri, to: dest });
    fileUri = dest;
    console.log('✅ Copied to:', fileUri);
  }

  console.log('🔍 About to call debugBlob with:', fileUri);
  // Debug the blob
  const blob = await debugBlob(fileUri);
  console.log('✅ getBlobFromUri completed successfully:', { size: blob.size, type: blob.type });
  return blob;
}

/**
 * Generate a simple wall mask as SVG data URL
 */
function generateWallMaskSvg(): string {
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <!-- Black background (keep everything) -->
      <rect width="512" height="512" fill="black"/>
      
      <!-- White areas for walls (change these) -->
      <!-- Upper wall area -->
      <rect x="25" y="0" width="462" height="250" fill="white"/>
      <!-- Left wall -->
      <rect x="0" y="0" width="150" height="350" fill="white"/>
      <!-- Right wall -->
      <rect x="362" y="0" width="150" height="350" fill="white"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Convert SVG data URL to blob (simple approach)
 */
async function svgDataUrlToBlob(svgDataUrl: string): Promise<Blob> {
  console.log('🎭 Converting SVG data URL to blob...');
  console.log('📏 SVG data URL length:', svgDataUrl.length);
  
  const response = await fetch(svgDataUrl);
  const blob = await response.blob();
  console.log('📦 Blob created:', { size: blob.size, type: blob.type });
  
  if (blob.size === 0) {
    throw new Error('❌ Blob is empty (0 bytes)!');
  }
  
  return blob;
}

/**
 * Upload blob to Supabase storage with validation
 */
async function uploadBlobToStorage(blob: Blob, filename: string, contentType: string): Promise<string> {
  console.log('📤 Uploading to Supabase storage:', { filename, contentType, blobSize: blob.size });
  console.log('📦 Blob details:', { 
    size: blob.size, 
    type: blob.type, 
    isBlob: blob instanceof Blob,
    constructor: blob.constructor.name
  });
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filename, blob, { 
      cacheControl: '3600', 
      upsert: false,
      contentType 
    });
  
  if (uploadError) {
    console.error('❌ Supabase upload failed:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log('✅ Supabase upload successful:', uploadData.path);
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(uploadData.path);
  
  console.log('🔗 Public URL generated:', publicUrl);
  console.log('📁 Upload path:', uploadData.path);
  console.log('🪣 Bucket name: uploads');
  
  return publicUrl!;
}

/**
 * Verify public URLs actually return bytes
 */
async function verifyPublicUrl(url: string, name: string): Promise<void> {
  console.log(`🔍 Verifying public ${name} URL:`, url);
  
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const byteLength = arrayBuffer.byteLength;
    
    console.log(`✅ Public ${name} bytes:`, byteLength);
    
    if (byteLength === 0) {
      throw new Error(`🚨 Public ${name} URL test failed - 0 bytes!`);
    }
  } catch (error) {
    console.error(`❌ Public ${name} URL verification failed:`, error);
    throw error;
  }
}

/**
 * Main helper: uploads image & mask client-side, then calls run-tool edge function
 */
export async function runInpaint({
  localImageUri,
  prompt,
  tool = 'colortouch',
  customMaskUri,
}: {
  localImageUri: string;
  prompt: string;
  tool?: string;
  customMaskUri?: string;
}): Promise<{ resultUrl: string; originalUrl: string; maskUrl: string }> {
  console.log('🎨 Starting client-side inpainting flow...');
  console.log('📸 Input image URI:', localImageUri);
  
  // Generate unique filenames
  const timestamp = Date.now();
  const imageFilename = `img-${timestamp}.jpg`;
  const maskFilename = `mask-${timestamp}.png`;

  try {
    // 1) Grab real blobs with validation
    console.log('📸 Processing image...');
    console.log('🔍 About to call getBlobFromUri with:', localImageUri);
    const imageBlob = await getBlobFromUri(localImageUri);
    console.log('✅ Image blob created successfully:', { size: imageBlob.size, type: imageBlob.type });
    
    console.log('🎭 Processing mask...');
    let maskBlob: Blob;
    if (customMaskUri) {
      maskBlob = await getBlobFromUri(customMaskUri);
    } else {
      // Generate wall mask for ColorTouch using simple mask generator
      const { createSimpleWallMask } = await import('./simpleMaskGenerator');
      const maskPath = await createSimpleWallMask();
      maskBlob = await getBlobFromUri(maskPath);
    }

    // Sanity check
    console.log('📊 Final blob sizes:', {
      image: imageBlob.size,
      mask: maskBlob.size
    });

    // 2) Upload both image & mask client-side
    console.log('📤 Uploading image...');
    const imageUrl = await uploadBlobToStorage(imageBlob, imageFilename, 'image/jpeg');
    
    console.log('📤 Uploading mask...');
    const maskUrl = await uploadBlobToStorage(maskBlob, maskFilename, 'image/png');

    // 3) Verify public URLs actually return bytes
    await verifyPublicUrl(imageUrl, 'image');
    await verifyPublicUrl(maskUrl, 'mask');

    // 4) Invoke your inpaint Edge Function
    console.log('🔥 Calling run-tool edge function with:', { imageUrl, maskUrl, prompt, tool });
    
    const { data, error } = await supabase.functions.invoke('run-tool', {
      body: { 
        imageUrl, 
        maskUrl, 
        prompt, 
        tool 
      },
    });
    
    if (error) {
      console.error('🔥 Edge function error:', error);
      throw error;
    }

    if (!data?.checkUrl) {
      throw new Error('No result URL returned from edge function');
    }

    console.log('🎉 Inpainting successful:', data.checkUrl);

    return {
      resultUrl: data.checkUrl,
      originalUrl: imageUrl,
      maskUrl
    };

  } catch (error) {
    console.error('❌ Inpainting flow failed:', error);
    throw error;
  }
}

/**
 * Simplified version for your existing runToolAndSave flow
 * This maintains compatibility with your current ColorTouch implementation
 */
export async function runInpaintWithFallback({
  fileUri,
  prompt,
  tool = 'colortouch',
  customMaskUri,
}: {
  fileUri: string;
  prompt: string;
  tool?: string;
  customMaskUri?: string;
}): Promise<{ resultUrl: string; originalUrl: string }> {
  const result = await runInpaint({
    localImageUri: fileUri,
    prompt,
    tool,
    customMaskUri,
  });

  console.log('🎉 Inpainting completed successfully:', result.resultUrl);

  return {
    resultUrl: result.resultUrl,
    originalUrl: result.originalUrl,
  };
} 