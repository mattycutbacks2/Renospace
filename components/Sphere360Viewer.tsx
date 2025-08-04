// components/Sphere360Viewer.tsx
import { ArrowRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ThreeSphere from './ThreeSphere';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const VIEWER_HEIGHT = 350;

interface Hotspot {
  name: string;
  yaw: number;        // 0-360 degrees horizontal angle
  pitch?: number;     // -90 to 90 degrees vertical angle (optional)
  targetRoom: number;
  type: 'door' | 'entrance' | 'window';
}

interface Room {
  name: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
}

interface Sphere360ViewerProps {
  rooms: Room[];
  initialRoom?: number;
  onRoomChange?: (roomIndex: number) => void;
}

export default function Sphere360Viewer({
  rooms,
  initialRoom = 0,
  onRoomChange
}: Sphere360ViewerProps) {
  const [currentRoom, setCurrentRoom] = useState(initialRoom);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentViewAngle, setCurrentViewAngle] = useState({ yaw: 0, pitch: 0 });
  const [visibleHotspots, setVisibleHotspots] = useState<Hotspot[]>([]);
  
  const panoramaRef = useRef<any>(null);

  console.log('🎉 Sphere360Viewer mounted!', { 
    roomCount: rooms.length, 
    currentRoom: rooms[currentRoom]?.name 
  });

  // Reset loading state when room changes
  useEffect(() => {
    setIsLoading(true);
    setIsLoaded(false);
    setVisibleHotspots([]);
  }, [currentRoom]);

  // Update visible hotspots based on current view angle
  useEffect(() => {
    if (!isLoaded || !rooms[currentRoom]) return;

    const currentRoomData = rooms[currentRoom];
    const visible = currentRoomData.hotspots.filter(hotspot => {
      // Calculate if hotspot is in view (within 60 degrees)
      const yawDiff = Math.abs(normalizeAngle(currentViewAngle.yaw - hotspot.yaw));
      return yawDiff <= 60; // 120-degree field of view
    });

    setVisibleHotspots(visible);
  }, [currentViewAngle, isLoaded, currentRoom, rooms]);

  // Normalize angle to 0-360 range
  const normalizeAngle = (angle: number): number => {
    return ((angle % 360) + 360) % 360;
  };

  // Handle panorama view changes (when user drags to look around)
  const handleViewChange = (event: any) => {
    const { yaw, pitch } = event.nativeEvent || event;
    setCurrentViewAngle({ 
      yaw: normalizeAngle(yaw), 
      pitch: pitch || 0 
    });
  };

  // Handle taps on the panorama (for hotspot detection)
  const handlePanoramaTap = (event: any) => {
    const { yaw, pitch } = event.nativeEvent || event;
    const tapYaw = normalizeAngle(yaw);
    
    console.log('🖐 Tap detected:', { tapYaw, pitch });

    // Find closest hotspot to tap location
    const currentRoomData = rooms[currentRoom];
    if (!currentRoomData) return;

    const closestHotspot = currentRoomData.hotspots.reduce((closest, hotspot) => {
      const distance = Math.abs(normalizeAngle(tapYaw - hotspot.yaw));
      const minDistance = Math.min(distance, 360 - distance); // Handle wrap-around
      
      if (!closest || minDistance < closest.distance) {
        return { hotspot, distance: minDistance };
      }
      return closest;
    }, null as { hotspot: Hotspot; distance: number } | null);

    // If tap is within 30 degrees of a hotspot, navigate
    if (closestHotspot && closestHotspot.distance <= 30) {
      navigateToRoom(closestHotspot.hotspot.targetRoom);
    }
  };

  // Navigate to a different room
  const navigateToRoom = (roomIndex: number) => {
    if (roomIndex >= 0 && roomIndex < rooms.length && roomIndex !== currentRoom) {
      console.log(`🚪 Walking to ${rooms[roomIndex].name}`);
      setCurrentRoom(roomIndex);
      onRoomChange?.(roomIndex);
    }
  };

  // Handle panorama load completion
  const handlePanoramaLoad = () => {
    console.log('✅ Sphere panorama loaded');
    setIsLoaded(true);
    setIsLoading(false);
  };

  // Handle panorama load error
  const handlePanoramaError = (error: any) => {
    console.error('❌ Sphere panorama load error:', error);
    setIsLoading(false);
  };

  const currentRoomData = rooms[currentRoom];
  if (!currentRoomData) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>No room data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Spherical Panorama Viewer */}
      <View style={styles.panoramaContainer}>
        {/* Real WebGL-backed sphere using @lightbase/react-native-panorama-view */}
        <ThreeSphere
          style={styles.panoramaView}
          dimensions={{
            width: SCREEN_W,
            height: VIEWER_HEIGHT,
          }}
          inputType="mono"
          imageUrl={currentRoomData.panoramaUrl}
          enableTouchTracking
          onImageLoaded={() => {
            console.log('✅ Sphere panorama loaded');
            handlePanoramaLoad();
          }}
          onImageLoadingFailed={() => {
            console.error('❌ Sphere panorama load error');
            handlePanoramaError(new Error('Failed to load panorama'));
          }}
          onImageTap={handlePanoramaTap}
          onImageMove={handleViewChange}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Loading {currentRoomData.name}...</Text>
          </View>
        )}
      </View>

      {/* Dynamic Hotspot Arrows */}
      {isLoaded && visibleHotspots.map((hotspot, index) => {
        // Calculate screen position for hotspot arrow
        const screenPosition = calculateScreenPosition(hotspot, currentViewAngle);
        
        return (
          <TouchableOpacity
            key={`${currentRoom}-${index}`}
            style={[
              styles.hotspotArrow,
              {
                left: screenPosition.x,
                top: screenPosition.y,
                opacity: screenPosition.opacity,
              }
            ]}
            onPress={() => navigateToRoom(hotspot.targetRoom)}
            activeOpacity={0.8}
          >
            <View style={styles.arrowContainer}>
              <ArrowRight size={24} color="white" />
              <Text style={styles.hotspotText}>{hotspot.name}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Room Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.roomName}>{currentRoomData.name}</Text>
        <Text style={styles.instructions}>
          🤏 Drag to look around • 🚪 Tap near doors to walk through
        </Text>
        
        {/* Debug Info (removable) */}
        <Text style={styles.debugText}>
          View: {Math.round(currentViewAngle.yaw)}° | Hotspots: {visibleHotspots.length}
        </Text>
      </View>
    </View>
  );
}

// Calculate screen position for hotspot arrow
function calculateScreenPosition(
  hotspot: Hotspot, 
  currentView: { yaw: number; pitch: number }
): { x: number; y: number; opacity: number } {
  const yawDiff = normalizeAngle(hotspot.yaw - currentView.yaw);
  const normalizedDiff = yawDiff > 180 ? yawDiff - 360 : yawDiff;
  
  // Convert angle difference to screen coordinates
  const screenX = SCREEN_W / 2 + (normalizedDiff / 90) * (SCREEN_W / 2);
  const screenY = VIEWER_HEIGHT * 0.7; // Position in lower portion of view
  
  // Calculate opacity based on angle (fade out at edges)
  const distance = Math.abs(normalizedDiff);
  const opacity = Math.max(0, 1 - (distance / 60)); // Fade out beyond 60 degrees
  
  return {
    x: Math.max(20, Math.min(SCREEN_W - 120, screenX - 60)), // Keep arrow on screen
    y: screenY,
    opacity
  };
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: VIEWER_HEIGHT + 80, // Extra space for info bar
    backgroundColor: '#000',
  },
  
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  
  panoramaContainer: {
    width: SCREEN_W,
    height: VIEWER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  
  panoramaView: {
    width: '100%',
    height: '100%',
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  
  hotspotArrow: {
    position: 'absolute',
    zIndex: 10,
  },
  
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 70, 193, 0.9)', // Purple theme
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  hotspotText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  
  infoBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  
  roomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  instructions: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  
  debugText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontFamily: 'monospace',
  },
}); 