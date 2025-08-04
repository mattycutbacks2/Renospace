import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

export async function pickImageFromGallery(): Promise<string | null> {
  // ask for permission (only needed on iOS)
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!')
      return null
    }
  }

  // open image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  })

  if (result.canceled || !result.assets.length) return null
  return result.assets[0].uri
}

export async function pickImageFromCamera(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!')
      return null
    }
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  })
  if (result.canceled || !result.assets.length) return null
  return result.assets[0].uri
} 