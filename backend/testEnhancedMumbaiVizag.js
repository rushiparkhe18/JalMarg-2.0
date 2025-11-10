/**
 * 🧪 TEST: Mumbai → Visakhapatnam with Enhanced Corridor Routing
 * Tests all three modes: fuel, optimal, safe
 */

const mongoose = require('mongoose');
const RouteFinder = require('./routeFinder');
const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const portsData = require('./indianOceanPorts.json');
require('dotenv').config();

const ports = portsData.ports || portsData;

async function testMumbaiVisakhapatnam() {
  console.log('\n🧪 === TESTING MUMBAI → VISAKHAPATNAM WITH ENHANCED CORRIDOR ===');
  console.log('='.repeat(80));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find ports
    const mumbai = ports.find(p => p.name.includes('Mumbai'));
    const visakhapatnam = ports.find(p => p.name.includes('Vishakhapatnam'));
    
    if (!mumbai || !visakhapatnam) {
      console.error('❌ Could not find ports');
      console.log('Available ports:', ports.map(p => p.name).join(', '));
      return;
    }
    
    console.log(`📍 From: ${mumbai.name} (${mumbai.lat.toFixed(2)}°N, ${mumbai.lon.toFixed(2)}°E)`);
    console.log(`📍 To:   ${visakhapatnam.name} (${visakhapatnam.lat.toFixed(2)}°N, ${visakhapatnam.lon.toFixed(2)}°E)`);
    console.log('');
    
    const routeFinder = new RouteFinder();
    const coastalOptimizer = new CoastalRouteOptimizer();
    
    // Test all three modes
    const modes = ['fuel', 'optimal', 'safe'];
    const results = {};
    
    for (const mode of modes) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🚢 TESTING MODE: ${mode.toUpperCase()}`);
      console.log(`${'='.repeat(80)}\n`);
      
      const startTime = Date.now();
      
      try {
        const result = await coastalOptimizer.calculateMultiSegmentRoute(
          { lat: mumbai.lat, lon: mumbai.lon, name: mumbai.name },
          { lat: visakhapatnam.lat, lon: visakhapatnam.lon, name: visakhapatnam.name },
          routeFinder,
          0.2,
          mode
        );
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (result.success) {
          console.log(`\n✅ ${mode.toUpperCase()} ROUTE CALCULATED SUCCESSFULLY`);
          console.log(`   ⏱️  Calculation Time: ${duration}s`);
          console.log(`   📏 Total Distance: ${result.totalDistance.toFixed(1)} km`);
          console.log(`   ⏱️  Travel Time: ${result.totalTime.toFixed(1)} hours (${(result.totalTime / 24).toFixed(1)} days)`);
          console.log(`   ⛽ Fuel Cost: $${result.fuelCost.toLocaleString()}`);
          console.log(`   📊 Points in Path: ${result.pointsCount}`);
          console.log(`   🎨 Route Color: ${result.style.color}`);
          
          results[mode] = {
            success: true,
            distance: result.totalDistance,
            time: result.totalTime,
            fuel: result.fuelCost,
            calculationTime: duration,
            points: result.pointsCount
          };
        } else {
          console.log(`\n❌ ${mode.toUpperCase()} ROUTE FAILED`);
          console.log(`   Error: ${result.error || 'Unknown error'}`);
          results[mode] = { success: false };
        }
        
      } catch (error) {
        console.error(`\n❌ ${mode.toUpperCase()} MODE ERROR:`, error.message);
        console.error(error.stack);
        results[mode] = { success: false, error: error.message };
      }
    }
    
    // Summary comparison
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RESULTS COMPARISON');
    console.log(`${'='.repeat(80)}\n`);
    
    console.log('┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ Mode        │ Distance (km)│ Time (hours) │ Fuel Cost    │ Calc Time    │');
    console.log('├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤');
    
    for (const mode of modes) {
      const r = results[mode];
      if (r.success) {
        console.log(
          `│ ${mode.padEnd(11)} │ ${r.distance.toFixed(1).padStart(12)} │ ${r.time.toFixed(1).padStart(12)} │ $${r.fuel.toLocaleString().padStart(11)} │ ${r.calculationTime.padStart(10)}s  │`
        );
      } else {
        console.log(
          `│ ${mode.padEnd(11)} │ FAILED       │ FAILED       │ FAILED       │ N/A          │`
        );
      }
    }
    console.log('└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘');
    
    // Analysis
    console.log('\n📈 ANALYSIS:');
    
    const successfulModes = Object.keys(results).filter(m => results[m].success);
    
    if (successfulModes.length === 3) {
      console.log('   ✅ All modes calculated successfully');
      
      // Compare distances
      const distances = successfulModes.map(m => results[m].distance);
      const minDist = Math.min(...distances);
      const maxDist = Math.max(...distances);
      
      if (maxDist - minDist > 50) {
        console.log(`   ✅ Routes differ by distance: ${(maxDist - minDist).toFixed(1)} km variation`);
      } else {
        console.log(`   ⚠️  Routes are very similar (< 50km difference) - mode distinction may be weak`);
      }
      
      // Compare fuel costs
      const fuels = successfulModes.map(m => results[m].fuel);
      const minFuel = Math.min(...fuels);
      const maxFuel = Math.max(...fuels);
      
      if (maxFuel - minFuel > 1000) {
        console.log(`   ✅ Fuel costs differ: $${(maxFuel - minFuel).toLocaleString()} variation`);
      }
      
      // Expected behavior
      console.log('\n   📋 Expected Behavior:');
      console.log('      • Fuel mode: Longest distance, lowest fuel cost, slowest');
      console.log('      • Optimal mode: Balanced distance/time/fuel');
      console.log('      • Safe mode: Moderate distance, higher safety buffer');
      
      // Check if results match expectations
      if (results.fuel.success && results.optimal.success) {
        if (results.fuel.fuel < results.optimal.fuel * 0.95) {
          console.log('   ✅ Fuel mode saves fuel vs optimal (expected)');
        }
        if (results.fuel.time > results.optimal.time * 1.1) {
          console.log('   ✅ Fuel mode is slower than optimal (expected)');
        }
      }
      
    } else {
      console.log(`   ⚠️  Only ${successfulModes.length}/3 modes succeeded`);
      successfulModes.forEach(m => console.log(`      ✅ ${m}`));
      
      const failedModes = Object.keys(results).filter(m => !results[m].success);
      failedModes.forEach(m => console.log(`      ❌ ${m}: ${results[m].error || 'Unknown error'}`));
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run test
testMumbaiVisakhapatnam()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  });
