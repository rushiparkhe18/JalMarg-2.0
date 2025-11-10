/**
 * Test that Mumbai → Visakhapatnam generates DIFFERENT routes for fuel/optimal/safe modes
 * This ensures mode-aware routing is working correctly
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const coastalOptimizer = new CoastalRouteOptimizer();

// Test ports
const startPort = { name: 'Mumbai', lat: 18.9388, lon: 72.8354 };
const endPort = { name: 'Vishakhapatnam', lat: 17.6868, lon: 83.2185 };

const modes = ['fuel', 'optimal', 'safe'];

async function runTests() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🚢 Testing Mode-Aware Route Selection for Mumbai → Visakhapatnam');
    console.log('='.repeat(70) + '\n');

    const modeResults = {};

    for (const mode of modes) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`🔍 Testing MODE: ${mode.toUpperCase()}`);
      console.log(`${'─'.repeat(70)}\n`);

      // Get waypoints for this mode
      const waypointInfo = coastalOptimizer.selectWaypointSet(startPort, endPort, mode);
      
      if (!waypointInfo) {
        console.log(`   ❌ No waypoint set selected for ${mode} mode`);
        continue;
      }

      console.log(`   📋 Selected Set: ${waypointInfo.set}`);

      // Get strategic waypoints
      const waypoints = coastalOptimizer.getStrategicWaypoints(startPort, endPort, mode);

      if (!waypoints || waypoints.length === 0) {
        console.log(`   ❌ No waypoints returned`);
        continue;
      }

      console.log(`   📌 Waypoint Count: ${waypoints.length}`);
      console.log(`   📍 Waypoint Sequence:`);

      // Calculate distance and analyze waypoints
      let totalDistance = 0;
      let prevPoint = startPort;

      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        const dist = haversineDistance(prevPoint.lat, prevPoint.lon, wp.lat, wp.lon);
        totalDistance += dist;
        
        const typeLabel = wp.type ? `[${wp.type}]` : '';
        const coordsLabel = `(${wp.lat.toFixed(2)}°N, ${wp.lon.toFixed(2)}°E)`;
        
        console.log(`      ${i}: ${wp.name} ${coordsLabel} ${typeLabel}`);
        
        if (i > 0) {
          console.log(`         └─ Distance from prev: ${dist.toFixed(0)} km`);
        }
        
        prevPoint = wp;
      }

      const finalDist = haversineDistance(prevPoint.lat, prevPoint.lon, endPort.lat, endPort.lon);
      totalDistance += finalDist;

      modeResults[mode] = {
        waypointSet: waypointInfo.set,
        waypointCount: waypoints.length,
        totalDistance: totalDistance,
        waypoints: waypoints
      };

      console.log(`\n   📏 Total Distance: ${totalDistance.toFixed(0)} km`);
      console.log(`   ✅ ${mode.toUpperCase()} mode configuration complete\n`);
    }

    // Comparison analysis
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 COMPARISON ANALYSIS');
    console.log(`${'='.repeat(70)}\n`);

    console.log('Waypoint Sets Used:');
    modes.forEach(mode => {
      const result = modeResults[mode];
      console.log(`  ⛽ ${mode.toUpperCase().padEnd(8)}: ${result.waypointSet} (${result.waypointCount} waypoints, ${result.totalDistance.toFixed(0)} km)`);
    });

    // Check if they're different
    const fuelSet = modeResults['fuel'].waypointSet;
    const optimalSet = modeResults['optimal'].waypointSet;
    const safeSet = modeResults['safe'].waypointSet;

    console.log('\n✅ Route Differentiation Analysis:');
    
    if (fuelSet !== optimalSet && optimalSet !== safeSet) {
      console.log(`   ✅ ALL THREE MODES use DIFFERENT waypoint sets!`);
      console.log(`      • Fuel:    ${fuelSet}`);
      console.log(`      • Optimal: ${optimalSet}`);
      console.log(`      • Safe:    ${safeSet}`);
    } else if (fuelSet !== optimalSet || optimalSet !== safeSet) {
      console.log(`   ⚠️  SOME modes use different sets (partial differentiation)`);
    } else {
      console.log(`   ❌ All modes use the SAME waypoint set (no differentiation)`);
    }

    // Waypoint count comparison
    const fuelCount = modeResults['fuel'].waypointCount;
    const optimalCount = modeResults['optimal'].waypointCount;
    const safeCount = modeResults['safe'].waypointCount;

    console.log(`\n✅ Waypoint Count Analysis:`);
    console.log(`   • Fuel Mode:    ${fuelCount} waypoints (shortest route, fewest stops)`);
    console.log(`   • Optimal Mode: ${optimalCount} waypoints (balanced route)`);
    console.log(`   • Safe Mode:    ${safeCount} waypoints (safest route, most stops)`);

    if (fuelCount < optimalCount && optimalCount < safeCount) {
      console.log(`   ✅ Correct: Fuel < Optimal < Safe (expected order)`);
    } else if (fuelCount !== optimalCount || optimalCount !== safeCount) {
      console.log(`   ⚠️  Different counts but not in expected order`);
    } else {
      console.log(`   ⚠️  All modes have same waypoint count`);
    }

    // Distance comparison
    const fuelDist = modeResults['fuel'].totalDistance;
    const optimalDist = modeResults['optimal'].totalDistance;
    const safeDist = modeResults['safe'].totalDistance;

    console.log(`\n✅ Distance Analysis:`);
    console.log(`   • Fuel Mode:    ${fuelDist.toFixed(0)} km (shortest)`);
    console.log(`   • Optimal Mode: ${optimalDist.toFixed(0)} km (balanced)`);
    console.log(`   • Safe Mode:    ${safeDist.toFixed(0)} km (furthest from coast)`);

    if (fuelDist < optimalDist && optimalDist < safeDist) {
      console.log(`   ✅ Correct: Fuel < Optimal < Safe (expected order)`);
    } else if (fuelDist !== optimalDist || optimalDist !== safeDist) {
      console.log(`   ⚠️  Different distances but not in expected order`);
    }

    // Cost analysis (theoretical)
    console.log(`\n✅ Cost Weights (theoretical A* costs):`);
    console.log(`   • Fuel Mode:    distance_weight=10.0, safety_weight=0.1`);
    console.log(`      → Prefers: SHORT distance, IGNORES safety`);
    console.log(`   • Optimal Mode: distance_weight=5.0, safety_weight=3.0`);
    console.log(`      → Prefers: BALANCED distance and safety`);
    console.log(`   • Safe Mode:    distance_weight=1.0, safety_weight=15.0`);
    console.log(`      → Prefers: SAFETY over distance (takes longer, safer route)`);

    console.log(`\n` + '='.repeat(70));
    console.log('✅ MODE-AWARE ROUTING TEST COMPLETE');
    console.log(`${'='.repeat(70)}\n`);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Haversine distance helper
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Run tests
runTests().catch(console.error);
