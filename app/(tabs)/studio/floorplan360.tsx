import { GenerationGuard, useGenerationGuard } from '@/components/GenerationGuard';
import ThreeSphere from '@/components/ThreeSphere';
import { supabase } from '@/utils/supabaseClient';
import { uploadImageWithFallback } from '@/utils/uploadImage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Production-quality error handling
const PRODUCTION_ERRORS = {
  UPLOAD_FAILED: 'Failed to upload floor plan. Please check your internet connection and try again.',
  ANALYSIS_FAILED: 'Could not analyze your floor plan. Please ensure it\'s a clear architectural drawing with visible room labels.',
  GENERATION_FAILED: 'Failed to generate virtual tour. Please try again in a few moments.',
  NETWORK_ERROR: 'Network connection issue. Please check your internet and try again.',
  PERMISSION_DENIED: 'Camera roll permission required. Please grant access in Settings.',
  INVALID_IMAGE: 'Invalid image format. Please select a JPEG or PNG file.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Production-quality retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  TIMEOUT: 300000 // 5 minutes
};

// Production-quality validation
const validateImage = (uri: string): boolean => {
  return Boolean(uri && (uri.startsWith('file://') || uri.startsWith('http')));
};

const validateSupabaseUrl = (url: string): boolean => {
  return Boolean(url && url.startsWith('https://') && url.includes('supabase.co') && !url.includes('file://'));
};

const validateImageUrl = (url: string): boolean => {
  // Accept both Supabase URLs and Replicate URLs
  return Boolean(
    url && 
    url.startsWith('https://') && 
    (url.includes('supabase.co') || url.includes('replicate.delivery')) && 
    !url.includes('file://')
  );
};

// Production-quality timeout wrapper
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(PRODUCTION_ERRORS.TIMEOUT)), timeoutMs)
    )
  ]);
};

// Production-quality retry wrapper
const withRetry = async <T,>(
  operation: () => Promise<T>, 
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES,
  delay: number = RETRY_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), RETRY_CONFIG.TIMEOUT);
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
};

