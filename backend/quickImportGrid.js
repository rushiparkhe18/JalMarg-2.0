const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Grid = require('./models/Grid');

/**
 * QUICK IMPORT: Load pre-computed grid from file (NO API calls!)
 * This imports the saved gridData.json directly to MongoDB
 * Use this instead of regenerating the grid every time
 */

async function quickImport() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   ⚡ QUICK GRID IMPORT');
    console.log('   Load pre-computed grid (NO API calls!)');
    console.log('═══════════════════════════════════════════════════\n');

    // Check if grid file exists
    const gridPath = path.join(__dirname, 'gridData.json');
    if (!fs.existsSync(gridPath)) {
      console.error('❌ ERROR: gridData.json not found!');
      console.log('\nPlease generate the grid first:');
      console.log('  node gridGenerator.js\n');
      process.exit(1);
    }

    // Load grid data
    console.log('📂 Loading grid data from file...');
    const gridData = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
    console.log(`✅ Loaded ${gridData.grid.length} grid points\n`);

    // Display grid info
    const waterPoints = gridData.grid.filter(p => !p.is_land).length;
    const landPoints = gridData.grid.filter(p => p.is_land).length;
    
    console.log('📊 Grid Summary:');
    console.log(`   Total Points: ${gridData.grid.length}`);
    console.log(`   🌊 Water: ${waterPoints} (${((waterPoints/gridData.grid.length)*100).toFixed(1)}%)`);
    console.log(`   🏝️  Land: ${landPoints} (${((landPoints/gridData.grid.length)*100).toFixed(1)}%)`);
    
    // Safely display metadata
    if (gridData.metadata) {
      if (gridData.metadata.latRange && gridData.metadata.latRange.length === 2) {
        console.log(`   Lat Range: ${gridData.metadata.latRange[0]}° to ${gridData.metadata.latRange[1]}°`);
      }
      if (gridData.metadata.lonRange && gridData.metadata.lonRange.length === 2) {
        console.log(`   Lon Range: ${gridData.metadata.lonRange[0]}° to ${gridData.metadata.lonRange[1]}°`);
      }
      if (gridData.metadata.resolution) {
        console.log(`   Resolution: ${gridData.metadata.resolution}°`);
      }
    }
    console.log('');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing grid data
    console.log('🗑️  Clearing old grid data...');
    await Grid.deleteMany({});
    console.log('✅ Old data cleared\n');

    // Prepare grid document
    console.log('💾 Importing grid to MongoDB...');
    const gridDoc = new Grid({
      name: gridData.metadata.name || 'Indian Ocean Navigation Grid',
      resolution: gridData.metadata.resolution || 0.5,
      bounds: gridData.metadata.bounds || {
        north: 30.58,
        south: -38.4,
        east: 142.48,
        west: 22.15
      },
      cells: gridData.grid.map(point => ({
        lat: point.lat,
        lon: point.lon,
        is_land: point.is_land || false,  // Store land status permanently
        obstacle: point.obstacle || point.is_land || false,  // Backward compat
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

    // Save to database
    await gridDoc.save();
    
    console.log('✅ Grid imported successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('   ✨ IMPORT COMPLETE');
    console.log(`   ${gridData.grid.length} points ready for navigation`);
    console.log('═══════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run import
if (require.main === module) {
  quickImport();
}

module.exports = quickImport;
