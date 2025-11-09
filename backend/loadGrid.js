const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Grid = require('./models/Grid');

/**
 * SMART GRID LOADER
 * This script ALWAYS uses cached grid - NEVER regenerates land detection
 * 
 * Run this ONCE after generating your grid, and you're done forever!
 * Land data is permanent - only weather updates separately.
 */

async function smartLoad() {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   ⚡ SMART GRID LOADER');
  console.log('   Load pre-computed grid (NO land detection!)');
  console.log('═══════════════════════════════════════════════════\n');

  // Check for cached grid
  const gridPath = path.join(__dirname, 'gridData.json');
  const gridPathGz = path.join(__dirname, 'gridData.json.gz');

  if (!fs.existsSync(gridPath) && !fs.existsSync(gridPathGz)) {
    console.log('❌ No cached grid found!\n');
    console.log('You need to generate the grid ONCE:');
    console.log('  node gridGenerator.js\n');
    console.log('This will:');
    console.log('  ✅ Detect land/water for all grid points (ONE TIME)');
    console.log('  ✅ Save to gridData.json');
    console.log('  ✅ Take ~45-60 minutes\n');
    console.log('After that, you can use this script to load instantly!\n');
    process.exit(1);
  }

  // Load grid from cache
  console.log('📂 Loading cached grid (NO API calls, instant!)...\n');

  let gridData;
  
  if (fs.existsSync(gridPath)) {
    // Load uncompressed
    console.log('📄 Loading from gridData.json...');
    gridData = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
  } else {
    // Load compressed
    console.log('📦 Loading from compressed cache...');
    const zlib = require('zlib');
    const compressed = fs.readFileSync(gridPathGz);
    const decompressed = zlib.gunzipSync(compressed);
    gridData = JSON.parse(decompressed.toString());
  }

  // Support both 'grid' and 'cells' property names
  const cells = gridData.cells || gridData.grid;
  
  console.log(`✅ Loaded ${cells.length} grid points\n`);

  // Display grid info
  const waterPoints = cells.filter(p => !p.is_land).length;
  const landPoints = cells.filter(p => p.is_land).length;
  
  console.log('📊 Grid Summary:');
  console.log(`   Total: ${cells.length}`);
  console.log(`   🌊 Water: ${waterPoints} (${((waterPoints/cells.length)*100).toFixed(1)}%)`);
  console.log(`   🏝️  Land: ${landPoints} (${((landPoints/cells.length)*100).toFixed(1)}%)`);
  
  if (gridData.metadata) {
    console.log(`   Resolution: ${gridData.metadata.resolution}°`);
    if (gridData.metadata.generatedAt) {
      const date = new Date(gridData.metadata.generatedAt);
      console.log(`   Generated: ${date.toLocaleString()}`);
    }
  }
  console.log('');

  // Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // Clear old grid
  console.log('🗑️  Clearing old grid data...');
  await Grid.deleteMany({});
  console.log('✅ Cleared\n');

  // Import to MongoDB
  console.log('💾 Importing to MongoDB...');
  
  const gridDoc = new Grid({
    name: gridData.metadata?.name || 'Indian Ocean Navigation Grid',
    resolution: gridData.metadata?.resolution || 0.5,
    bounds: {
      north: gridData.metadata?.bounds?.latMax || gridData.metadata?.bounds?.north || 30.58,
      south: gridData.metadata?.bounds?.latMin || gridData.metadata?.bounds?.south || -38.4,
      east: gridData.metadata?.bounds?.lonMax || gridData.metadata?.bounds?.east || 142.48,
      west: gridData.metadata?.bounds?.lonMin || gridData.metadata?.bounds?.west || 22.15
    },
    cells: cells.map(point => ({
      lat: point.lat,
      lon: point.lon,
      is_land: point.is_land || false,  // ✅ Land data loaded from cache
      obstacle: point.obstacle || point.is_land || false,
      weatherData: point.weather || point.weatherData || {
        temperature: null,
        windSpeed: null,
        windDirection: null,
        waveHeight: null,
        visibility: null,
        lastUpdated: null
      }
    })),
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await gridDoc.save();
  
  console.log('✅ Grid imported successfully!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('   ✨ READY FOR NAVIGATION');
  console.log(`   ${cells.length} points loaded (land detection from cache)`);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected\n');
  
  console.log('💡 Next steps:');
  console.log('   1. Start backend: npm start');
  console.log('   2. (Optional) Update weather: node weatherOnlyUpdater.js\n');
}

// Run
smartLoad().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
