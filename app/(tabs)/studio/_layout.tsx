import { Stack } from 'expo-router';

export default function StudioLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="artpreview" />
      <Stack.Screen name="colorpop" />
      <Stack.Screen name="floorplan360" />
      <Stack.Screen name="gardenrender" />
      <Stack.Screen name="objectswap" />
      <Stack.Screen name="stylesync" />
      <Stack.Screen name="canigetahottub" />
      <Stack.Screen name="virtualstager" />
      <Stack.Screen 
        name="colortouch" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen
        name="result"
        options={{
          headerShown: true,
          title: 'Result',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
} 