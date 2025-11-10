/**
 * Test that other routes (not Southeast) still work normally
 */

const CoastalRouteOptimizer = require('./coastalRouteOptimizer');

async function testOtherRoutes() {
  console.log('\n✅ Testing that OTHER routes still work correctly\n');
  console.log('═'.repeat(60) + '\n');
  
  const optimizer = new CoastalRouteOptimizer();

  const testCases = [
    {
      start: { lat: 18.97, lon: 72.87, name: 'Mumbai' },
      end: { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
      expected: 'Should work (West → Chennai hub)'
    },
    {
      start: { lat: 22.02, lon: 88.03, name: 'Haldia' },
      end: { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
      expected: 'Should work (East → Chennai hub)'
    },
    {
      start: { lat: 18.97, lon: 72.87, name: 'Mumbai' },
      end: { lat: 9.93, lon: 76.27, name: 'Kochi' },
      expected: 'Should work (West coast route)'
    }
  ];

  for (const test of testCases) {
    console.log(`\n📍 ${test.start.name} → ${test.end.name}`);
    console.log(`   Expected: ${test.expected}`);
    
    try {
      const waypoints = optimizer.getStrategicWaypoints(test.start, test.end, 'FUEL');
      
      if (waypoints && waypoints.length > 0) {
        console.log(`   ✅ SUCCESS: ${waypoints.length} waypoints returned`);
      } else {
        console.log(`   ⚠️  WARNING: No waypoints (will use A* direct routing)`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ All tests complete!\n');
  process.exit(0);
}

testOtherRoutes();
