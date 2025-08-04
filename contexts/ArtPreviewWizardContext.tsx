import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface MaskRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArtPreviewWizardState {
  // Step 1: Room Upload
  roomImageUri: string;
  roomUploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  
  // Step 2: Placement Selection
  mask: MaskRect | null;
  isDrawing: boolean;
  
  // Step 3: Artwork Upload
  artworkImageUri: string;
  artworkUploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  fitMode: 'fill' | 'letterbox' | 'crop';
  
  // Step 4: Processing
  processingStep: number;
  progressMessage: string;
  resultUrl?: string;
  
  // Step 5: Results
  beforeUrl: string;
}

interface ArtPreviewWizardContextType {
  state: ArtPreviewWizardState;
  setRoomImage: (uri: string) => void;
  setRoomUploadStatus: (status: ArtPreviewWizardState['roomUploadStatus']) => void;
  setMask: (mask: MaskRect | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setArtworkImage: (uri: string) => void;
  setArtworkUploadStatus: (status: ArtPreviewWizardState['artworkUploadStatus']) => void;
  setFitMode: (mode: ArtPreviewWizardState['fitMode']) => void;
  setProcessingStep: (step: number) => void;
  setProgressMessage: (message: string) => void;
  setResultUrl: (url: string) => void;
  setBeforeUrl: (url: string) => void;
  resetWizard: () => void;
  goToStep: (step: number) => void;
  currentStep: number;
}

const initialState: ArtPreviewWizardState = {
  roomImageUri: '',
  roomUploadStatus: 'idle',
  mask: null,
  isDrawing: false,
  artworkImageUri: '',
  artworkUploadStatus: 'idle',
  fitMode: 'fill',
  processingStep: 1,
  progressMessage: '',
  resultUrl: undefined,
  beforeUrl: '',
};

const ArtPreviewWizardContext = createContext<ArtPreviewWizardContextType | undefined>(undefined);

export const useArtPreviewWizard = () => {
  const context = useContext(ArtPreviewWizardContext);
  if (!context) {
    throw new Error('useArtPreviewWizard must be used within ArtPreviewWizardProvider');
  }
  return context;
};

interface ArtPreviewWizardProviderProps {
  children: ReactNode;
}

export const ArtPreviewWizardProvider: React.FC<ArtPreviewWizardProviderProps> = ({ children }) => {
  const [state, setState] = useState<ArtPreviewWizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);

  const setRoomImage = (uri: string) => {
    setState(prev => ({ ...prev, roomImageUri: uri }));
  };

  const setRoomUploadStatus = (status: ArtPreviewWizardState['roomUploadStatus']) => {
    setState(prev => ({ ...prev, roomUploadStatus: status }));
  };

  const setMask = (mask: MaskRect | null) => {
    setState(prev => ({ ...prev, mask }));
  };

  const setIsDrawing = (drawing: boolean) => {
    setState(prev => ({ ...prev, isDrawing: drawing }));
  };

  const setArtworkImage = (uri: string) => {
    setState(prev => ({ ...prev, artworkImageUri: uri }));
  };

  const setArtworkUploadStatus = (status: ArtPreviewWizardState['artworkUploadStatus']) => {
    setState(prev => ({ ...prev, artworkUploadStatus: status }));
  };

  const setFitMode = (mode: ArtPreviewWizardState['fitMode']) => {
    setState(prev => ({ ...prev, fitMode: mode }));
  };

  const setProcessingStep = (step: number) => {
    setState(prev => ({ ...prev, processingStep: step }));
  };

  const setProgressMessage = (message: string) => {
    setState(prev => ({ ...prev, progressMessage: message }));
  };

  const setResultUrl = (url: string) => {
    setState(prev => ({ ...prev, resultUrl: url }));
  };

  const setBeforeUrl = (url: string) => {
    setState(prev => ({ ...prev, beforeUrl: url }));
  };

  const resetWizard = () => {
    setState(initialState);
    setCurrentStep(1);
  };

  const goToStep = (step: number) => {
    console.log('🔄 Navigating from step', currentStep, 'to step', step);
    setCurrentStep(step);
  };

  const value: ArtPreviewWizardContextType = {
    state,
    setRoomImage,
    setRoomUploadStatus,
    setMask,
    setIsDrawing,
    setArtworkImage,
    setArtworkUploadStatus,
    setFitMode,
    setProcessingStep,
    setProgressMessage,
    setResultUrl,
    setBeforeUrl,
    resetWizard,
    goToStep,
    currentStep,
  };

  return (
    <ArtPreviewWizardContext.Provider value={value}>
      {children}
    </ArtPreviewWizardContext.Provider>
  );
}; 