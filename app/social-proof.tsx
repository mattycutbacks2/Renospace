import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SocialProofScreen() {
  const router = useRouter();
  const { markSocialProofDone } = useFlow();

  const handleContinue = () => {
    markSocialProofDone();
    router.push('/feedback');
  };

  return (
    <LinearGradient 
      colors={['#6a11cb', '#2575fc']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.headline}>
              We've helped 100K+ renovators transform their spaces
            </Text>
            
            <View style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <Image 
                  source={require('../assets/images/eb-headshot.jpeg')}
                  style={styles.headshot}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.author}>Erin B.</Text>
                </View>
              </View>
              <View style={styles.stars}>
                <Text style={styles.star}>★★★★★</Text>
              </View>
              <Text style={styles.quote}>
                "Life-changing for my home! The AI suggestions were spot-on and saved me hours of planning."
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  testimonialCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headshot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  stars: {
    marginBottom: 12,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  author: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  authorTitle: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#6a11cb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 