/**
 * Quick verification that open_water classification exists
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

async function verifyOpenWater() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 QUICK VERIFICATION: Open Water Classification');
    console.log('═'.repeat(80) + '\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Sample some cells to verify the changes
    const sampleAreas = [
      { name: 'Visakhapatnam Offshore', lat: 17.40, lon: 83.20 },
      { name: 'Bay of Bengal Central', lat: 15.40, lon: 83.20 },
      { name: 'Bay of Bengal South', lat: 14.00, lon: 83.00 }
    ];

    for (const area of sampleAreas) {
      console.log(`\n📍 ${area.name} (${area.lat}°N, ${area.lon}°E):`);

      // Get chunks without lean() to ensure fresh data
      const chunks = await Grid.find({ isChunked: true });
      
      let foundCell = null;
      for (const chunk of chunks) {
        if (!chunk.cells) continue;
        const cell = chunk.cells.find(c => 
          Math.abs(c.lat - area.lat) < 0.01 && 
          Math.abs(c.lon - area.lon) < 0.01
        );
        if (cell) {
          foundCell = cell;
          break;
        }
      }

      if (foundCell) {
        console.log(`   ✅ Found cell:`);
        console.log(`      Lat: ${foundCell.lat.toFixed(2)}°, Lon: ${foundCell.lon.toFixed(2)}°`);
        console.log(`      is_land: ${foundCell.is_land}`);
        console.log(`      zone: ${foundCell.zone || 'undefined'}`);
        console.log(`      open_water: ${foundCell.open_water !== undefined ? foundCell.open_water : 'undefined'}`);
      } else {
        console.log(`   ❌ Cell not found`);
      }
    }

    // Get overall statistics
    console.log('\n' + '═'.repeat(80));
    console.log('📊 OVERALL STATISTICS');
    console.log('═'.repeat(80) + '\n');

    const chunks = await Grid.find({ isChunked: true });
    
    let totalCells = 0;
    let waterCells = 0;
    let openWaterCells = 0;
    let coastalCells = 0;

    for (const chunk of chunks) {
      if (!chunk.cells) continue;
      for (const cell of chunk.cells) {
        totalCells++;
        if (!cell.is_land && !cell.obstacle) {
          waterCells++;
          if (cell.zone === 'open_water' || cell.open_water === true) {
            openWaterCells++;
          } else {
            coastalCells++;
          }
        }
      }
    }

    console.log(`Total cells:        ${totalCells.toLocaleString()}`);
    console.log(`Water cells:        ${waterCells.toLocaleString()} (${(waterCells/totalCells*100).toFixed(1)}%)`);
    console.log(`🌊 Open water:      ${openWaterCells.toLocaleString()} (${(openWaterCells/waterCells*100).toFixed(1)}% of water)`);
    console.log(`🏖️ Coastal:         ${coastalCells.toLocaleString()} (${(coastalCells/waterCells*100).toFixed(1)}% of water)`);

    if (openWaterCells > 0) {
      console.log('\n✅ SUCCESS! Grid has been enhanced with open_water classification!\n');
    } else {
      console.log('\n❌ WARNING: No open_water cells found. Enhancement may have failed.\n');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyOpenWater();
