const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Grid Cache Manager
 * Saves and loads pre-computed grid data for instant loading
 * Supports compression to reduce file size
 */

class GridCacheManager {
  constructor(cacheDir = __dirname) {
    this.cacheDir = cacheDir;
    this.gridCacheFile = path.join(cacheDir, 'gridData.json');
    this.compressedCacheFile = path.join(cacheDir, 'gridData.json.gz');
    this.metadataFile = path.join(cacheDir, 'gridMetadata.json');
  }

  /**
   * Check if cached grid exists
   */
  hasCachedGrid() {
    return fs.existsSync(this.gridCacheFile);
  }

  /**
   * Check if compressed cache exists
   */
  hasCompressedCache() {
    return fs.existsSync(this.compressedCacheFile);
  }

  /**
   * Save grid data to cache file
   */
  saveGrid(gridData) {
    console.log('💾 Saving grid to cache...');
    
    try {
      // Save full JSON
      fs.writeFileSync(this.gridCacheFile, JSON.stringify(gridData, null, 2));
      const fileSize = fs.statSync(this.gridCacheFile).size;
      console.log(`✅ Grid saved: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

      // Save compressed version (much smaller for distribution)
      const compressed = zlib.gzipSync(JSON.stringify(gridData));
      fs.writeFileSync(this.compressedCacheFile, compressed);
      const compressedSize = fs.statSync(this.compressedCacheFile).size;
      console.log(`✅ Compressed saved: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`   Compression ratio: ${((1 - compressedSize/fileSize) * 100).toFixed(1)}%\n`);

      // Save metadata for quick info
      const metadata = {
        totalPoints: gridData.grid.length,
        waterPoints: gridData.grid.filter(p => !p.is_land).length,
        landPoints: gridData.grid.filter(p => p.is_land).length,
        latRange: gridData.metadata.latRange,
        lonRange: gridData.metadata.lonRange,
        resolution: gridData.metadata.resolution,
        generatedAt: new Date().toISOString(),
        version: '2.0',
        apiUsed: 'is-on-water (FREE)'
      };
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));

      return true;
    } catch (error) {
      console.error('❌ Failed to save grid:', error.message);
      return false;
    }
  }

  /**
   * Load grid from cache (INSTANT - no API calls!)
   */
  loadGrid() {
    console.log('📂 Loading grid from cache...');
    
    try {
      if (!this.hasCachedGrid()) {
        throw new Error('No cached grid found. Please generate grid first.');
      }

      const gridData = JSON.parse(fs.readFileSync(this.gridCacheFile, 'utf8'));
      
      console.log(`✅ Loaded ${gridData.grid.length} points INSTANTLY (no API calls!)\n`);
      
      return gridData;
    } catch (error) {
      console.error('❌ Failed to load grid:', error.message);
      return null;
    }
  }

  /**
   * Load from compressed file (for initial setup)
   */
  loadCompressed() {
    console.log('📂 Loading compressed grid...');
    
    try {
      if (!this.hasCompressedCache()) {
        throw new Error('No compressed grid found.');
      }

      const compressed = fs.readFileSync(this.compressedCacheFile);
      const decompressed = zlib.gunzipSync(compressed);
      const gridData = JSON.parse(decompressed.toString());
      
      // Save uncompressed for faster access
      fs.writeFileSync(this.gridCacheFile, JSON.stringify(gridData, null, 2));
      
      console.log(`✅ Decompressed and loaded ${gridData.grid.length} points\n`);
      
      return gridData;
    } catch (error) {
      console.error('❌ Failed to load compressed grid:', error.message);
      return null;
    }
  }

  /**
   * Get grid metadata (quick info without loading full grid)
   */
  getMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) {
        return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Display cache information
   */
  displayCacheInfo() {
    console.log('═══════════════════════════════════════════════════');
    console.log('   📊 GRID CACHE STATUS');
    console.log('═══════════════════════════════════════════════════\n');

    const metadata = this.getMetadata();
    
    if (metadata) {
      console.log('✅ Cached Grid Available:');
      console.log(`   Total Points: ${metadata.totalPoints}`);
      console.log(`   Water Points: ${metadata.waterPoints}`);
      console.log(`   Land Points: ${metadata.landPoints}`);
      console.log(`   Lat Range: ${metadata.latRange[0]}° to ${metadata.latRange[1]}°`);
      console.log(`   Lon Range: ${metadata.lonRange[0]}° to ${metadata.lonRange[1]}°`);
      console.log(`   Resolution: ${metadata.resolution}°`);
      console.log(`   Generated: ${new Date(metadata.generatedAt).toLocaleString()}`);
      console.log(`   API Used: ${metadata.apiUsed}`);
      console.log(`   Version: ${metadata.version}\n`);

      if (this.hasCachedGrid()) {
        const fileSize = fs.statSync(this.gridCacheFile).size;
        console.log(`📁 Cache Files:`);
        console.log(`   gridData.json: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      }
      
      if (this.hasCompressedCache()) {
        const compressedSize = fs.statSync(this.compressedCacheFile).size;
        console.log(`   gridData.json.gz: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB`);
      }
      
      console.log('\n💡 To use cached grid:');
      console.log('   node quickImportGrid.js\n');
    } else {
      console.log('❌ No cached grid found');
      console.log('\n💡 Generate grid first:');
      console.log('   node gridGenerator.js\n');
    }

    console.log('═══════════════════════════════════════════════════\n');
  }
}

// CLI usage
if (require.main === module) {
  const manager = new GridCacheManager();
  manager.displayCacheInfo();
}

module.exports = GridCacheManager;
