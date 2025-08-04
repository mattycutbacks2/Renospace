import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme';

const PALETTES = [
  { id: 'sunset', name: 'Sunset', colors: ['#FFB347', '#FF6961', '#FFD700'] },
  { id: 'ocean', name: 'Ocean', colors: ['#00BFFF', '#1E90FF', '#4682B4'] },
  { id: 'forest', name: 'Forest', colors: ['#228B22', '#6B8E23', '#A2C523'] },
  { id: 'pastel', name: 'Pastel', colors: ['#FFD1DC', '#B5EAD7', '#C7CEEA'] },
  { id: 'neon', name: 'Neon', colors: ['#39FF14', '#FF073A', '#F3F315'] },
  { id: 'earth', name: 'Earth', colors: ['#A0522D', '#DEB887', '#F4A460'] },
];

export default function ColorSchemeStep() {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [customActive, setCustomActive] = useState(false);

  const isValidCustom = /^#([0-9A-F]{3}){1,2}$/i.test(custom.trim());
  const canContinue = selected || (customActive && isValidCustom);

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Pick a color palette</Text>
      <Text style={styles(theme).subtitle}>Choose a preset or enter your own</Text>
      <FlatList
        data={PALETTES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles(theme).row}
        contentContainerStyle={styles(theme).list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => { setSelected(item.id); setCustomActive(false); }}
            style={({ pressed }) => [
              styles(theme).card,
              selected === item.id && styles(theme).cardSelected,
              pressed && styles(theme).cardPressed
            ]}
          >
            <View style={styles(theme).swatchRow}>
              {item.colors.map((color, i) => (
                <View key={i} style={[styles(theme).swatch, { backgroundColor: color }]} />
              ))}
            </View>
            <Text style={styles(theme).cardName}>{item.name}</Text>
          </Pressable>
        )}
      />
      <Pressable
        style={({ pressed }) => [
          styles(theme).customCard,
          customActive && styles(theme).cardSelected,
          pressed && styles(theme).cardPressed
        ]}
        onPress={() => { setSelected(null); setCustomActive(true); }}
      >
        <Text style={styles(theme).customLabel}>Custom Color</Text>
        <TextInput
          style={styles(theme).customInput}
          placeholder="#AABBCC"
          placeholderTextColor={theme.colors.textMuted}
          value={custom}
          onChangeText={setCustom}
          onFocus={() => { setSelected(null); setCustomActive(true); }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={7}
        />
        {custom.length > 0 && !isValidCustom && (
          <Text style={styles(theme).errorText}>Enter a valid hex color</Text>
        )}
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles(theme).nextButton,
          (!canContinue || pressed) && styles(theme).nextButtonDisabled
        ]}
        onPress={() => router.push('/compose/notes')}
        disabled={!canContinue}
      >
        <Text style={styles(theme).nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[5],
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    lineHeight: 22,
  },
  list: {
    paddingBottom: theme.spacing[4],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[4],
    marginBottom: 0,
    flex: 1,
    marginHorizontal: theme.spacing[2],
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  swatchRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[2],
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  customCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  customLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  customInput: {
    width: 120,
    height: 40,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[4],
    width: '100%',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 