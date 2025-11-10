/**
 * Quick test: Mumbai → Visakhapatnam route
 */

const CoastalRouteOptimizer = require('./coastalRouteOptimizer');

async function testRoute() {
  console.log('\n🧪 Testing Mumbai → Visakhapatnam Route\n');
  
  const optimizer = new CoastalRouteOptimizer();

  const start = { lat: 18.97, lon: 72.87, name: 'Mumbai' };
  const end = { lat: 17.68, lon: 83.30, name: 'Visakhapatnam' };

  console.log('📍 Start:', start.name);
  console.log('📍 End:', end.name);
  console.log('⚙️  Mode: FUEL (fastest)\n');

  const startTime = Date.now();
  
  try {
    const waypoints = optimizer.getStrategicWaypoints(start, end, 'FUEL');
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (waypoints && waypoints.length > 0) {
      console.log(`✅ SUCCESS in ${elapsed}s!`);
      console.log(`   Waypoints: ${waypoints.length}`);
      console.log('\n📍 Route waypoints:');
      waypoints.forEach((wp, i) => {
        console.log(`   ${i + 1}. ${wp.name} (${wp.lat}°N, ${wp.lon}°E)`);
      });
    } else {
      console.log(`❌ FAILED in ${elapsed}s`);
      console.log(`   No waypoints returned`);
    }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ ERROR in ${elapsed}s: ${error.message}`);
  }

  process.exit(0);
}

testRoute();
