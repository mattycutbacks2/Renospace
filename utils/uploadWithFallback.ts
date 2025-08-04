import Constants from 'expo-constants'
import * as FileSystem from 'expo-file-system'
import { supabase } from './supabaseClient'

const SUPA_URL = Constants.expoConfig!.extra!.SUPABASE_URL!
const SUPA_KEY = Constants.expoConfig!.extra!.SUPABASE_ANON_KEY!

export type Tool = 'colorpop' | 'compose' | 'me';

export async function uploadFile(tool: Tool, fileUri: string, extension = 'jpg'): Promise<string> {
  // 1️⃣ Get the current signed-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('❌ supabase.auth.getUser error:', userError);
  } else {
    console.log('👉 Uploading as user:', user?.id);
  }
  const timestamp = Date.now();
  const storagePath = `${user?.id || 'unknown-user'}/${tool}/${timestamp}.${extension}`;
  console.log('👉 Full storage path →', storagePath);
  const url = `${SUPA_URL}/storage/v1/object/upload/uploads/${storagePath}`;
  console.log('[uploadFile] will POST to →', url);

  const options = {
    httpMethod: 'POST' as const,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'image/jpeg',
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  };

  try {
    const result = await FileSystem.uploadAsync(url, fileUri, options);
    console.log('[uploadFile] uploadAsync result →', result);
    if (result.status < 300) {
      console.log('✅ Direct upload succeeded!');
      // Supabase returns {"Key": "uploads/tool/timestamp.jpg"}
      const body = JSON.parse(result.body);
      // Return just the object key (without the 'uploads/' prefix)
      return storagePath;
    } else {
      console.error('❌ Direct upload failed:', result.status, result.body);
      throw new Error(`Upload failed: ${result.status} - ${result.body}`);
    }
  } catch (err) {
    console.error('❌ uploadFile error:', err);
    throw err;
  }
}

async function uploadViaEdge(fileUri: string) {
  // 1️⃣ Get the current signed-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('❌ supabase.auth.getUser error:', userError);
  } else {
    console.log('👉 [Edge] Uploading as user:', user?.id);
  }
  const filename = `${Date.now()}.jpg`;
  const storagePath = `${user?.id || 'unknown-user'}/colorpop/${filename}`;
  console.log('👉 [Edge] Full storage path →', storagePath);
  // Read as base64 for edge function
  const b64 = await (await fetch(fileUri)).blob().then(async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  });
  const resp = await fetch(`${SUPA_URL}/functions/v1/upload-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPA_KEY}`,
    },
    body: JSON.stringify({ image: b64, filename, contentType: 'image/jpeg' }),
  });
  if (!resp.ok) throw new Error(`Edge upload failed: ${await resp.text()}`);
  const json = await resp.json();
  console.log('✅ Edge upload returned path:', json.path);
  return json.path;
}

async function uploadDirect(fileUri: string) {
  // 1️⃣ Get the current signed-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('❌ supabase.auth.getUser error:', userError);
  } else {
    console.log('👉 [Direct] Uploading as user:', user?.id);
  }
  const filename = `${Date.now()}.jpg`;
  const storagePath = `${user?.id || 'unknown-user'}/colorpop/${filename}`;
  console.log('👉 [Direct] Full storage path →', storagePath);
  console.log('[uploadWithFallback] Fetching file as blob:', fileUri);
  const response = await fetch(fileUri);
  const blob = await response.blob();
  console.log('[uploadWithFallback] Got blob, uploading to Supabase...');
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(storagePath, blob, { contentType: blob.type || 'image/jpeg' });
  if (error) throw error;
  console.log('✅ Direct upload returned path:', data.path);
  return data.path;
}

/**
 * Try edge first, then direct
 */
export async function uploadWithFallback(
  fileUri: string,
  userId: string,
  module: string,
  filename: string,
  prompt: string,
  originalUrl: string,
  resultUrl: string
) {
  const storagePath = `${userId}/${module}/${filename}`;
  try {
    console.log('➡️ Trying edge upload…');
    const edgeResult = await uploadViaEdge(fileUri);
    // Database insert removed - focus on core functionality
    console.log('🎉 Edge upload completed successfully');
    return { storagePath, edgeResult };
  } catch (edgeErr) {
    console.warn('⚠️ Edge upload failed:', edgeErr);
    console.log('➡️ Falling back to direct upload…');
    const directResult = await uploadDirect(fileUri);
    // Database insert removed - focus on core functionality
    console.log('🎉 Direct upload completed successfully');
    return { storagePath, directResult };
  }
} 