/**
 * 🧪 QUICK TEST: Mumbai → Visakhapatnam DIRECT Route
 */

const mongoose = require('mongoose');
const RouteFinder = require('./routeFinder');
const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const portsData = require('./indianOceanPorts.json');
require('dotenv').config();

const ports = portsData.ports || portsData;

async function testDirectRoute() {
  console.log('\n🎯 === TESTING MUMBAI → VISAKHAPATNAM (DIRECT ROUTE) ===\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const mumbai = ports.find(p => p.name.includes('Mumbai'));
    const visakhapatnam = ports.find(p => p.name.includes('Vishakhapatnam'));
    
    console.log(`📍 From: ${mumbai.name} (${mumbai.lat.toFixed(2)}°N, ${mumbai.lon.toFixed(2)}°E)`);
    console.log(`📍 To:   ${visakhapatnam.name} (${visakhapatnam.lat.toFixed(2)}°N, ${visakhapatnam.lon.toFixed(2)}°E)`);
    console.log(`📏 Straight-line distance: ~1,800 km\n`);
    
    const routeFinder = new RouteFinder();
    const coastalOptimizer = new CoastalRouteOptimizer();
    
    const mode = 'optimal';
    const startTime = Date.now();
    
    const result = await coastalOptimizer.calculateMultiSegmentRoute(
      { lat: mumbai.lat, lon: mumbai.lon, name: mumbai.name },
      { lat: visakhapatnam.lat, lon: visakhapatnam.lon, name: visakhapatnam.name },
      routeFinder,
      0.2,
      mode
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (result.success) {
      console.log(`\n✅ ROUTE CALCULATED SUCCESSFULLY!`);
      console.log(`\n📊 RESULTS:`);
      console.log(`   ⏱️  Calculation Time: ${duration}s (${duration < 120 ? '✅ FAST!' : '⚠️ Slow'})`);
      console.log(`   📏 Distance: ${result.totalDistance.toFixed(1)} km (Expected: ~1,800-2,000 km)`);
      console.log(`   ⏱️  Travel Time: ${result.totalTime.toFixed(1)} hours (${(result.totalTime / 24).toFixed(1)} days)`);
      console.log(`   ⛽ Fuel Cost: $${result.fuelCost.toLocaleString()}`);
      console.log(`   📍 Waypoints: ${result.pointsCount}`);
      
      console.log(`\n🎯 ANALYSIS:`);
      
      if (result.totalDistance < 2200) {
        console.log(`   ✅ Route uses DIRECT crossing (not around Sri Lanka)`);
      } else {
        console.log(`   ❌ Route still goes around Sri Lanka (${result.totalDistance.toFixed(0)} km is too long)`);
      }
      
      if (duration < 120) {
        console.log(`   ✅ Calculation is FAST (< 2 minutes)`);
      } else {
        console.log(`   ⚠️  Calculation is slow (${duration}s)`);
      }
      
      console.log(`\n📋 WAYPOINTS USED:`);
      if (result.waypointMetadata && result.waypointMetadata.waypoints) {
        result.waypointMetadata.waypoints.forEach((wp, i) => {
          console.log(`   ${i + 1}. ${wp.name} (${wp.lat.toFixed(2)}°N, ${wp.lon.toFixed(2)}°E)`);
        });
      }
      
    } else {
      console.log(`\n❌ ROUTE FAILED`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test complete\n');
  }
}

testDirectRoute()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
