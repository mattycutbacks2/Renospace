import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

interface MaskCreatorProps {
  imageWidth: number;
  imageHeight: number;
  onMaskCreated: (uri: string) => void;
}

const MaskCreator: React.FC<MaskCreatorProps> = ({ 
  imageWidth, 
  imageHeight, 
  onMaskCreated 
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  const captureMask = async () => {
    try {
      console.log('📸 Capturing wall mask as PNG...');
      console.log('📏 Dimensions:', { width: imageWidth, height: imageHeight });
      
      const uri = await viewShotRef.current?.capture();
      
      if (uri) {
        console.log('✅ Wall mask captured:', uri);
        onMaskCreated(uri);
      } else {
        console.error('❌ Mask capture returned no URI');
      }
    } catch (error) {
      console.error('❌ Mask capture failed:', error);
    }
  };

  useEffect(() => {
    // Capture the mask after component mounts
    setTimeout(captureMask, 100);
  }, [imageWidth, imageHeight]);

  return (
    <View style={{ position: 'absolute', left: -9999, top: -9999 }}> {/* Hidden off-screen */}
      <ViewShot 
        ref={viewShotRef}
        options={{ 
          format: 'png', 
          quality: 1.0,
          width: imageWidth,
          height: imageHeight,
        }}
      >
        <View style={{ 
          width: imageWidth, 
          height: imageHeight, 
          backgroundColor: 'black' // Black background (keep everything)
        }}>
          <Svg width={imageWidth} height={imageHeight}>
            {/* White areas for walls (change these) */}
            {/* Upper wall area */}
            <Rect
              x={imageWidth * 0.05}
              y={0}
              width={imageWidth * 0.9}
              height={imageHeight * 0.49}
              fill="white"
            />
            {/* Left wall */}
            <Rect
              x={0}
              y={0}
              width={imageWidth * 0.29}
              height={imageHeight * 0.68}
              fill="white"
            />
            {/* Right wall */}
            <Rect
              x={imageWidth * 0.71}
              y={0}
              width={imageWidth * 0.29}
              height={imageHeight * 0.68}
              fill="white"
            />
          </Svg>
        </View>
      </ViewShot>
    </View>
  );
};

export default MaskCreator; 