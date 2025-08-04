// Test script to debug the ai-design-suite edge function
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kipgwyiohiqyvswggehp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhZmFzZSIsInJlZiI6ImtpcGd3eWlvaGlxeXZzd2dnZWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTUzNzgsImV4cCI6MjA2NTMzMTM3OH0.pYyApfufbY2T6KH4w6TVBuv33fEV6OTP9EDNUo438oA'
);

async function testEdgeFunction() {
  try {
    console.log('🧪 Testing ai-design-suite edge function...');
    
    // Use the working image URL from the dashboard
    const testImageUrl = 'https://kipgwyiohiqyvswggehp.supabase.co/storage/v1/object/public/uploads/img-1753137383455.jpg';
    
    console.log('📸 Testing with image:', testImageUrl);
    
    const { data, error } = await supabase.functions.invoke('ai-design-suite', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: testImageUrl,
        tool: 'ColorTouch',
        params: {
          surface: 'wall',
          color: 'blue'
        }
      })
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return;
    }

    console.log('✅ Edge function response:', data);
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testEdgeFunction(); 