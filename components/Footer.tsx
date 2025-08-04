import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Footer({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 140,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  nextBtn: {
    width: 140,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  nextText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 