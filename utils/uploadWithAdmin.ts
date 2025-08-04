// utils/uploadWithAdmin.ts
import { supabaseAdmin } from './supabaseAdmin';

export async function uploadWithAdmin(path: string, file: Blob, contentType?: string) {
  console.log('🔄 Uploading with Supabase Admin SDK...');
  
  // this client is service-role, so no RLS errors
  const { data, error } = await supabaseAdmin
    .storage
    .from('uploads')
    .upload(path, file, { 
      upsert: true,
      contentType: contentType || file.type
    })

  if (error) {
    console.error('❌ Admin upload failed:', error);
    throw error;
  }
  
  console.log('✅ Supabase Admin SDK upload successful:', data.path);
  return data;  // { Key: 'uploads/…', etc. }
}

export async function getPublicUrlWithAdmin(path: string) {
  const { data: { publicUrl } } = supabaseAdmin
    .storage
    .from('uploads')
    .getPublicUrl(path);
  
  return publicUrl;
} 