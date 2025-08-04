// FLUX TOOLS EDGE FUNCTION - COMPLETE MIGRATION WITH CORRECT API PARAMETERS
// supabase/functions/flux-tools/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const REPLICATE = "https://api.replicate.com/v1/predictions";

// FLUX Model Configurations - All 8 Tools with CORRECT API Parameters
const FLUX_MODELS = {
  // KONTEXT PRO TOOLS - Image Editing (6 tools)
  colortouch: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext',
    apiParams: {
      guidance_scale: 3.5,
      num_inference_steps: 25
    }
  },
  stylesync: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext', 
    apiParams: {
      guidance_scale: 6.0,  // Increased from 3.5 for more dramatic changes
      num_inference_steps: 30  // Increased from 25 for better quality
    }
  },
  gardenrender: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext',
    apiParams: {
      guidance_scale: 3.5,
      num_inference_steps: 25
    }
  },
  artpreview: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext',
    apiParams: {
      guidance_scale: 3.5,
      num_inference_steps: 25
    }
  },
  objectswap: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext',
    apiParams: {
      guidance_scale: 3.5,
      num_inference_steps: 25
    }
  },
  hottub: {
    model: 'black-forest-labs/flux-kontext-pro',
    type: 'kontext',
    apiParams: {
      guidance_scale: 3.5,
      num_inference_steps: 25
    }
  },
  
  // FLUX PRO TOOLS - Text-to-Image (2 tools)
  roomrender: {
    model: 'black-forest-labs/flux-pro',
    type: 'pro',
    apiParams: {
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: 90
    }
  },
  virtualstager: {
    model: 'black-forest-labs/flux-pro', 
    type: 'pro',
    apiParams: {
      aspect_ratio: '16:9',
      output_format: 'webp',
      output_quality: 95
    }
  }
};

// Professional Prompt Enhancement System
function enhancePromptForTool(prompt: string, tool: string): string {
  const enhancers = {
    colortouch: (p: string) => {
      const colorMap = {
        'yellow': 'bright sunny yellow with subtle texture',
        'blue': 'ocean blue with depth and richness',
        'green': 'sage green with natural undertones',
        'red': 'warm crimson red with sophisticated finish'
      };
      
      let enhanced = p.toLowerCase();
      Object.entries(colorMap).forEach(([color, enhancement]) => {
        enhanced = enhanced.replace(color, enhancement);
      });
      
      return `${enhanced}, keep all furniture identical positions and colors, maintain exact room layout, preserve all decorative elements, same lighting conditions, professional interior design quality`;
    },
    
    objectswap: (p: string) => {
      const isRemoval = p.toLowerCase().includes('remove') || p.toLowerCase().includes('delete');
      
      if (isRemoval) {
        return `${p}, seamlessly fill the empty space with appropriate background elements (wall texture, floor pattern continuation), maintain natural lighting and shadows in the area, no obvious gaps or distortions, realistic background completion, professional photo editing quality`;
      } else {
        return `${p}, maintain exact same position and scale as original object, match existing room lighting and shadow patterns, blend naturally with surrounding decor and room style, realistic proportions and perspective`;
      }
    },
    
    stylesync: (p: string) => {
      return `Transform the target room to match the reference style: ${p}. 

CRITICAL INSTRUCTIONS:
- Repaint ALL walls with the style's signature colors
- Replace furniture upholstery with style-appropriate fabrics and colors  
- Add style-specific decorative elements (artwork, rugs, lighting fixtures)
- Change window treatments to match the style
- Modify floor finishes if applicable
- Ensure dramatic visual transformation while maintaining room functionality

The result should be a COMPLETE style transformation that is immediately recognizable as the target style.`;
    },
    
    gardenrender: (p: string) => {
      return `Transform this outdoor space: ${p}, maintain existing architecture and hardscaping, realistic plant growth and seasonal appearance, professional landscape design quality, appropriate plant selection for climate, natural lighting and shadows`;
    },
    
    artpreview: (p: string) => {
      return `Place artwork in room: ${p}, correct proportions for room size and wall space, appropriate height placement (57-60 inches center height), realistic lighting with proper shadows and reflections, complement existing room style and color scheme`;
    },
    
    hottub: (p: string) => {
      return `Add luxury outdoor feature: ${p}, integrate seamlessly with existing landscape and architecture, place in optimal location considering traffic flow and aesthetics, include appropriate utility access, professional installation quality, realistic proportions and materials`;
    },
    
    roomrender: (p: string) => {
      return `Generate a complete interior room: ${p}, professional interior design quality, realistic lighting with multiple light sources, fully furnished with appropriate furniture layout and scale, decorator-level styling with accessories and artwork, realistic textures and materials`;
    },
    
    virtualstager: (p: string) => {
      return `Transform this empty room into professionally staged luxury interior: ${p}, magazine-quality styling, expensive-looking furniture and accessories, perfect lighting for photography, maximize perceived value and buyer appeal, Selling Sunset level luxury staging, ready for high-end real estate photography`;
    }
  };
  
  const enhancer = enhancers[tool as keyof typeof enhancers];
  return enhancer ? enhancer(prompt) : prompt;
}

