// Production-Ready Overhead Dollhouse Generator
// File: supabase/functions/generate-dollhouse/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Room {
  name: string;
  type: string;
  position: string;
  size: string;
  connections: string[];
  description: string;
}

interface Connection {
  from: string;
  to: string;
  type: string;
  direction?: string;
}

interface FloorPlanAnalysis {
  apartment_type: string;
  rooms: Room[];
  connections: Connection[];
  layout_style: string;
  total_rooms: number;
}

interface DollhouseResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  cached?: boolean;
}

// Main generation function with strong typing
async function generateOverheadDollhouse(
  analysis: FloorPlanAnalysis,
  style: string
): Promise<DollhouseResult> {
  try {
    console.log('🏠 Generating overhead dollhouse view');
    
    // Validate inputs
    const validationError = validateAnalysis(analysis);
    if (validationError) {
      throw new Error(`Invalid analysis: ${validationError}`);
    }
    
    // Check cache first
    const cacheKey = generateCacheKey(analysis, style);
    const cached = await checkCache(cacheKey);
    if (cached) {
      console.log('✅ Returning cached dollhouse');
      return { success: true, imageUrl: cached, cached: true };
    }
    
    // Generate prompt
    const prompt = buildOverheadPrompt(analysis, style);
    console.log('📝 Generated prompt length:', prompt.length);
    
    // Generate image with retry logic
    const imageUrl = await generateImageWithRetry(prompt);
    
    // Cache result
    await cacheResult(cacheKey, imageUrl);
    
    console.log('✅ Dollhouse generated successfully');
    return { success: true, imageUrl };
    
  } catch (error) {
    console.error('💥 Dollhouse generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

// Validate analysis payload
function validateAnalysis(analysis: FloorPlanAnalysis): string | null {
  if (!analysis) return 'Analysis is null or undefined';
  if (!analysis.rooms || analysis.rooms.length === 0) return 'No rooms found in analysis';
  if (!analysis.apartment_type) return 'Missing apartment type';
  
  for (const room of analysis.rooms) {
    if (!room.name || !room.type) return `Invalid room: ${JSON.stringify(room)}`;
    if (!room.position || !room.size) return `Room missing position/size: ${room.name}`;
  }
  
  return null; // Valid
}

// Build detailed overhead prompt
function buildOverheadPrompt(analysis: FloorPlanAnalysis, style: string): string {
  const { rooms, connections, apartment_type, layout_style } = analysis;
  
  const spatialLayout = createSpatialDescription(rooms, connections);
  const roomDetails = createRoomDetails(rooms, style);
  
  return `Create a detailed OVERHEAD BIRD'S EYE VIEW dollhouse of this ${apartment_type} apartment:

LAYOUT REQUIREMENTS:
- Perspective: Looking straight down from above
- Style: ${style} interior design
- Layout: ${layout_style} floor plan
- Total rooms: ${rooms.length}

EXACT ROOM ARRANGEMENT:
${spatialLayout}

ROOM SPECIFICATIONS:
${roomDetails}

VISUAL REQUIREMENTS:
- High-quality 3D architectural visualization
- Overhead bird's eye perspective 
- Realistic room proportions and furniture placement
- Clear wall boundaries and doorway connections
- Professional architectural rendering quality
- Even lighting from above
- ${style} design aesthetic throughout

TECHNICAL SPECS:
- Resolution: 1024x1024 pixels
- Format: Clean, professional dollhouse visualization
- Perspective: Perfect top-down view
- Detail level: High-quality interior design details`;
}

// Create spatial room description
function createSpatialDescription(rooms: Room[], connections: Connection[]): string {
  return rooms.map((room, index) => {
    const roomConnections = connections
      .filter(conn => conn.from === room.type || conn.to === room.type)
      .map(conn => {
        const target = conn.from === room.type ? conn.to : conn.from;
        return `${conn.type} connection to ${target}`;
      });
    
    return `${index + 1}. ${room.name}:
   Position: ${room.position}
   Size: ${room.size} 
   Connections: ${roomConnections.join(', ') || 'standalone'}`;
  }).join('\n');
}

// Create style-specific room details
function createRoomDetails(rooms: Room[], style: string): string {
  const styleGuide = getStyleGuide(style);
  
  return rooms.map(room => {
    const furniture = styleGuide[room.type] || styleGuide.default;
    return `${room.name}: ${furniture}`;
  }).join('\n');
}

// Style-specific furniture definitions
function getStyleGuide(style: string): Record<string, string> {
  const guides: Record<string, Record<string, string>> = {
    modern: {
      living_room: 'sleek sectional sofa, glass coffee table, minimalist TV unit, contemporary lighting',
      kitchen: 'white cabinets, quartz island, stainless appliances, bar seating',
      bedroom: 'platform bed, built-in closets, modern nightstands, clean lines',
      bathroom: 'floating vanity, walk-in shower, modern fixtures, large mirror',
      dining_room: 'rectangular table, contemporary chairs, pendant lighting',
      default: 'modern furniture with clean lines and neutral colors'
    },
    industrial: {
      living_room: 'leather seating, metal coffee table, exposed brick, Edison lighting',
      kitchen: 'dark cabinets, concrete counters, stainless steel, metal stools',
      bedroom: 'metal bed frame, industrial nightstands, exposed elements',
      bathroom: 'concrete vanity, subway tiles, black fixtures, industrial mirror',
      dining_room: 'reclaimed wood table, metal chairs, hanging Edison bulbs',
      default: 'industrial furniture with metal, wood, and exposed elements'
    },
    minimalist: {
      living_room: 'simple sofa, wooden table, minimal decor, clean space',
      kitchen: 'handleless cabinets, stone surfaces, minimal appliances',
      bedroom: 'simple bed, minimal furniture, neutral palette, uncluttered',
      bathroom: 'clean vanity, simple fixtures, minimal accessories',
      dining_room: 'simple table, minimal chairs, unadorned surfaces',
      default: 'minimal furniture with clean lines and neutral colors'
    }
  };
  
  return guides[style.toLowerCase()] || guides.modern;
}

// Generate cache key
function generateCacheKey(analysis: FloorPlanAnalysis, style: string): string {
  const roomTypes = analysis.rooms.map(r => r.type).sort().join('-');
  const hash = btoa(`${analysis.apartment_type}-${roomTypes}-${style}`).slice(0, 16);
  return `dollhouse-${hash}`;
}

// Check cache (implement with your preferred storage)
async function checkCache(key: string): Promise<string | null> {
  // TODO: Implement with Redis, Supabase storage, etc.
  // For now, return null (no cache)
  return null;
}

// Cache result
async function cacheResult(key: string, imageUrl: string): Promise<void> {
  // TODO: Implement caching
  console.log(`📦 Would cache ${key}: ${imageUrl}`);
}

// Image generation with retry logic
async function generateImageWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎨 Generation attempt ${attempt}/${maxRetries}`);
      return await callImageGeneration(prompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Attempt ${attempt} failed:`, errorMessage);
      
      if (attempt === maxRetries) {
        throw new Error(`Image generation failed after ${maxRetries} attempts: ${errorMessage}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Unexpected error in retry logic');
}

// Actual image generation call
async function callImageGeneration(prompt: string): Promise<string> {
  const token = Deno.env.get('REPLICATE_API_TOKEN');
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      input: {
        prompt,
        image_dimensions: "1024x1024",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        num_outputs: 1
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }
  
  const prediction = await response.json();
  
  // Poll with timeout
  const timeoutMs = 120000; // 2 minutes
  const startTime = Date.now();
  let result = prediction;
  
  while (result.status === 'starting' || result.status === 'processing') {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Generation timeout after 2 minutes');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    
    if (!pollResponse.ok) {
      throw new Error(`Polling failed: ${pollResponse.status}`);
    }
    
    result = await pollResponse.json();
  }
  
  if (result.status === 'succeeded' && result.output && result.output[0]) {
    return result.output[0];
  } else {
    throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
  }
}

serve(async (req: Request) => {
  console.log('🏠 STRICT dollhouse generation - MUST match floor plan')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { analysis, style = 'modern', generation_id } = await req.json()
    
    // STRICT validation - we MUST have proper floor plan analysis
    if (!analysis || !analysis.rooms || analysis.rooms.length === 0) {
      throw new Error('No valid floor plan analysis provided - cannot generate dollhouse')
    }
    
    console.log('📝 Generating dollhouse for SPECIFIC layout:', analysis.apartment_type)
    console.log('🎯 Generation ID:', generation_id)
    
    // Generate the dollhouse
    const result = await generateOverheadDollhouse(analysis, style)
    
    if (result.success && result.imageUrl) {
      console.log('✅ Dollhouse generated for specific layout:', result.imageUrl)
      return new Response(JSON.stringify({
        success: true,
        imageUrl: result.imageUrl,
        layout_type: analysis.apartment_type,
        generation_id: generation_id,
        timestamp: Date.now(),
        cached: result.cached || false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      throw new Error(result.error || 'Dollhouse generation failed')
    }
    
  } catch (error) {
    console.error('💥 Dollhouse generation FAILED:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    // NO FALLBACK IMAGES - if we can't generate based on the floor plan, we fail
    return new Response(JSON.stringify({
      success: false,
      error: `Cannot generate dollhouse: ${errorMessage}`,
      message: 'Dollhouse generation must be based on your specific floor plan layout.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 