import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function LandingMock() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>Renospace</Text>
        <Text style={styles.subtitle}>AI Interior Design</Text>
      </View>
      <View style={styles.heroWrap}>
        <Text style={styles.emoji}>🏡</Text>
        <Text style={styles.headline}>Welcome to Renospace</Text>
        <Text style={styles.valueProp}>
          Transform your space with AI-powered design tools.
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <Text style={styles.footer}>
        This is a static mockup for App Store review.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#7C3AED',
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroWrap: {
    alignItems: 'center',
    backgroundColor: '#f8f8ff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#232323',
    textAlign: 'center',
    marginBottom: 12,
  },
  valueProp: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
}); 