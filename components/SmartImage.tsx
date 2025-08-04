// SmartImage Component - WebP Support with Fallback
// File: components/SmartImage.tsx

import React, { useEffect, useState } from 'react';
import { Image, ImageProps, StyleSheet, Text, View } from 'react-native';

interface SmartImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackUri?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
}

const SmartImage: React.FC<SmartImageProps> = ({
  uri,
  fallbackUri,
  showLoadingState = true,
  showErrorState = true,
  onError,
  ...imageProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUri, setCurrentUri] = useState(uri);

  // Reset state when URI changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentUri(uri);
  }, [uri]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.warn('SmartImage error for URI:', currentUri, error);
    
    // Try fallback if available and we haven't already tried it
    if (fallbackUri && currentUri === uri) {
      console.log('Trying fallback URI:', fallbackUri);
      setCurrentUri(fallbackUri);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    // If we're already using fallback or no fallback available
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  };

  // Generate fallback URI if not provided
  const getFallbackUri = (originalUri: string): string => {
    if (fallbackUri) return fallbackUri;
    
    // Convert WebP to JPEG fallback
    if (originalUri.includes('.webp')) {
      return originalUri.replace('.webp', '.jpg');
    }
    
    // Add cache buster to force reload
    return `${originalUri}${originalUri.includes('?') ? '&' : '?'}fallback=${Date.now()}`;
  };

  return (
    <View style={styles.container}>
      <Image
        {...imageProps}
        source={{ uri: currentUri }}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        style={[styles.image, imageProps.style]}
      />
      
      {/* Loading overlay */}
      {showLoadingState && isLoading && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Loading...</Text>
        </View>
      )}
      
      {/* Error overlay */}
      {showErrorState && hasError && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Image failed to load</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SmartImage; 