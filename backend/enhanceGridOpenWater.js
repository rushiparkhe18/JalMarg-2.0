/**
 * Enhance Grid: Add open_water classification to Bay of Bengal cells
 * Fixes A* routing by marking cells far from coast as navigable open water
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

async function enhanceGrid() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔧 ENHANCING GRID: Adding open_water classification');
    console.log('═'.repeat(80) + '\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📦 Loading all grid chunks...');
    const chunks = await Grid.find({ isChunked: true }).lean(); // Use lean() for better performance
    console.log(`✅ Loaded ${chunks.length} chunks\n`);

    // Build global land cell index for fast lookups
    console.log('�️ Building land cell index...');
    const landCells = new Set();
    let totalCells = 0;
    
    for (const chunk of chunks) {
      if (!chunk.cells) continue;
      for (const cell of chunk.cells) {
        totalCells++;
        if (cell.is_land || cell.obstacle) {
          const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
          landCells.add(key);
        }
      }
    }
    
    console.log(`✅ Indexed ${landCells.size.toLocaleString()} land cells from ${totalCells.toLocaleString()} total cells\n`);

    let waterCells = 0;
    let openWaterMarked = 0;
    let coastalMarked = 0;

    console.log('🔍 Classifying water cells...\n');

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunkId = chunks[chunkIndex]._id;
      const chunkDoc = await Grid.findById(chunkId); // Load mutable version
      
      if (!chunkDoc || !chunkDoc.cells || chunkDoc.cells.length === 0) continue;

      let chunkModified = false;
      const resolution = 0.2;
      for (let i = 0; i < chunkDoc.cells.length; i++) {
        const cell = chunkDoc.cells[i];

        // Skip land cells
        if (cell.is_land || cell.obstacle) continue;
        waterCells++;

        // Check if cell has land in immediate neighbors (8 directions)
        let hasLandNearby = false;

        for (let dLat = -resolution; dLat <= resolution; dLat += resolution) {
          for (let dLon = -resolution; dLon <= resolution; dLon += resolution) {
            if (dLat === 0 && dLon === 0) continue;

            const checkLat = cell.lat + dLat;
            const checkLon = cell.lon + dLon;
            const key = `${checkLat.toFixed(1)},${checkLon.toFixed(1)}`;

            if (landCells.has(key)) {
              hasLandNearby = true;
              break;
            }
          }
          if (hasLandNearby) break;
        }

        // Classify: open_water if no land nearby, coastal otherwise
        if (!hasLandNearby) {
          chunkDoc.cells[i].zone = 'open_water';
          chunkDoc.cells[i].open_water = true;
          openWaterMarked++;
          chunkModified = true;
        } else {
          chunkDoc.cells[i].zone = 'coastal';
          chunkDoc.cells[i].open_water = false;
          coastalMarked++;
          chunkModified = true;
        }
      }

      // Save chunk if modified
      if (chunkModified) {
        await chunkDoc.save();
        
        if ((chunkIndex + 1) % 2 === 0 || chunkIndex === chunks.length - 1) {
          console.log(`   ✅ Processed ${chunkIndex + 1}/${chunks.length} chunks (${openWaterMarked.toLocaleString()} open water)`);
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('📊 CLASSIFICATION SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log(`Total cells processed:     ${totalCells.toLocaleString()}`);
    console.log(`Water cells found:         ${waterCells.toLocaleString()} (${(waterCells/totalCells*100).toFixed(1)}%)`);
    console.log(`🌊 Open water cells:       ${openWaterMarked.toLocaleString()} (${(openWaterMarked/waterCells*100).toFixed(1)}% of water)`);
    console.log(`🏖️ Coastal cells:          ${coastalMarked.toLocaleString()} (${(coastalMarked/waterCells*100).toFixed(1)}% of water)`);

    console.log('\n✅ Grid enhanced successfully!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

enhanceGrid();
