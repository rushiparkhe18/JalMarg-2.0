const mongoose = require('mongoose');
const Grid = require('./models/Grid');
require('dotenv').config();

/**
 * Mark Palk Strait (between India and Sri Lanka) as land
 * This prevents routes from trying to cross this narrow, shallow passage
 */
async function blockPalkStrait() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Palk Strait coordinates (between India and Sri Lanka)
    const palkStraitBounds = {
      latMin: 8.5,
      latMax: 10.5,
      lonMin: 79.0,
      lonMax: 80.5
    };

    console.log('🚫 Marking Palk Strait as LAND...');
    console.log(`   Area: ${palkStraitBounds.latMin}°-${palkStraitBounds.latMax}°N, ${palkStraitBounds.lonMin}°-${palkStraitBounds.lonMax}°E\n`);

    // Find all cells in Palk Strait area
    const palkCells = await Grid.find({
      lat: { $gte: palkStraitBounds.latMin, $lte: palkStraitBounds.latMax },
      lon: { $gte: palkStraitBounds.lonMin, $lte: palkStraitBounds.lonMax },
      is_land: false // Only mark water cells
    });

    console.log(`📍 Found ${palkCells.length} water cells in Palk Strait`);

    if (palkCells.length === 0) {
      console.log('ℹ️  No water cells found (may already be marked as land)');
      return;
    }

    // Mark them as land
    const result = await Grid.updateMany(
      {
        lat: { $gte: palkStraitBounds.latMin, $lte: palkStraitBounds.latMax },
        lon: { $gte: palkStraitBounds.lonMin, $lte: palkStraitBounds.lonMax },
        is_land: false
      },
      {
        $set: { 
          is_land: true,
          obstacle: true,
          note: 'Palk Strait - too shallow for large cargo ships'
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} cells`);
    console.log('🚢 Large ships will now route around southern Sri Lanka automatically\n');

    // Show sample of blocked cells
    const sample = palkCells.slice(0, 5);
    console.log('📋 Sample blocked cells:');
    sample.forEach(cell => {
      console.log(`   • (${cell.lat}, ${cell.lon})`);
    });

    console.log('\n✅ Palk Strait successfully blocked!');
    console.log('🔄 Restart your backend to apply changes.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

blockPalkStrait();
