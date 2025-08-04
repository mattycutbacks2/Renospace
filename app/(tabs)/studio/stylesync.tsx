import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { supabase } from '../../../utils/supabaseClient';
import { uploadImageWithFallback } from '../../../utils/uploadImage';

const PURPLE = '#6B46C1';

// Type definitions
interface Style {
  id: string;
  label: string;
  asset: any;
  tagline: string;
  characteristics: string;
  mood: string[];
}

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  styles: Style[];
}

interface RoomType {
  id: string;
  label: string;
  icon: string;
}

interface IntensityLevel {
  id: string;
  label: string;
  description: string;
  icon: string;
}

// Style categories with existing onboarding styles
const ALL_STYLES: Style[] = [
  { id: 'artdeco', label: 'Art Deco', asset: require('../../../assets/styles/artdeco.png'), tagline: 'Luxurious geometric glamour', characteristics: 'Geometric patterns, metallic accents, bold colors', mood: ['Luxurious', 'Bold', 'Glamorous'] },
  { id: 'biophilic', label: 'Biophilic', asset: require('../../../assets/styles/biophilic.png'), tagline: 'Nature-inspired living spaces', characteristics: 'Natural materials, plants, organic shapes', mood: ['Natural', 'Calm', 'Organic'] },
  { id: 'bohemian', label: 'Bohemian', asset: require('../../../assets/styles/bohemian.png'), tagline: 'Free-spirited artistic expression', characteristics: 'Layered textiles, global patterns, vintage pieces', mood: ['Creative', 'Free-spirited', 'Artistic'] },
  { id: 'coastal', label: 'Coastal', asset: require('../../../assets/styles/coastal.png'), tagline: 'Ocean-inspired serenity', characteristics: 'Blues and whites, natural textures, nautical elements', mood: ['Serene', 'Relaxed', 'Fresh'] },
  { id: 'coastalmodern', label: 'Coastal Modern', asset: require('../../../assets/styles/coastalmodern.png'), tagline: 'Contemporary beach living', characteristics: 'Clean lines, coastal colors, modern furniture', mood: ['Modern', 'Coastal', 'Clean'] },
  { id: 'contemporary', label: 'Contemporary', asset: require('../../../assets/styles/contemporary.png'), tagline: 'Current trends with lasting appeal', characteristics: 'Neutral palette, clean lines, mixed materials', mood: ['Current', 'Versatile', 'Refined'] },
  { id: 'cottagecore', label: 'Cottagecore', asset: require('../../../assets/styles/cottagecore.png'), tagline: 'Whimsical rural romance', characteristics: 'Floral patterns, vintage textiles, natural materials', mood: ['Whimsical', 'Romantic', 'Natural'] },
  { id: 'eclectic', label: 'Eclectic', asset: require('../../../assets/styles/eclectic.png'), tagline: 'Bold mix of styles and eras', characteristics: 'Mixed patterns, diverse textures, personal collections', mood: ['Creative', 'Personal', 'Bold'] },
  { id: 'farmhouse', label: 'Farmhouse', asset: require('../../../assets/styles/farmhouse.png'), tagline: 'Cozy comfort with rural charm', characteristics: 'Reclaimed wood, vintage pieces, warm colors', mood: ['Cozy', 'Welcoming', 'Charming'] },
  { id: 'frenchcountry', label: 'French Country', asset: require('../../../assets/styles/frenchcountry.png'), tagline: 'Rustic charm with French sophistication', characteristics: 'Weathered wood, soft colors, vintage accents', mood: ['Charming', 'Sophisticated', 'Rustic'] },
  { id: 'gothicrevival', label: 'Gothic Revival', asset: require('../../../assets/styles/gothicrevival.png'), tagline: 'Dramatic medieval elegance', characteristics: 'Dark colors, ornate details, dramatic lighting', mood: ['Dramatic', 'Elegant', 'Mysterious'] },
  { id: 'hightech', label: 'High Tech', asset: require('../../../assets/styles/hightech.png'), tagline: 'Futuristic and technologically advanced', characteristics: 'Sleek surfaces, smart features, bold accents', mood: ['Futuristic', 'Bold', 'Advanced'] },
  { id: 'hollywoodregency', label: 'Hollywood Regency', asset: require('../../../assets/styles/hollywoodregency.png'), tagline: 'Old Hollywood glamour and sophistication', characteristics: 'Mirrored surfaces, bold colors, luxurious fabrics', mood: ['Glamorous', 'Sophisticated', 'Luxurious'] },
  { id: 'industrial', label: 'Industrial', asset: require('../../../assets/styles/industrial.png'), tagline: 'Raw materials meet urban sophistication', characteristics: 'Exposed brick, metal accents, open spaces', mood: ['Edgy', 'Urban', 'Sophisticated'] },
  { id: 'japandi', label: 'Japandi', asset: require('../../../assets/styles/japandi.png'), tagline: 'Japanese minimalism meets Scandinavian warmth', characteristics: 'Clean lines, natural wood, neutral palette', mood: ['Harmonious', 'Warm', 'Clean'] },
  { id: 'japanesezen', label: 'Japanese Zen', asset: require('../../../assets/styles/japanesezen.png'), tagline: 'Minimalist tranquility and balance', characteristics: 'Natural materials, clean lines, peaceful spaces', mood: ['Peaceful', 'Balanced', 'Minimal'] },
  { id: 'mediterranean', label: 'Mediterranean', asset: require('../../../assets/styles/mediterranean.png'), tagline: 'Sun-drenched coastal elegance', characteristics: 'Warm colors, textured walls, wrought iron', mood: ['Warm', 'Elegant', 'Relaxed'] },
  { id: 'midcentury', label: 'Mid-Century Modern', asset: require('../../../assets/styles/midcentury.png'), tagline: 'Timeless elegance from the 50s & 60s', characteristics: 'Clean lines, organic shapes, warm woods', mood: ['Elegant', 'Timeless', 'Warm'] },
  { id: 'minimalist', label: 'Minimalist', asset: require('../../../assets/styles/minimalist.png'), tagline: 'Clean, bright, and serene', characteristics: 'Natural wood, white walls, minimal decor', mood: ['Clean', 'Calm', 'Spacious'] },
  { id: 'moderntraditional', label: 'Modern Traditional', asset: require('../../../assets/styles/moderntraditional.png'), tagline: 'Classic elegance with contemporary comfort', characteristics: 'Refined details, comfortable seating, balanced proportions', mood: ['Elegant', 'Comfortable', 'Refined'] },
  { id: 'moroccan', label: 'Moroccan', asset: require('../../../assets/styles/moroccan.png'), tagline: 'Exotic patterns and rich colors', characteristics: 'Intricate patterns, vibrant colors, lanterns', mood: ['Exotic', 'Vibrant', 'Mysterious'] },
  { id: 'retro70s', label: 'Retro 70s', asset: require('../../../assets/styles/retro70s.png'), tagline: 'Groovy vintage vibes', characteristics: 'Bold colors, geometric patterns, vintage furniture', mood: ['Fun', 'Nostalgic', 'Bold'] },
  { id: 'rustic', label: 'Rustic', asset: require('../../../assets/styles/rustic.png'), tagline: 'Natural materials and earthy warmth', characteristics: 'Rough wood, stone, natural textures', mood: ['Warm', 'Natural', 'Earthy'] },
  { id: 'scandinavian', label: 'Scandinavian', asset: require('../../../assets/styles/scandinavian.png'), tagline: 'Warm minimalism with natural elements', characteristics: 'Light wood, neutral colors, cozy textures', mood: ['Cozy', 'Bright', 'Natural'] },
  { id: 'shabbychic', label: 'Shabby Chic', asset: require('../../../assets/styles/shabbychic.png'), tagline: 'Distressed elegance with feminine charm', characteristics: 'Weathered finishes, soft colors, vintage pieces', mood: ['Feminine', 'Elegant', 'Soft'] },
  { id: 'tropical', label: 'Tropical', asset: require('../../../assets/styles/tropical.png'), tagline: 'Island paradise in your home', characteristics: 'Bamboo, palm prints, bright colors, natural light', mood: ['Vibrant', 'Relaxed', 'Energetic'] },
  { id: 'tuscan', label: 'Tuscan', asset: require('../../../assets/styles/tuscan.png'), tagline: 'Italian countryside warmth', characteristics: 'Earthy colors, stone, terracotta, aged wood', mood: ['Warm', 'Earthy', 'Inviting'] },
  { id: 'urbanloft', label: 'Urban Loft', asset: require('../../../assets/styles/urbanloft.png'), tagline: 'Industrial chic meets urban living', characteristics: 'High ceilings, exposed elements, modern furniture', mood: ['Urban', 'Spacious', 'Modern'] },
  { id: 'wabisabi', label: 'Wabi-Sabi', asset: require('../../../assets/styles/wabisabi.png'), tagline: 'Finding beauty in imperfection', characteristics: 'Imperfect finishes, natural materials, muted colors', mood: ['Serene', 'Imperfect', 'Natural'] },
];

