const GridCacheManager = require('./gridCacheManager');
const quickImport = require('./quickImportGrid');

/**
 * SMART GRID SETUP
 * Automatically detects and loads cached grid (INSTANT!)
 * No need to regenerate grid every time
 */

async function smartSetup() {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   🚀 SMART GRID SETUP');
  console.log('   Jalmarg 2.0 Maritime Navigation');
  console.log('═══════════════════════════════════════════════════\n');

  const cacheManager = new GridCacheManager();

  // Check if cached grid exists
  if (cacheManager.hasCachedGrid()) {
    console.log('✅ Found cached grid! Loading instantly...\n');
    
    const metadata = cacheManager.getMetadata();
    if (metadata) {
      console.log('📊 Grid Information:');
      console.log(`   Total Points: ${metadata.totalPoints}`);
      console.log(`   Water: ${metadata.waterPoints}, Land: ${metadata.landPoints}`);
      
      // Safely display ranges
      if (metadata.latRange && metadata.latRange.length === 2) {
        console.log(`   Coverage: Lat ${metadata.latRange[0]}° to ${metadata.latRange[1]}°`);
      }
      if (metadata.lonRange && metadata.lonRange.length === 2) {
        console.log(`   Coverage: Lon ${metadata.lonRange[0]}° to ${metadata.lonRange[1]}°`);
      }
      if (metadata.generatedAt) {
        console.log(`   Generated: ${new Date(metadata.generatedAt).toLocaleString()}`);
      }
      if (metadata.version) {
        console.log(`   Version: ${metadata.version}`);
      }
      console.log('');
    }

    console.log('⚡ Importing to MongoDB (takes ~5 seconds)...\n');
    await quickImport();
    
    console.log('✨ SETUP COMPLETE! Grid loaded INSTANTLY!');
    console.log('💡 No API calls needed - using cached data\n');
    
  } else if (cacheManager.hasCompressedCache()) {
    console.log('📦 Found compressed grid cache...');
    console.log('🔓 Decompressing...\n');
    
    const gridData = cacheManager.loadCompressed();
    
    if (gridData) {
      console.log('⚡ Importing to MongoDB...\n');
      await quickImport();
      console.log('✨ SETUP COMPLETE!\n');
    }
    
  } else {
    console.log('❌ No cached grid found!\n');
    console.log('Please generate the grid first:');
    console.log('  node gridGenerator.js [resolution]\n');

    // Compute expected size based on default/ENV resolution
    const DEFAULT_RESOLUTION = 0.5;
    const envRes = process.env.GRID_RESOLUTION ? parseFloat(process.env.GRID_RESOLUTION) : undefined;
    const resolution = Number.isFinite(envRes) ? envRes : DEFAULT_RESOLUTION;
    const bounds = { north: 30.58, south: -38.4, east: 142.48, west: 22.15 };
    const latPoints = Math.floor((bounds.north - bounds.south) / resolution) + 1;
    const lonPoints = Math.floor((bounds.east - bounds.west) / resolution) + 1;
    const totalPoints = latPoints * lonPoints;
    const estMinutes = ((totalPoints * 0.15) / 60).toFixed(1);

    console.log('This will:');
    console.log(`  • Generate ${totalPoints.toLocaleString()} grid points (${latPoints} x ${lonPoints}) at ${resolution}° resolution`);
    console.log('  • Detect land/water using FREE APIs (multi-tier)');
    console.log('  • Save to cache for future instant loading');
    console.log(`  • Estimated time (rough): ${estMinutes} minutes (ONE TIME ONLY)\n`);
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('   ✅ READY FOR NAVIGATION');
  console.log('   You can now start the backend server');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run setup
if (require.main === module) {
  smartSetup().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = smartSetup;
