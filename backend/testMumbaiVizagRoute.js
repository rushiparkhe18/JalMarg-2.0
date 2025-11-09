const RouteFinder = require('./routeFinder');
const mongoose = require('mongoose');
const Grid = require('./models/Grid');
require('dotenv').config();

async function testRoute() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Load ALL grid chunks
    console.log('📦 Loading grid chunks from MongoDB...');
    const chunks = await Grid.find({ isChunked: true }).lean();
    console.log(`✅ Found ${chunks.length} chunks\n`);
    
    // Merge all cells from chunks
    const allCells = [];
    chunks.forEach(chunk => {
      if (chunk.cells) {
        allCells.push(...chunk.cells);
      }
    });
    
    const resolution = chunks[0]?.resolution || 0.2;
    console.log(`✅ Loaded ${allCells.length} total cells, resolution: ${resolution}°\n`);
    
    // Initialize route finder
    const routeFinder = new RouteFinder();
    
    // Test Mumbai to Visakhapatnam
    console.log('🧪 Testing Mumbai → Visakhapatnam route\n');
    console.log('=' .repeat(60));
    
    const result = await routeFinder.findOptimalRoute(
      { lat: 18.97, lon: 72.87 }, // Mumbai
      { lat: 17.68, lon: 83.30 }, // Visakhapatnam
      allCells,
      'optimal',
      resolution
    );
    
    console.log('\n✅ Route found successfully!');
    console.log(`Distance: ${result.distance.toFixed(2)} km`);
    console.log(`Fuel: ${result.fuelConsumption.toFixed(2)} tons`);
    console.log(`Duration: ${result.duration.toFixed(2)} hours`);
    console.log(`Waypoints: ${result.path.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testRoute();
