// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

console.log("Hello from Functions!")

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    console.log('🚀 Upload-image function called');
    const { image, filename, contentType } = await req.json()
    console.log('📦 Received:', { filename, contentType, imageLength: image?.length || 0 });
    
    if (!image || !filename || !contentType) {
      console.error('❌ Missing required fields:', { hasImage: !!image, hasFilename: !!filename, hasContentType: !!contentType });
      return new Response(JSON.stringify({ error: 'Missing image, filename, or contentType' }), { status: 400 })
    }
    
    // image should be base64 string, no data URL prefix
    console.log('🔄 Converting base64 to buffer...');
    const buffer = Uint8Array.from(atob(image), (c) => c.charCodeAt(0))
    console.log('📊 Buffer size:', buffer.length, 'bytes');

    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(SUPA_URL, SUPA_SERVICE_KEY)

    console.log('📤 Uploading to Supabase storage...');
    const { data, error } = await supabase
      .storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType,
        upsert: false,
      })

    if (error) {
      console.error('🔴 Edge Upload Error', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    console.log('✅ Upload successful:', data.path);
    return new Response(JSON.stringify({ path: data.path }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (err: any) {
    console.error('🔴 Edge Function Exception', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/upload-image' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
