import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { supabase } from './utils/supabaseClient';

export default function DebugScreen() {
  useEffect(() => {
    (async () => {
      console.log("=== DEBUG: start ===");

      // 1. Internet test
      try {
        const r = await fetch('https://www.google.com');
        console.log("Fetch google.com ok:", r.ok);
      } catch (e) {
        console.error("Fetch google.com failed:", e);
      }

      // 2. Supabase root
      try {
        const url = Constants.expoConfig?.extra?.SUPABASE_URL!;
        console.log("Fetch Supabase root URL:", url);
        const r2 = await fetch(url);
        console.log("Fetch supabase root ok:", r2.ok, "status:", r2.status);
      } catch (e) {
        console.error("Fetch supabase root failed:", e);
      }

      // 3. Simple Supabase select (adjust table if exists)
      try {
        const { data, error } = await supabase.from('generated_images').select().limit(1);
        console.log("Supabase select data/error:", data, error);
      } catch (e) {
        console.error("Supabase select threw:", e);
      }

      // 4. Storage metadata GET
      try {
        const supaUrl = Constants.expoConfig?.extra?.SUPABASE_URL!;
        const anonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY!;
        const metaUrl = `${supaUrl}/storage/v1/object/metadata?bucket=uploads&prefix=`;
        console.log("Fetch metadata URL:", metaUrl);
        const r3 = await fetch(metaUrl, {
          method: 'GET',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        });
        console.log("Metadata GET ok:", r3.ok, "status:", r3.status);
        const text = await r3.text();
        console.log("Metadata body snippet:", text.substring(0,200));
      } catch (e) {
        console.error("Metadata GET failed:", e);
      }

      // 5. Small blob upload
      try {
        console.log("Testing small blob upload...");
        const blob = new Blob([JSON.stringify({test:1})], { type: 'application/json' });
        const path = `test/debug-${Date.now()}.json`;
        const { data, error } = await supabase.storage.from('uploads').upload(path, blob);
        console.log("Small upload data/error:", data, error);
      } catch (e) {
        console.error("Small upload threw:", e);
      }

      console.log("=== DEBUG: end ===");
    })();
  }, []);

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Debugging—check Metro logs</Text>
    </View>
  );
} 