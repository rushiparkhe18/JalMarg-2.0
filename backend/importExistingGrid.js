/**
 * Import EXISTING gridData.json into MongoDB
 * (Skips regeneration, just imports the fixed coastal cells grid)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Grid = require('./models/Grid');

async function importExistingGrid() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Load existing grid data
    console.log('📂 Loading gridData.json...\n');
    const gridPath = path.join(__dirname, 'gridData.json');
    const gridData = JSON.parse(fs.readFileSync(gridPath, 'utf8'));

    console.log(`📊 Grid Statistics:`);
    console.log(`   Total Cells: ${gridData.grid.length}`);
    console.log(`   Water Cells: ${gridData.grid.filter(c => !c.is_land).length}`);
    console.log(`   Land Cells: ${gridData.grid.filter(c => c.is_land).length}`);
    console.log(`   Coastal Cells: ${gridData.grid.filter(c => c.coastal).length || 0}\n`);

    // Transform grid data for MongoDB
    console.log('📦 Preparing data for database import...\n');
    const gridDocument = {
      name: 'Indian Ocean Navigation Grid (Coastal Fixed)',
      bounds: gridData.metadata.bounds || {
        north: 30.58,
        south: -38.4,
        east: 142.48,
        west: 22.15
      },
      resolution: gridData.metadata.resolution || 1,
      cells: gridData.grid.map(point => ({
        lat: point.lat,
        lon: point.lon,
        is_land: point.is_land || false,
        coastal: point.coastal || false,
        weatherData: {
          temperature: point.weather?.temperature || null,
          windSpeed: point.weather?.windSpeed || null,
          windDirection: point.weather?.windDirection || null,
          waveHeight: point.weather?.waveHeight || null,
          visibility: point.weather?.visibility || null,
        },
        obstacle: point.obstacle || point.is_land || false,
        cost: point.cost || 1,
      })),
      createdAt: new Date(),
      metadata: {
        source: 'gridData.json (coastal cells fixed)',
        totalCells: gridData.grid.length,
        waterCells: gridData.grid.filter(c => !c.is_land).length,
        landCells: gridData.grid.filter(c => c.is_land).length,
        coastalCells: gridData.grid.filter(c => c.coastal).length || 0,
        coastalFixDate: gridData.metadata.coastalFixDate,
        coastalThreshold: gridData.metadata.coastalThreshold
      }
    };

    // Delete existing grid data
    console.log('🗑️  Removing old grid data from database...\n');
    const deleteResult = await Grid.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} old grid(s)\n`);

    // Insert new grid data
    console.log('💾 Importing grid into database...\n');
    const grid = new Grid(gridDocument);
    await grid.save();

    console.log('✅ Grid successfully imported to MongoDB!\n');
    console.log('📊 Database Summary:');
    console.log(`   Grid Name: ${grid.name}`);
    console.log(`   Total Cells: ${grid.cells.length}`);
    console.log(`   Water Cells: ${grid.metadata.waterCells}`);
    console.log(`   Land Cells: ${grid.metadata.landCells}`);
    console.log(`   Coastal Cells: ${grid.metadata.coastalCells}`);
    console.log(`   Resolution: ${grid.resolution}°\n`);

    mongoose.connection.close();
    console.log('✨ Import complete! Database connection closed.\n');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run import
if (require.main === module) {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   📥 IMPORT EXISTING GRID TO MONGODB');
  console.log('   (Coastal Cells Fixed)');
  console.log('═══════════════════════════════════════════════════\n');
  
  importExistingGrid();
}

module.exports = { importExistingGrid };
