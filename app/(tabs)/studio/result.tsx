import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  const router = useRouter();
  const { resultUrl } = useLocalSearchParams<{ resultUrl: string }>();
  const [isSaving, setIsSaving] = useState(false);

  if (!resultUrl) {
    return (
      <View style={styles.container}>
        <Text>No result found.</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Check out my design!',
        url: resultUrl,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to save images to your photo library.');
            return;
        }

        const fileUri = FileSystem.documentDirectory + `${new Date().getTime()}.jpg`;
        const { uri } = await FileSystem.downloadAsync(resultUrl, fileUri);
        
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert('Saved!', 'The image has been saved to your photo library.');

    } catch (error) {
        console.error('Save error:', error);
        Alert.alert('Error', 'Failed to save image.');
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={{ uri: resultUrl }} style={styles.image} resizeMode="contain" />

        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleSave}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
          </Pressable>
          <Pressable style={styles.button} onPress={handleShare}>
            <Text style={styles.buttonText}>Share</Text>
          </Pressable>
        </View>
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Try Again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: '100%',
        flex: 1,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#6200EE',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: '#aaa',
        fontSize: 16,
    },
}); 