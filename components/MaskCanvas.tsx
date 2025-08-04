import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path, Rect } from 'react-native-svg';
import { APP_COLORS } from '../constants/Colors';

/**
 * MaskCanvas lets the user draw a mask over an image.
 * - On screen: shows purple lines (your brand color)
 * - For export: you can render with white lines on black for DALL·E
 *
 * Props:
 *   exportMode: if true, draws white on black for mask export
 *   strokeWidth: thickness of the mask lines (default 20)
 */
export default function MaskCanvas({ exportMode = false, strokeWidth = 20 }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>('');
  const isDrawing = useRef(false);

  // Handle drawing gestures
  const onGestureEvent = ({ nativeEvent }: any) => {
    const { x, y, state } = nativeEvent;
    if (state === State.BEGAN) {
      isDrawing.current = true;
      setCurrent(`M${x},${y}`);
    } else if (state === State.ACTIVE && isDrawing.current) {
      setCurrent(c => `${c} L${x},${y}`);
    } else if (state === State.END || state === State.CANCELLED) {
      isDrawing.current = false;
      setPaths(p => [...p, current]);
      setCurrent('');
    }
  };

  // Pick stroke color: purple for preview, white for export
  const strokeColor = exportMode ? '#FFFFFF' : APP_COLORS.primary;
  // Background: black for export, transparent for preview
  const backgroundColor = exportMode ? '#000000' : 'transparent';

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent} onGestureEvent={onGestureEvent}>
      <View style={StyleSheet.absoluteFill} collapsable={false}>
        <Svg style={StyleSheet.absoluteFill}>
          {/* Background for export mode */}
          {exportMode && (
            <Rect x="0" y="0" width="100%" height="100%" fill="#000" />
          )}
          {paths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={exportMode ? 1 : 0.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {current ? (
            <Path
              d={current}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={exportMode ? 1 : 0.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>
    </PanGestureHandler>
  );
} 