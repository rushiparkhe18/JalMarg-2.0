const mongoose = require('mongoose');
const Grid = require('./models/Grid');
require('dotenv').config();

async function analyzeGrid() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const grid = await Grid.findOne({}).lean();
    console.log(`Grid ID: ${grid._id}`);
    console.log(`Resolution: ${grid.resolution}°`);
    console.log(`Total cells: ${grid.cells.length}\n`);
    
    // Analyze bounds
    const lats = grid.cells.map(c => c.lat);
    const lons = grid.cells.map(c => c.lon);
    
    console.log('Grid Bounds:');
    console.log(`  Latitude: ${Math.min(...lats)}° to ${Math.max(...lats)}°`);
    console.log(`  Longitude: ${Math.min(...lons)}° to ${Math.max(...lons)}°\n`);
    
    // Check cells near Mumbai (18.97, 72.87)
    console.log('Cells near Mumbai (18.97°N, 72.87°E):');
    const nearMumbai = grid.cells.filter(c => 
      Math.abs(c.lat - 18.97) < 1 && Math.abs(c.lon - 72.87) < 1
    );
    console.log(`  Found ${nearMumbai.length} cells within 1° radius`);
    if (nearMumbai.length > 0) {
      nearMumbai.slice(0, 5).forEach(c => {
        console.log(`    (${c.lat}, ${c.lon}) - land: ${c.is_land}, obstacle: ${c.obstacle}`);
      });
    }
    
    // Check cells near Visakhapatnam (17.68, 83.30)
    console.log('\nCells near Visakhapatnam (17.68°N, 83.30°E):');
    const nearVizag = grid.cells.filter(c => 
      Math.abs(c.lat - 17.68) < 1 && Math.abs(c.lon - 83.30) < 1
    );
    console.log(`  Found ${nearVizag.length} cells within 1° radius`);
    if (nearVizag.length > 0) {
      nearVizag.slice(0, 5).forEach(c => {
        console.log(`    (${c.lat}, ${c.lon}) - land: ${c.is_land}, obstacle: ${c.obstacle}`);
      });
    }
    
    // Water vs land count
    const waterCells = grid.cells.filter(c => !c.is_land && !c.obstacle);
    const landCells = grid.cells.filter(c => c.is_land || c.obstacle);
    console.log(`\nWater cells: ${waterCells.length}`);
    console.log(`Land cells: ${landCells.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

analyzeGrid();
