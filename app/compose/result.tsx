import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { useCompose } from './_layout';

export default function ComposeResult() {
  const theme = useTheme();
  const router = useRouter();
  const { roomType, style, notes } = useCompose();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Simulate AI generation delay
    setTimeout(() => {
      setImageUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
      setLoading(false);
    }, 2200);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      <Text style={styles(theme).title}>Your AI-Generated Design</Text>
      {loading ? (
        <View style={styles(theme).loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles(theme).loadingText}>Generating your design...</Text>
        </View>
      ) : (
        <>
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles(theme).image} />
          )}
          <View style={styles(theme).summary}>
            <Text style={styles(theme).summaryTitle}>Summary</Text>
            <Text style={styles(theme).summaryItem}><Text style={styles(theme).summaryLabel}>Room:</Text> {roomType}</Text>
            <Text style={styles(theme).summaryItem}><Text style={styles(theme).summaryLabel}>Style:</Text> {style}</Text>
            <Text style={styles(theme).summaryItem}><Text style={styles(theme).summaryLabel}>Notes:</Text> {notes}</Text>
          </View>
          <View style={styles(theme).actions}>
            <Pressable
              style={({ pressed }) => [styles(theme).actionButton, pressed && styles(theme).actionButtonPressed]}
              onPress={() => router.replace('/compose/room-type')}
            >
              <Text style={styles(theme).actionButtonText}>Start Over</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles(theme).actionButton, pressed && styles(theme).actionButtonPressed]}
              onPress={() => router.replace('/compose/notes')}
            >
              <Text style={styles(theme).actionButtonText}>Edit</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[5],
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  loadingWrap: {
    alignItems: 'center',
    marginTop: theme.spacing[8],
  },
  loadingText: {
    marginTop: theme.spacing[4],
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: theme.roundness.lg,
    marginBottom: theme.spacing[4],
    backgroundColor: '#eee',
  },
  summary: {
    width: '100%',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[2],
  },
  summaryItem: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  summaryLabel: {
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: theme.spacing[4],
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 