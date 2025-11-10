/**
 * Test both Mumbai → Visakhapatnam (direct) and Mumbai → Chennai (coastal)
 * to ensure the fix doesn't break existing functionality
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const coastalOptimizer = new CoastalRouteOptimizer();

// Test ports
const testCases = [
  {
    name: 'Mumbai → Visakhapatnam (should use DIRECT route)',
    start: { name: 'Mumbai', lat: 18.9388, lon: 72.8354 },
    end: { name: 'Vishakhapatnam', lat: 17.6868, lon: 83.2185 },
    expectedSet: 'MUMBAI_TO_VISAKHAPATNAM_DIRECT',
    expectedWaypoints: 9
  },
  {
    name: 'Mumbai → Chennai (should use COASTAL route)',
    start: { name: 'Mumbai', lat: 18.9388, lon: 72.8354 },
    end: { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    expectedSet: 'MUMBAI_TO_EAST_COAST',
    expectedWaypoints: 31
  }
];

async function runTests() {
  try {
    console.log('\n🧪 Testing Route Selection Logic\n');
    console.log('='.repeat(60));
    
    for (const test of testCases) {
      console.log(`\n📍 ${test.name}`);
      console.log(`   Start: ${test.start.name} (${test.start.lat}°N, ${test.start.lon}°E)`);
      console.log(`   End:   ${test.end.name} (${test.end.lat}°N, ${test.end.lon}°E)`);
      
      // Test waypoint selection
      const waypointInfo = coastalOptimizer.selectWaypointSet(test.start, test.end);
      
      if (!waypointInfo) {
        console.log(`   ❌ No waypoint set selected`);
        continue;
      }
      
      console.log(`\n   📋 Selected: ${waypointInfo.set}`);
      
      // Get waypoints using getStrategicWaypoints
      const waypoints = coastalOptimizer.getStrategicWaypoints(test.start, test.end);
      
      if (!waypoints || waypoints.length === 0) {
        console.log(`   ❌ No waypoints returned`);
        continue;
      }
      
      console.log(`   📌 Waypoints: ${waypoints.length}`);
      
      // Validate
      const setMatch = waypointInfo.set === test.expectedSet;
      const countMatch = waypoints.length === test.expectedWaypoints;
      
      if (setMatch && countMatch) {
        console.log(`   ✅ PASS: Correct route selected`);
      } else {
        console.log(`   ❌ FAIL:`);
        if (!setMatch) {
          console.log(`      Expected set: ${test.expectedSet}, Got: ${waypointInfo.set}`);
        }
        if (!countMatch) {
          console.log(`      Expected ${test.expectedWaypoints} waypoints, Got: ${waypoints.length}`);
        }
      }
      
      // Calculate approximate distance
      let totalDistance = 0;
      let prevPoint = test.start;
      for (const wp of waypoints) {
        const dist = haversineDistance(prevPoint.lat, prevPoint.lon, wp.lat, wp.lon);
        totalDistance += dist;
        prevPoint = wp;
      }
      const finalDist = haversineDistance(prevPoint.lat, prevPoint.lon, test.end.lat, test.end.lon);
      totalDistance += finalDist;
      
      console.log(`   📏 Approximate distance: ${Math.round(totalDistance)} km`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Route selection tests complete!\n');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Haversine distance helper
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Run tests
runTests().catch(console.error);
