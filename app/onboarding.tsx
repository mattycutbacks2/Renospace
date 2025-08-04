import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFlow } from '../components/FlowManager';
import { OnboardingHeader } from '../components/OnboardingHeader';
import { saveOnboardingResponses } from '../utils/onboardingStorage';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

// Types for responses
export type OnboardingResponses = {
  roomType?: string;
  styleVibe?: string[];
  firstFeeling?: string;
  designExperience?: string;
};

const ONBOARDING_STEPS = [
  {
    key: 'roomType',
    question: 'What room are you redesigning?',
    subtitle: 'helps us tailor styles & assets',
    type: 'single',
    options: [
      { key: 'living', label: '🛋️ Living Room' },
      { key: 'kitchen', label: '🍴 Kitchen' },
      { key: 'bedroom', label: '🛏️ Bedroom' },
      { key: 'bathroom', label: '🛁 Bathroom' },
      { key: 'outdoor', label: '🌳 Outdoor Space' },
    ],
  },
  {
    key: 'styleVibe',
    question: 'Pick your style vibe',
    subtitle: 'swipe to explore real-room photos; pick 1–3',
    type: 'visual',
    options: [
      { key: 'minimalist', label: 'Minimalist', asset: require('../assets/styles/minimalist.png') },
      { key: 'midcentury', label: 'Mid-Century Modern', asset: require('../assets/styles/midcentury.png') },
      { key: 'scandinavian', label: 'Scandinavian', asset: require('../assets/styles/scandinavian.png') },
      { key: 'bohemian', label: 'Bohemian', asset: require('../assets/styles/bohemian.png') },
      { key: 'industrial', label: 'Industrial', asset: require('../assets/styles/industrial.png') },
      { key: 'coastal', label: 'Coastal', asset: require('../assets/styles/coastal.png') },
      { key: 'moderntraditional', label: 'Modern Traditional', asset: require('../assets/styles/moderntraditional.png') },
      { key: 'eclectic', label: 'Eclectic', asset: require('../assets/styles/eclectic.png') },
    ],
  },
  {
    key: 'firstFeeling',
    question: 'When you step into your new space, you want to feel…',
    subtitle: 'this first impression guides our entire design; pick one',
    type: 'single',
    options: [
      { key: 'calm', label: '🧘 Calm & Serene', tagline: 'A breath of fresh air' },
      { key: 'energized', label: '⚡ Vibrant & Energized', tagline: 'Ready to seize the day' },
      { key: 'creative', label: '✨ Creative & Inspired', tagline: 'Ideas spark everywhere' },
      { key: 'cozy', label: '🛋️ Cozy & Comforting', tagline: 'Wrapped in warmth' },
      { key: 'sophisticated', label: '💎 Sophisticated & Elegant', tagline: 'Timeless style' },
      { key: 'relaxed', label: '🌙 Relaxed & Peaceful', tagline: 'Unwind effortlessly' },
    ],
  },
  {
    key: 'designExperience',
    question: 'How would you rate your design skills?',
    subtitle: 'so we can customize tips & resources; pick one',
    type: 'single',
    options: [
      { key: 'beginner', label: '🌱 Beginner' },
      { key: 'intermediate', label: '🚀 Intermediate' },
      { key: 'advanced', label: '⭐ Advanced' },
      { key: 'expert', label: '🏆 Expert' },
    ],
  },
];

