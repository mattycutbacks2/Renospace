import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFlow } from '../components/FlowManager';

export default function ReviewScreen() {
  const router = useRouter();
  const { markReviewDone } = useFlow();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getRatingMessage = (stars: number) => {
    switch (stars) {
      case 1: return "You rated: 1 star — We'll do better!";
      case 2: return "You rated: 2 stars — We're getting there!";
      case 3: return "You rated: 3 stars — It's a start!";
      case 4: return "You rated: 4 stars — Almost perfect!";
      case 5: return "You rated: 5 stars — You're the best!";
      default: return "";
    }
  };

  const handleStarPress = (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating);
    
    // Animate the star
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Here you could save the feedback to your backend
    console.log('Feedback submitted:', { rating, feedback });
    
    // Mark review as done and continue to onboarding
    markReviewDone();
    router.push('/onboarding');
  };

  const handleSkip = () => {
    markReviewDone();
    router.push('/onboarding');
  };

  if (submitted) {
    return (
      <LinearGradient 
        colors={['#6a11cb', '#2575fc']} 
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.thankYouText}>Thank you! 🙏</Text>
              <Text style={styles.subtitle}>
                Your feedback helps us make Renospace better for everyone.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={['#6a11cb', '#2575fc']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Hero Illustration */}
          <View style={styles.heroContainer}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>📈</Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Headline & Subtext */}
            <Text style={styles.headline}>Help us grow!</Text>
            <Text style={styles.subtext}>
              Your thoughts fuel our next features.
            </Text>
            
            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[0, 1, 2, 3, 4].map((index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleStarPress(index)}
                  style={styles.starButton}
                >
                  <Animated.Text 
                    style={[
                      styles.star,
                      index < rating ? styles.starFilled : styles.starEmpty,
                      { transform: [{ scale: scaleAnim }] }
                    ]}
                  >
                    {index < rating ? '★' : '☆'}
                  </Animated.Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Rating Feedback */}
            {rating > 0 && (
              <Text style={styles.ratingFeedback}>
                {getRatingMessage(rating)}
              </Text>
            )}
            
            {/* Optional Feedback */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Any quick notes? (optional)"
                placeholderTextColor="#999"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.charCount}>
                {feedback.length}/200
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton, rating === 0 && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={rating === 0}
              >
                <Text style={styles.submitButtonText}>Submit & Continue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
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
  heroContainer: {
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroEmoji: {
    fontSize: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 360,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'SpaceMono-Bold',
  },
  subtext: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'SpaceMono-Regular',
    lineHeight: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 32,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#ccc',
  },
  ratingFeedback: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  feedbackInput: {
    width: '100%',
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
  },
  submitButton: {
    backgroundColor: '#6a11cb',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6a11cb',
    fontSize: 14,
    fontWeight: '600',
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 