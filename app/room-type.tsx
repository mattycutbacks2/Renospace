import React from 'react';
import {
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ROOM_TYPES = [
  { id: 'living-room', label: 'Living Room', icon: 'home-outline' },
  { id: 'bedroom', label: 'Bedroom', icon: 'bed-outline' },
  { id: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { id: 'bathroom', label: 'Bathroom', icon: 'water-outline' },
  { id: 'dining-room', label: 'Dining Room', icon: 'pizza-outline' },
  { id: 'office', label: 'Office', icon: 'desktop-outline' },
  { id: 'outdoor', label: 'Outdoor', icon: 'leaf-outline' },
  { id: 'garden', label: 'Garden', icon: 'flower-outline' },
  { id: 'garage', label: 'Garage', icon: 'car-outline' },
  { id: 'hallway', label: 'Hallway', icon: 'walk-outline' },
  { id: 'basement', label: 'Basement', icon: 'home-outline' },
  { id: 'pool-house', label: 'Pool House', icon: 'water-outline' },
  { id: 'conference-room', label: 'Conference Room', icon: 'people-outline' },
  { id: 'great-room', label: 'Great Room', icon: 'sparkles-outline' },
  { id: 'exercise-room', label: 'Exercise Room', icon: 'barbell-outline' },
  { id: 'wine-cellar', label: 'Wine Cellar', icon: 'wine-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const cardSize = (width - 48) / 2;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select a Room Type</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {ROOM_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.card, { width: cardSize, height: cardSize }]}
            onPress={() =>
              router.push({
                pathname: '/image-upload',
                params: { roomType: type.label },
              })
            }
          >
            <View style={styles.iconWrap}>
              <Ionicons name={type.icon} size={40} color="#fff" />
            </View>
            <Text style={styles.cardText}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', paddingTop: 28 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    padding: 8,
  },
  iconWrap: {
    backgroundColor: '#7B61FF', // purple background
    borderRadius: 50,
    padding: 10,
  },
  cardText: {
    marginTop: 10,
    color: '#222',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});




