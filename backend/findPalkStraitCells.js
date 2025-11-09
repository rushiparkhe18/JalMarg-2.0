require('dotenv').config();
const mongoose = require('mongoose');
const Grid = require('./models/Grid');

async function findPalkStraitCells() {
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

    console.log('🔍 Searching for cells in Palk Strait area...');
    console.log(`   Area: ${palkStraitBounds.minLat}°-${palkStraitBounds.maxLat}°N, ${palkStraitBounds.minLon}°-${palkStraitBounds.maxLon}°E\n`);

    // Find all Grid chunks
    const gridChunks = await Grid.find({});
    console.log(`📦 Found ${gridChunks.length} grid chunks in database\n`);

    let waterCellsInPalkStrait = [];
    let landCellsInPalkStrait = [];
    let totalCellsInPalkStrait = 0;

    // Search through each chunk's cells
    for (const chunk of gridChunks) {
      for (const cell of chunk.cells) {
        // Check if cell is in Palk Strait area
        if (cell.lat >= palkStraitBounds.minLat && 
            cell.lat <= palkStraitBounds.maxLat &&
            cell.lon >= palkStraitBounds.minLon && 
            cell.lon <= palkStraitBounds.maxLon) {
          
          totalCellsInPalkStrait++;
          
          if (cell.is_land) {
            landCellsInPalkStrait.push(cell);
          } else {
            waterCellsInPalkStrait.push(cell);
          }
        }
      }
    }

    console.log(`📍 Found ${totalCellsInPalkStrait} cells in Palk Strait area:`);
    console.log(`   💧 Water cells: ${waterCellsInPalkStrait.length}`);
    console.log(`   🏔️  Land cells: ${landCellsInPalkStrait.length}\n`);

    if (waterCellsInPalkStrait.length > 0) {
      console.log('🌊 Sample WATER cells (first 10):');
      waterCellsInPalkStrait.slice(0, 10).forEach((cell, i) => {
        console.log(`   ${i + 1}. (${cell.lat}, ${cell.lon}) - obstacle: ${cell.obstacle || false}`);
      });
      console.log('\n✅ These water cells should be marked as land to block routing through Palk Strait');
    } else {
      console.log('✅ No water cells found - Palk Strait is already blocked!');
    }

    if (landCellsInPalkStrait.length > 0) {
      console.log(`\n🏔️  Sample LAND cells (first 5):`);
      landCellsInPalkStrait.slice(0, 5).forEach((cell, i) => {
        console.log(`   ${i + 1}. (${cell.lat}, ${cell.lon})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findPalkStraitCells();
