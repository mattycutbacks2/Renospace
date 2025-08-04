// app/results-gallery.tsx

import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function ResultsGallery() {
  const router = useRouter()
  const { redesignedImage, originalImage, roomType, style, error } = useLocalSearchParams()

  const saveImage = async (url: string) => {
    try {
      const localUri = FileSystem.documentDirectory + 'design.jpg'
      const dl       = await FileSystem.downloadAsync(url, localUri)
      const perm     = await MediaLibrary.requestPermissionsAsync()
      if (perm.granted) {
        await MediaLibrary.createAssetAsync(dl.uri)
        Alert.alert('Saved!', 'Your redesign is in Photos.')
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert('Error', "Couldn't save image.")
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>
        Your {roomType} in {style} Style
      </Text>

      {originalImage && (
        <View style={styles.card}>
          <Text style={styles.sub}>Original</Text>
          <Image source={{ uri: originalImage }} style={styles.img} />
        </View>
      )}

      {/* AI Redesign section */}
      <View style={styles.card}>
        <Text style={styles.sub}>AI Redesign</Text>
        {redesignedImage && typeof redesignedImage === 'string' && redesignedImage.startsWith('http') ? (
          <>
            <Image source={{ uri: redesignedImage }} style={styles.img} />
            <TouchableOpacity style={styles.btn} onPress={() => saveImage(redesignedImage)}>
              <Text style={styles.btnText}>Save to Photos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.err}>{error ? error : 'No redesign returned.'}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#aaa', flex: 1, marginRight: 8 }]}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.btnText}>New Design</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { flex: 1 }]}
          onPress={() => router.replace({ pathname: '/ai-loading', params: { roomType, style, imageUrl: originalImage } })}
        >
          <Text style={styles.btnText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  card:  {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  sub:    { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  img:    { width: '100%', height: 300, borderRadius: 12, resizeMode: 'cover' },
  btn:    { marginTop: 12, backgroundColor: '#7B61FF', paddingVertical: 12, borderRadius: 8 },
  btnText:{ color: '#fff', fontWeight: '600', textAlign: 'center' },
  err:    { color: 'red', fontSize: 16, marginTop: 40 },
})