// Types
interface Room {
  id: string;
  name: string;
  type: string;
  image360Url?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface Tour {
  id: string;
  dollhouseUrl?: string;
  rooms: Room[];
  viewpoints: any[];
  style: string;
  status: 'analyzing' | 'generating' | 'completed' | 'failed';
  layoutType?: string;
  analysis?: any;
}

// Style options
const DESIGN_STYLES = [
  { id: 'scandinavian', name: 'Scandinavian', description: 'Clean, minimal, natural', icon: '🌿' },
  { id: 'modern', name: 'Modern', description: 'Sleek, contemporary', icon: '🏢' },
  { id: 'farmhouse', name: 'Farmhouse', description: 'Rustic, cozy, traditional', icon: '🏡' },
  { id: 'industrial', name: 'Industrial', description: 'Urban, raw materials', icon: '🏭' },
  { id: 'minimalist', name: 'Minimalist', description: 'Less is more', icon: '⚪' },
  { id: 'bohemian', name: 'Bohemian', description: 'Eclectic, artistic', icon: '🎨' },
];

// Generation progress steps
const GENERATION_STEPS = [
  'Reading your specific floor plan layout...',
  'Generating dollhouse matching your layout...',
  'Creating tour views for your rooms...',
  'Validating generated content...',
  'Finalizing your custom experience...',
  'Ready to explore!'
];

// Add smoke test data at the top of the component
const SMOKE_TEST_ROOMS = [
  {
    name: "Test Living Room",
    panoramaUrl: "https://replicate.delivery/xezq/QGVIIYQ7FoIsNZEvBXI6NQSSrewlRjPnbfZWQGkQLTNsyFFVA/out-0.webp",
    hotspots: [
      { name: "Kitchen", yaw: 90, targetRoom: 1 },
      { name: "Bedroom", yaw: 180, targetRoom: 2 }
    ]
  },
  {
    name: "Test Kitchen", 
    panoramaUrl: "https://replicate.delivery/xezq/QGVIIYQ7FoIsNZEvBXI6NQSSrewlRjPnbfZWQGkQLTNsyFFVA/out-0.webp",
    hotspots: [
      { name: "Living Room", yaw: 270, targetRoom: 0 }
    ]
  }
];

export default function Floorplan360Screen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [floorPlan, setFloorPlan] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<typeof DESIGN_STYLES[0] | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [smokeTestMode, setSmokeTestMode] = useState(true); // Force smoke test mode ON
  const [currentViewpointIndex, setCurrentViewpointIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { checkAndConsumeCredit } = useGenerationGuard();

  // Production-quality error boundary
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    console.error('💥 PRODUCTION ERROR BOUNDARY CAUGHT:', error, errorInfo);
    setHasError(true);
    setErrorMessage(error.message || PRODUCTION_ERRORS.UNKNOWN_ERROR);
    setLoading(false);
  }, []);

  // Production-quality error recovery
  const handleErrorRecovery = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    setCurrentStep(1);
    setFloorPlan(null);
    setSelectedStyle(null);
    setTour(null);
    setGenerationProgress(0);
    setCurrentViewpointIndex(0);
    setLoading(false);
    console.log('🔄 Error recovery completed');
  }, []);

  // Production-quality error display
  if (hasError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>⚠️</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={handleErrorRecovery}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#667EEA' : '#8B5CF6',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              alignItems: 'center',
            })}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Image optimization helper
  const optimizeImage = async (uri: string) => {
    // For now, just return the original URI
    // In the future, we could add image optimization here
    return uri;
  };

  // Step 1: Floor plan upload
  const handleCameraRollUpload = async () => {
    try {
      console.log('📱 Starting camera roll picker...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload your floor plan.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('📸 Image selected from camera roll:', asset.uri);
        
        // Optimize image
        console.log('🖼️ Optimizing camera roll image...');
        const optimizedUri = await optimizeImage(asset.uri);
        
        // Upload to Supabase using the reliable uploadWithFallback utility
        console.log('📤 Starting camera roll upload to Supabase...');
        const storagePath = await uploadImageWithFallback(optimizedUri);
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(storagePath);
        
        console.log('✅ Camera roll upload successful, storage path:', storagePath);
        console.log('🔗 Generated public URL:', publicUrl);
        setFloorPlan(publicUrl);
        setCurrentStep(2);
        console.log('✅ Camera roll upload completed, moving to step 2');
      }
    } catch (error) {
      console.error('❌ Camera roll error:', error);
      Alert.alert('Upload Error', 'Failed to upload floor plan. Please try again.');
    }
  };

  // Step 2: Style selection
  const handleStyleSelect = (style: typeof DESIGN_STYLES[0]) => {
    console.log('🎨 Style selected:', style.name, 'ID:', style.id);
    setSelectedStyle(style);
    setCurrentStep(3);
    console.log('✅ Style selection completed, moving to step 3');
  };

  // Production-quality tour generation with comprehensive error handling
  const generateTour = async () => {
    if (!floorPlan || !selectedStyle) {
      Alert.alert('Error', 'Please select a floor plan and style first');
      return;
    }

    setLoading(true);
    setCurrentStep(4);
    setGenerationProgress(0);

    try {
      // Check and consume credit before generation
      const canGenerate = await checkAndConsumeCredit();
      if (!canGenerate) {
        console.log('❌ No credits available for generation');
        return;
      }

      console.log('✅ Credit consumed, starting generation...');
      
      // Step 1: Use the existing floor plan URL (no need to re-upload!)
      console.log('📤 Step 1: Using existing floor plan URL...');
      const floorPlanUrl = floorPlan; // Already a Supabase URL!
      console.log('✅ Using existing URL:', floorPlanUrl);
      
      // VALIDATE URL BEFORE PROCEEDING
      if (!validateSupabaseUrl(floorPlanUrl)) {
        throw new Error(`Invalid floor plan URL: ${floorPlanUrl}`);
      }
      
      setCurrentGenerationStep(GENERATION_STEPS[0]);
      setGenerationProgress(10);
      console.log('🔍 Step 1: STRICT floor plan analysis...');

      // Step 2: Analyze floor plan with retry logic
      const { data: analysisData, error: analysisError } = await withRetry(async () => {
        return await supabase.functions.invoke('analyze-floorplan', {
          body: { imageUrl: floorPlanUrl }
        });
      });

      console.log('🔍 STRICT analysis result:', analysisData);
      
      // FAIL if analysis doesn't work
      if (analysisError || !analysisData.success) {
        console.error('❌ Analysis failed:', analysisError || analysisData?.error);
        throw new Error(analysisData?.error || PRODUCTION_ERRORS.ANALYSIS_FAILED);
      }

      // VALIDATE that we have real floor plan data
      if (!analysisData.analysis || !analysisData.analysis.rooms || analysisData.analysis.rooms.length === 0) {
        console.error('❌ No room data in analysis:', analysisData);
        throw new Error('Floor plan analysis returned no room data - please upload a clear architectural floor plan');
      }

      console.log('✅ Floor plan successfully analyzed:', analysisData.analysis.apartment_type);
      console.log('📋 Detected rooms:', analysisData.analysis.rooms.map((r: any) => `${r.name} (${r.dimensions || 'no dimensions'})`));
      console.log('🔍 Analysis details:', JSON.stringify(analysisData.analysis, null, 2));

      // Step 3: Generate SPECIFIC dollhouse based on floor plan with retry logic
      setCurrentGenerationStep(GENERATION_STEPS[1]);
      setGenerationProgress(30);
      console.log('🏠 Step 2: Generating SPECIFIC dollhouse...');
      console.log('🏠 Passing analysis to dollhouse:', JSON.stringify(analysisData.analysis, null, 2));

      const { data: dollhouseData, error: dollhouseError } = await withRetry(async () => {
        return await supabase.functions.invoke('generate-dollhouse', {
          body: { 
            analysis: analysisData.analysis,
            style: selectedStyle.id,
            generation_id: analysisData.generation_id
          }
        });
      });

      console.log('🏠 Dollhouse response:', dollhouseData);
      console.log('🏠 Dollhouse error:', dollhouseError);

      if (dollhouseError || !dollhouseData.success) {
        console.error('❌ Dollhouse generation failed:', dollhouseError || dollhouseData?.error);
        throw new Error(dollhouseData?.error || PRODUCTION_ERRORS.GENERATION_FAILED);
      }

      console.log('✅ Dollhouse generated successfully:', dollhouseData.imageUrl);

      // Step 4: Generate SPECIFIC virtual tour based on floor plan with retry logic
      setCurrentGenerationStep(GENERATION_STEPS[2]);
      setGenerationProgress(60);
      console.log('🎯 Step 3: Generating SPECIFIC virtual tour...');

      const { data: tourData, error: tourError } = await withRetry(async () => {
        return await supabase.functions.invoke('generate-virtual-tour', {
          body: { 
            analysis: analysisData.analysis,
            style: selectedStyle.id,
            generation_id: analysisData.generation_id
          }
        });
      });

      if (tourError || !tourData.success) {
        console.error('❌ Virtual tour generation failed:', tourError || tourData?.error);
        throw new Error(tourData?.error || PRODUCTION_ERRORS.GENERATION_FAILED);
      }

      console.log('✅ Virtual tour generated successfully:', tourData.viewpoints.length, 'viewpoints');

      // Step 5: Create tour object with cache busting and validation
      setCurrentGenerationStep(GENERATION_STEPS[3]);
      setGenerationProgress(90);

      const cacheBuster = Date.now();
      console.log('🧹 CACHE BUSTER:', cacheBuster);

      // Validate all generated content
      if (!dollhouseData.imageUrl || !validateImageUrl(dollhouseData.imageUrl)) {
        throw new Error('Invalid dollhouse image URL generated');
      }

      if (!tourData.viewpoints || tourData.viewpoints.length === 0) {
        throw new Error('No tour viewpoints were generated');
      }

      // Validate each viewpoint has a valid image URL
      const invalidViewpoints = tourData.viewpoints.filter((vp: any) => 
        !vp.imageUrl || !validateImageUrl(vp.imageUrl)
      );

      if (invalidViewpoints.length > 0) {
        console.warn('⚠️ Some viewpoints have invalid URLs:', invalidViewpoints.length);
      }

      const newTour: Tour = {
        id: `tour_${Date.now()}`,
        dollhouseUrl: dollhouseData.imageUrl + `?bust=${cacheBuster}&gen=${analysisData.generation_id}`,
        rooms: analysisData.analysis.rooms,
        viewpoints: tourData.viewpoints.map((vp: any, index: number) => ({
          ...vp,
          imageUrl: vp.imageUrl + `?bust=${cacheBuster}&gen=${analysisData.generation_id}&vp=${index}`
        })),
        style: selectedStyle.id,
        status: 'completed',
        layoutType: analysisData.analysis.apartment_type,
        analysis: analysisData.analysis
      };

      setTour(newTour);
      setCurrentGenerationStep(GENERATION_STEPS[4]);
      setGenerationProgress(100);
      setCurrentStep(5);

      console.log('🎉 PRODUCTION-QUALITY virtual tour generation completed successfully!');
      console.log('🏠 Tour details:', {
        id: newTour.id,
        layoutType: newTour.layoutType,
        viewpoints: newTour.viewpoints.length,
        style: newTour.style
      });

    } catch (error) {
      console.error('💥 PRODUCTION generation FAILED:', error);
      
      // Production-quality error messages
      let errorMessage = PRODUCTION_ERRORS.UNKNOWN_ERROR;
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = PRODUCTION_ERRORS.TIMEOUT;
        } else if (error.message.includes('network')) {
          errorMessage = PRODUCTION_ERRORS.NETWORK_ERROR;
        } else if (error.message.includes('upload')) {
          errorMessage = PRODUCTION_ERRORS.UPLOAD_FAILED;
        } else if (error.message.includes('analysis')) {
          errorMessage = PRODUCTION_ERRORS.ANALYSIS_FAILED;
        } else if (error.message.includes('generation')) {
          errorMessage = PRODUCTION_ERRORS.GENERATION_FAILED;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Generation Failed', errorMessage, [
        { text: 'Try Again', onPress: () => generateTour() },
        { text: 'Cancel', style: 'cancel' }
      ]);
      
      setCurrentStep(3);
    } finally {
      setLoading(false);
      console.log('🏁 PRODUCTION generation process finished');
    }
  };

  // Navigation functions
  const navigateToViewpoint = useCallback((index: number) => {
    setCurrentViewpointIndex(index);
  }, []);

  const navigateToHotspot = useCallback((hotspot: any) => {
    if (tour?.viewpoints) {
      const targetIndex = tour.viewpoints.findIndex(v => v.id === hotspot.to);
      if (targetIndex !== -1) {
        navigateToViewpoint(targetIndex);
      }
    }
  }, [tour?.viewpoints, navigateToViewpoint]);

  // Download & Share functions
  const downloadTour = async () => {
    if (!tour) return;
    try {
      const { data, error } = await supabase.functions.invoke('create-download-package', {
        body: { tourId: tour.id }
      });
      if (error) throw error;
      Alert.alert(
        'Download Ready',
        'Your virtual tour package is ready!',
        [
          { text: 'Download Now', onPress: () => console.log('Download:', data.downloadUrl) },
          { text: 'Share Link', onPress: () => console.log('Share:', data.shareUrl) }
        ]
      );
    } catch (error) {
      Alert.alert('Download Failed', 'Please try again.');
    }
  };

  const startOver = () => {
    setCurrentStep(1);
    setFloorPlan(null);
    setSelectedStyle(null);
    setTour(null);
    setGenerationProgress(0);
    setCurrentViewpointIndex(0);
    console.log('✅ State reset completed');
  };

  // Render functions
  const renderStep1 = () => (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
          Upload Your Floor Plan
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 }}>
          Get a 360° virtual tour with 3D dollhouse view for just $9.99
        </Text>
        {floorPlan && (
          <Image
            source={{ uri: floorPlan }}
            style={{ width: screenWidth - 40, height: 200, borderRadius: 12, marginBottom: 20 }}
            resizeMode="contain"
          />
        )}
        <Pressable
          onPress={handleCameraRollUpload}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#5A67D8' : '#667EEA',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            width: screenWidth - 40,
            alignItems: 'center',
          })}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
            📄 Upload Floor Plan from Gallery
          </Text>
        </Pressable>
        <View style={{ marginTop: 40, padding: 20, backgroundColor: 'white', borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
            What You'll Get:
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
            • 3D dollhouse cutaway view{'\n'}
            • 360° panoramic room tours{'\n'}
            • Professional download package{'\n'}
            • Shareable virtual tour links
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
          Choose Your Style
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }}>
          Select the design style for your virtual tour
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {DESIGN_STYLES.map((style) => (
            <Pressable
              key={style.id}
              onPress={() => handleStyleSelect(style)}
              style={({ pressed }) => ({
                width: (screenWidth - 60) / 2,
                backgroundColor: pressed ? '#f0f0f0' : 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                alignItems: 'center',
              })}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>
                {style.icon}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
                {style.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                {style.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Ready to Generate
      </Text>
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 30, width: '100%' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Tour Summary:</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
          Style: {selectedStyle?.name} {selectedStyle?.icon}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
          Includes: 3D dollhouse + walkthrough virtual tour
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Generation time: ~3-5 minutes
        </Text>
      </View>
      <Pressable
        onPress={generateTour}
        disabled={loading}
        style={({ pressed }) => ({
          backgroundColor: loading ? '#ccc' : (pressed ? '#D53F8C' : '#E53E3E'),
          paddingVertical: 18,
          paddingHorizontal: 40,
          borderRadius: 12,
          width: '100%',
          alignItems: 'center',
        })}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          Generate Virtual Tour - $9.99
        </Text>
      </Pressable>
    </View>
  );

  const renderStep4 = () => (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }}>
        Generating Your Virtual Tour
      </Text>
      <View style={{ width: '100%', backgroundColor: '#e0e0e0', height: 8, borderRadius: 4, marginBottom: 20 }}>
        <View
          style={{
            width: `${generationProgress}%`,
            backgroundColor: '#667EEA',
            height: '100%',
            borderRadius: 4
          }}
        />
      </View>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
        {currentGenerationStep}
      </Text>
      <ActivityIndicator size="large" color="#667EEA" />
      <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginTop: 20 }}>
        Please don't close the app during generation
      </Text>
    </View>
  );

  const renderStep5 = () => {
    const currentViewpoint = tour?.viewpoints?.[currentViewpointIndex];
    const totalViewpoints = tour?.viewpoints?.length || 0;
    
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
            🎉 Tour Complete!
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }}>
            Your virtual tour is ready to explore and download
          </Text>

          {tour?.dollhouseUrl && (
            <View style={{ marginBottom: 30, width: '100%' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                3D Dollhouse Overview:
              </Text>
              <Image
                source={{ uri: tour.dollhouseUrl }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>
          )}

          {tour?.viewpoints && tour.viewpoints.length > 0 ? (
            <View style={{ width: '100%' }}>
              {/* Real 360° Panorama Viewer */}
              <ThreeSphere
                uri={tour.viewpoints[currentViewpointIndex]?.imageUrl}
                onTap={(yaw) => {
                  // Find hotspot whose yaw is closest within ±30°
                  const currentViewpoint = tour.viewpoints[currentViewpointIndex];
                  if (currentViewpoint?.hotspots) {
                    const hs = currentViewpoint.hotspots.find((h: any) => {
                      let d = Math.abs(((yaw - h.yaw + 540) % 360) - 180);
                      return d < 30;
                    });
                    if (hs && hs.targetRoom !== undefined) {
                      setCurrentViewpointIndex(hs.targetRoom);
                    }
                  }
                }}
              />
              
              {/* Room Navigation */}
              {tour.viewpoints && tour.viewpoints.length > 1 && (
                <View style={styles.roomNavigation}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.roomNavigationContent}
                  >
                    {tour.viewpoints.map((viewpoint: any, index: number) => (
                      <Pressable
                        key={index}
                        onPress={() => setCurrentViewpointIndex(index)}
                        style={[
                          styles.roomButton,
                          currentViewpointIndex === index && styles.roomButtonActive
                        ]}
                      >
                        <Text style={[
                          styles.roomButtonText,
                          currentViewpointIndex === index && styles.roomButtonTextActive
                        ]}>
                          {viewpoint.title || viewpoint.name || `Room ${index + 1}`}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tourPlaceholder}>
              <Text style={{ fontSize: 48 }}>👁️</Text>
              <Text style={styles.placeholderText}>Virtual tour will appear here</Text>
            </View>
          )}

          {/* Action Buttons */}
          <Pressable
            onPress={downloadTour}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#48BB78' : '#68D391',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              marginBottom: 16,
              width: '100%',
              alignItems: 'center',
            })}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              📥 Download Tour Package
            </Text>
          </Pressable>

          <Pressable
            onPress={startOver}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#A0AEC0' : '#CBD5E0',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              width: '100%',
              alignItems: 'center',
            })}
          >
            <Text style={{ color: '#2D3748', fontSize: 18, fontWeight: '600' }}>
              Create Another Tour
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <GenerationGuard showCredits={true}>
      <SafeAreaView style={{ flex: 1 }}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </SafeAreaView>
    </GenerationGuard>
  );
}

// Styles
const styles = StyleSheet.create({
  roomNavigation: {
    marginTop: 16,
  },
  roomNavigationContent: {
    paddingHorizontal: 8,
  },
  roomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  roomButtonActive: {
    backgroundColor: '#667EEA',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  roomButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  roomButtonTextActive: {
    color: 'white',
  },
  instructionsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  instructionsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 4,
  },
  instructionsDescription: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  instructionsBold: {
    fontWeight: '600',
  },
  tourPlaceholder: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
  },
});
