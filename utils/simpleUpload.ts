import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase config:', { 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImageFile(imageUri: string, filename: string): Promise<string> {
  console.log('📤 Uploading image:', { imageUri, filename });
  
  try {
    // Step 1: Build the React Native "file" object
    const file = {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
    } as any; // supabase-js will treat this as a React Native file
    
    console.log("📁 File object:", {
      uri: imageUri.substring(0, 50) + "...",
      name: filename,
      type: 'image/jpeg'
    });
    
    // Step 2: Upload to Supabase Storage
    console.log("📤 Attempting upload to Supabase...");
    
    const { data: uploadData, error: uploadErr } = await supabase
      .storage
      .from("uploads")
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (uploadErr) {
      console.error("❌ Upload failed:", uploadErr);
      if (uploadErr.message) {
        console.error("Error message:", uploadErr.message);
      }
      throw uploadErr;
    }
    
    console.log("✅ Upload successful:", uploadData);
    console.log("📁 Returning storage path:", filename);
    console.log("🔍 Upload data details:", {
      path: uploadData.path,
      fullPath: uploadData.fullPath,
      id: uploadData.id
    });
    
    // Step 3: Return the storage path (not public URL)
    return uploadData.path; // Use the exact path from uploadData
    
  } catch (error: any) {
    console.error('❌ Image upload failed:', error);
    throw error;
  }
}




