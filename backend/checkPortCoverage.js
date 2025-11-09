const mongoose = require('mongoose');
const Grid = require('./models/Grid');
const portsData = require('./indianOceanPorts.json');
const ports = portsData.ports || portsData;
require('dotenv').config();

async function checkPortCoverage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get grid bounds from first chunk
    const sampleChunk = await Grid.findOne({ isChunked: true }).lean();
    console.log('📊 Grid Coverage:');
    console.log(`   Resolution: ${sampleChunk.resolution}°\n`);
    
    // Calculate actual bounds from all chunks
    console.log('📦 Loading all chunks to determine bounds...');
    const chunks = await Grid.find({ isChunked: true }).lean();
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    
    chunks.forEach(chunk => {
      chunk.cells.forEach(cell => {
        if (cell.lat < minLat) minLat = cell.lat;
        if (cell.lat > maxLat) maxLat = cell.lat;
        if (cell.lon < minLon) minLon = cell.lon;
        if (cell.lon > maxLon) maxLon = cell.lon;
      });
    });
    
    console.log(`\n   Latitude: ${minLat}° to ${maxLat}°`);
    console.log(`   Longitude: ${minLon}° to ${maxLon}°\n`);
    
    // Check each port
    const outsidePorts = [];
    const insidePorts = [];
    
    console.log('🔍 Checking all ports...\n');
    
    ports.forEach(port => {
      const isInside = 
        port.lat >= minLat && port.lat <= maxLat &&
        port.lon >= minLon && port.lon <= maxLon;
      
      if (isInside) {
        insidePorts.push(port);
      } else {
        outsidePorts.push(port);
      }
    });
    
    console.log(`✅ Ports inside grid: ${insidePorts.length}/${ports.length}`);
    console.log(`❌ Ports outside grid: ${outsidePorts.length}/${ports.length}\n`);
    
    if (outsidePorts.length > 0) {
      console.log('⚠️  PORTS OUTSIDE GRID BOUNDS:');
      console.log('━'.repeat(70));
      outsidePorts.forEach(port => {
        const latDiff = port.lat < minLat ? `${(minLat - port.lat).toFixed(2)}° too south` :
                        port.lat > maxLat ? `${(port.lat - maxLat).toFixed(2)}° too north` : 'OK';
        const lonDiff = port.lon < minLon ? `${(minLon - port.lon).toFixed(2)}° too west` :
                        port.lon > maxLon ? `${(port.lon - maxLon).toFixed(2)}° too east` : 'OK';
        
        console.log(`${port.name} (${port.country})`);
        console.log(`   Coordinates: ${port.lat.toFixed(2)}°N, ${port.lon.toFixed(2)}°E`);
        console.log(`   Issue: Lat ${latDiff}, Lon ${lonDiff}\n`);
      });
    }
    
    // Check some major Indian ports
    console.log('\n📍 MAJOR INDIAN PORTS STATUS:');
    console.log('━'.repeat(70));
    
    const majorPorts = [
      'Mumbai', 'Chennai', 'Kolkata', 'Vishakhapatnam', 'Kochi',
      'Mangalore', 'Goa', 'Kandla', 'Tuticorin', 'Paradip'
    ];
    
    majorPorts.forEach(portName => {
      const port = ports.find(p => p.name.includes(portName));
      if (port) {
        const isInside = 
          port.lat >= minLat && port.lat <= maxLat &&
          port.lon >= minLon && port.lon <= maxLon;
        
        const status = isInside ? '✅' : '❌';
        console.log(`${status} ${port.name}: (${port.lat.toFixed(2)}°N, ${port.lon.toFixed(2)}°E)`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkPortCoverage();
