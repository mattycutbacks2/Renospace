// utils/supabaseClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto'; // Polyfill for React Native

if (!global.Buffer) {
  // @ts-ignore
  global.Buffer = Buffer;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('[supabase] SUPABASE_URL:', supabaseUrl);
console.log('[supabase] SUPABASE_ANON_KEY prefix:', supabaseAnonKey?.slice(0, 10));
console.log('[supabaseClient] Creating client with URL:', supabaseUrl, 'and ANON_KEY prefix:', supabaseAnonKey?.substring(0, 10));

// 🔑 Update these with your exact project values from the Supabase dashboard (Settings > API):
export const SUPABASE_URL = supabaseUrl!;
export const SUPABASE_ANON_KEY = supabaseAnonKey!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not needed in RN
  },
});

// 1️⃣ Upload binary Buffer to a bucket
export async function uploadToBucket(
  bucket: string,
  fileName: string,
  buffer: Buffer,
  contentType = 'image/jpeg'
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType, upsert: false })
  if (error) throw error
  return data.path
}

// 2️⃣ Invoke your run-tool function
export async function runTool<T = any>(toolSlug: string, payload: any) {
  const { data, error } = await supabase.functions.invoke<T>(toolSlug, {
    body: payload,
  })
  if (error) throw error
  return data
}

// 3️⃣ List a folder (for "Me" gallery)
export async function listFolder(bucket: string, folder: string) {
  console.log('[listFolder] called with:', bucket, folder);
  const { data, error } = await supabase.storage.from(bucket).list(folder)
  if (error) throw error
  // FileObject[] has 'name', but not 'path', so construct path manually
  return (data ?? []).map((file: { name: string }) => ({
    name: file.name,
    path: `${folder}/${file.name}`,
  }))
}

// 4️⃣ Get a public URL
export function getPublicUrl(path: string) {
  const { data } = supabase
    .storage
    .from('uploads')
    .getPublicUrl(path);
  return data.publicUrl;
}

// Auth helper functions
export const signInWithApple = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'designaiapp://auth/callback',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Apple sign in error:', error);
    return { data: null, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'designaiapp://auth/callback',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
};

export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'designaiapp://auth/callback',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Magic link error:', error);
    return { data: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Email sign in error:', error);
    return { data: null, error };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'designaiapp://auth/callback',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Email sign up error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
