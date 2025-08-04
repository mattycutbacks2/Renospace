import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { useCompose } from './_layout';

const ROOM_TYPES = [
  { id: 'living-room', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'dining-room', name: 'Dining Room', icon: '🍽️' },
  { id: 'home-office', name: 'Home Office', icon: '💼' },
  { id: 'nursery', name: 'Nursery', icon: '👶' },
  { id: 'basement', name: 'Basement', icon: '🏠' },
];

export default function RoomTypeStep() {
  const theme = useTheme();
  const { roomType, setRoomType } = useCompose();
  const router = useRouter();

  const handleRoomSelect = (type: string) => {
    setRoomType(type);
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>What room are you designing?</Text>
      <Text style={styles(theme).subtitle}>Choose the room type for your design</Text>
      <FlatList
        data={ROOM_TYPES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles(theme).row}
        contentContainerStyle={styles(theme).list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleRoomSelect(item.id)}
            style={({ pressed }) => [
              styles(theme).card,
              roomType === item.id && styles(theme).cardSelected,
              pressed && styles(theme).cardPressed
            ]}
          >
            <Text style={styles(theme).icon}>{item.icon}</Text>
            <Text style={styles(theme).cardName}>{item.name}</Text>
          </Pressable>
        )}
      />
      <Pressable
        style={({ pressed }) => [
          styles(theme).nextButton,
          (!roomType || pressed) && styles(theme).nextButtonDisabled
        ]}
        onPress={() => router.push('/compose/style-preference')}
        disabled={!roomType}
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
    paddingVertical: theme.spacing[6],
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
  icon: {
    fontSize: 36,
    marginBottom: theme.spacing[2],
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
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