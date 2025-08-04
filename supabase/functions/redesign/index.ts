// supabase/functions/redesign/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// 🔥 Use the v4 Deno SDK default export
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");
console.log("🔑 OPENAI_API_KEY length:", apiKey?.length);

const openai = new OpenAI({ apiKey });

console.log("✅ Edge Function running");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { imageUrl, roomType, style } = await req.json();

    // Validate required parameters
    if (!imageUrl || !roomType || !style) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageUrl, roomType, style' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log("📸 Processing:", { imageUrl, roomType, style });

    // 1️⃣ Vision
    const visionResp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Describe this ${roomType} for redesign in ${style} style. Focus on the key design elements, color palette, and overall aesthetic that would transform this space.` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });
    const visionResult = visionResp.choices[0].message.content;
    console.log("✅ Vision:", visionResult);

    // 1️⃣.5 Summarize visionResult into one sentence
    const summaryResp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Summarize the following room description in one concise sentence, preserving key objects and mood.' },
        { role: 'user', content: visionResult }
      ]
    });
    const visionSummary = summaryResp.choices[0].message.content.trim();

    // 2️⃣ Build a tighter prompt
    const promptString = `Photorealistic ${roomType} redesign in ${style} style—keep the exact camera angle and bed/nightstand arrangement. Base it on this: ${visionSummary}`.replace(/\s+/g, ' ').trim();
    console.log('📝 Refined DALL·E Prompt:', promptString);

    const dalleResp = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptString,
      n: 1,
      size: "1024x1024",
    });
    const redesignedUrl = dalleResp.data[0].url;
    console.log("✅ DALL·E URL:", redesignedUrl);

    return new Response(
      JSON.stringify({ redesignedUrl }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );

  } catch (err) {
    console.error("❌ Function error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
