import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animation after 200ms delay
    const animationTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Auto-advance after 1.2s total
    const navigationTimer = setTimeout(() => {
      router.replace('/social-proof');
    }, 1200);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(navigationTimer);
    };
  }, [fadeAnim, scaleAnim, router]);

  return (
    <LinearGradient 
      colors={['#6a11cb', '#2575fc']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* House Icon */}
            <View style={styles.houseIcon}>
              <View style={styles.houseBackground}>
                <View style={styles.houseSilhouette}>
                  {/* Roof */}
                  <View style={styles.roof} />
                  {/* Left wall */}
                  <View style={styles.leftWall} />
                  {/* Right wall */}
                  <View style={styles.rightWall} />
                  {/* Window */}
                  <View style={styles.window} />
                  {/* Door */}
                  <View style={styles.door} />
                </View>
                {/* Notification dot */}
                <View style={styles.notificationDot} />
              </View>
            </View>
            
            {/* Renospace Text */}
            <Text style={styles.logoText}>Renospace</Text>
          </Animated.View>
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
  },
  logoContainer: {
    alignItems: 'center',
  },
  houseIcon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  houseBackground: {
    width: 120,
    height: 120,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  houseSilhouette: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  roof: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  leftWall: {
    position: 'absolute',
    top: 12,
    left: 4,
    width: 16,
    height: 36,
    backgroundColor: '#fff',
  },
  rightWall: {
    position: 'absolute',
    top: 12,
    right: 4,
    width: 16,
    height: 36,
    backgroundColor: '#fff',
  },
  window: {
    position: 'absolute',
    top: 20,
    left: 6,
    width: 4,
    height: 4,
    backgroundColor: '#7C3AED',
  },
  door: {
    position: 'absolute',
    bottom: 0,
    left: 6,
    width: 4,
    height: 8,
    backgroundColor: '#7C3AED',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    backgroundColor: '#FCD34D',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoText: {
    fontFamily: 'SpaceMono',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
}); 