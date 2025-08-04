import Replicate from "npm:replicate";

const replicate = new Replicate({
  auth: Deno.env.get("REPLICATE_API_TOKEN")!,
});

async function debugUrls(imageUrl: string, maskUrl: string) {
  console.log('🔍 DEBUGGING URLs...');
  
  try {
    console.log('📸 Testing image URL:', imageUrl);
    const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
    console.log('📸 Image status:', imageResponse.status);
    console.log('📸 Image headers:', Object.fromEntries(imageResponse.headers.entries()));
    
    console.log('🎭 Testing mask URL:', maskUrl);
    const maskResponse = await fetch(maskUrl, { method: 'HEAD' });
    console.log('🎭 Mask status:', maskResponse.status);
    console.log('🎭 Mask headers:', Object.fromEntries(maskResponse.headers.entries()));
    
    // Try to actually fetch a bit of content
    console.log('📸 Fetching image content preview...');
    const imageContentResponse = await fetch(imageUrl);
    const imageBlob = await imageContentResponse.blob();
    console.log('📸 Image blob size:', imageBlob.size, 'type:', imageBlob.type);
    
    console.log('🎭 Fetching mask content preview...');
    const maskContentResponse = await fetch(maskUrl);
    const maskBlob = await maskContentResponse.blob();
    console.log('🎭 Mask blob size:', maskBlob.size, 'type:', maskBlob.type);
    
    return { imageSize: imageBlob.size, maskSize: maskBlob.size };
  } catch (error) {
    console.error('❌ URL debug error:', error);
    throw error;
  }
}

async function simpleInpaint(imageUrl: string, maskUrl: string, prompt: string) {
  console.log('🎨 Starting simple inpaint test...');
  
  // First debug the URLs
  const urlInfo = await debugUrls(imageUrl, maskUrl);
  
  if (urlInfo.imageSize === 0) {
    throw new Error('❌ Image file is empty!');
  }
  if (urlInfo.maskSize === 0) {
    throw new Error('❌ Mask file is empty!');
  }
  
  console.log('✅ Files look good, creating prediction...');
  
  const prediction = await replicate.predictions.create({
    version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
    input: {
      image: imageUrl,
      mask: maskUrl,
      prompt,
      num_inference_steps: 10, // Super fast for testing
      guidance_scale: 7.5
    },
  });
  
  console.log('🤖 Prediction created:', prediction.id);
  
  // Wait for the prediction to complete
  console.log('⏳ Waiting for prediction to complete...');
  let completedPrediction = prediction;
  
  while (completedPrediction.status !== 'succeeded' && completedPrediction.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    completedPrediction = await replicate.predictions.get(prediction.id);
    console.log('📊 Prediction status:', completedPrediction.status);
  }
  
  if (completedPrediction.status === 'failed') {
    throw new Error('❌ Prediction failed: ' + completedPrediction.error);
  }
  
  console.log('✅ Prediction completed successfully!');
  console.log('🎨 Output:', completedPrediction.output);
  
  // Return the actual result image URL
  const resultUrl = completedPrediction.output?.[0];
  if (!resultUrl) {
    throw new Error('❌ No output URL in prediction result');
  }
  
  console.log('🔗 Result URL:', resultUrl);
  return resultUrl;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { tool, imageUrl, maskUrl, prompt } = await req.json();
    
    console.log('🚀 DEBUG REQUEST:', { tool, imageUrl, maskUrl, prompt });
    
    if (tool !== 'colortouch') {
      return new Response('Invalid tool', { status: 400 });
    }

    if (!imageUrl || !maskUrl || !prompt) {
      return new Response('Missing required parameters', { status: 400 });
    }

    // Create prediction and wait for completion
    const resultUrl = await simpleInpaint(imageUrl, maskUrl, prompt);
    
    return new Response(JSON.stringify({ 
      success: true, 
      resultUrl: resultUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});