require('dotenv').config();
const mongoose = require('mongoose');
const Grid = require('./models/Grid');

async function checkPalkStraitCells() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define Palk Strait area (between India and Sri Lanka)
    const palkStraitBounds = {
      minLat: 8.5,
      maxLat: 10.5,
      minLon: 79.0,
      maxLon: 80.5
    };

    console.log('🔍 Searching for ALL cells in Palk Strait area...');
    console.log(`   Area: ${palkStraitBounds.minLat}°-${palkStraitBounds.maxLat}°N, ${palkStraitBounds.minLon}°-${palkStraitBounds.maxLon}°E\n`);

    // Find ALL cells in this area (both water and land)
    const allCells = await Grid.find({
      lat: { $gte: palkStraitBounds.minLat, $lte: palkStraitBounds.maxLat },
      lon: { $gte: palkStraitBounds.minLon, $lte: palkStraitBounds.maxLon }
    }).limit(20);

    console.log(`📍 Found ${allCells.length} total cells in Palk Strait area\n`);

    if (allCells.length === 0) {
      console.log('❌ No cells found! This might mean:');
      console.log('   1. The coordinates are outside the grid coverage area');
      console.log('   2. The grid resolution doesn\'t match (expecting 0.2°)');
      console.log('   3. The lat/lon format is different in database');
      
      // Let's check what the actual grid coverage is
      console.log('\n🔍 Checking actual grid coverage...');
      const minLatCell = await Grid.findOne().sort({ lat: 1 }).limit(1);
      const maxLatCell = await Grid.findOne().sort({ lat: -1 }).limit(1);
      const minLonCell = await Grid.findOne().sort({ lon: 1 }).limit(1);
      const maxLonCell = await Grid.findOne().sort({ lon: -1 }).limit(1);
      
      console.log(`   Grid coverage:`);
      console.log(`   Latitude: ${minLatCell?.lat}° to ${maxLatCell?.lat}°`);
      console.log(`   Longitude: ${minLonCell?.lon}° to ${maxLonCell?.lon}°`);
    } else {
      // Show sample cells
      console.log('Sample cells:');
      allCells.slice(0, 5).forEach((cell, i) => {
        console.log(`   ${i + 1}. (${cell.lat}, ${cell.lon}) - is_land: ${cell.is_land}, obstacle: ${cell.obstacle || false}`);
      });

      // Count water vs land
      const waterCells = allCells.filter(c => !c.is_land);
      const landCells = allCells.filter(c => c.is_land);
      console.log(`\n📊 Breakdown:`);
      console.log(`   Water cells: ${waterCells.length}`);
      console.log(`   Land cells: ${landCells.length}`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPalkStraitCells();
