import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import AuthScreen from '../app/AuthScreen';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onAuthSuccess }) {
  const scrollRef = useRef(null);
  const [authComplete, setAuthComplete] = useState(false);

  if (authComplete) return null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      <View style={[styles.slide, { backgroundColor: '#fff' }]}> 
        <Text style={styles.title}>Welcome to DesignAI!</Text>
        <Text style={styles.subtitle}>Reimagine your space with AI-powered design tools.</Text>
      </View>
      <View style={[styles.slide, { backgroundColor: '#f5f5f5' }]}> 
        <Text style={styles.title}>Create amazing rooms</Text>
        <Text style={styles.subtitle}>Upload a photo, pick a style, and let AI do the rest.</Text>
      </View>
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.slide}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Get Started</Text>
          <AuthScreen onAuthSuccess={() => { setAuthComplete(true); if (onAuthSuccess) onAuthSuccess(); }} />
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
});
