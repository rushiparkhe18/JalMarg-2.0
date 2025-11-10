/**
 * Manually mark strategic waypoints as open_water for Southeast routes
 * Fast solution: Only updates ~50 critical cells instead of 157,950
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

// Critical waypoints from all Southeast route corridors
const WAYPOINTS = [
  // Mumbai→Visakhapatnam
  { lat: 18.00, lon: 72.00, name: 'Mumbai Escape', zone: 'open_water' },
  { lat: 16.00, lon: 75.00, name: 'Bay Southwest', zone: 'open_water' },
  { lat: 14.00, lon: 78.60, name: 'Bay Central', zone: 'open_water' },
  { lat: 12.60, lon: 81.80, name: 'Bay Southeast', zone: 'open_water' },
  { lat: 15.40, lon: 83.20, name: 'Vizag Approach', zone: 'open_water' },
  { lat: 17.40, lon: 83.20, name: 'Vizag Offshore', zone: 'open_water' },
  { lat: 16.50, lon: 81.00, name: 'Vizag Mid-Approach', zone: 'open_water' },
  
  // Mumbai→Paradip (additional waypoints)
  { lat: 18.50, lon: 82.50, name: 'Paradip Approach', zone: 'open_water' },
  { lat: 19.50, lon: 85.00, name: 'Paradip Offshore', zone: 'open_water' },
  
  // Mumbai→Haldia (additional waypoints)
  { lat: 19.00, lon: 86.00, name: 'Haldia Approach', zone: 'open_water' },
  { lat: 20.50, lon: 87.50, name: 'Haldia Offshore', zone: 'open_water' },
  
  // Mumbai→Chittagong (additional waypoints)
  { lat: 20.00, lon: 88.00, name: 'Chittagong Approach', zone: 'open_water' },
  { lat: 21.50, lon: 90.50, name: 'Chittagong Offshore', zone: 'open_water' },
  
  // Wide corridor points for SAFE routes
  { lat: 10.00, lon: 79.00, name: 'Deep South Corridor', zone: 'open_water' },
  { lat: 11.00, lon: 80.00, name: 'Deep South Mid', zone: 'open_water' },
  { lat: 13.00, lon: 79.00, name: 'Bay Southwest Deep', zone: 'open_water' },
  { lat: 15.00, lon: 80.00, name: 'Bay Mid-West', zone: 'open_water' },
  { lat: 14.00, lon: 82.00, name: 'Bay Mid-East', zone: 'open_water' },
  
  // Additional offshore buffer zones (to create routing corridors)
  { lat: 17.00, lon: 74.00, name: 'West Coast Offshore', zone: 'open_water' },
  { lat: 15.00, lon: 76.00, name: 'Mid Bay West', zone: 'open_water' },
  { lat: 13.00, lon: 77.00, name: 'South Bay West', zone: 'open_water' },
  { lat: 16.00, lon: 82.00, name: 'East Coast Offshore', zone: 'open_water' },
  { lat: 18.00, lon: 84.00, name: 'North Bay Mid', zone: 'open_water' },
];

// Coastal waypoints (near ports - should be coastal)
const COASTAL_WAYPOINTS = [
  { lat: 18.97, lon: 72.87, name: 'Mumbai Port', zone: 'coastal' },
  { lat: 17.68, lon: 83.30, name: 'Visakhapatnam Port', zone: 'coastal' },
  { lat: 20.27, lon: 85.83, name: 'Paradip Port', zone: 'coastal' },
  { lat: 22.02, lon: 88.03, name: 'Haldia Port', zone: 'coastal' },
  { lat: 22.34, lon: 91.82, name: 'Chittagong Port', zone: 'coastal' },
];

async function markWaypoints() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 MARKING STRATEGIC WAYPOINTS - Fast Manual Classification');
    console.log('═'.repeat(80) + '\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allWaypoints = [...WAYPOINTS, ...COASTAL_WAYPOINTS];
    console.log(`📍 Processing ${allWaypoints.length} waypoints...\n`);

    let marked = 0;
    let notFound = 0;
    const resolution = 0.5; // Search within 0.5° (~55km radius)

    for (const waypoint of allWaypoints) {
      // Find nearest grid cell (search in wider area)
      const chunks = await Grid.find({ isChunked: true });
      
      let nearestCell = null;
      let nearestChunk = null;
      let nearestIndex = -1;
      let minDistance = Infinity;
      
      for (const chunk of chunks) {
        if (!chunk.cells) continue;
        
        for (let i = 0; i < chunk.cells.length; i++) {
          const cell = chunk.cells[i];
          
          // Skip land cells
          if (cell.is_land || cell.obstacle) continue;
          
          // Calculate distance to waypoint
          const latDiff = Math.abs(cell.lat - waypoint.lat);
          const lonDiff = Math.abs(cell.lon - waypoint.lon);
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
          
          if (distance <= resolution && distance < minDistance) {
            minDistance = distance;
            nearestCell = cell;
            nearestChunk = chunk;
            nearestIndex = i;
          }
        }
      }
      
      if (nearestCell && nearestChunk) {
        // Mark the cell
        nearestChunk.cells[nearestIndex].zone = waypoint.zone;
        nearestChunk.cells[nearestIndex].open_water = (waypoint.zone === 'open_water');
        
        await nearestChunk.save();
        console.log(`   ✅ ${waypoint.name.padEnd(30)} → ${waypoint.zone.padEnd(12)} (${nearestCell.lat.toFixed(2)}°N, ${nearestCell.lon.toFixed(2)}°E) [${(minDistance * 111).toFixed(1)}km away]`);
        marked++;
      } else {
        console.log(`   ⚠️  ${waypoint.name.padEnd(30)} → NOT FOUND in ${resolution}° radius`);
        notFound++;
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log(`Total waypoints:        ${allWaypoints.length}`);
    console.log(`✅ Successfully marked: ${marked}`);
    console.log(`⚠️  Not found/land:     ${notFound}`);

    if (marked > 0) {
      console.log('\n✅ SUCCESS! Critical waypoints marked for Southeast routing!\n');
      console.log('🚀 You can now test Mumbai→Visakhapatnam and other Southeast routes.\n');
    } else {
      console.log('\n❌ WARNING: No waypoints were marked. Check grid data.\n');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

markWaypoints();
