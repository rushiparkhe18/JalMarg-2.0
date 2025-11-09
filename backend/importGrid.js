const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

/**
 * Import grid data from gridData.json into MongoDB Atlas
 */

async function importGridToDatabase() {
  try {
    // Check if MongoDB URI is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Load grid data from file
    console.log('📂 Loading grid data from gridData.json...\n');
    const gridFilePath = path.join(__dirname, 'gridData.json');
    
    if (!fs.existsSync(gridFilePath)) {
      throw new Error('gridData.json not found! Run: node gridGeneratorEnhanced.js first');
    }
    
    const gridData = JSON.parse(fs.readFileSync(gridFilePath, 'utf8'));
    
    // Transform grid data for MongoDB
    console.log('📦 Preparing data for database import...\n');
    console.log(`   Total cells: ${gridData.cells.length.toLocaleString()}`);
    console.log(`   Land cells: ${gridData.metadata.landCells.toLocaleString()}`);
    console.log(`   Water cells: ${gridData.metadata.waterCells.toLocaleString()}`);
    console.log(`   Resolution: ${gridData.metadata.resolution}°\n`);
    
    const gridDocument = {
      name: 'Indian Ocean Navigation Grid (Shapefile)',
      bounds: {
        north: gridData.metadata.bounds.latMax,
        south: gridData.metadata.bounds.latMin,
        east: gridData.metadata.bounds.lonMax,
        west: gridData.metadata.bounds.lonMin
      },
      resolution: gridData.metadata.resolution,
      cells: gridData.cells.map(cell => ({
        lat: cell.lat,
        lon: cell.lon,
        is_land: cell.is_land || false,
        obstacle: cell.obstacle || false,
        weather: cell.weather ? {
          temperature: cell.weather.temperature,
          windSpeed: cell.weather.windSpeed,
          waveHeight: cell.weather.waveHeight,
          visibility: cell.weather.visibility,
          humidity: cell.weather.humidity,
          lastUpdated: cell.weather.lastUpdated
        } : null
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: gridData.metadata
    };
    
    // Check if grid already exists
    console.log('🔍 Checking for existing grid...\n');
    const existingGrid = await Grid.findOne({ name: gridDocument.name });
    
    if (existingGrid) {
      console.log('⚠️  Grid already exists. Updating...\n');
      await Grid.findByIdAndUpdate(existingGrid._id, gridDocument);
      console.log('✅ Grid updated successfully!');
    } else {
      console.log('💾 Saving new grid to database...\n');
      const newGrid = new Grid(gridDocument);
      await newGrid.save();
      console.log('✅ Grid saved successfully!');
    }
    
    // Display statistics
    const savedGrid = await Grid.findOne({ name: gridDocument.name });
    console.log('\n📊 Database Statistics:');
    console.log(`  Grid ID: ${savedGrid._id}`);
    console.log(`  Total Cells: ${savedGrid.cells.length}`);
    console.log(`  Region: ${savedGrid.name}`);
    console.log(`  Resolution: ${savedGrid.resolution}°`);
    
    console.log('\n✨ Grid import complete!\n');
    
  } catch (error) {
    console.error('❌ Error importing grid:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
  }
}

// Run the import
if (require.main === module) {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   📥 GRID DATA IMPORTER');
  console.log('   MongoDB Atlas Integration');
  console.log('═══════════════════════════════════════════════════\n');
  
  importGridToDatabase()
    .then(() => {
      console.log('✅ Import process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importGridToDatabase };