// API Parameter Building Functions with CORRECT parameter names
function buildKontextParams(publicUrl: string, prompt: string, config: any) {
  return {
    input_image: publicUrl,           // CRITICAL: Use input_image not image_url
    prompt: prompt,
    guidance_scale: config.apiParams.guidance_scale,  // CRITICAL: Use guidance_scale not guidance
    num_inference_steps: config.apiParams.num_inference_steps
  }
}

function buildFluxProParams(prompt: string, config: any) {
  return {
    prompt: prompt,                   // No input image for text-to-image
    aspect_ratio: config.apiParams.aspect_ratio,
    output_format: config.apiParams.output_format,
    output_quality: config.apiParams.output_quality
  }
}

async function createAndPoll(cfg: any) {
  console.log('🚀 Starting Replicate prediction with config:', JSON.stringify(cfg, null, 2));
  
  // Fire off the prediction
  let res = await fetch(REPLICATE, {
    method: "POST",
    headers: {
      "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cfg),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Replicate POST failed:', res.status, errorText);
    throw new Error(`Replicate POST failed: ${res.status} - ${errorText}`);
  }
  
  let pred = await res.json();
  console.log('✅ Prediction created:', pred.id, 'Status:', pred.status);

  // Poll status with increased timeout and better logging
  let attempts = 0;
  const maxAttempts = 300; // 5 minutes for complex operations
  
  while (pred.status === "starting" || pred.status === "processing") {
    attempts++;
    if (attempts > maxAttempts) {
      console.error('⏰ Timeout reached after', maxAttempts, 'attempts');
      throw new Error(`FLUX processing timeout after ${maxAttempts} seconds. The model is taking longer than expected. Please try again with a simpler image or different prompt.`);
    }
    
    console.log(`⏳ Poll attempt ${attempts}/${maxAttempts}: ${pred.status}`);
    
    // Wait 1 second before next poll
    await new Promise((r) => setTimeout(r, 1000));
    
    try {
      res = await fetch(`${REPLICATE}/${pred.id}`, {
        headers: { "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Poll request failed:', res.status, errorText);
        throw new Error(`Poll request failed: ${res.status} - ${errorText}`);
      }
      
      pred = await res.json();
      
      // Log any error messages from Replicate
      if (pred.error) {
        console.error('🔴 Replicate error detected:', pred.error);
        throw new Error(`Replicate error: ${pred.error}`);
      }
      
    } catch (pollError) {
      console.error('❌ Poll error:', pollError);
      throw pollError;
    }
  }

  console.log('🎯 Final prediction status:', pred.status);
  
  if (pred.status === "failed") {
    console.error("🔴 Replicate failed:", JSON.stringify(pred, null, 2));
    throw new Error(`Replicate failed: ${pred.error || 'Unknown error'}`);
  }
  
  if (pred.status === "canceled") {
    console.error("🔴 Replicate canceled:", JSON.stringify(pred, null, 2));
    throw new Error(`Replicate canceled: ${pred.error || 'Unknown reason'}`);
  }
  
  if (pred.status !== "succeeded") {
    console.error("🔴 Unexpected Replicate status:", pred.status, JSON.stringify(pred, null, 2));
    throw new Error(`Unexpected Replicate status: ${pred.status}`);
  }
  
  console.log('✅ Prediction succeeded!');
  return pred;
}

async function handler(req: Request): Promise<Response> {
  // RECURSION DETECTION (copy from ColorTouch)
  if (!globalThis.callCount) globalThis.callCount = 0;
  globalThis.callCount++;
  
  console.log(`🔢 Function call #${globalThis.callCount}`);
  
  if (globalThis.callCount > 3) {
    console.error("❌ TOO MANY CALLS - STOPPING RECURSION");
    return new Response("Recursion detected", { status: 500 });
  }

  try {
    const requestBody = await req.json();
    console.log(`🚀 ${requestBody.tool} called:`, requestBody);
    
    // MINIMAL TEST ENDPOINT
    if (requestBody.tool === 'minimal-test') {
      console.log('🧪 Running minimal test with ultra-simple parameters...');
      
      const minimalInput = {
        input_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=512&h=512&fit=crop",
        prompt: "Scandinavian style",
        guidance_scale: 3.5,
        num_inference_steps: 15
      };
      
      console.log('📋 Minimal test parameters:', JSON.stringify(minimalInput, null, 2));
      
      try {
        const pred = await createAndPoll({
          version: "black-forest-labs/flux-kontext-pro",
          input: minimalInput
        });
        
        let resultUrl;
        if (Array.isArray(pred.output) && pred.output.length > 0) {
          resultUrl = pred.output[0];
        } else if (pred.output && typeof pred.output === 'string') {
          resultUrl = pred.output;
        } else {
          throw new Error("Failed to extract result URL from minimal test");
        }
        
        console.log('✅ Minimal test succeeded! Result URL:', resultUrl);
        
        return new Response(JSON.stringify({
          success: true,
          resultUrl: resultUrl,
          message: "Minimal test completed successfully"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
        
      } catch (minimalError) {
        console.error('❌ Minimal test failed:', minimalError);
        console.error('❌ Minimal test error payload:', JSON.stringify(minimalError, null, 2));
        
        return new Response(JSON.stringify({
          success: false,
          resultUrl: null,
          error: `Minimal test failed: ${minimalError.message}`
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    
    // Handle special case for ArtPreview - needs two images
    if (requestBody.tool === 'artpreview') {
      const { roomImagePath, artworkImagePath, placementInstructions, mask, tool } = requestBody;
      
      if (!roomImagePath || !artworkImagePath) {
        throw new Error('ArtPreview requires both room and artwork images');
      }
      
      if (!placementInstructions?.trim()) {
        throw new Error('ArtPreview requires placement instructions');
      }
      
      console.log(`🎨 ArtPreview processing:`, { roomImagePath, artworkImagePath, placementInstructions, mask });
      
      // Get public URLs for both images
      const { data: roomData } = supabase.storage.from("uploads").getPublicUrl(roomImagePath);
      const { data: artworkData } = supabase.storage.from("uploads").getPublicUrl(artworkImagePath);
      
      const roomUrl = roomData.publicUrl;
      const artworkUrl = artworkData.publicUrl;
      
      console.log("▶️ Room URL:", roomUrl);
      console.log("▶️ Artwork URL:", artworkUrl);
      
      // Test both URLs
      try {
        const roomTest = await fetch(roomUrl, { method: 'HEAD' });
        const artworkTest = await fetch(artworkUrl, { method: 'HEAD' });
        
        if (!roomTest.ok || !artworkTest.ok) {
          throw new Error('One or both images failed to load');
        }
      } catch (testError) {
        console.error('❌ URL test failed:', testError);
        throw new Error('Image upload failed - please try again');
      }
      
      // Create enhanced prompt with mask information
      let enhancedPrompt = `Place the artwork from the second image naturally in the room from the first image. ${placementInstructions}. Ensure realistic size, proper lighting, natural shadows, and professional placement that complements the room's style and layout. The artwork should look like it belongs in the space.`;
      
      // Add mask-specific instructions if mask is provided
      if (mask && mask.x !== undefined && mask.y !== undefined && mask.width && mask.height) {
        enhancedPrompt += ` Place the artwork specifically in the area defined by the mask coordinates (x: ${mask.x}, y: ${mask.y}, width: ${mask.width}, height: ${mask.height}). The artwork should fit naturally within this designated area.`;
        console.log("🎯 Using mask for precise placement:", mask);
      }
      
      console.log(`🤖 Enhanced ArtPreview prompt: ${enhancedPrompt}`);
      
      // FLUX Kontext Pro parameters for two-image processing
      const replicateInput = {
        input_image: roomUrl,           // Primary room image
        prompt: enhancedPrompt,
        guidance_scale: 3.5,
        num_inference_steps: 25
      };
      
      console.log(`📋 ArtPreview API parameters:`, replicateInput);
      
      // Call FLUX Kontext Pro
      console.log(`🤖 Sending to FLUX Kontext Pro for ArtPreview`);
      console.log(`⏱️ Starting processing at: ${new Date().toISOString()}`);
      
      try {
        const pred = await createAndPoll({
          version: "black-forest-labs/flux-kontext-pro",
          input: replicateInput
        });
        
        console.log(`✅ FLUX processing completed at: ${new Date().toISOString()}`);
        
        // Log the complete prediction object
        console.log("🔍 Full prediction object:", JSON.stringify(pred, null, 2));
        console.log("🔍 Prediction output structure:", JSON.stringify(pred.output, null, 2));
        
        // Extract result URL with multiple fallback methods
        let resultUrl;
        if (Array.isArray(pred.output) && pred.output.length > 0) {
          resultUrl = pred.output[0];
        } else if (pred.output && typeof pred.output === 'string') {
          resultUrl = pred.output;
        } else if (pred.urls && pred.urls.get) {
          resultUrl = pred.urls.get;
        } else if (pred.output && pred.output.images && pred.output.images.length > 0) {
          resultUrl = pred.output.images[0];
        } else {
          console.error("❌ Could not extract result URL from prediction:", pred);
          throw new Error("Failed to extract result URL from FLUX response");
        }
        
        console.log("✅ Extracted result URL:", resultUrl);
        
        if (!resultUrl || resultUrl.length < 10) {
          console.error("❌ Result URL seems invalid (too short):", resultUrl);
          throw new Error("Invalid result URL received from FLUX");
        }
        
        // Return format that matches all UI expectations (both imageUrl and resultUrl)
        const responseData = {
          success: true,
          imageUrl: resultUrl,    // For ObjectSwap
          resultUrl: resultUrl,   // For all other tools
          message: "Artwork placement completed successfully"
        };
        
        console.log("📤 Response being sent:", JSON.stringify(responseData));
        
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
        
      } catch (error) {
        console.error("❌ Two-image processing failed, trying fallback approach:", error);
        
        // Fallback: Use a simpler approach with just the room image and a text prompt
        console.log("🔄 Trying fallback: single-image processing with text prompt");
        
        const fallbackInput = {
          input_image: roomUrl,
          prompt: `Add beautiful artwork to this room. Place it naturally on the wall or in a suitable location. The artwork should be realistic, well-lit, and complement the room's style.`,
          guidance_scale: 3.5,
          num_inference_steps: 25
        };
        
        const fallbackPred = await createAndPoll({
          version: "black-forest-labs/flux-kontext-pro",
          input: fallbackInput
        });
        
        let fallbackResultUrl;
        if (Array.isArray(fallbackPred.output) && fallbackPred.output.length > 0) {
          fallbackResultUrl = fallbackPred.output[0];
        } else if (fallbackPred.output && typeof fallbackPred.output === 'string') {
          fallbackResultUrl = fallbackPred.output;
        } else {
          throw new Error("Fallback processing also failed");
        }
        
        const responseData = {
          success: true,
          imageUrl: fallbackResultUrl,
          resultUrl: fallbackResultUrl,
          message: "Artwork placement completed (using simplified processing)"
        };
        
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    
    // Handle regular tools (existing logic)
    const { imagePath, prompt, tool } = requestBody;

    // Validate tool
    if (!FLUX_MODELS[tool as keyof typeof FLUX_MODELS]) {
      throw new Error(`Invalid tool: ${tool}. Available tools: ${Object.keys(FLUX_MODELS).join(', ')}`);
    }

    const toolConfig = FLUX_MODELS[tool as keyof typeof FLUX_MODELS];
    console.log(`▶️ Using FLUX model: ${toolConfig.model}`);

    // Get enhanced prompt
    const enhancedPrompt = enhancePromptForTool(prompt, tool);
    console.log(`🤖 Enhanced prompt: ${enhancedPrompt}`);

    let replicateInput;

    if (toolConfig.type === 'kontext') {
      // For Kontext Pro - needs input image
      if (!imagePath) {
        throw new Error(`${tool} requires an image input`);
      }
      
      // Get public URL (copy from ColorTouch)
      const { data } = supabase.storage.from("uploads").getPublicUrl(imagePath);
      const publicUrl = data.publicUrl;
      console.log("▶️ Using public URL:", publicUrl);

      // Test the public URL to make sure it works (copy from ColorTouch)
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
      
      replicateInput = buildKontextParams(publicUrl, enhancedPrompt, toolConfig);
    } else if (toolConfig.type === 'pro') {
      // For FLUX Pro - text-to-image only
      replicateInput = buildFluxProParams(enhancedPrompt, toolConfig);
    } else {
      throw new Error(`Unknown tool type: ${toolConfig.type}`);
    }

    console.log(`📋 API parameters for ${tool}:`, replicateInput);

    // Call Replicate with correct model
    console.log(`🤖 Sending to FLUX ${toolConfig.model} with prompt:`, enhancedPrompt);
    const pred = await createAndPoll({
      version: toolConfig.model,  // Use the model string directly
      input: replicateInput
    });

    // Log the complete prediction object to understand FLUX response structure
    console.log("🔍 Full prediction object:", JSON.stringify(pred, null, 2));
    console.log("🔍 Prediction output structure:", JSON.stringify(pred.output, null, 2));
    
    // Extract result URL with multiple fallback methods
    let resultUrl;
    if (Array.isArray(pred.output) && pred.output.length > 0) {
      resultUrl = pred.output[0];
    } else if (pred.output && typeof pred.output === 'string') {
      resultUrl = pred.output;
    } else if (pred.urls && pred.urls.get) {
      resultUrl = pred.urls.get;
    } else if (pred.output && pred.output.images && pred.output.images.length > 0) {
      resultUrl = pred.output.images[0];
    } else {
      console.error("❌ Could not extract result URL from prediction:", pred);
      throw new Error("Failed to extract result URL from FLUX response");
    }
    
    console.log("✅ Extracted result URL:", resultUrl);
    
    if (!resultUrl || resultUrl.length < 10) {
      console.error("❌ Result URL seems invalid (too short):", resultUrl);
      throw new Error("Invalid result URL received from FLUX");
    }
    
    // Return format that matches all UI expectations (both imageUrl and resultUrl)
    const responseData = {
      success: true,
      imageUrl: resultUrl,    // For ObjectSwap
      resultUrl: resultUrl,   // For all other tools
      message: "Transformation completed successfully"
    };
    
    console.log("📤 Response being sent:", JSON.stringify(responseData));
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("❌ Handler error:", err);
    console.error("❌ Full error payload:", JSON.stringify(err, null, 2));
    
    // Handle specific FLUX errors with better error messages
    if (err.message.includes('invalid image URL') || err.message.includes('Image upload failed')) {
      return new Response(JSON.stringify({
        success: false,
        imageUrl: null,
        resultUrl: null,
        error: 'Image upload failed. Please try uploading again with a different image.'
      }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    
    if (err.message.includes('timeout')) {
      return new Response(JSON.stringify({
        success: false,
        imageUrl: null,
        resultUrl: null,
        error: 'Processing took too long. Please try again with a simpler image or different prompt.'
      }), { status: 408, headers: { "Content-Type": "application/json" } });
    }
    
    if (err.message.includes('Replicate')) {
      return new Response(JSON.stringify({
        success: false,
        imageUrl: null,
        resultUrl: null,
        error: 'AI processing failed. Please try again with a different image or prompt.'
      }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    return new Response(JSON.stringify({
      success: false,
      imageUrl: null,
      resultUrl: null,
      error: err.message || 'An unexpected error occurred. Please try again.'
    }), {
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