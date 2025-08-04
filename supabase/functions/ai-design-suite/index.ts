import { createClient } from "@supabase/supabase-js";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Create admin client with service role key for reliable file access
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const REPLICATE_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

if (!supabaseUrl || !serviceRoleKey || !REPLICATE_TOKEN) {
  throw new Error(`Missing environment variables: ${!supabaseUrl ? 'SUPABASE_URL ' : ''}${!serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY ' : ''}${!REPLICATE_TOKEN ? 'REPLICATE_API_TOKEN' : ''}`);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Convert hex to RGB for precise color control
function hexToRGB(hex: string) {
  const m = hex.replace("#","").match(/.{2}/g)!;
  const [r,g,b] = m.map(x => parseInt(x,16));
  return `${r},${g},${b}`;
}

// Helper function to poll Replicate predictions
async function pollPrediction(predictionId: string, maxAttempts: number = 60): Promise<any> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
    
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Token ${REPLICATE_TOKEN}` }
    });
    
    if (!poll.ok) {
      throw new Error(`Poll failed: ${poll.status}`);
    }
    
    const prediction = await poll.json();
    console.log(`📊 Poll attempt ${attempts}/${maxAttempts}:`, prediction.status);
    
    if (prediction.status === "succeeded") {
      return prediction;
    }
    
    if (prediction.status === "failed") {
      throw new Error("Prediction failed: " + JSON.stringify(prediction.error || prediction));
    }
  }
  
  throw new Error(`Prediction timed out after ${maxAttempts} seconds`);
}

serve(async (req: Request) => {
  try {
    console.log('🚀 AI Design Suite function called');
    
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    // Add basic validation and debugging
    console.log('🔍 Environment check:', {
      hasReplicateToken: !!Deno.env.get("REPLICATE_API_TOKEN"),
      hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL")
    });
    
    const { imagePath, tool, params } = await req.json();
    console.log('📥 Request data:', { tool, params, imagePath });
    
    if (!imagePath || !tool || !params) {
      throw new Error('Missing required parameters: imagePath, tool, or params');
    }
    
    if (tool === 'ColorTouch') {
      console.log('🎨 Starting ColorTouch processing...');
      
      // 1) Build a public URL for Replicate
      console.log('🔗 Step 1: Building public URL...');
      const { data: urlData } = supabaseAdmin
        .storage
        .from("uploads")
        .getPublicUrl(imagePath);
      
      const imageUrl = urlData.publicUrl;
      console.log("✅ Public URL generated:", imageUrl);
      
      // Verify it's a valid HTTP URL
      if (!imageUrl.startsWith('http')) {
        throw new Error(`Invalid public URL: ${imageUrl}`);
      }
      
      // 2) Step 1: Run segmentation to get masks
      console.log('🎭 Step 2: Running segmentation...');
      console.log('🔗 Sending image URL to segmentation:', imageUrl);
      
      const segResp = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "f4cbdd8c8ce5deac41ae87b9c77e2f950c08edfb1ca77fe763057d84fd4608fd",
          input: {
            image: imageUrl,
            text_prompt: params.surface,
            mask_limit: 3
          }
        })
      });
      
      if (!segResp.ok) {
        const errorText = await segResp.text();
        console.error('❌ Segmentation API error:', errorText);
        throw new Error(`Segmentation API failed: ${segResp.status} ${errorText}`);
      }
      
      const segPrediction = await segResp.json();
      console.log('📊 Segmentation prediction created:', segPrediction.id);
      
      // Poll segmentation until complete
      const segResult = await pollPrediction(segPrediction.id);
      console.log('✅ Segmentation completed');
      
      if (!segResult.output?.length) {
        throw new Error("Segmentation gave no masks");
      }
      
      // Pick the right mask for the surface type
      const surfaceMap: { [key: string]: number } = { floor: 0, wall: 1, ceiling: 2 };
      const surfaceIndex = surfaceMap[params.surface.toLowerCase()] || 0;
      const maskUrl = segResult.output[surfaceIndex];
      
      if (!maskUrl) {
        throw new Error(`No mask found for surface ${params.surface} at index ${surfaceIndex}`);
      }
      
      console.log(`🎭 Using mask ${surfaceIndex} for ${params.surface}:`, maskUrl);
      
      // 3) Step 2: Run inpainting with the specific mask
      console.log('🎨 Step 3: Running inpainting with mask...');
      const rgbColor = hexToRGB(params.color);
      console.log(`🎨 Color: ${params.color} → RGB(${rgbColor})`);
      
      console.log('🔗 Sending to inpainting:', {
        image: imageUrl,
        mask: maskUrl,
        prompt: `Paint the ${params.surface} exactly ${params.color} (e.g. RGB ${rgbColor}) preserving all original texture and lighting.`
      });
      
      const inpaintResp = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
          input: {
            image: imageUrl,
            mask: maskUrl,
            prompt: `Paint the ${params.surface} exactly ${params.color} (e.g. RGB ${rgbColor}) preserving all original texture and lighting.`,
            strength: 0.7,
            guidance_scale: 7.5
          }
        })
      });
      
      if (!inpaintResp.ok) {
        const errorText = await inpaintResp.text();
        console.error('❌ Inpainting API error:', errorText);
        throw new Error(`Inpainting API failed: ${inpaintResp.status} ${errorText}`);
      }
      
      const inpaintPrediction = await inpaintResp.json();
      console.log('📊 Inpainting prediction created:', inpaintPrediction.id);
      
      // Poll inpainting until complete
      const inpaintResult = await pollPrediction(inpaintPrediction.id);
      console.log('✅ Inpainting completed');
      
      if (!inpaintResult.output?.[0]) {
        throw new Error('Inpainting failed - no output image');
      }
      
      console.log('✅ ColorTouch completed successfully');
      console.log('🔗 Result URL:', inpaintResult.output[0]);
      
      return new Response(JSON.stringify({
        success: true,
        imageUrl: inpaintResult.output[0]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error(`Tool ${tool} not implemented`);
    
  } catch (error: any) {
    console.error('❌ AI Design Suite error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 