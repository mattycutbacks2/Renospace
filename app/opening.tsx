import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import AuthScreen from './AuthScreen';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Instant Room Makeovers',
    subtitle: 'Upload a photo and let AI do the rest.',
    image: require('../assets/styles/bohemian.png'),
    buttonLabel: 'Next',
  },
  {
    key: '2',
    title: '100+ Styles to Explore',
    subtitle: 'From Boho to Bauhaus, find your vibe.',
    image: require('../assets/styles/minimalist.png'),
    buttonLabel: 'Next',
  },
  {
    key: '3',
    title: 'Save & Share',
    subtitle: 'Export high-res images straight to your camera roll.',
    image: require('../assets/styles/scandinavian.png'),
    buttonLabel: 'Get Started',
  },
];

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setShowAuth(true);
    }
  };

  const skip = () => {
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthScreen onAuthSuccess={() => router.replace('/(tabs)/studio')} />;
  }

  return (
    <View style={styles(theme).container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={[styles(theme).slide, { width }]}> 
            <Image source={item.image} style={styles(theme).image} />
            <Text style={styles(theme).title}>{item.title}</Text>
            <Text style={styles(theme).subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Progress Indicators */}
      <View style={styles(theme).progressContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles(theme).dot,
              currentIndex === i ? styles(theme).activeDot : styles(theme).inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Skip button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable style={styles(theme).skip} onPress={skip}>
          <Text style={styles(theme).skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Next/Get Started button */}
      <View style={styles(theme).footer}>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles(theme).nextButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles(theme).nextButtonText}>
            {SLIDES[currentIndex].buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: {
    alignItems: 'center',
    paddingTop: 60,
  },
  image: {
    width: width,
    height: width * 0.6,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#7C4DFF',
  },
  inactiveDot: {
    backgroundColor: '#EEE',
  },
  skip: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  skipText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  nextButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 