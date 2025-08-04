import { supabase } from './supabaseClient';
import { uploadImageWithFallback } from './uploadImage';

export async function runToolAndSave({
  fileUri,
  userId: _userId, // ignore passed-in userId, always fetch fresh
  module,
  prompt,
  edgeFunction,
}: {
  fileUri: string,
  userId: string, // still required for call signature, but not used
  module: string,
  prompt: string,
  edgeFunction: string,
}) {
  // 1. Upload image with preprocessing (handled by uploadImageWithFallback)
  const storagePath = await uploadImageWithFallback(fileUri);

  // 2. Get public URL
  const { data: { publicUrl: originalUrl } } = supabase
    .storage
    .from('uploads')
    .getPublicUrl(storagePath);

  // --- PRE-INVOKE DEBUG LOG ---
  console.log('🟢 Calling Edge Function with:', {
    tool: module,
    imageUrl: originalUrl,
    prompt,
  });

  // 3. Call Edge Function
  const { data: fnData, error: fnError } = await supabase.functions.invoke(edgeFunction, {
    body: { tool: module, imageUrl: originalUrl, prompt },
  });
  if (fnError) {
    console.log('🔥 Supabase Function Error Message:', fnError.message);
    console.log('📝 Supabase Function Error Details:', fnError.details);
    throw fnError;
  }
  const resultUrl = fnData?.resultUrl;

  // ❌ NO DATABASE WRITES IN DEVELOPMENT - EVER!
  if (__DEV__) {
    console.log("🚫 DEV mode: skipping all database inserts (purchases & generated_images)");
    console.log("🎉 Processing completed successfully:", resultUrl);
    return { storagePath, originalUrl, resultUrl };
  }

  // ✅ Only in production would we do database writes (currently handled by edge function)
  // Database inserts are now handled server-side in the edge function using service role key
  console.log('🎉 Processing completed successfully:', resultUrl);

  return { storagePath, originalUrl, resultUrl };
} 