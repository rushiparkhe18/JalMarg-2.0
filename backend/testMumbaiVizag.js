/**
 * 🧪 QUICK TEST: Mumbai → Visakhapatnam
 * The most challenging Indian coastal route - perfect for exam demo
 */

const mongoose = require('mongoose');
const RouteFinder = require('./routeFinder');
const CoastalRouteOptimizer = require('./coastalRouteOptimizer');
const portsData = require('./indianOceanPorts.json');
require('dotenv').config();

const ports = portsData.ports || portsData;

async function quickTest() {
  console.log('\n🧪 QUICK TEST: Mumbai → Visakhapatnam');
  console.log('='.repeat(80));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const mumbai = ports.find(p => p.name.includes('Mumbai'));
    const visakhapatnam = ports.find(p => p.name.includes('Vishakhapatnam'));
    
    console.log(`📍 From: ${mumbai.name} (${mumbai.lat.toFixed(2)}°N, ${mumbai.lon.toFixed(2)}°E)`);
    console.log(`📍 To: ${visakhapatnam.name} (${visakhapatnam.lat.toFixed(2)}°N, ${visakhapatnam.lon.toFixed(2)}°E)\n`);
    
    const routeFinder = new RouteFinder();
    const coastalOptimizer = new CoastalRouteOptimizer();
    
    const start = { lat: mumbai.lat, lon: mumbai.lon };
    const end = { lat: visakhapatnam.lat, lon: visakhapatnam.lon };
    
    console.log('🚀 Starting waypoint-optimized route calculation...\n');
    const startTime = Date.now();
    
    const result = await coastalOptimizer.calculateMultiSegmentRoute(
      start, end, routeFinder, 0.2
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ SUCCESS! Route calculated');
    console.log('='.repeat(80));
    console.log(`⏱️  Time: ${duration}s`);
    console.log(`📊 Distance: ${result.distance.toFixed(2)} km`);
    console.log(`⛽ Fuel: ${result.fuelConsumption.toFixed(2)} tons`);
    console.log(`⏱️  Duration: ${result.duration.toFixed(2)} hours (${(result.duration / 24).toFixed(1)} days)`);
    console.log(`🗺️  Waypoints: ${result.path.length}`);
    console.log(`📍 Segments: ${result.segmentsCompleted}/${result.segmentsTotal}`);
    console.log(`\n✅ READY FOR EXAM DEMONSTRATION!`);
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

quickTest();
