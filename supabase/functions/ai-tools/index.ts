// UPDATED AI TOOLS EDGE FUNCTION WITH PROFESSIONAL PROMPTS
// supabase/functions/ai-tools/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ToolConfig {
  model: string;
  strength: number;
  guidance_scale: number;
  num_inference_steps: number;
  getPrompt: (userPrompt: string) => string;
  getNegativePrompt: () => string;
}

const AI_TOOLS: Record<string, ToolConfig> = {
  
  // 1. COLORTOUCH - Surgical Color/Surface Changes
  colortouch: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.35,
    guidance_scale: 7.5,
    num_inference_steps: 20,
    getPrompt: (userPrompt: string) => {
      // Enhanced color descriptions
      const colorEnhancements = {
        'yellow': 'bright sunny yellow with subtle texture',
        'blue': 'ocean blue with depth and richness',
        'green': 'sage green with natural undertones',
        'red': 'warm crimson red with sophisticated finish',
        'white': 'pure white with subtle off-white warmth',
        'black': 'deep charcoal black with matte finish',
        'gray': 'modern gray with cool undertones',
        'brown': 'warm chocolate brown with wood grain',
        'beige': 'warm beige with cream highlights',
        'navy': 'deep navy blue with sophisticated depth'
      };
      
      let enhancedPrompt = userPrompt.toLowerCase();
      
      // Detect and enhance colors
      Object.keys(colorEnhancements).forEach(color => {
        if (enhancedPrompt.includes(color)) {
          enhancedPrompt = enhancedPrompt.replace(color, colorEnhancements[color as keyof typeof colorEnhancements]);
        }
      });
      
      // Add wall specificity if not specified
      if (enhancedPrompt.includes('wall') && !enhancedPrompt.includes('back wall') && !enhancedPrompt.includes('left wall') && !enhancedPrompt.includes('right wall')) {
        enhancedPrompt = enhancedPrompt.replace('wall', 'back wall');
      }
      
      return `${enhancedPrompt}, keep all furniture in identical positions and colors, maintain exact room layout, preserve all decorative elements, same lighting conditions, professional interior design quality, realistic textures and finishes, no furniture changes, no layout modifications`;
    },
    getNegativePrompt: () => "furniture color changes, different furniture, moving furniture, room layout changes, style changes, different decor, unrealistic textures, blurry details, distorted proportions"
  },

  // 2. OBJECTSWAP - Remove or Replace Objects
  objectswap: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.6,
    guidance_scale: 8.0,
    num_inference_steps: 25,
    getPrompt: (userPrompt: string) => {
      const isRemoval = userPrompt.toLowerCase().includes('remove') || userPrompt.toLowerCase().includes('delete');
      
      if (isRemoval) {
        return `${userPrompt}, seamlessly fill the empty space with appropriate background elements (wall texture, floor pattern continuation), maintain natural lighting and shadows in the area, no obvious gaps or distortions, realistic background completion, professional photo editing quality`;
      } else {
        return `${userPrompt}, maintain exact same position and scale as original object, match existing room lighting and shadow patterns, blend naturally with surrounding decor and room style, realistic proportions and perspective, professional interior design placement`;
      }
    },
    getNegativePrompt: () => "obvious editing artifacts, unrealistic shadows, mismatched lighting, wrong proportions, floating objects, distorted perspective, blurry details, inconsistent style"
  },

  // 3. ROOMRENDER - Complete AI Room Generation
  roomrender: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.8,
    guidance_scale: 9.0,
    num_inference_steps: 30,
    getPrompt: (userPrompt: string) => {
      // Style-specific enhancements
      const stylePrompts = {
        'modern': 'clean lines, minimal furniture, neutral color palette with accent colors, natural lighting, uncluttered surfaces, contemporary art, sleek finishes',
        'traditional': 'warm woods, classic furniture, rich textures, ornate details, layered lighting, traditional patterns, comfortable seating arrangements',
        'scandinavian': 'light woods, white walls, cozy textures, functional furniture, natural elements, hygge atmosphere, simple color palette',
        'industrial': 'exposed brick, metal fixtures, leather furniture, concrete elements, Edison bulb lighting, raw materials, urban aesthetic',
        'boho': 'mixed patterns, warm earth tones, plants, eclectic furniture, textured fabrics, global influences, layered rugs',
        'farmhouse': 'shiplap walls, vintage furniture, neutral colors, natural textures, rustic charm, cozy atmosphere, barn-inspired elements'
      };
      
      let enhancedPrompt = userPrompt;
      
      // Detect and enhance style
      Object.keys(stylePrompts).forEach(style => {
        if (userPrompt.toLowerCase().includes(style)) {
          enhancedPrompt += `, ${stylePrompts[style as keyof typeof stylePrompts]}`;
        }
      });
      
      return `Generate a complete interior room: ${enhancedPrompt}, professional interior design quality, realistic lighting with multiple light sources, fully furnished with appropriate furniture layout and scale, decorator-level styling with accessories and artwork, realistic textures and materials, proper room proportions, inviting atmosphere`;
    },
    getNegativePrompt: () => "empty room, unfurnished, poor lighting, unrealistic proportions, floating furniture, blurry details, amateur design, cluttered space, mismatched styles"
  },

  // 4. STYLESYNC - Control Photo Style Transfer
  stylesync: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.7,
    guidance_scale: 8.5,
    num_inference_steps: 25,
    getPrompt: (userPrompt: string) => {
      return `Transform the target room to match the reference style: ${userPrompt}, analyze and apply the color palette, furniture style, material choices, lighting mood, and decorative approach from reference image, maintain target room's architecture and basic layout, ensure cohesive style translation, professional interior design quality, realistic implementation of style elements`;
    },
    getNegativePrompt: () => "mismatched styles, unrealistic color combinations, poor style translation, inconsistent design elements, amateur styling, conflicting aesthetics"
  },

  // 5. GARDENRENDER - Outdoor Space Transformation
  gardenrender: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.5,
    guidance_scale: 7.5,
    num_inference_steps: 25,
    getPrompt: (userPrompt: string) => {
      // Plant and garden enhancements
      const gardenEnhancements = {
        'plants': 'lush, healthy plants with realistic growth patterns',
        'flowers': 'vibrant seasonal flowers in natural arrangements',
        'grass': 'well-maintained green lawn with natural texture',
        'trees': 'mature trees with realistic foliage and shadows',
        'garden': 'professionally landscaped garden with proper plant spacing',
        'patio': 'elegant patio with appropriate outdoor furniture'
      };
      
      let enhancedPrompt = userPrompt.toLowerCase();
      
      Object.keys(gardenEnhancements).forEach(element => {
        if (enhancedPrompt.includes(element)) {
          enhancedPrompt = enhancedPrompt.replace(element, gardenEnhancements[element as keyof typeof gardenEnhancements]);
        }
      });
      
      return `Transform this outdoor space: ${enhancedPrompt}, maintain existing architecture and hardscaping, realistic plant growth and seasonal appearance, professional landscape design quality, appropriate plant selection for climate, natural lighting and shadows, well-composed outdoor living space`;
    },
    getNegativePrompt: () => "dead plants, unrealistic growth, poor landscaping, mismatched plant types, artificial appearance, poor composition, unrealistic lighting"
  },

  // 6. HOTTUB - Add Luxury Outdoor Features
  hottub: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.6,
    guidance_scale: 8.0,
    num_inference_steps: 25,
    getPrompt: (userPrompt: string) => {
      // Feature-specific prompts
      const featurePrompts = {
        'hot tub': 'luxury hot tub with premium finishes, appropriate decking and surroundings, integrated lighting, spa-like atmosphere',
        'pool': 'beautiful swimming pool with proper proportions, elegant coping, integrated landscaping, resort-quality design',
        'fire pit': 'stylish fire pit with comfortable seating arrangement, appropriate safety clearances, cozy gathering space',
        'pergola': 'elegant pergola with proper proportions, quality materials, integrated with landscape design'
      };
      
      let enhancedPrompt = userPrompt.toLowerCase();
      
      Object.keys(featurePrompts).forEach(feature => {
        if (enhancedPrompt.includes(feature.replace(' ', ''))) {
          enhancedPrompt += `, ${featurePrompts[feature]}`;
        }
      });
      
      return `Add luxury outdoor feature: ${enhancedPrompt}, integrate seamlessly with existing landscape and architecture, place in optimal location considering traffic flow and aesthetics, include appropriate utility access, professional installation quality, realistic proportions and materials, enhance overall outdoor living experience`;
    },
    getNegativePrompt: () => "poor placement, unrealistic proportions, cheap appearance, safety hazards, poor integration, amateur installation, unrealistic features"
  },

  // 7. VIRTUALSTAGER - Professional Real Estate Staging
  virtualstager: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.75,
    guidance_scale: 9.0,
    num_inference_steps: 35,
    getPrompt: (userPrompt: string) => {
      // Professional staging styles
      const stagingStyles = {
        'luxury modern': 'high-end contemporary furniture, marble and gold accents, statement lighting fixtures, neutral palette with luxury touches, designer accessories, expensive-looking materials, sophisticated color coordination',
        'family appeal': 'comfortable but elegant furniture, warm inviting colors, family-friendly layout but upscale, cozy sophistication, quality family furniture, welcoming atmosphere',
        'executive': 'sophisticated masculine design, rich leather furniture, dark woods, impressive built-ins, luxury tech integration, professional home office elements',
        'maximalist': 'bold patterns and colors, statement furniture pieces, impressive art collections, luxury textiles, dramatic lighting, show-stopping design elements'
      };
      
      let enhancedPrompt = userPrompt.toLowerCase();
      
      // Detect staging style
      Object.keys(stagingStyles).forEach(style => {
        if (enhancedPrompt.includes(style.replace(' ', ''))) {
          enhancedPrompt += `, ${stagingStyles[style]}`;
        }
      });
      
      return `Transform this empty room into professionally staged luxury interior: ${enhancedPrompt}, magazine-quality styling, expensive-looking furniture and accessories, perfect lighting for photography, maximize perceived value and buyer appeal, create aspirational lifestyle atmosphere, Selling Sunset level luxury staging, impeccable taste and sophistication, ready for high-end real estate photography`;
    },
    getNegativePrompt: () => "cheap furniture, poor staging, cluttered appearance, bad lighting, amateur styling, low-end materials, poor color coordination, cramped layout, unprofessional appearance"
  },

  // 8. ARTPREVIEW - Artwork Visualization
  artpreview: {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    strength: 0.4,
    guidance_scale: 7.0,
    num_inference_steps: 20,
    getPrompt: (userPrompt: string) => {
      return `Place artwork in room: ${userPrompt}, correct proportions for room size and wall space, appropriate height placement (57-60 inches center height), realistic lighting with proper shadows and reflections, complement existing room style and color scheme, professional gallery-quality placement, realistic frame and matting, natural integration with room design`;
    },
    getNegativePrompt: () => "wrong proportions, poor placement, unrealistic lighting, mismatched style, floating artwork, distorted perspective, poor framing, amateur placement"
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, prompt, tool } = await req.json()

    if (!imageBase64 || !prompt || !tool) {
      throw new Error('Missing required parameters: imageBase64, prompt, and tool')
    }

    const toolConfig = AI_TOOLS[tool.toLowerCase()]
    if (!toolConfig) {
      throw new Error(`Unknown tool: ${tool}. Available tools: ${Object.keys(AI_TOOLS).join(', ')}`)
    }

    // Generate enhanced prompts using tool-specific logic
    const enhancedPrompt = toolConfig.getPrompt(prompt)
    const negativePrompt = toolConfig.getNegativePrompt()

    console.log(`Processing ${tool} with enhanced prompt:`, enhancedPrompt)

    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: toolConfig.model,
        input: {
          image: imageBase64,
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt,
          strength: toolConfig.strength,
          guidance_scale: toolConfig.guidance_scale,
          num_inference_steps: toolConfig.num_inference_steps
        },
      }),
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      throw new Error(`Replicate API error: ${replicateResponse.status} ${errorText}`)
    }

    const prediction = await replicateResponse.json()
    
    // Poll for completion
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          "Authorization": `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
        },
      })
      
      if (!pollResponse.ok) {
        throw new Error(`Polling error: ${pollResponse.status}`)
      }
      
      result = await pollResponse.json()
    }

    if (result.status === "failed") {
      throw new Error(`AI processing failed: ${result.error}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: result.output?.[0] || result.output,
        tool: tool,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )

  } catch (error) {
    console.error('AI Tools Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )
  }
}) 