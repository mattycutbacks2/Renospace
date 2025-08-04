import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    clamp,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withDecay
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface Hotspot {
  to: string;
  position: { yaw: number; pitch: number };
  label: string;
}

interface PanoramaViewerProps {
  imageUrl: string;
  hotspots?: Hotspot[];
  onHotspotPress?: (hotspot: Hotspot) => void;
  roomTitle?: string;
  roomDescription?: string;
}

const PanoramaViewer = ({ 
  imageUrl, 
  hotspots = [], 
  onHotspotPress, 
  roomTitle, 
  roomDescription 
}: PanoramaViewerProps) => {
  const translateX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-(screenWidth * 2.5 - screenWidth), 0],
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateX: clamp(translateX.value, -(screenWidth * 2.5 - screenWidth), 0) 
    }],
  }));

  const handleHotspotPress = (hotspot: Hotspot) => {
    if (onHotspotPress) {
      onHotspotPress(hotspot);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.panoramaContainer}>
          <Animated.Image 
            source={{ uri: imageUrl }} 
            style={[styles.image, animatedStyle]} 
            resizeMode="cover"
            onLoadStart={() => console.log('🖼️ Loading panorama:', imageUrl)}
            onLoad={() => console.log('✅ Panorama loaded')}
            onError={(e: any) => console.error('❌ Panorama load error:', e.nativeEvent.error)}
          />

          {/* Room Title Overlay */}
          {roomTitle && (
            <View style={styles.roomTitleOverlay}>
              <Text style={styles.roomTitle}>{roomTitle}</Text>
              {roomDescription && (
                <Text style={styles.roomDescription}>{roomDescription}</Text>
              )}
            </View>
          )}

          {/* Hotspots */}
          {hotspots.map((hotspot, index) => {
            const baseX = (hotspot.position?.yaw || 0) / 360 * screenWidth * 2.5;
            const adjustedX = baseX - (screenWidth * 0.75);
            
            return (
              <Animated.View
                key={`hotspot-${index}`}
                style={[
                  styles.hotspotContainer,
                  {
                    left: adjustedX,
                    transform: [
                      { translateX: translateX },
                      { translateY: -20 }
                    ],
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleHotspotPress(hotspot)}
                  style={styles.hotspotButton}
                >
                  <Text style={styles.hotspotArrow}>→</Text>
                  <Text style={styles.hotspotText}>
                    {hotspot.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* 360° Indicator */}
          <View style={styles.panoramaIndicator}>
            <Text style={styles.panoramaIndicatorText}>360° View</Text>
          </View>

          {/* Pan Instruction */}
          <View style={styles.panInstruction}>
            <Text style={styles.panInstructionText}>🔄</Text>
            <Text style={styles.panInstructionText}>
              Drag to look around
            </Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  panoramaContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: screenWidth * 2.5,
    height: '100%',
  },
  roomTitleOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  roomTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  roomDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  hotspotContainer: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
  },
  hotspotButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotspotArrow: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  hotspotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  panoramaIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  panoramaIndicatorText: {
    color: 'white',
    fontSize: 12,
  },
  panInstruction: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  panInstructionText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
  },
});

export default PanoramaViewer; 