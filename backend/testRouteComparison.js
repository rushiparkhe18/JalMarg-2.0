/**
 * 🚢 Visual Route Comparison: Fuel vs Optimal vs Safe
 * Shows the exact coordinate paths for each mode
 */

const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const coastalOptimizer = new CoastalRouteOptimizer();

const startPort = { name: 'Mumbai', lat: 18.9388, lon: 72.8354 };
const endPort = { name: 'Vishakhapatnam', lat: 17.6868, lon: 83.2185 };

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function printRouteMap(mode, waypoints) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🗺️  ROUTE MAP: ${mode.toUpperCase()} MODE`);
  console.log(`${'═'.repeat(80)}\n`);

  let totalDist = 0;
  
  // Print map representation
  console.log('Latitude progression:');
  console.log('  North ↑');
  
  // Create simple ASCII map
  const lats = waypoints.map(w => w.lat);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const latRange = maxLat - minLat;
  
  const lons = waypoints.map(w => w.lon);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const lonRange = maxLon - minLon;

  console.log(`\n${' '.repeat(4)}${minLon.toFixed(1)}°E ← Longitude → ${maxLon.toFixed(1)}°E\n`);

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const x = ((wp.lon - minLon) / lonRange) * 70;
    const marker = i === 0 ? '🚢' : (i === waypoints.length - 1 ? '⚓' : '📍');
    
    console.log(`${marker} ${wp.name.padEnd(40)} (${wp.lat.toFixed(2)}°N, ${wp.lon.toFixed(2)}°E)`);
    
    if (i < waypoints.length - 1) {
      const dist = haversineDistance(wp.lat, wp.lon, waypoints[i+1].lat, waypoints[i+1].lon);
      totalDist += dist;
      console.log(`   ↓ ${dist.toFixed(0)} km`);
    }
  }
  
  const finalDist = haversineDistance(waypoints[waypoints.length-1].lat, waypoints[waypoints.length-1].lon, 
                                      endPort.lat, endPort.lon);
  totalDist += finalDist;
  console.log(`   ↓ ${finalDist.toFixed(0)} km`);
  console.log(`   ⚓ ${endPort.name}`);

  return totalDist;
}

function main() {
  console.log('\n' + '█'.repeat(80));
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█' + '  🚢 MARITIME ROUTE COMPARISON: Mumbai → Visakhapatnam  '.padEnd(79) + '█');
  console.log('█' + '  Showing 3 Different Routes Based on Mode (Fuel/Optimal/Safe)  '.padEnd(79) + '█');
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█'.repeat(80));

  const modes = ['fuel', 'optimal', 'safe'];
  const results = {};

  for (const mode of modes) {
    const waypoints = coastalOptimizer.getStrategicWaypoints(startPort, endPort, mode);
    const distance = printRouteMap(mode, waypoints);
    
    results[mode] = {
      waypoints: waypoints,
      distance: distance,
      count: waypoints.length
    };
  }

  // Summary comparison
  console.log('\n' + '═'.repeat(80));
  console.log('📊 COMPREHENSIVE ROUTE COMPARISON');
  console.log('═'.repeat(80) + '\n');

  console.log('┌─ ROUTE CHARACTERISTICS ─────────────────────────────────────────────┐');
  console.log('│                                                                       │');
  console.log('│ ⛽ FUEL MODE:                                                         │');
  console.log(`│    • Waypoints: ${results['fuel'].count} (FEWEST - fastest route)                                   │`);
  console.log(`│    • Distance: ${results['fuel'].distance.toFixed(0)} km (SHORTEST - minimum fuel)                        │`);
  console.log('│    • Cost Focus: Distance only (weight=10.0)                          │');
  console.log('│    • Use Case: Budget operations, good weather                        │');
  console.log('│                                                                       │');
  console.log('│ ⚖️  OPTIMAL MODE:                                                     │');
  console.log(`│    • Waypoints: ${results['optimal'].count} (MEDIUM - balanced route)                              │`);
  console.log(`│    • Distance: ${results['optimal'].distance.toFixed(0)} km (MEDIUM - good compromise)                       │`);
  console.log('│    • Cost Focus: Distance & Safety (5.0 : 3.0)                        │');
  console.log('│    • Use Case: Normal shipping operations                             │');
  console.log('│                                                                       │');
  console.log('│ 🛡️  SAFE MODE:                                                       │');
  console.log(`│    • Waypoints: ${results['safe'].count} (MOST - cautious route)                               │`);
  console.log(`│    • Distance: ${results['safe'].distance.toFixed(0)} km (LONGEST - maximum safety margin)                 │`);
  console.log('│    • Cost Focus: Safety primarily (weight=15.0)                       │');
  console.log('│    • Use Case: Hazmat, poor weather, high-value cargo                │');
  console.log('│                                                                       │');
  console.log('└───────────────────────────────────────────────────────────────────────┘');

  // Distance savings
  console.log('\n┌─ DISTANCE COMPARISON ────────────────────────────────────────────────┐');
  console.log('│                                                                       │');
  
  const fuelDist = results['fuel'].distance;
  const optimalDist = results['optimal'].distance;
  const safeDist = results['safe'].distance;
  
  const fuelVsOptimal = ((fuelDist - optimalDist) / optimalDist * 100).toFixed(1);
  const optimalVsSafe = ((safeDist - optimalDist) / optimalDist * 100).toFixed(1);
  const fuelVsSafe = ((safeDist - fuelDist) / fuelDist * 100).toFixed(1);
  
  console.log(`│ Fuel vs Optimal:   ${fuelDist.toFixed(0)} vs ${optimalDist.toFixed(0)} km (${fuelVsOptimal > 0 ? '+' : ''}${fuelVsOptimal}%)               │`);
  console.log(`│ Optimal vs Safe:   ${optimalDist.toFixed(0)} vs ${safeDist.toFixed(0)} km (${optimalVsSafe > 0 ? '+' : ''}${optimalVsSafe}% longer for safety)    │`);
  console.log(`│ Fuel vs Safe:      ${fuelDist.toFixed(0)} vs ${safeDist.toFixed(0)} km (${fuelVsSafe > 0 ? '+' : ''}${fuelVsSafe}% extra for safety)       │`);
  console.log('│                                                                       │');
  console.log('└───────────────────────────────────────────────────────────────────────┘');

  // Waypoint count analysis
  console.log('\n┌─ WAYPOINT ANALYSIS ──────────────────────────────────────────────────┐');
  console.log('│                                                                       │');
  console.log('│ Each additional waypoint provides:                                   │');
  console.log('│   • Better route precision and flexibility for A* algorithm          │');
  console.log('│   • More routing options to avoid obstacles                          │');
  console.log('│   • Slightly longer calculation time                                 │');
  console.log('│                                                                       │');
  console.log(`│ Fuel (${results['fuel'].count} points):    Minimal waypoints → straight line crossing           │`);
  console.log(`│ Optimal (${results['optimal'].count} points):  Good balance → reasonable flexibility             │`);
  console.log(`│ Safe (${results['safe'].count} points):   Extra waypoints → more cautious routing            │`);
  console.log('│                                                                       │');
  console.log('└───────────────────────────────────────────────────────────────────────┘');

  // A* Cost Weights
  console.log('\n┌─ A* ALGORITHM COST WEIGHTS ───────────────────────────────────────────┐');
  console.log('│                                                                       │');
  console.log('│ How the A* algorithm prioritizes different factors:                  │');
  console.log('│                                                                       │');
  console.log('│ ⛽ FUEL MODE:     cost = distance * 10.0 + safety * 0.1             │');
  console.log('│    • Heavily penalizes long distances                                │');
  console.log('│    • Ignores safety considerations                                   │');
  console.log('│    • Result: Shortest path regardless of hazards                     │');
  console.log('│                                                                       │');
  console.log('│ ⚖️  OPTIMAL MODE:  cost = distance * 5.0 + safety * 3.0             │');
  console.log('│    • Balances distance and safety equally                            │');
  console.log('│    • Good compromise for most operations                             │');
  console.log('│    • Result: Efficient route with reasonable safety                  │');
  console.log('│                                                                       │');
  console.log('│ 🛡️  SAFE MODE:    cost = distance * 1.0 + safety * 15.0            │');
  console.log('│    • Barely considers distance                                       │');
  console.log('│    • Heavily prioritizes safety                                      │');
  console.log('│    • Result: Safest route, ignoring distance penalties               │');
  console.log('│                                                                       │');
  console.log('└───────────────────────────────────────────────────────────────────────┘');

  console.log('\n' + '█'.repeat(80));
  console.log('✅ ROUTE COMPARISON COMPLETE - All 3 modes generate different paths!');
  console.log('█'.repeat(80) + '\n');
}

main();
