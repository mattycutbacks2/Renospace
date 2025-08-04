import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🎯 STRICT virtual tour generation - MUST match floor plan')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN')
    if (!replicateToken) {
      throw new Error('Missing REPLICATE_API_TOKEN environment variable')
    }

    const { analysis, style = 'modern', generation_id } = await req.json()
    
    // STRICT validation
    if (!analysis || !analysis.rooms || analysis.rooms.length === 0) {
      throw new Error('No valid floor plan analysis provided - cannot generate tour')
    }

    console.log('📝 Generating tour for SPECIFIC layout:', analysis.apartment_type)
    console.log('🎯 Generation ID:', generation_id)

    // Create strategic viewpoints based on the ACTUAL floor plan
    const viewpoints = createFloorPlanBasedViewpoints(analysis, style)
    console.log('📍 Creating viewpoints for actual layout:', viewpoints.map(v => v.id))

    // Generate all viewpoints with STRICT prompts
    const viewpointPromises = viewpoints.map(viewpoint => 
      generateSpecificViewpoint(viewpoint, replicateToken, generation_id)
    )

    const results = await Promise.allSettled(viewpointPromises)
    
    // Process results - NO fallbacks for failed generations
    const generatedViewpoints = []
    const failedViewpoints = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        generatedViewpoints.push({
          ...viewpoints[index],
          imageUrl: result.value + `?bust=${Date.now()}&gen=${generation_id}&vp=${index}`, // FORCE CACHE BUST
          status: 'success',
          generation_id: generation_id
        })
      } else {
        console.error(`❌ Viewpoint ${viewpoints[index].id} failed:`, result.reason)
        failedViewpoints.push(viewpoints[index].id)
      }
    })

    // If too many viewpoints failed, we fail the whole tour
    if (generatedViewpoints.length === 0) {
      throw new Error('All viewpoint generations failed - cannot create tour')
    }

    if (failedViewpoints.length > 0) {
      console.warn('⚠️ Some viewpoints failed:', failedViewpoints)
    }

    console.log('✅ Virtual tour generated with', generatedViewpoints.length, 'viewpoints matching floor plan')

    return new Response(JSON.stringify({ 
      success: true, 
      viewpoints: generatedViewpoints,
      totalViewpoints: generatedViewpoints.length,
      failedViewpoints: failedViewpoints,
      layout_type: analysis.apartment_type,
      generation_id: generation_id,
      timestamp: Date.now()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Virtual tour generation FAILED:', error)
    
    // NO FALLBACK TOUR - if we can't generate based on floor plan, we fail
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Cannot generate virtual tour: ${error.message}`,
      message: 'Virtual tour generation must be based on your specific floor plan layout.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function createFloorPlanBasedViewpoints(analysis: any, style: string) {
  const rooms = analysis.rooms || []
  const entranceLocation = analysis.entrance_location || 'main entrance'
  const spatialLayout = analysis.spatial_layout || ''
  
  const viewpoints = []
  
  // Find specific room types from the floor plan
  const entranceRoom = rooms.find(r => 
    r.room_type === 'entrance' || 
    r.name.toLowerCase().includes('foyer') || 
    r.name.toLowerCase().includes('entrance')
  )
  
  const livingRoom = rooms.find(r => 
    r.room_type === 'living' || 
    r.name.toLowerCase().includes('living')
  )
  
  const diningRoom = rooms.find(r => 
    r.room_type === 'dining' || 
    r.name.toLowerCase().includes('dining')
  )
  
  const masterBedroom = rooms.find(r => 
    r.name.toLowerCase().includes('master') ||
    (r.room_type === 'bedroom' && r.dimensions && parseDimensions(r.dimensions) > 150)
  )
  
  const terrace = rooms.find(r => 
    r.room_type === 'terrace' || 
    r.name.toLowerCase().includes('terrace') || 
    r.name.toLowerCase().includes('balcony')
  )

  // 1. Entrance viewpoint (if exists) - EXACT positioning
  if (entranceRoom) {
    const entranceConnections = entranceRoom.connects_to || []
    const nextRooms = entranceConnections.length > 0 ? `showing direct access to ${entranceConnections.join(' and ')}` : 'showing main apartment areas'
    
    viewpoints.push({
      id: 'entrance',
      title: entranceRoom.name,
      description: `${entranceRoom.dimensions || 'Entry area'} - ${entranceRoom.location || 'main entrance'}`,
      prompt: `360 degree panoramic interior view from ${entranceRoom.name} ${entranceRoom.dimensions ? `measuring ${entranceRoom.dimensions}` : ''} in ${style} apartment, positioned at ${entranceRoom.location || 'entrance'}, ${nextRooms}, architectural interior photography showing ${style} design elements, equirectangular projection, welcoming entrance with clear view toward main living areas`,
      hotspots: generateHotspotsFromConnections(entranceRoom, rooms)
    })
  }

  // 2. Living room viewpoint (priority room) - EXACT positioning
  if (livingRoom) {
    const livingConnections = livingRoom.connects_to || []
    const adjacentAreas = livingConnections.length > 0 ? `with views toward ${livingConnections.join(', ')}` : ''
    const spatialContext = `positioned in ${livingRoom.location || 'main area'} of the apartment`
    
    viewpoints.push({
      id: 'living_area',
      title: livingRoom.name,
      description: `${livingRoom.dimensions || 'Main living space'} - ${livingRoom.location || 'central area'}`,
      prompt: `360 degree panoramic interior view of spacious ${livingRoom.name} ${livingRoom.dimensions ? `measuring ${livingRoom.dimensions}` : ''} in ${style} apartment, ${spatialContext}, ${adjacentAreas}, ${style} furniture and decor, large windows and natural lighting, equirectangular projection, premium residential interior photography showing comfortable seating area and modern amenities`,
      hotspots: generateHotspotsFromConnections(livingRoom, rooms)
    })
  }

  // 3. Dining area (if separate from living) - EXACT spatial relationship
  if (diningRoom && diningRoom !== livingRoom) {
    const diningConnections = diningRoom.connects_to || []
    const adjacentSpaces = diningConnections.length > 0 ? `adjacent to ${diningConnections.join(' and ')}` : 'central dining space'
    
    viewpoints.push({
      id: 'dining_area',
      title: diningRoom.name,
      description: `${diningRoom.dimensions || 'Dining space'} - ${diningRoom.location || 'dining area'}`,
      prompt: `360 degree panoramic interior view of elegant ${diningRoom.name} ${diningRoom.dimensions ? `measuring ${diningRoom.dimensions}` : ''} in ${style} apartment, positioned in ${diningRoom.location || 'central area'}, ${adjacentSpaces}, dining table and chairs with ${style} design, equirectangular projection, sophisticated dining environment with proper spatial flow to connected areas`,
      hotspots: generateHotspotsFromConnections(diningRoom, rooms)
    })
  }

  // 4. Master bedroom - EXACT positioning and size
  if (masterBedroom) {
    const bedroomConnections = masterBedroom.connects_to || []
    const privateArea = `located in ${masterBedroom.location || 'private wing'} of the apartment`
    const adjacentSpaces = bedroomConnections.length > 0 ? `with access to ${bedroomConnections.join(' and ')}` : ''
    
    viewpoints.push({
      id: 'master_bedroom',
      title: masterBedroom.name,
      description: `${masterBedroom.dimensions || 'Primary bedroom'} - ${masterBedroom.location || 'private area'}`,
      prompt: `360 degree panoramic interior view of spacious ${masterBedroom.name} ${masterBedroom.dimensions ? `measuring ${masterBedroom.dimensions}` : ''} in ${style} apartment, ${privateArea}, ${adjacentSpaces}, ${style} bedroom furniture including bed, nightstands, and storage, natural lighting from windows, equirectangular projection, luxurious private bedroom space with comfortable ambiance`,
      hotspots: generateHotspotsFromConnections(masterBedroom, rooms)
    })
  }

  // 5. Terrace/outdoor space (if exists) - EXACT connection to interior
  if (terrace) {
    const terraceConnections = rooms.filter(r => r.connects_to && r.connects_to.some(c => c.toLowerCase().includes('terrace')))
    const interiorConnection = terraceConnections.length > 0 ? `connected to ${terraceConnections[0].name}` : 'accessible from main living areas'
    
    viewpoints.push({
      id: 'terrace',
      title: 'Terrace',
      description: `${analysis.special_features?.find(f => f.includes('21\'')) || 'Outdoor space'} - exterior area`,
      prompt: `360 degree panoramic view of spacious apartment terrace ${analysis.special_features?.find(f => f.includes('21\'')) || ''}, ${interiorConnection}, outdoor furniture and plants, view back toward apartment interior, ${style} outdoor design elements, natural daylight, equirectangular projection, premium outdoor living space with clear connection to indoor areas`,
      hotspots: terraceConnections.length > 0 ? [{ 
        to: getViewpointIdFromRoom(terraceConnections[0]), 
        position: { yaw: 180, pitch: 0 }, 
        label: `Back to ${terraceConnections[0].name}` 
      }] : []
    })
  }

  return viewpoints
}

function generateHotspotsFromConnections(room: any, allRooms: any[]) {
  const hotspots = []
  
  if (room.connects_to && Array.isArray(room.connects_to)) {
    room.connects_to.forEach((connectedRoomName: string, index: number) => {
      const connectedRoom = allRooms.find(r => 
        r.name.toLowerCase().includes(connectedRoomName.toLowerCase()) ||
        connectedRoomName.toLowerCase().includes(r.name.toLowerCase())
      )
      
      if (connectedRoom) {
        // Calculate position based on room connections and typical layouts
        const positions = [
          { yaw: 0, pitch: 0 },    // Straight ahead
          { yaw: 90, pitch: 0 },   // Right
          { yaw: 180, pitch: 0 },  // Behind
          { yaw: 270, pitch: 0 }   // Left
        ]
        
        hotspots.push({
          to: getViewpointIdFromRoom(connectedRoom),
          position: positions[index % positions.length],
          label: connectedRoom.name
        })
      }
    })
  }
  
  return hotspots
}

function getViewpointIdFromRoom(room: any): string {
  const name = room.name.toLowerCase()
  if (name.includes('living')) return 'living_area'
  if (name.includes('dining')) return 'dining_area'
  if (name.includes('master')) return 'master_bedroom'
  if (name.includes('foyer') || name.includes('entrance')) return 'entrance'
  if (name.includes('terrace') || name.includes('balcony')) return 'terrace'
  return 'living_area' // Default fallback
}

function parseDimensions(dimensions: string): number {
  // Extract square footage from dimensions like "12'10" x 17'9""
  const matches = dimensions.match(/(\d+)'?(\d*)"?\s*x\s*(\d+)'?(\d*)"?/)
  if (matches) {
    const width = parseInt(matches[1]) + (parseInt(matches[2] || '0') / 12)
    const length = parseInt(matches[3]) + (parseInt(matches[4] || '0') / 12)
    return width * length
  }
  return 100 // Default size
}

async function generateSpecificViewpoint(viewpoint: any, token: string, generationId: string) {
  console.log(`🎨 Generating specific viewpoint: ${viewpoint.id} for ${generationId}`)
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-schnell',
      input: {
        prompt: viewpoint.prompt,
        width: 1200,
        height: 600,
        num_inference_steps: 4,
        guidance_scale: 3.5
      }
    })
  })

  const prediction = await response.json()
  
  // Poll for completion
  let result = prediction
  const maxAttempts = 15
  let attempts = 0

  while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    
    result = await pollResponse.json()
    attempts++
  }

  if (result.status === 'succeeded' && result.output) {
    return Array.isArray(result.output) ? result.output[0] : result.output
  }

  throw new Error(`Viewpoint generation failed: ${result.error || 'Unknown error'}`)
} 