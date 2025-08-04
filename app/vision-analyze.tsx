import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function VisionAnalyzeScreen() {
  const [image, setImage] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  // Pick an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setDesc('');
    }
  };

  // Take a photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setDesc('');
    }
  };

  // Helper: turn image URI into base64
  async function imageUriToBase64(uri) {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }

  // Analyze the room with GPT-4o Vision
  const analyzeRoom = async () => {
    if (!image) {
      alert('Select an image first!');
      return;
    }
    setLoading(true);
    setDesc('');
    try {
      console.log('🔄 Starting room analysis...');
      
      console.log('📸 Converting image to base64...');
      const base64 = await imageUriToBase64(image);
      console.log('✅ Image converted successfully');

      console.log('🤖 Calling OpenAI Vision API...');
      const requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this room in detail for an interior design AI.' },
              {
                type: 'image_url',
                image_url: {
                  url: 'data:image/jpeg;base64,' + base64,
                },
              },
            ],
          },
        ],
        max_tokens: 400,
      };
      console.log('📤 Request configuration:', {
        model: requestBody.model,
        max_tokens: requestBody.max_tokens,
        messageTypes: requestBody.messages[0].content.map(c => c.type)
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API Response status:', response.status);
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        console.log('✨ Successfully received room description');
        setDesc(data.choices[0].message.content);
      } else {
        console.error('❌ Invalid API response:', {
          hasChoices: !!data.choices,
          error: data.error,
          rawResponse: JSON.stringify(data).substring(0, 200) + '...'
        });
        setDesc('No description received.');
        Alert.alert('Error', JSON.stringify(data.error) || 'No result.');
      }
    } catch (err) {
      console.error('❌ Room analysis failed:', {
        error: err.message,
        stack: err.stack
      });
      setDesc('Error: ' + err.message);
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>OpenAI Vision Room Analyzer</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Button title="Pick a Photo" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 16 }} />
      )}
      <Button title="Analyze Room" onPress={analyzeRoom} disabled={!image || loading} />
      {loading && <ActivityIndicator style={{ margin: 20 }} size="large" />}
      {desc ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{desc}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', backgroundColor: '#fafafa' },
  title: { fontSize: 22, fontWeight: '600', marginVertical: 24, color: '#222' },
  resultBox: {
    backgroundColor: '#f3f3f3',
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
    maxWidth: 320,
  },
  resultText: { fontSize: 15, color: '#222' },
});
