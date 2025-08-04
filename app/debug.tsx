import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Text, View } from 'react-native';

export default function DebugInpaint() {
  const [photo, setPhoto] = useState<string>();
  const [result, setResult] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const SUPA_URL = Constants.manifest.extra.SUPABASE_URL!;
  const SUPA_KEY = Constants.manifest.extra.SUPABASE_ANON_KEY!;

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaType.Images 
    });
    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
      addLog(`📸 Photo selected: ${res.assets[0].uri.substring(0, 50)}...`);
    }
  };

  const run = async () => {
    if (!photo) return Alert.alert('Pick a photo');
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🚀 Starting inpainting process...');
      
      const filename = `debug-${Date.now()}.jpg`;
      addLog(`📁 Uploading as: ${filename}`);
      
      // 1. Upload image
      const blob = await (await fetch(photo)).blob();
      addLog(`📦 Image blob size: ${blob.size} bytes`);
      
      const uploadRes = await fetch(`${SUPA_URL}/storage/v1/object/upload/uploads/${filename}`, {
        method: 'POST',
        headers: { 
          apikey: SUPA_KEY, 
          Authorization: `Bearer ${SUPA_KEY}`, 
          'Content-Type': blob.type 
        },
        body: blob,
      });
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${uploadRes.status} - ${errorText}`);
      }
      
      addLog('✅ Upload successful');
      
      // 2. Call edge function
      const imageUrl = `${SUPA_URL}/storage/v1/object/public/uploads/${filename}`;
      addLog(`🔗 Calling edge function with: ${imageUrl}`);
      
      const funcRes = await fetch(`${SUPA_URL}/functions/v1/run-tool`, {
        method: 'POST',
        headers: { 
          apikey: SUPA_KEY, 
          Authorization: `Bearer ${SUPA_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          imageUrl: imageUrl, 
          prompt: 'Recolor the wall to #6B46C1 while keeping texture & lighting.', 
          tool: 'colortouch' 
        }),
      });
      
      const funcJson = await funcRes.json();
      addLog(`📡 Edge function response: ${funcRes.status}`);
      
      if (!funcRes.ok) {
        throw new Error(`Edge function failed: ${funcRes.status} - ${JSON.stringify(funcJson)}`);
      }
      
      addLog('🎨 Inpainting successful!');
      addLog(`📁 Result path: ${funcJson.path}`);
      
      const resultUrl = `${SUPA_URL}/storage/v1/object/public/uploads/${funcJson.path}`;
      setResult(resultUrl);
      addLog(`🖼️ Displaying result: ${resultUrl}`);
      
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🔧 Debug Inpaint
      </Text>
      
      <Button title="📸 Pick Photo" onPress={pick} />
      <Button 
        title="🎨 Run Inpaint" 
        onPress={run} 
        disabled={loading || !photo}
        color={loading ? '#ccc' : '#6B46C1'}
      />
      
      {loading && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={{ marginTop: 10 }}>Processing...</Text>
        </View>
      )}
      
      {result && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Result:</Text>
          <Image 
            source={{ uri: result }} 
            style={{ width: '100%', height: 300, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
      )}
      
      {logs.length > 0 && (
        <View style={{ marginTop: 20, backgroundColor: '#fff', padding: 10, borderRadius: 5 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Logs:</Text>
          {logs.map((log, index) => (
            <Text key={index} style={{ fontSize: 12, marginBottom: 2, fontFamily: 'monospace' }}>
              {log}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
} 