function SingleChoiceStep({ 
  question, 
  subtitle, 
  options, 
  value, 
  onChange, 
  onNext, 
  onBack, 
  step, 
  total 
}: {
  question: string;
  subtitle?: string;
  options: Array<{ key: string; label: string; tagline?: string }>;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <OnboardingHeader title={question} step={step} total={total} onBack={onBack} />
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      <FlatList
        data={options}
        keyExtractor={item => item.key}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          paddingBottom: 120 
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const selected = value === item.key;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.optionCard,
                selected && styles.optionCardSelected,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => onChange(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[
                styles.optionLabel, 
                selected && styles.optionLabelSelected
              ]}>
                {item.label}
              </Text>
              {item.tagline && (
                <Text style={[
                  styles.optionTagline,
                  selected && styles.optionTaglineSelected
                ]}>
                  {item.tagline}
                </Text>
              )}
            </Pressable>
          );
        }}
      />
      <SafeAreaView style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.navBtn, 
            (!value || value === '') && styles.navBtnDisabled
          ]}
          onPress={onNext}
          disabled={!value}
        >
          <Text style={styles.navBtnText}>Next</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function VisualStyleStep({ 
  question, 
  subtitle, 
  options, 
  value, 
  onChange, 
  onNext, 
  onBack, 
  step, 
  total 
}: {
  question: string;
  subtitle?: string;
  options: Array<{ key: string; label: string; asset: any }>;
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}) {
  const [selected, setSelected] = useState<string[]>(value || []);
  const { width } = Dimensions.get('window');
  const cardSize = (width - 48 - 16) / 2; // 16px gap between columns

  const toggleStyle = (key: string) => {
    let updated;
    if (selected.includes(key)) {
      updated = selected.filter((s) => s !== key);
    } else {
      updated = [...selected, key];
    }
    setSelected(updated);
    onChange(updated);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <OnboardingHeader title={question} step={step} total={total} onBack={onBack} />
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      <FlatList
        data={options}
        numColumns={2}
        keyExtractor={item => item.key}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          paddingBottom: 120 
        }}
        columnWrapperStyle={{ 
          justifyContent: 'space-between', 
          marginBottom: 16 
        }}
        renderItem={({ item }) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [
              styles.styleCard,
              selected.includes(item.key) && styles.styleCardSelected,
              { 
                width: cardSize, 
                height: cardSize,
                transform: [{ scale: pressed ? 0.98 : selected.includes(item.key) ? 1.02 : 1 }] 
              }
            ]}
            onPress={() => toggleStyle(item.key)}
          >
            <Image 
              source={item.asset} 
              style={styles.styleImage} 
            />
            <Text style={[
              styles.styleLabel,
              selected.includes(item.key) && styles.styleLabelSelected
            ]}>
              {item.label}
            </Text>
            {selected.includes(item.key) && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        )}
      />
      <SafeAreaView style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.navBtn, 
            (selected.length === 0) && styles.navBtnDisabled
          ]}
          onPress={onNext}
          disabled={selected.length === 0}
        >
          <Text style={styles.navBtnText}>Next</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function MultipleChoiceStep({ 
  question, 
  subtitle, 
  options, 
  value, 
  onChange, 
  onNext, 
  onBack, 
  step, 
  total 
}: {
  question: string;
  subtitle?: string;
  options: Array<{ key: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}) {
  const [selected, setSelected] = useState<string[]>(value || []);

  const toggleOption = (key: string) => {
    let updated;
    if (selected.includes(key)) {
      updated = selected.filter((s) => s !== key);
    } else {
      updated = [...selected, key];
    }
    setSelected(updated);
    onChange(updated);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <OnboardingHeader title={question} step={step} total={total} onBack={onBack} />
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      <FlatList
        data={options}
        keyExtractor={item => item.key}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          paddingBottom: 120 
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.key);
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => toggleOption(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[
                styles.optionLabel, 
                isSelected && styles.optionLabelSelected
              ]}>
                {item.label}
              </Text>
              {isSelected && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
      <SafeAreaView style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.navBtn, 
            (selected.length === 0) && styles.navBtnDisabled
          ]}
          onPress={onNext}
          disabled={selected.length === 0}
        >
          <Text style={styles.navBtnText}>Next</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const { markOnboardingDone } = useFlow();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<OnboardingResponses>({});

  const handleNext = async () => {
    console.log('Onboarding handleNext: step =', step, 'total steps =', ONBOARDING_STEPS.length);
    if (step === ONBOARDING_STEPS.length - 1) {
      console.log('Onboarding: Completing onboarding with responses:', responses);
      await saveOnboardingResponses(responses);
      console.log('Onboarding: Saved responses, calling markOnboardingDone()');
      markOnboardingDone(); // Call the FlowManager's completion handler
      console.log('Onboarding: markOnboardingDone() called, flow should redirect');
      onComplete?.();
      // The flow system will automatically redirect to the next step
    } else {
      console.log('Onboarding: Moving to next step');
      setStep(s => Math.min(ONBOARDING_STEPS.length - 1, s + 1));
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(0, s - 1));
  };

  const StepComponent = useMemo(() => {
    const currentStep = ONBOARDING_STEPS[step];
    
    if (currentStep.type === 'visual') {
      return (
        <VisualStyleStep
          question={currentStep.question}
          subtitle={currentStep.subtitle}
          options={currentStep.options as Array<{ key: string; label: string; asset: any }>}
          value={(responses as any)[currentStep.key] ?? []}
          onChange={v => setResponses(r => ({ ...r, [currentStep.key]: v }))}
          onNext={handleNext}
          onBack={handleBack}
          step={step}
          total={ONBOARDING_STEPS.length}
        />
      );
    }
    
    if (currentStep.type === 'multiple') {
      return (
        <MultipleChoiceStep
          question={currentStep.question}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          value={(responses as any)[currentStep.key] ?? []}
          onChange={v => setResponses(r => ({ ...r, [currentStep.key]: v }))}
          onNext={handleNext}
          onBack={handleBack}
          step={step}
          total={ONBOARDING_STEPS.length}
        />
      );
    }
    
    return (
      <SingleChoiceStep
        question={currentStep.question}
        subtitle={currentStep.subtitle}
        options={currentStep.options}
        value={(responses as any)[currentStep.key] ?? ''}
        onChange={v => setResponses(r => ({ ...r, [currentStep.key]: v }))}
        onNext={handleNext}
        onBack={handleBack}
        step={step}
        total={ONBOARDING_STEPS.length}
      />
    );
  }, [step, responses]);

  return <View style={{ flex: 1 }}>{StepComponent}</View>;
}

const styles = StyleSheet.create({
  subtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionCard: {
    backgroundColor: '#232323',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 60,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optionTagline: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  optionTaglineSelected: {
    color: '#FFFFFF',
  },
  navBtn: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 100,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minWidth: 120,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  navBtnDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  checkmarkText: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  styleCard: {
    backgroundColor: '#232323',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  styleCardSelected: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  styleImage: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  styleLabel: {
    padding: 10,
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  styleLabelSelected: {
    color: '#FFFFFF',
  },
});

 