/**
 * REGENERATE GRID WITH LAND DETECTION using IsItWater API
 * 
 * This script will:
 * 1. Generate a new grid with 100% accurate land/water detection using IsItWater API
 * 2. Clear old grid data from MongoDB
 * 3. Import the new grid with land markers
 * 
 * Estimated time: 15-20 minutes for 7,171 grid points
 * Requirements: RAPIDAPI_KEY must be set in .env file
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');
const { generateGrid } = require('./gridGenerator');

async function regenerateGrid() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   🔄 GRID REGENERATION WITH LAND DETECTION');
    console.log('═══════════════════════════════════════════════════\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Delete old grid data
    console.log('🗑️  Deleting old grid data...\n');
    const deleteResult = await Grid.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} old grid(s)\n`);

    // Generate new grid with land detection
    console.log('🌊 Generating new grid with IsItWater API land detection...');
    console.log('⏱️  Estimated time: 15-20 minutes for 7,171 points...\n');
    console.log('💡 API Info: Using IsItWater API (100% accuracy)\n');
    
    const gridData = await generateGrid();

    // Import to MongoDB
    console.log('\n📦 Importing new grid to MongoDB...\n');
    
    const gridDocument = {
      name: 'Indian Ocean Navigation Grid - Land Detected',
      bounds: gridData.metadata.bounds,
      resolution: gridData.metadata.resolution,
      cells: gridData.grid.map(point => ({
        lat: point.lat,
        lon: point.lon,
        is_land: point.is_land || false,
        weatherData: {
          temperature: point.weather.temperature,
          windSpeed: point.weather.windSpeed,
          windDirection: point.weather.windDirection,
          waveHeight: point.weather.waveHeight,
          visibility: point.weather.visibility,
        },
        obstacle: point.obstacle || point.is_land || false,
        cost: point.cost || 1,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newGrid = new Grid(gridDocument);
    await newGrid.save();

    // Display statistics
    console.log('✅ Grid imported successfully!\n');
    console.log('📊 Final Statistics:');
    console.log(`   Grid ID: ${newGrid._id}`);
    console.log(`   Total Cells: ${newGrid.cells.length}`);
    console.log(`   Water Cells: ${gridData.metadata.waterPoints}`);
    console.log(`   Land Cells: ${gridData.metadata.landPoints}`);
    console.log(`   Resolution: ${newGrid.resolution}°\n`);

    console.log('🎉 Grid regeneration complete!');
    console.log('   Your maritime routes will now avoid land masses.\n');

  } catch (error) {
    console.error('❌ Error regenerating grid:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
  }
}

// Run the regeneration
if (require.main === module) {
  regenerateGrid()
    .then(() => {
      console.log('✅ Regeneration process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Regeneration failed:', error);
      process.exit(1);
    });
}

module.exports = { regenerateGrid };
