import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Rect } from 'react-native-svg';

interface MaskRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MobileMaskDrawerProps {
  roomUri: string;
  onComplete: (mask: MaskRect) => void;
  onCancel: () => void;
}

export function MobileMaskDrawer({ roomUri, onComplete, onCancel }: MobileMaskDrawerProps) {
  const [rect, setRect] = useState<MaskRect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const onGestureEvent = (event: any) => {
    if (!isDrawing) {
      setIsDrawing(true);
      setRect({ 
        x: event.nativeEvent.x, 
        y: event.nativeEvent.y, 
        width: 0, 
        height: 0 
      });
    } else if (rect) {
      setRect({
        ...rect,
        width: event.nativeEvent.x - rect.x,
        height: event.nativeEvent.y - rect.y,
      });
    }
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END && rect) {
      setIsDrawing(false);
      // Ensure positive dimensions
      const finalRect = {
        x: rect.width < 0 ? rect.x + rect.width : rect.x,
        y: rect.height < 0 ? rect.y + rect.height : rect.y,
        width: Math.abs(rect.width),
        height: Math.abs(rect.height),
      };
      
      console.log('🎯 Final rect dimensions:', finalRect);
      
      // Validate minimum size (reduced from 50x50 to 20x20)
      if (finalRect.width < 20 || finalRect.height < 20) {
        Alert.alert('Mask Too Small', 'Please draw a larger area for artwork placement (minimum 20x20 pixels)');
        setRect(null);
        return;
      }
      
      setRect(finalRect);
      console.log('✅ Mask set successfully:', finalRect);
    }
  };

  const handleConfirm = () => {
    console.log('🔘 Confirm button pressed, rect:', rect);
    if (rect) {
      console.log('✅ Calling onComplete with rect:', rect);
      onComplete(rect);
    } else {
      console.log('❌ No rect to confirm');
    }
  };

  const handleClear = () => {
    setRect(null);
    setIsDrawing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Draw Placement Area</Text>
        <Text style={styles.subtitle}>Drag to create a rectangle where you want the artwork</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: roomUri }} style={styles.image} resizeMode="contain" />
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Svg style={StyleSheet.absoluteFill}>
            {rect && (
              <Rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill="rgba(107, 70, 193, 0.3)"
                stroke="rgba(107, 70, 193, 0.8)"
                strokeWidth={3}
                strokeDasharray="5,5"
              />
            )}
          </Svg>
        </PanGestureHandler>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.confirmButton, !rect && styles.disabledButton]} 
          onPress={handleConfirm}
          disabled={!rect}
        >
          <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm Area</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  confirmButtonText: {
    color: '#FFF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    borderColor: '#D1D5DB',
  },
}); 