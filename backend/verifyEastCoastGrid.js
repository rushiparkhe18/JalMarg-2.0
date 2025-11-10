/**
 * Verify East Coast Grid Coverage - Visakhapatnam Area
 * Check if Bay of Bengal cells near Visakhapatnam are properly classified
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

async function verifyEastCoastGrid() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 VERIFYING EAST COAST GRID COVERAGE - Visakhapatnam Area');
    console.log('═'.repeat(80) + '\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define critical areas around Visakhapatnam
    const areas = [
      {
        name: 'Visakhapatnam Port',
        center: { lat: 17.68, lon: 83.30 },
        desc: 'Port location (should be coastal/land)'
      },
      {
        name: 'Visakhapatnam Offshore (17.4°N, 83.2°E)',
        center: { lat: 17.40, lon: 83.20 },
        desc: 'Waypoint location (should be open water)'
      },
      {
        name: 'Bay of Bengal East Coast',
        center: { lat: 16.60, lon: 83.20 },
        desc: 'Mid-approach area (should be open water)'
      },
      {
        name: 'Bay of Bengal Central',
        center: { lat: 15.40, lon: 83.20 },
        desc: 'Central Bay approach (should be open water)'
      },
      {
        name: 'Bay of Bengal South',
        center: { lat: 14.00, lon: 83.00 },
        desc: 'South Bay area (should be open water)'
      }
    ];

    console.log('📍 Checking critical waypoint areas:\n');

    for (const area of areas) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📍 ${area.name}`);
      console.log(`   Center: ${area.center.lat.toFixed(2)}°N, ${area.center.lon.toFixed(2)}°E`);
      console.log(`   Expected: ${area.desc}`);
      console.log(`${'─'.repeat(80)}`);

      // Check cells in 1° radius around this point
      const minLat = area.center.lat - 1.0;
      const maxLat = area.center.lat + 1.0;
      const minLon = area.center.lon - 1.0;
      const maxLon = area.center.lon + 1.0;

      const chunks = await Grid.find({ isChunked: true }).select('cells').lean();
      
      const nearbyCells = [];
      for (const chunk of chunks) {
        if (!chunk.cells) continue;
        for (const cell of chunk.cells) {
          if (cell.lat >= minLat && cell.lat <= maxLat &&
              cell.lon >= minLon && cell.lon <= maxLon) {
            nearbyCells.push(cell);
          }
        }
      }

      if (nearbyCells.length === 0) {
        console.log(`   ❌ NO CELLS FOUND in this area!`);
        console.log(`   🔧 ACTION NEEDED: Grid needs to be regenerated with proper coverage`);
        continue;
      }

      // Analyze cells
      const waterCells = nearbyCells.filter(c => !c.is_land && !c.obstacle);
      const landCells = nearbyCells.filter(c => c.is_land);
      const openWaterCells = waterCells.filter(c => c.zone === 'open_water' || c.open_water === true);
      const coastalCells = waterCells.filter(c => !c.zone || c.zone === 'coastal');

      console.log(`\n   📊 Cell Statistics:`);
      console.log(`      Total cells: ${nearbyCells.length}`);
      console.log(`      Water cells: ${waterCells.length} (${(waterCells.length/nearbyCells.length*100).toFixed(1)}%)`);
      console.log(`      Land cells:  ${landCells.length} (${(landCells.length/nearbyCells.length*100).toFixed(1)}%)`);
      console.log(`      Open water:  ${openWaterCells.length} (${(openWaterCells.length/nearbyCells.length*100).toFixed(1)}%)`);
      console.log(`      Coastal:     ${coastalCells.length} (${(coastalCells.length/nearbyCells.length*100).toFixed(1)}%)`);

      // Find exact match or nearest cells
      const exactMatch = nearbyCells.find(c => 
        Math.abs(c.lat - area.center.lat) < 0.1 && 
        Math.abs(c.lon - area.center.lon) < 0.1
      );

      if (exactMatch) {
        console.log(`\n   ✅ Found cell at waypoint coordinate:`);
        console.log(`      Lat: ${exactMatch.lat.toFixed(2)}°N, Lon: ${exactMatch.lon.toFixed(2)}°E`);
        console.log(`      Type: ${exactMatch.is_land ? '🏝️ LAND' : '🌊 WATER'}`);
        if (!exactMatch.is_land) {
          console.log(`      Zone: ${exactMatch.zone || exactMatch.open_water ? '🌊 Open Water' : '🏖️ Coastal'}`);
        }
        console.log(`      Obstacle: ${exactMatch.obstacle ? '⚠️ YES' : '✅ No'}`);
      } else {
        console.log(`\n   ⚠️  No cell at exact waypoint coordinate`);
        
        // Find nearest water cells
        const nearestWater = waterCells
          .map(c => ({
            ...c,
            dist: Math.sqrt(Math.pow(c.lat - area.center.lat, 2) + Math.pow(c.lon - area.center.lon, 2))
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3);

        if (nearestWater.length > 0) {
          console.log(`\n   📍 Nearest water cells:`);
          nearestWater.forEach((c, i) => {
            const distKm = c.dist * 111;
            const type = c.zone === 'open_water' || c.open_water ? '🌊 Open Water' : '🏖️ Coastal';
            console.log(`      ${i+1}. (${c.lat.toFixed(2)}°N, ${c.lon.toFixed(2)}°E) - ${type} - ${distKm.toFixed(1)}km away`);
          });
        }
      }

      // Check grid resolution
      if (waterCells.length > 0) {
        const latValues = [...new Set(waterCells.map(c => c.lat))].sort((a,b) => a-b);
        const lonValues = [...new Set(waterCells.map(c => c.lon))].sort((a,b) => a-b);
        
        const latResolution = latValues.length > 1 ? latValues[1] - latValues[0] : 'N/A';
        const lonResolution = lonValues.length > 1 ? lonValues[1] - lonValues[0] : 'N/A';
        
        console.log(`\n   🔍 Grid Resolution:`);
        console.log(`      Latitude steps:  ${latResolution !== 'N/A' ? latResolution.toFixed(2) : 'N/A'}°`);
        console.log(`      Longitude steps: ${lonResolution !== 'N/A' ? lonResolution.toFixed(2) : 'N/A'}°`);
        
        if (latResolution !== 'N/A' && latResolution > 0.3) {
          console.log(`      ⚠️  Resolution might be too coarse (>0.3°) for accurate coastal routing`);
        }
      }
    }

    console.log(`\n${'═'.repeat(80)}`);
    console.log('📋 RECOMMENDATIONS:');
    console.log(`${'═'.repeat(80)}\n`);

    console.log('1. ✅ If all waypoint areas show water cells with open_water classification:');
    console.log('      → Grid is properly configured');
    console.log('      → A* should be able to navigate\n');

    console.log('2. ⚠️  If waypoint areas show NO CELLS or only coastal/land:');
    console.log('      → Grid needs regeneration with finer resolution');
    console.log('      → Run: node backend/gridGenerator.js with resolution=0.2\n');

    console.log('3. 🔧 If resolution is too coarse (>0.3°):');
    console.log('      → Regenerate grid with resolution=0.1 or 0.2');
    console.log('      → This ensures coastal areas are properly classified\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyEastCoastGrid();
