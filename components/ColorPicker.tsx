import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { APP_COLORS } from '../constants/Colors';

// List of colors to pick from (add or remove as you like)
const COLORS = [
  APP_COLORS.primary,
  APP_COLORS.secondary,
  APP_COLORS.accent,
  '#F59E42', // orange
  '#22D3EE', // teal
  '#10B981', // green
  '#F43F5E', // red
  '#FFFFFF', // white
  '#1F2937', // black
];

/**
 * ColorPicker lets the user pick a color from your palette.
 * Props:
 *   selected: the currently selected color
 *   onSelect: function to call when a color is picked
 */
type ColorPickerProps = {
  selected: string;
  onSelect: (color: string) => void;
};

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.row}>
      {COLORS.map(color => (
        <TouchableOpacity
          key={color}
          style={[styles.swatch, { backgroundColor: color, borderColor: color === selected ? APP_COLORS.primary : '#E5E7EB' }]}
          onPress={() => onSelect(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    marginHorizontal: 6,
  },
}); 