// --- structuredClone polyfill (must come before any imports!) ---
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = obj => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => global.structuredClone(item));
    const clone = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = global.structuredClone(obj[key]);
      }
    }
    return clone;
  };
}
// --- end polyfill ---

import { createClient } from '@supabase/supabase-js';

// 1️⃣ Log your configured URL & Key
console.log('DEBUG › Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('DEBUG › Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// 2️⃣ Create a throw‑away client and list buckets
const debugClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

;(async () => {
  const { data: buckets, error } = await debugClient.storage.listBuckets();
  console.log('DEBUG › Buckets:', buckets);
  if (error) console.error('DEBUG › listBuckets error:', error);
})();

import 'expo-router/entry';