// Room types for better context
const ROOM_TYPES: RoomType[] = [
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'living', label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { id: 'office', label: 'Office', icon: '💼' },
  { id: 'dining', label: 'Dining Room', icon: '🍽️' },
];

// Intensity levels for style transformation
const INTENSITY_LEVELS: IntensityLevel[] = [
  { id: 'subtle', label: 'Subtle Inspiration', description: 'Keep most existing, add style accents', icon: '🌱' },
  { id: 'moderate', label: 'Moderate Transformation', description: 'Change colors, some furniture, keep layout', icon: '🌿' },
  { id: 'complete', label: 'Complete Makeover', description: 'Dramatic style transformation', icon: '🌳' },
];

export default function StyleSyncScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState('moderate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stylesList, setStylesList] = useState<Style[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  // Load styles on component mount
  React.useEffect(() => {
    console.log('🎨 Loading styles...');
    if (ALL_STYLES.length > 0) {
      setStylesList(ALL_STYLES);
      console.log('🎨 Styles loaded:', ALL_STYLES.length, 'styles');
    } else {
      console.log('❌ No styles found in ALL_STYLES');
    }
  }, []);

  // Fallback: if stylesList is empty, use ALL_STYLES directly
  const displayStyles = stylesList.length > 0 ? stylesList : ALL_STYLES;

  const onSelectStyle = (style: Style) => {
    console.log('🎯 Style selected:', style.id, style.label);
    setSelectedStyleId(style.id);
    setSelectedStyle(style);
    setCurrentStep(3);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    setCurrentStep(4);
  };

  const processStyleSync = async () => {
    if (!selectedImage || !selectedStyle) return;

    setIsProcessing(true);
    setProcessingStep(1);

    try {
      console.log('🎨 Starting StyleSync transformation...');
      console.log('Selected style:', selectedStyle.label);
      console.log('Intensity:', selectedIntensity);

      // Step 1: Upload image to Supabase storage
      setProcessingStep(1);
      console.log('📤 Uploading image to Supabase storage...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in first!');
      }

      // Optimize image to 512x512 for better AI compatibility
      console.log('🖼️ Optimizing image to 512x512...');
      const optimizedImage = await ImageManipulator.manipulateAsync(
        selectedImage,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('✅ Image optimized:', optimizedImage.uri);

      // Upload optimized image using the existing utility
      const storagePath = await uploadImageWithFallback(optimizedImage.uri);
      console.log('✅ Image uploaded successfully:', storagePath);

      // Step 2: Prepare the prompt for the selected style
      setProcessingStep(2);
      const fullStylePrompt = `Transform this room into ${selectedStyle.label} style with DRAMATIC changes:

STYLE: ${selectedStyle.label}
CHARACTERISTICS: ${selectedStyle.characteristics}
MOOD: ${selectedStyle.mood.join(', ')}

CRITICAL TRANSFORMATION INSTRUCTIONS:
- Repaint ALL walls with ${selectedStyle.label} signature colors
- Replace furniture upholstery with style-appropriate fabrics
- Add ${selectedStyle.label} decorative elements (artwork, rugs, lighting)
- Change window treatments to match the style
- Modify floor finishes if applicable
- Ensure COMPLETE visual transformation

Intensity: ${selectedIntensity === 'subtle' ? 'Subtle style accents' : 
            selectedIntensity === 'moderate' ? 'Moderate style changes' : 
            'DRAMATIC complete transformation'}

The result must be immediately recognizable as ${selectedStyle.label} style.`;

      // Clamp prompt length for testing (start with 400 chars, then expand)
      const stylePrompt = fullStylePrompt.slice(0, 400);
      console.log('📝 Using clamped prompt (400 chars):', stylePrompt);

      // Step 3: Call the flux-tools edge function
      setProcessingStep(3);
      console.log('📤 Calling flux-tools edge function...');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/flux-tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          tool: 'stylesync',
          imagePath: storagePath, // Use the uploaded storage path
          prompt: stylePrompt,
          style: selectedStyle.label,
          intensity: selectedIntensity
        }),
      });

      const data = await response.json();
      console.log('📥 Response from flux-tools:', data);

      if (data.success && data.resultUrl) {
        setProcessingStep(4);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProcessingStep(5);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResultUrl(data.resultUrl);
        setCurrentStep(5);
        console.log('✅ StyleSync transformation complete!');
      } else {
        throw new Error(data.error || 'Failed to transform room');
      }

    } catch (error) {
      console.error('❌ StyleSync error:', error);
      Alert.alert(
        'Transformation Failed', 
        'Unable to transform your room. Please try again with a different photo or style.',
        [{ text: 'OK', onPress: () => setCurrentStep(4) }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedImage(null);
    setSelectedStyle(null);
    setSelectedIntensity('moderate');
    setResultUrl(null);
  };

  const renderStep1 = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transform Your Space Into Any Style</Text>
        <Text style={styles.subtitle}>
          Upload a photo and choose a style to see your room transformed
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload your room photo</Text>
          <Text style={styles.sectionSubtitle}>
            For best results, use well-lit photos with a clear view of the room
          </Text>

          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <View style={styles.uploadZone}>
                <Ionicons name="camera-outline" size={48} color={PURPLE} />
                <Text style={styles.uploadTitle}>Add your room photo</Text>
                <Text style={styles.uploadSubtitle}>
                  Take a new photo or choose from your gallery
                </Text>
              </View>
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Style Selection - Clickable Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Style</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any style to transform your room
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleCardsContainer}>
            {displayStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCardHorizontal,
                  selectedStyleId === style.id && styles.styleCardSelected
                ]}
                onPress={() => {
                  console.log('🎨 Style selected:', style.label);
                  setSelectedStyle(style);
                  setSelectedStyleId(style.id);
                }}
              >
                <Image source={style.asset} style={styles.styleCardImage} />
                <Text style={styles.styleCardLabel}>{style.label}</Text>
                <Text style={styles.styleCardTagline}>{style.tagline}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Intensity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transformation Intensity</Text>
          <Text style={styles.sectionSubtitle}>
            How dramatic do you want the style change to be?
          </Text>
          {INTENSITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.intensityCard,
                selectedIntensity === level.id && styles.intensityCardSelected
              ]}
              onPress={() => setSelectedIntensity(level.id)}
            >
              <Text style={styles.intensityIcon}>{level.icon}</Text>
              <View style={styles.intensityInfo}>
                <Text style={styles.intensityLabel}>{level.label}</Text>
                <Text style={styles.intensityDescription}>{level.description}</Text>
              </View>
              {selectedIntensity === level.id && (
                <Ionicons name="checkmark-circle" size={24} color={PURPLE} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Transform Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={{
              backgroundColor: 'red',
              padding: 20,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}
            onPress={() => {
              console.log('Button pressed!');
              alert('Button works! Photo: ' + (selectedImage ? 'YES' : 'NO') + ', Style: ' + (selectedStyle ? selectedStyle.label : 'NO'));
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
              🔴 TEST BUTTON - CLICK ME
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: (!selectedImage || !selectedStyle) ? '#D1D5DB' : PURPLE,
              padding: 20,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 10,
            }}
            onPress={processStyleSync}
            disabled={!selectedImage || !selectedStyle}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Transform My Room
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Style Transformation</Text>
        <Text style={styles.subtitle}>
          See how your room looks in {selectedStyle?.label} style
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Before/After Comparison */}
        <View style={styles.section}>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonImage}>
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.comparisonImage} />
              )}
              <Text style={styles.comparisonLabel}>Before</Text>
            </View>
            <View style={styles.comparisonImage}>
              {resultUrl && (
                <Image source={{ uri: resultUrl }} style={styles.comparisonImage} />
              )}
              <Text style={styles.comparisonLabel}>After</Text>
            </View>
          </View>
        </View>

        {/* Style Elements Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Elements Applied</Text>
          <View style={styles.elementsContainer}>
            <View style={styles.elementCard}>
              <Ionicons name="color-palette" size={24} color={PURPLE} />
              <Text style={styles.elementTitle}>Color Palette</Text>
              <Text style={styles.elementDescription}>Updated to match {selectedStyle?.label} style</Text>
            </View>
            <View style={styles.elementCard}>
              <Ionicons name="bed" size={24} color={PURPLE} />
              <Text style={styles.elementTitle}>Furniture</Text>
              <Text style={styles.elementDescription}>Style-appropriate pieces and arrangements</Text>
            </View>
            <View style={styles.elementCard}>
              <Ionicons name="bulb" size={24} color={PURPLE} />
              <Text style={styles.elementTitle}>Lighting</Text>
              <Text style={styles.elementDescription}>Enhanced lighting to complement the style</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Share Result</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentStep(1)}>
            <Text style={styles.secondaryButtonText}>Try Different Style</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={resetFlow}>
            <Text style={styles.primaryButtonText}>Transform Another Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transforming Your Room</Text>
        <Text style={styles.subtitle}>
          Creating your {selectedStyle?.label} style transformation
        </Text>
      </View>

      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.processingTitle}>
          {processingStep === 1 && 'Analyzing your room layout...'}
          {processingStep === 2 && `Applying ${selectedStyle?.label} design principles...`}
          {processingStep === 3 && 'Adjusting lighting and colors...'}
          {processingStep === 4 && 'Adding style-specific elements...'}
          {processingStep === 5 && 'Finalizing your transformation...'}
        </Text>
        <Text style={styles.processingSubtitle}>
          This usually takes 30-60 seconds
        </Text>
      </View>
    </View>
  );

  const renderResult = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your {selectedStyle?.label} Transformation</Text>
        <Text style={styles.subtitle}>
          Here's your room transformed into {selectedStyle?.label} style
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before & After</Text>
          
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonImageContainer}>
              <Text style={styles.comparisonLabel}>Original</Text>
              {selectedImage && <Image source={{ uri: selectedImage }} style={styles.comparisonImage} />}
            </View>
            
            <View style={styles.comparisonImageContainer}>
              <Text style={styles.comparisonLabel}>{selectedStyle?.label}</Text>
              <Image source={{ uri: resultUrl! }} style={styles.comparisonImage} />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={resetFlow}>
              <Ionicons name="refresh" size={20} color={PURPLE} />
              <Text style={styles.secondaryButtonText}>Try Another Style</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="download" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Save to Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Render current step
  if (isProcessing) {
    return renderProcessing();
  }

  // Show result if we have one
  if (resultUrl && currentStep === 5) {
    return renderResult();
  }

  switch (currentStep) {
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    default:
      return renderStep1();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  roomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roomTypeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 110,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roomTypeCardSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F3F4F6',
    shadowColor: PURPLE,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  roomTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roomTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  uploadContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadZone: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  changeImageButton: {
    padding: 16,
    alignItems: 'center',
  },
  changeImageText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: '600',
  },
  examplesContainer: {
    marginTop: 16,
  },
  exampleCard: {
    marginRight: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    width: 120,
  },
  exampleImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  exampleLabel: {
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  categoryList: {
    padding: 24,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryStyles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStyleThumb: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
  categoryStyleCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  styleList: {
    paddingVertical: 16,
  },
  styleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  styleCardSelected: {
    borderColor: PURPLE,
    borderWidth: 2,
    shadowColor: PURPLE,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  styleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },
  styleInfo: {
    flex: 1,
  },
  styleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  styleTagline: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  styleMood: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moodTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  selectedStyleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedStyleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },
  selectedStyleInfo: {
    flex: 1,
  },
  selectedStyleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedStyleTagline: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  selectedStyleCharacteristics: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  intensityCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  intensityCardSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F3F4F6',
  },
  intensityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  intensityInfo: {
    flex: 1,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  intensityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  roomPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  elementsContainer: {
    gap: 12,
  },
  elementCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  elementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
    marginBottom: 4,
  },
  elementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  styleDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  styleDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  styleDetailTagline: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  styleDetailCharacteristics: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  moodContainer: {
    marginTop: 24,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleCardsContainer: {
    marginTop: 16,
  },
  styleCardHorizontal: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    width: 180,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  styleCardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  styleCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    textAlign: 'center',
  },
  styleCardTagline: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 12,
    paddingBottom: 12,
    textAlign: 'center',
  },
  styleCardSelected: {
    borderColor: PURPLE,
    borderWidth: 3,
    shadowColor: PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  comparisonImageContainer: {
    flex: 1,
    position: 'relative',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: '600',
  },
}); 