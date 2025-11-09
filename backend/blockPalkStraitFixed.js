const mongoose = require('mongoose');
const Grid = require('./models/Grid');
require('dotenv').config();

/**
 * Mark Palk Strait (between India and Sri Lanka) as land
 * This prevents routes from trying to cross this narrow, shallow passage
 * Works with chunked grid structure where cells are stored as arrays
 */
async function blockPalkStrait() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define Palk Strait area (between India and Sri Lanka)
    // This narrow passage is too shallow for large cargo ships
    const palkStraitBounds = {
      minLat: 8.5,
      maxLat: 10.5,
      minLon: 79.0,
      maxLon: 80.5
    };

    console.log('🚫 Marking Palk Strait as LAND...');
    console.log(`   Area: ${palkStraitBounds.minLat}°-${palkStraitBounds.maxLat}°N, ${palkStraitBounds.minLon}°-${palkStraitBounds.maxLon}°E\n`);

    // Get all grid chunks
    const gridChunks = await Grid.find({});
    console.log(`📦 Processing ${gridChunks.length} grid chunks...\n`);

    let totalUpdated = 0;
    let updatedCells = [];

    // Update cells in each chunk
    for (const chunk of gridChunks) {
      let chunkModified = false;
      
      for (const cell of chunk.cells) {
        // Check if cell is in Palk Strait area and is water
        if (cell.lat >= palkStraitBounds.minLat && 
            cell.lat <= palkStraitBounds.maxLat &&
            cell.lon >= palkStraitBounds.minLon && 
            cell.lon <= palkStraitBounds.maxLon &&
            !cell.is_land) {
          
          // Mark cell as land
          cell.is_land = true;
          cell.obstacle = true;
          cell.note = 'Palk Strait - too shallow for large cargo ships';
          
          totalUpdated++;
          chunkModified = true;
          updatedCells.push({ lat: cell.lat, lon: cell.lon });
        }
      }
      
      // Save chunk if any cells were modified
      if (chunkModified) {
        await chunk.save();
        console.log(`   ✅ Saved chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks}`);
      }
    }

    console.log(`\n✅ Successfully marked ${totalUpdated} water cells as LAND\n`);
    
    if (totalUpdated > 0) {
      console.log('📍 Sample updated cells (first 10):');
      updatedCells.slice(0, 10).forEach((cell, i) => {
        console.log(`   ${i + 1}. (${cell.lat}, ${cell.lon})`);
      });
      console.log(`\nℹ️  These cells will now be avoided by all routing algorithms`);
      console.log(`   Mumbai → Chittagong will route around southern Sri Lanka`);
      console.log(`   Mumbai → Visakhapatnam will route around Sri Lanka\n`);
    } else {
      console.log(`ℹ️  No water cells found (Palk Strait already blocked)\n`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('\n🚀 Next: Restart backend server to test Mumbai → Chittagong route');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

blockPalkStrait();
