import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PaletteCard({ title, subtitle, colors, selected, onPress }: {
  title: string;
  subtitle: string;
  colors: string[];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      <View style={styles.swatches}>
        {colors.map((c) => (
          <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
        ))}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    // Android elevation
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
  },
  swatches: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
}); 