import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useArtPreviewWizard } from '../contexts/ArtPreviewWizardContext';
import { ArtworkUploadStep } from './ArtPreviewSteps/ArtworkUploadStep';
import { PlacementSelectionStep } from './ArtPreviewSteps/PlacementSelectionStep';
import { ProcessingStep } from './ArtPreviewSteps/ProcessingStep';
import { ResultsStep } from './ArtPreviewSteps/ResultsStep';
import { RoomUploadStep } from './ArtPreviewSteps/RoomUploadStep';
import { ArtPreviewWizardNavigation } from './ArtPreviewWizardNavigation';

export const ArtPreviewWizard: React.FC = () => {
  const { currentStep, goToStep } = useArtPreviewWizard();

  const handleStepPress = (step: number) => {
    // Only allow navigation to completed steps
    if (step < currentStep) {
      goToStep(step);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <RoomUploadStep />;
      case 2:
        return <PlacementSelectionStep />;
      case 3:
        return <ArtworkUploadStep />;
      case 4:
        return <ProcessingStep />;
      case 5:
        return <ResultsStep />;
      default:
        return <RoomUploadStep />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <ArtPreviewWizardNavigation
        currentStep={currentStep}
        onStepPress={handleStepPress}
        canGoBack={currentStep > 1}
      />
      
      {/* Current Step Content */}
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
}); 