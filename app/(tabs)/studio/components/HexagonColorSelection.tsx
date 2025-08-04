import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const PURPLE = '#6B46C1';

const SURFACE_TYPES = [
  { key: 'wall', label: 'Wall', icon: '🏠' },
  { key: 'floor', label: 'Floor', icon: '🏢' },
  { key: 'countertop', label: 'Countertop', icon: '🪑' },
];

// Simple Color Picker Component
const SimpleColorPicker: React.FC<{
  selectedColor: string;
  onColorChange: (color: string) => void;
  size?: number;
}> = ({ selectedColor, onColorChange, size = 200 }) => {
  const [position, setPosition] = useState({ x: size / 2, y: size / 2 });

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Calculate color from position
  const getColorFromPosition = (x: number, y: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    
    // Calculate angle (hue)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate distance from center (saturation)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = size / 2 - 20;
    const saturation = Math.min(distance / maxDistance, 1);
    
    // Fixed brightness for vivid colors
    const brightness = 1;
    
    return hsvToRgb(angle, saturation, brightness);
  };

  // Handle pan gesture
  const onPanGestureEvent = (event: any) => {
    const { x, y } = event.nativeEvent;
    const centerX = size / 2;
    const centerY = size / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Keep within circle bounds
    if (distance <= size / 2 - 20) {
      setPosition({ x, y });
      const color = getColorFromPosition(x, y);
      onColorChange(color);
    }
  };

  return (
    <View style={[styles.pickerContainer, { width: size, height: size }]}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.END) {
            onPanGestureEvent(event);
          }
        }}
      >
        <View>
          <Svg width={size} height={size}>
            <Defs>
              {/* Rainbow gradient */}
              <LinearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#ff0000" />
                <Stop offset="16.66%" stopColor="#ffff00" />
                <Stop offset="33.33%" stopColor="#00ff00" />
                <Stop offset="50%" stopColor="#00ffff" />
                <Stop offset="66.66%" stopColor="#0000ff" />
                <Stop offset="83.33%" stopColor="#ff00ff" />
                <Stop offset="100%" stopColor="#ff0000" />
              </LinearGradient>
              
              {/* Saturation gradient */}
              <LinearGradient id="saturation" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            
            {/* Base circle with rainbow */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 10}
              fill="url(#rainbow)"
              stroke="#E0E0E0"
              strokeWidth="2"
            />
            
            {/* Saturation overlay */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 10}
              fill="url(#saturation)"
              opacity="0.7"
            />
            
            {/* Color selector dot */}
            <Circle
              cx={position.x}
              cy={position.y}
              r="8"
              fill={selectedColor}
              stroke="#FFF"
              strokeWidth="3"
            />
          </Svg>
        </View>
      </PanGestureHandler>
    </View>
  );
};

interface Props {
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  surfaceType: string;
  setSurfaceType: (s: string) => void;
  onProceed: () => void;
}

const HexagonColorSelection: React.FC<Props> = ({
  selectedColor,
  setSelectedColor,
  surfaceType,
  setSurfaceType,
  onProceed,
}) => {
  const [hexInput, setHexInput] = useState(selectedColor);

  // Normalize hex input
  const normalizeHex = (val: string) => {
    let cleanVal = val.replace('#', '');
    if (cleanVal.length === 3) {
      cleanVal = cleanVal.split('').map(c => c + c).join('');
    }
    if (cleanVal.length === 6) {
      return '#' + cleanVal.toUpperCase();
    }
    return val;
  };

  // Handle hex input change
  const handleHexChange = (val: string) => {
    setHexInput(val);
    const normalized = normalizeHex(val);
    if (/^#([0-9A-F]{6})$/i.test(normalized)) {
      setSelectedColor(normalized);
    }
  };

  // Update hex input when picker changes
  const handlePickerChange = (color: string) => {
    setSelectedColor(color);
    setHexInput(color);
  };

  const canContinue = Boolean(selectedColor && surfaceType);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 2 of 2</Text>
        <Text style={styles.title}>Pick a color</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        
        {/* Color Picker */}
        <View style={styles.pickerSection}>
          <Text style={styles.sectionLabel}>Choose a color</Text>
          <SimpleColorPicker
            selectedColor={selectedColor}
            onColorChange={handlePickerChange}
            size={200}
          />
        </View>

        {/* HEX Input Section */}
        <View style={styles.hexSection}>
          <Text style={styles.sectionLabel}>Hex Code</Text>
          <View style={styles.hexRow}>
            <TextInput
              value={hexInput}
              onChangeText={handleHexChange}
              style={styles.hexInput}
              placeholder="#FF0000"
              autoCapitalize="characters"
              maxLength={7}
              autoCorrect={false}
              selectTextOnFocus={true}
            />
            <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          </View>
        </View>

        {/* Surface Selection */}
        <View style={styles.surfaceSection}>
          <Text style={styles.sectionLabel}>Choose a surface</Text>
          <View style={styles.surfaceGrid}>
            {SURFACE_TYPES.map((surface) => (
              <TouchableOpacity
                key={surface.key}
                onPress={() => setSurfaceType(surface.key)}
                style={[
                  styles.surfaceCard,
                  surfaceType === surface.key && styles.surfaceCardSelected,
                ]}
              >
                <Text style={styles.surfaceIcon}>{surface.icon}</Text>
                <Text style={[
                  styles.surfaceLabel,
                  surfaceType === surface.key && styles.surfaceLabelSelected,
                ]}>
                  {surface.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onProceed}
          disabled={!canContinue}
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
        >
          <Text style={styles.continueButtonText}>
            {canContinue ? 'Continue' : 'Select color and surface'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  
  // Color Picker
  pickerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // HEX Section
  hexSection: {
    marginBottom: 20,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hexInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  
  // Surface
  surfaceSection: {
    marginBottom: 16,
  },
  surfaceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surfaceCard: {
    width: '31%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  surfaceCardSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  surfaceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  surfaceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  surfaceLabelSelected: {
    color: '#FFF',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: PURPLE,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default HexagonColorSelection; 