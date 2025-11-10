/**
 * FASTEST SOLUTION: Direct MongoDB update for waypoint cells
 * Updates only ~30 cells in seconds, no impact on other routes
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

// Critical waypoints - simplified list
const WAYPOINTS = [
  // Mumbai→Visakhapatnam corridor
  { lat: 18.00, lon: 72.00, zone: 'open_water' },
  { lat: 16.00, lon: 75.00, zone: 'open_water' },
  { lat: 14.00, lon: 78.60, zone: 'open_water' },
  { lat: 12.60, lon: 81.80, zone: 'open_water' },
  { lat: 15.40, lon: 83.20, zone: 'open_water' },
  { lat: 17.40, lon: 83.20, zone: 'open_water' },
  { lat: 16.50, lon: 81.00, zone: 'open_water' },
  
  // Additional Southeast corridors
  { lat: 18.50, lon: 82.50, zone: 'open_water' },
  { lat: 19.50, lon: 85.00, zone: 'open_water' },
  { lat: 19.00, lon: 86.00, zone: 'open_water' },
  { lat: 20.50, lon: 87.50, zone: 'open_water' },
  { lat: 20.00, lon: 88.00, zone: 'open_water' },
  { lat: 21.50, lon: 90.50, zone: 'open_water' },
  
  // Wide corridor
  { lat: 10.00, lon: 79.00, zone: 'open_water' },
  { lat: 11.00, lon: 80.00, zone: 'open_water' },
  { lat: 13.00, lon: 79.00, zone: 'open_water' },
  { lat: 15.00, lon: 80.00, zone: 'open_water' },
  { lat: 14.00, lon: 82.00, zone: 'open_water' },
  { lat: 17.00, lon: 74.00, zone: 'open_water' },
  { lat: 15.00, lon: 76.00, zone: 'open_water' },
  { lat: 13.00, lon: 77.00, zone: 'open_water' },
  { lat: 16.00, lon: 82.00, zone: 'open_water' },
  { lat: 18.00, lon: 84.00, zone: 'open_water' },
];

async function fastMarkWaypoints() {
  try {
    console.log('\n⚡ FAST WAYPOINT MARKING - Direct MongoDB Update\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let marked = 0;
    const tolerance = 0.3; // 0.3° tolerance (~33km)

    for (const wp of WAYPOINTS) {
      // Direct MongoDB update query - finds and updates in one operation
      const result = await Grid.updateMany(
        {
          isChunked: true,
          'cells': {
            $elemMatch: {
              lat: { $gte: wp.lat - tolerance, $lte: wp.lat + tolerance },
              lon: { $gte: wp.lon - tolerance, $lte: wp.lon + tolerance },
              is_land: false,
              obstacle: false
            }
          }
        },
        {
          $set: {
            'cells.$[elem].zone': wp.zone,
            'cells.$[elem].open_water': true
          }
        },
        {
          arrayFilters: [
            {
              'elem.lat': { $gte: wp.lat - tolerance, $lte: wp.lat + tolerance },
              'elem.lon': { $gte: wp.lon - tolerance, $lte: wp.lon + tolerance },
              'elem.is_land': false,
              'elem.obstacle': false
            }
          ],
          multi: true
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ ${wp.lat.toFixed(2)}°N, ${wp.lon.toFixed(2)}°E → ${result.modifiedCount} cells marked`);
        marked++;
      } else {
        console.log(`⚠️  ${wp.lat.toFixed(2)}°N, ${wp.lon.toFixed(2)}°E → No water cells found`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ SUCCESS! Marked ${marked}/${WAYPOINTS.length} waypoint areas`);
    console.log('═'.repeat(60) + '\n');

    await mongoose.connection.close();
    console.log('✅ Done! Test your routes now.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fastMarkWaypoints();
