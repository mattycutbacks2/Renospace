import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 360 Room function started')
    
    const body = await req.json()
    console.log('📦 Request body:', body)
    
    const { roomType, style } = body
    console.log('🏠 Room type:', roomType)
    console.log('🎨 Style:', style)

    // Check if REPLICATE_API_TOKEN exists
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN')
    console.log('🔑 Token exists:', !!replicateToken)
    
    if (!replicateToken) {
      throw new Error('REPLICATE_API_TOKEN not configured')
    }

    // For now, return a dummy response to test the pipeline
    console.log('✅ Returning dummy response for testing')
    
    return new Response(JSON.stringify({ 
      imageUrl: `https://replicate.delivery/pbxt/dummy-360-${roomType}-${style}.jpg`,
      debug: `Function is working, returning dummy 360° image for ${roomType} in ${style} style`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('🚨 Function error:', error.message)
    console.error('🚨 Full error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: "Function failed - check logs"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 