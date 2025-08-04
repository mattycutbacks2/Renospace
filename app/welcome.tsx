import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFlow } from '../components/FlowManager';
import { useTheme } from '../theme';

interface WelcomeScreenProps {
  onComplete?: () => void;
}

const STYLE_IMAGES = [
  require('../assets/styles/artdeco.png'),
  require('../assets/styles/bohemian.png'),
  require('../assets/styles/coastal.png'),
  require('../assets/styles/eclectic.png'),
  require('../assets/styles/hightech.png'),
  require('../assets/styles/japandi.png'),
  require('../assets/styles/moroccan.png'),
  require('../assets/styles/retro70s.png'),
  require('../assets/styles/rustic.png'),
  require('../assets/styles/tuscan.png'),
];

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const theme = useTheme();
  const { markWelcomeDone } = useFlow();

  const handleStart = () => {
    markWelcomeDone(); // Call the FlowManager's completion handler
    onComplete?.(); // Call the onComplete callback
    // The flow system will automatically redirect to the next step (onboarding)
  };

  return (
    <View style={styles(theme).container}>
      <ScrollView
        style={styles(theme).scroll}
        contentContainerStyle={styles(theme).scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {STYLE_IMAGES.map((img, i) => (
          <Image
            key={i}
            source={img}
            style={{
              width: '100%',
              height: 180,
              borderRadius: 20,
              marginBottom: theme.spacing[4],
              resizeMode: 'cover',
            }}
          />
        ))}
      </ScrollView>
      {/* Gradient overlay at the bottom for button readability */}
      <LinearGradient
        colors={["transparent", theme.colors.background, theme.colors.background]}
        style={styles(theme).gradient}
        pointerEvents="none"
      />
      <View style={styles(theme).buttonWrap}>
        <Pressable
          style={({ pressed }) => [
            styles(theme).button,
            pressed && styles(theme).buttonPressed
          ]}
          onPress={handleStart}
        >
          <Text style={styles(theme).buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.25,
  },
  image: {
    width: '100%',
    height: height * 0.45,
    marginBottom: theme.spacing[3],
    borderRadius: theme.roundness.lg,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    zIndex: 1,
  },
  buttonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    alignItems: 'center',
    zIndex: 2,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 