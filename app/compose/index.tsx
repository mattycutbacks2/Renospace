import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

export default function ComposeIndex() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).content}>
        <Text style={styles(theme).title}>AI Design Wizard</Text>
        <Text style={styles(theme).subtitle}>
          Let our AI create the perfect design for your space
        </Text>

        <View style={styles(theme).features}>
          <View style={styles(theme).feature}>
            <Text style={styles(theme).featureIcon}>🎨</Text>
            <Text style={styles(theme).featureTitle}>Personalized Design</Text>
            <Text style={styles(theme).featureText}>
              AI analyzes your preferences and creates custom designs
            </Text>
          </View>

          <View style={styles(theme).feature}>
            <Text style={styles(theme).featureIcon}>⚡</Text>
            <Text style={styles(theme).featureTitle}>Quick & Easy</Text>
            <Text style={styles(theme).featureText}>
              Get professional designs in minutes, not hours
            </Text>
          </View>

          <View style={styles(theme).feature}>
            <Text style={styles(theme).featureIcon}>💡</Text>
            <Text style={styles(theme).featureTitle}>Smart Suggestions</Text>
            <Text style={styles(theme).featureText}>
              AI suggests colors, furniture, and layouts that work together
            </Text>
          </View>
        </View>
      </View>

      <View style={styles(theme).footer}>
        <Pressable
          onPress={() => router.push('/compose/room-type')}
          style={({ pressed }) => [
            styles(theme).button,
            pressed && styles(theme).buttonPressed
          ]}
        >
          <LinearGradient
            colors={["#6C63FF", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles(theme).buttonGradient}
          >
            <Text style={styles(theme).buttonText}>Start Designing</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  feature: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FAFAFC',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 