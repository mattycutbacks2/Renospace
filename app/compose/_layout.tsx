import { Stack } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';
import { useTheme } from '../../theme';

interface ComposeContextType {
  roomType: string;
  setRoomType: (type: string) => void;
  style: string;
  setStyle: (style: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

export function useCompose() {
  const context = useContext(ComposeContext);
  if (!context) {
    throw new Error('useCompose must be used within a ComposeProvider');
  }
  return context;
}

export default function ComposeLayout() {
  const theme = useTheme();
  const [roomType, setRoomType] = useState('');
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ComposeContext.Provider value={{
      roomType,
      setRoomType,
      style,
      setStyle,
      notes,
      setNotes,
    }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="room-type" />
        <Stack.Screen name="style-preference" />
        <Stack.Screen name="notes" />
      </Stack>
    </ComposeContext.Provider>
  );
} 