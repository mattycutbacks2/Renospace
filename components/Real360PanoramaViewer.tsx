// components/Real360PanoramaViewer.tsx
import { ArrowRight, ArrowUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Hotspot = {
  name: string;
  yaw: number;       // 0–360°
  targetRoom: number;
  type: 'door' | 'entrance';
};

type Room = {
  name: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
};

interface Props {
  rooms: Room[];
  initialRoom?: number;
  onRoomChange?: (idx: number) => void;
}

export default function Real360PanoramaViewer({
  rooms,
  initialRoom = 0,
  onRoomChange,
}: Props) {
  console.log('🎉 Real360PanoramaViewer mounted!', { 
    roomsCount: rooms?.length, 
    initialRoom,
    currentRoomData: rooms?.[initialRoom]
  });
  
  const [currentRoom, setCurrentRoom] = useState(initialRoom);
  const [loaded, setLoaded] = useState(false);

  // Shared rotation in degrees
  const rotation = useSharedValue(0);

  // Reset loaded state when room changes
  useEffect(() => {
    setLoaded(false);
  }, [currentRoom]);

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.start = rotation.value;
    },
    onActive: (event, ctx) => {
      // Debug logging
      console.log('🖐 drag translationX:', event.translationX);
      
      // pixels → degrees
      rotation.value = ctx.start + event.translationX * 0.3;
    },
    onEnd: (event) => {
      rotation.value = withDecay({
        velocity: event.velocityX * 0.3,
        clamp: [-360, 360],
      });
    },
  });

  // Animate strip translateX based on rotation
  const stripStyle = useAnimatedStyle(() => {
    const tx = interpolate(
      rotation.value,
      [-360, 0, 360],
      [SCREEN_W, 0, -SCREEN_W],
      Extrapolate.CLAMP
    );
    return { transform: [{ translateX: tx }] };
  });

  // Determine if a hotspot is in view
  const isVisible = (hs: Hotspot) => {
    let angle = rotation.value % 360;
    if (angle < 0) angle += 360;
    let diff = Math.abs(angle - hs.yaw);
    if (diff > 180) diff = 360 - diff;
    
    // Debug logging
    console.log(`hotspot ${hs.name}: yaw=${hs.yaw}°, angle=${angle}°, diff=${diff}°`);
    
    return diff <= 90; // Widened from 45° to 90° for testing
  };

  // Navigate rooms
  const goTo = (idx: number) => {
    if (idx !== currentRoom && idx >= 0 && idx < rooms.length) {
      setCurrentRoom(idx);
      onRoomChange?.(idx);
    }
  };

  const room = rooms[currentRoom];

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      {/* Panorama */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.strip, stripStyle]}>
          {[-1, 0, 1].map((i) => (
            <View key={i} style={styles.tileContainer}>
              <Image
                source={{ uri: room.panoramaUrl }}
                style={styles.tile}
                resizeMode="cover"
                onLoad={() => i === 0 && setLoaded(true)}
              />
            </View>
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* Loading */}
      {!loaded && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading {room.name}…</Text>
        </View>
      )}

      {/* Hotspots */}
      {loaded &&
        room.hotspots.map((hs, i) => {
          if (!isVisible(hs)) return null;
          // position arrow at center bottom for simplicity
          return (
            <TouchableOpacity
              key={i}
              style={styles.hotspot}
              onPress={() => goTo(hs.targetRoom)}
              activeOpacity={0.8}
            >
              {hs.type === 'door' ? (
                <ArrowRight size={20} color="#fff" />
              ) : (
                <ArrowUp size={20} color="#fff" />
              )}
              <Text style={styles.hotspotText}>{hs.name}</Text>
            </TouchableOpacity>
          );
        })}

      {/* Force-show test arrow for debugging */}
      {loaded && (
        <TouchableOpacity
          style={[styles.hotspot, { left: SCREEN_W / 2 - 50 }]}
          onPress={() => goTo((currentRoom + 1) % rooms.length)}
          activeOpacity={0.8}
        >
          <Text style={styles.hotspotText}>🚀 TEST</Text>
        </TouchableOpacity>
      )}

      {/* Instruction Bar */}
      <View style={styles.bar}>
        <Text style={styles.barTitle}>{room.name}</Text>
        <Text style={styles.barHint}>🤏 Drag to look • ↗️ Tap arrows to move</Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_W,
    height: 300,
    backgroundColor: '#000',
  },
  strip: {
    flexDirection: 'row',
    width: SCREEN_W * 3,
    height: 300,
  },
  tileContainer: {
    width: SCREEN_W,
    height: 300,
  },
  tile: {
    width: '100%',
    height: '100%',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  hotspot: {
    position: 'absolute',
    bottom: 20,
    left: SCREEN_W / 2 - 50,
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 70, 193, 0.9)', // Purple to match your theme
    padding: 8,
    borderRadius: 20,
  },
  hotspotText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#111',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  barTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  barHint: {
    color: '#ccc',
    fontSize: 12,
  },
}); 