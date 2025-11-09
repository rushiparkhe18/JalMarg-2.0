/**
 * 🗺️ CHUNKED GRID IMPORTER
 * 
 * Imports large grids by splitting them into chunks that fit MongoDB's 16MB limit.
 * Each chunk is saved as a separate document.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const Grid = require('./models/Grid');

// Chunk size: ~10,000 cells per document (safe for 16MB limit)
const CELLS_PER_CHUNK = 10000;

async function importChunkedGrid() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Load grid data from file
    console.log('📂 Loading grid data from gridData.json...\n');
    const gridFilePath = path.join(__dirname, 'gridData.json');
    
    if (!fs.existsSync(gridFilePath)) {
      throw new Error('gridData.json not found! Run: node gridGeneratorEnhanced.js first');
    }
    
    const gridData = JSON.parse(fs.readFileSync(gridFilePath, 'utf8'));
    
    console.log('📦 Grid Information:');
    console.log(`   Total cells: ${gridData.cells.length.toLocaleString()}`);
    console.log(`   Land cells: ${gridData.metadata.landCells.toLocaleString()}`);
    console.log(`   Water cells: ${gridData.metadata.waterCells.toLocaleString()}`);
    console.log(`   Resolution: ${gridData.metadata.resolution}°\n`);
    
    // Calculate number of chunks needed
    const totalChunks = Math.ceil(gridData.cells.length / CELLS_PER_CHUNK);
    const fileSizeMB = (JSON.stringify(gridData).length / (1024 * 1024)).toFixed(2);
    
    console.log(`📊 Chunking Strategy:`);
    console.log(`   File size: ${fileSizeMB} MB`);
    console.log(`   Cells per chunk: ${CELLS_PER_CHUNK.toLocaleString()}`);
    console.log(`   Total chunks needed: ${totalChunks}\n`);
    
    // Delete old grid chunks
    console.log('🗑️  Deleting old grid chunks...');
    const deleteResult = await Grid.deleteMany({ 
      name: { $regex: /^Indian Ocean Navigation Grid/ }
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} old chunk(s)\n`);
    
    // Split cells into chunks and save
    console.log('💾 Saving grid chunks to database...\n');
    
    for (let i = 0; i < totalChunks; i++) {
      const startIdx = i * CELLS_PER_CHUNK;
      const endIdx = Math.min(startIdx + CELLS_PER_CHUNK, gridData.cells.length);
      const chunkCells = gridData.cells.slice(startIdx, endIdx);
      
      const gridDocument = {
        name: `Indian Ocean Navigation Grid (Shapefile) - Chunk ${i + 1}/${totalChunks}`,
        bounds: {
          north: gridData.metadata.bounds.latMax,
          south: gridData.metadata.bounds.latMin,
          east: gridData.metadata.bounds.lonMax,
          west: gridData.metadata.bounds.lonMin
        },
        resolution: gridData.metadata.resolution,
        isChunked: true,
        chunkIndex: i,
        totalChunks: totalChunks,
        cells: chunkCells.map(cell => ({
          lat: cell.lat,
          lon: cell.lon,
          is_land: cell.is_land || false,
          obstacle: cell.obstacle || false,
          weather: cell.weather ? {
            temperature: cell.weather.temperature,
            windSpeed: cell.weather.windSpeed,
            waveHeight: cell.weather.waveHeight,
            visibility: cell.weather.visibility,
            humidity: cell.weather.humidity,
            lastUpdated: cell.weather.lastUpdated
          } : null
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: gridData.metadata
      };
      
      const newGrid = new Grid(gridDocument);
      await newGrid.save();
      
      const progress = ((i + 1) / totalChunks * 100).toFixed(1);
      console.log(`   ✅ Chunk ${i + 1}/${totalChunks} saved (${chunkCells.length.toLocaleString()} cells) - ${progress}%`);
    }
    
    // Display final statistics
    console.log('\n📊 Import Complete!');
    console.log('━'.repeat(60));
    
    const chunkCount = await Grid.countDocuments({ isChunked: true });
    
    console.log(`✅ Saved ${chunkCount} chunks`);
    console.log(`📍 Total cells: ${gridData.cells.length.toLocaleString()}`);
    console.log(`🗺️  Resolution: ${gridData.metadata.resolution}° (~${Math.round(gridData.metadata.resolution * 111)}km)`);
    console.log(`📏 Coverage: ${gridData.metadata.bounds.lonMin}°E to ${gridData.metadata.bounds.lonMax}°E`);
    console.log(`           ${gridData.metadata.bounds.latMin}°S to ${gridData.metadata.bounds.latMax}°N`);
    console.log('━'.repeat(60));
    
    console.log('\n✨ Grid import complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart backend: npm start');
    console.log('   2. Test route calculation');
    console.log('   3. Routes should now follow coastlines with 11km accuracy!\n');
    
  } catch (error) {
    console.error('\n❌ Error importing grid:', error.message);
    console.error(error.stack);
  } finally {
    console.log('🔌 Database connection closed.');
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  importChunkedGrid()
    .then(() => {
      console.log('\n✅ Import process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importChunkedGrid };
