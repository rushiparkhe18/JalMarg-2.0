require('dotenv').config();
const mongoose = require('mongoose');
const Grid = require('./models/Grid');

async function diagnoseRoute() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Visakhapatnam → Mumbai route
    const start = { name: 'Visakhapatnam', lat: 17.68, lon: 83.30 };
    const end = { name: 'Mumbai', lat: 18.97, lon: 72.87 };

    console.log(`🔍 Diagnosing route: ${start.name} → ${end.name}`);
    console.log(`   Start: (${start.lat}, ${start.lon})`);
    console.log(`   End: (${end.lat}, ${end.lon})\n`);

    // Get all grid chunks
    const gridChunks = await Grid.find({});
    console.log(`📦 Found ${gridChunks.length} grid chunks\n`);

    // Build cell map
    const cellMap = new Map();
    let totalCells = 0;
    let waterCells = 0;
    let landCells = 0;

    for (const chunk of gridChunks) {
      for (const cell of chunk.cells) {
        const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
        cellMap.set(key, cell);
        totalCells++;
        if (cell.is_land) landCells++;
        else waterCells++;
      }
    }

    console.log(`📊 Grid statistics:`);
    console.log(`   Total cells: ${totalCells}`);
    console.log(`   Water cells: ${waterCells}`);
    console.log(`   Land cells: ${landCells}\n`);

    // Check if start/end points exist in grid
    const startKey = `${start.lat.toFixed(1)},${start.lon.toFixed(1)}`;
    const endKey = `${end.lat.toFixed(1)},${end.lon.toFixed(1)}`;
    
    const startCell = cellMap.get(startKey);
    const endCell = cellMap.get(endKey);

    console.log(`📍 Start cell (${startKey}): ${startCell ? (startCell.is_land ? 'LAND ❌' : 'WATER ✅') : 'NOT FOUND ❌'}`);
    console.log(`📍 End cell (${endKey}): ${endCell ? (endCell.is_land ? 'LAND ❌' : 'WATER ✅') : 'NOT FOUND ❌'}\n`);

    // Check the path between them - look for Palk Strait blockage
    console.log('🔍 Checking critical areas along the route:\n');

    // Southeast coast of India (where route needs to go)
    const criticalAreas = [
      { name: 'Visakhapatnam area', lat: 17.6, lon: 83.2 },
      { name: 'Chennai area', lat: 13.0, lon: 80.2 },
      { name: 'South of Palk Strait', lat: 8.0, lon: 79.5 },
      { name: 'Southern Sri Lanka', lat: 6.0, lon: 80.0 },
      { name: 'Southwest India', lat: 10.0, lon: 75.0 },
      { name: 'Mumbai area', lat: 19.0, lon: 72.8 }
    ];

    for (const area of criticalAreas) {
      const areaKey = `${area.lat.toFixed(1)},${area.lon.toFixed(1)}`;
      const areaCell = cellMap.get(areaKey);
      const status = areaCell ? (areaCell.is_land ? '🏔️  LAND' : '🌊 WATER') : '❓ NOT IN GRID';
      console.log(`   ${area.name.padEnd(25)} (${area.lat}, ${area.lon}): ${status}`);
    }

    // Check if there are water cells blocking the route
    console.log('\n🔍 Checking for potential blockages:\n');

    // Check Palk Strait area (should all be land now)
    let palkStraitWaterCells = 0;
    for (const [key, cell] of cellMap) {
      if (cell.lat >= 8.5 && cell.lat <= 10.5 &&
          cell.lon >= 79.0 && cell.lon <= 80.5 &&
          !cell.is_land) {
        palkStraitWaterCells++;
      }
    }
    console.log(`   Palk Strait water cells: ${palkStraitWaterCells} ${palkStraitWaterCells === 0 ? '✅' : '❌'}`);

    // Check if there's a gap in the grid coverage
    console.log('\n🗺️  Grid coverage check:');
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    for (const [key, cell] of cellMap) {
      minLat = Math.min(minLat, cell.lat);
      maxLat = Math.max(maxLat, cell.lat);
      minLon = Math.min(minLon, cell.lon);
      maxLon = Math.max(maxLon, cell.lon);
    }

    console.log(`   Latitude: ${minLat}° to ${maxLat}°`);
    console.log(`   Longitude: ${minLon}° to ${maxLon}°`);
    console.log(`   Resolution: 0.2° (~22km)\n`);

    // Check if route requires going outside grid
    if (start.lat < minLat || start.lat > maxLat || 
        start.lon < minLon || start.lon > maxLon) {
      console.log('❌ START port is outside grid coverage!\n');
    }
    if (end.lat < minLat || end.lat > maxLat || 
        end.lon < minLon || end.lon > maxLon) {
      console.log('❌ END port is outside grid coverage!\n');
    }

    // Check specific area around southern India that might need blocking
    console.log('🔍 Checking area around EASTERN INDIA coast (potential strait/narrow passage):\n');
    
    const easternIndiaCoast = [];
    for (const [key, cell] of cellMap) {
      // Area between 10°-14°N, 79°-81°E (south of Chennai, could be narrow)
      if (cell.lat >= 10 && cell.lat <= 14 &&
          cell.lon >= 79 && cell.lon <= 81 &&
          !cell.is_land) {
        easternIndiaCoast.push(cell);
      }
    }

    console.log(`   Found ${easternIndiaCoast.length} water cells in eastern coast area (10-14°N, 79-81°E)`);
    if (easternIndiaCoast.length > 0 && easternIndiaCoast.length < 50) {
      console.log(`   ⚠️  This might be a narrow passage that needs checking`);
      console.log(`   Sample cells (first 10):`);
      easternIndiaCoast.slice(0, 10).forEach((cell, i) => {
        console.log(`      ${i + 1}. (${cell.lat}, ${cell.lon})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnoseRoute();
