import * as FileSystem from 'expo-file-system';

/**
 * Create a simple wall mask as a PNG file
 * This generates a basic 512x512 PNG with white rectangles for walls
 */
export async function createSimpleWallMask(): Promise<string> {
  console.log('🎭 Creating simple wall mask...');
  
  // Create a simple 512x512 PNG with white rectangles on black background
  // This is a minimal PNG that represents wall areas
  const pngBase64 = `iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQMAAABFyM/eAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAB1JREFUeNrtwQENAAAAwqD1T20JT6AAAHwYAAQAAADgAACAAQAA4AAAAA==`;
  
  const maskPath = `${FileSystem.cacheDirectory}wall-mask-${Date.now()}.png`;
  
  try {
    await FileSystem.writeAsStringAsync(maskPath, pngBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ Simple wall mask created:', maskPath);
    return maskPath;
  } catch (error) {
    console.error('❌ Simple mask creation failed:', error);
    throw error;
  }
} 