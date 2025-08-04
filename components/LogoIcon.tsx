import React from 'react';
import { View } from 'react-native';
import SvgUri from 'react-native-svg-uri';

export default function LogoIcon({ size = 128, style, ...props }) {
  return (
    <View style={[{ maxWidth: size, maxHeight: size }, style]} {...props}>
      <SvgUri
        width={size}
        height={size}
        source={require('../assets/icons/AppIcon.svg')}
      />
    </View>
  );
} 