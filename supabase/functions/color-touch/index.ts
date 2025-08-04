// COLORTOUCH EDGE FUNCTION - MIGRATED TO FLUX KONTEXT PRO
// supabase/functions/color-touch/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const REPLICATE = "https://api.replicate.com/v1/predictions";

async function createAndPoll(cfg: any) {
  // Fire off the prediction
  let res = await fetch(REPLICATE, {
    method: "POST",
    headers: {
      "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cfg),
  });
  
  if (!res.ok) throw new Error(`Replicate POST ${res.status}`);
  let pred = await res.json();

  // Poll status with timeout
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max
  
  while (pred.status === "starting" || pred.status === "processing") {
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error("Polling timeout after 60 seconds");
    }
    
    console.log(`⏳ Poll attempt ${attempts}: ${pred.status}`);
    await new Promise((r) => setTimeout(r, 1000));
    
    res = await fetch(`${REPLICATE}/${pred.id}`, {
      headers: { "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}` },
    });
    pred = await res.json();
  }

  if (pred.status !== "succeeded") {
    console.error("🔴 Replicate failed:", pred);
    throw new Error(`Replicate status ${pred.status}`);
  }
  return pred;
}

async function handler(req: Request): Promise<Response> {
  // RECURSION DETECTION
  if (!globalThis.callCount) globalThis.callCount = 0;
  globalThis.callCount++;
  
  console.log(`🔢 Function call #${globalThis.callCount}`);
  
  if (globalThis.callCount > 3) {
    console.error("❌ TOO MANY CALLS - STOPPING RECURSION");
    return new Response("Recursion detected", { status: 500 });
  }

  try {
    const { imagePath, prompt } = await req.json();
    console.log(`🚀 ColorTouch called:`, { imagePath, prompt });

    // Build the public URL (keep existing logic)
    const { data } = supabase
      .storage
      .from("uploads")
      .getPublicUrl(imagePath);
    
    const publicUrl = data.publicUrl;
    console.log("▶️ Using public URL:", publicUrl);

    // Test the public URL to make sure it works
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('🧪 Public URL test:', {
        status: testResponse.status,
        contentLength: testResponse.headers.get('content-length'),
        url: publicUrl
      });
      
      if (!testResponse.ok || testResponse.headers.get('content-length') === '0') {
        console.log('⚠️ Public URL failed, trying signed URL...');
        
        // Try signed URL as fallback
        const { data: signedData } = await supabase.storage
          .from('uploads')
          .createSignedUrl(imagePath, 60);
        
        if (!signedData?.signedUrl) {
          throw new Error('Could not create signed URL');
        }
        
        const signedUrl = signedData.signedUrl;
        console.log('🔐 Using signed URL:', signedUrl);
      }
    } catch (testError) {
      console.error('❌ URL test failed:', testError);
      throw new Error('Image upload failed - please try again');
    }

    // Enhanced prompt for FLUX Kontext Pro
    const enhancedPrompt = `${prompt}, keep all furniture identical positions and colors, maintain exact room layout, preserve all decorative elements, same lighting conditions, professional interior design quality`;
    console.log('🤖 Enhanced prompt:', enhancedPrompt);

    // Call FLUX Kontext Pro with correct parameters
    console.log('🔗 Calling FLUX Kontext Pro with:', { publicUrl, enhancedPrompt });
    const pred = await createAndPoll({
      version: "black-forest-labs/flux-kontext-pro",
      input: {
        input_image: publicUrl,        // Use publicUrl instead of dataUri
        prompt: enhancedPrompt,
        guidance_scale: 3.5,           // CRITICAL: Use guidance_scale not guidance
        num_inference_steps: 25
      }
    });

    console.log("✅ Got result URL:", pred.output[0]);
    return new Response(JSON.stringify({ resultUrl: pred.output[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("❌ Handler error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    // Reset counter when done
    globalThis.callCount = 0;
  }
}

// ONLY ONE serve call at module level - outside of handler
serve(handler); 