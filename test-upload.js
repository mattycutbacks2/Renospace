// Test script to check if uploaded files are accessible
const testUrl = "https://kipgwyiohiqyvswggehp.supabase.co/storage/v1/object/public/uploads/img-1753109193946.jpg";

async function testUpload() {
  console.log('Testing URL:', testUrl);
  
  try {
    const response = await fetch(testUrl);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const blob = await response.blob();
    console.log('Blob size:', blob.size);
    console.log('Blob type:', blob.type);
    
    if (blob.size === 0) {
      console.log('❌ File is empty!');
    } else {
      console.log('✅ File has content!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload(); 