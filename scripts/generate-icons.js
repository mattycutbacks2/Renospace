#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/icons/AppIcon.svg');
const outputDir = path.join(__dirname, '../assets/images');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const iconSizes = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 32 },
  { name: 'splash-icon.png', size: 200 },
];

async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...');
  console.log('');

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);
      
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    console.log('');
    console.log('🎉 All icons generated successfully!');
    console.log('');
    console.log('The new icon features:');
    console.log('✅ Purple background (#7C3AED)');
    console.log('✅ White house silhouette');
    console.log('✅ Purple window and door cutouts');
    console.log('✅ Yellow notification dot with white border');
    console.log('✅ 8px corner radius');
    console.log('');
    console.log('Your app will now use the new icon! 🏠');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons(); 