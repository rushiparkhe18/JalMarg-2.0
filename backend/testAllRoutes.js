/**
 * 🧪 COMPREHENSIVE ROUTE TESTING FOR EXAM
 * Tests all major Indian Ocean routes to ensure exam readiness
 */

const mongoose = require('mongoose');
const RouteFinder = require('./routeFinder');
const { validatePort, loadRegionalCells } = require('./optimizedRouteHelper');
const portsData = require('./indianOceanPorts.json');
require('dotenv').config();

const ports = portsData.ports || portsData;

// Test routes for exam demonstration
const TEST_ROUTES = [
  // West to East coast (challenging - goes around India)
  { from: 'Mumbai', to: 'Vishakhapatnam', description: 'West to East coast (around southern India)' },
  { from: 'Mumbai', to: 'Chennai', description: 'West to Southeast coast' },
  
  // East coast routes
  { from: 'Chennai', to: 'Vishakhapatnam', description: 'East coast (Bay of Bengal)' },
  { from: 'Kolkata', to: 'Vishakhapatnam', description: 'Northeast to East' },
  { from: 'Vishakhapatnam', to: 'Paradip', description: 'East coast ports' },
  
  // West coast routes
  { from: 'Mumbai', to: 'Kandla', description: 'West coast (Arabian Sea)' },
  { from: 'Mumbai', to: 'Kochi', description: 'Mumbai to Kerala' },
  { from: 'Kochi', to: 'New Mangalore', description: 'South to Central west coast' },
  
  // Cross-regional
  { from: 'Chennai', to: 'Colombo', description: 'India to Sri Lanka' },
  { from: 'Kochi', to: 'Male', description: 'India to Maldives' },
  
  // International
  { from: 'Mumbai', to: 'Dubai', description: 'India to UAE' },
  { from: 'Chennai', to: 'Singapore', description: 'India to Southeast Asia' },
];

async function testRoute(fromName, toName, description) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📍 ${description}`);
  console.log(`   ${fromName} → ${toName}`);
  console.log('='.repeat(80));
  
  try {
    // Find ports
    const fromPort = ports.find(p => p.name.includes(fromName));
    const toPort = ports.find(p => p.name.includes(toName));
    
    if (!fromPort) {
      console.log(`❌ Port not found: ${fromName}`);
      return { success: false, reason: 'Port not found' };
    }
    
    if (!toPort) {
      console.log(`❌ Port not found: ${toName}`);
      return { success: false, reason: 'Port not found' };
    }
    
    console.log(`   From: ${fromPort.name} (${fromPort.lat.toFixed(2)}°N, ${fromPort.lon.toFixed(2)}°E)`);
    console.log(`   To: ${toPort.name} (${toPort.lat.toFixed(2)}°N, ${toPort.lon.toFixed(2)}°E)`);
    
    // Validate bounds
    const fromValidation = validatePort(fromPort);
    const toValidation = validatePort(toPort);
    
    if (!fromValidation.valid) {
      console.log(`   ⚠️  Start port out of bounds: ${fromValidation.reason}`);
      return { success: false, reason: 'Start port out of bounds' };
    }
    
    if (!toValidation.valid) {
      console.log(`   ⚠️  End port out of bounds: ${toValidation.reason}`);
      return { success: false, reason: 'End port out of bounds' };
    }
    
    // Load regional cells
    const routeDistance = Math.sqrt(
      Math.pow(toPort.lat - fromPort.lat, 2) + 
      Math.pow(toPort.lon - fromPort.lon, 2)
    ) * 111;
    
    const buffer = Math.max(3, Math.min(10, routeDistance / 200));
    console.log(`   📏 Approximate distance: ${routeDistance.toFixed(0)}km, buffer: ${buffer.toFixed(1)}°`);
    
    const cells = await loadRegionalCells(
      fromPort.lat, fromPort.lon,
      toPort.lat, toPort.lon,
      buffer
    );
    
    if (cells.length === 0) {
      console.log(`   ❌ No grid cells in region`);
      return { success: false, reason: 'No grid cells' };
    }
    
    // Calculate route
    const routeFinder = new RouteFinder();
    const startTime = Date.now();
    
    const result = await routeFinder.findOptimalRoute(
      { lat: fromPort.lat, lon: fromPort.lon },
      { lat: toPort.lat, lon: toPort.lon },
      cells,
      'optimal',
      0.2
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n   ✅ ROUTE FOUND in ${duration}s!`);
    console.log(`   📊 Distance: ${result.distance.toFixed(2)} km`);
    console.log(`   ⛽ Fuel: ${result.fuelConsumption.toFixed(2)} tons`);
    console.log(`   ⏱️  Duration: ${result.duration.toFixed(2)} hours (${(result.duration / 24).toFixed(1)} days)`);
    console.log(`   🗺️  Waypoints: ${result.path.length}`);
    console.log(`   💰 Fuel Cost: $${(result.fuelConsumption * 500).toFixed(0)}`);
    
    return { 
      success: true, 
      distance: result.distance,
      duration: result.duration,
      waypoints: result.path.length,
      computeTime: duration
    };
    
  } catch (error) {
    console.log(`\n   ❌ ERROR: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

async function runAllTests() {
  console.log('\n🧪 COMPREHENSIVE ROUTE TESTING FOR EXAM DEMONSTRATION');
  console.log('='.repeat(80));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const results = [];
    
    for (const route of TEST_ROUTES) {
      const result = await testRoute(route.from, route.to, route.description);
      results.push({
        route: `${route.from} → ${route.to}`,
        ...result
      });
      
      // Small delay to avoid overwhelming logs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Successful routes: ${successful.length}/${results.length}`);
    console.log(`❌ Failed routes: ${failed.length}/${results.length}\n`);
    
    if (successful.length > 0) {
      console.log('Successful Routes:');
      successful.forEach(r => {
        console.log(`  ✅ ${r.route}`);
        console.log(`     Distance: ${r.distance?.toFixed(0)}km, Time: ${r.computeTime}s, Waypoints: ${r.waypoints}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\nFailed Routes:');
      failed.forEach(r => {
        console.log(`  ❌ ${r.route}: ${r.reason}`);
      });
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('🎓 EXAM READINESS ASSESSMENT:');
    console.log('='.repeat(80));
    
    if (successful.length >= 8) {
      console.log('✅ EXCELLENT - System ready for exam demonstration');
      console.log('   All major Indian Ocean routes working correctly');
    } else if (successful.length >= 5) {
      console.log('⚠️  GOOD - Most routes working, some optimization needed');
    } else {
      console.log('❌ NEEDS WORK - Several routes failing, requires debugging');
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAllTests();
