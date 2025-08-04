// components/ThreeSphere.tsx
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');
const VIEW_H = 300;

interface ThreeSphereProps {
  uri: string;
  onTap?: (yaw: number) => void;
}

export default function ThreeSphere({ uri, onTap }: ThreeSphereProps) {
  const pan = useSharedValue(0);
  const lastPan = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      lastPan.current = pan.value;
    },
    onActive: (e) => {
      pan.value = lastPan.current - e.translationX * 0.5;
    },
    onEnd: (e) => {
      // Optional: Add spring animation
      pan.value = withSpring(pan.value);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pan.value }],
    };
  });

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleTap = () => {
    if (onTap) {
      onTap(pan.value % 360);
    }
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load panorama</Text>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri }}
            style={[styles.panoramaImage, animatedStyle]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading panorama...</Text>
            </View>
          )}
        </View>
        
        {/* Instructions overlay */}
        <View style={styles.instructionsOverlay}>
          <Text style={styles.instructionsText}>
            Drag to look around • Tap to navigate
          </Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: W, 
    height: VIEW_H,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#f0f0f0'
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  panoramaImage: {
    width: W * 2, // Make image wider for panning
    height: VIEW_H,
    position: 'absolute',
    left: -W / 2, // Center the image
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    width: W,
    height: VIEW_H,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  instructionsText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 