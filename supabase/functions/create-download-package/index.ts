import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tourId } = await req.json()

    // Create download URLs and sharing links
    const downloadUrl = `https://your-domain.com/downloads/${tourId}.zip`
    const shareUrl = `https://your-domain.com/tours/${tourId}`

    return new Response(JSON.stringify({ 
      downloadUrl,
      shareUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 