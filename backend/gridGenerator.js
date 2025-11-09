const fs = require('fs');
const path = require('path');
const LandDetectionService = require('./landDetection');
require('dotenv').config();

/**
 * Grid Generator for Indian Ocean Maritime Navigation with Land Detection
 * Generates grid points for the complete Indian Ocean region
 * Latitude: -38.4° to +30.58°, Longitude: 22.15° to 142.48°
 * Step: 1 degree
 * Marks land cells as obstacles using IsItWater API (100% accurate)
 */

// Allow overriding resolution via ENV or CLI argument (node gridGenerator.js 0.5)
const DEFAULT_RESOLUTION = 0.5; // user-requested default for better accuracy
const cliResolution = parseFloat(process.argv[2]);
const envResolution = process.env.GRID_RESOLUTION ? parseFloat(process.env.GRID_RESOLUTION) : undefined;
const RESOLUTION = Number.isFinite(cliResolution) ? cliResolution : (Number.isFinite(envResolution) ? envResolution : DEFAULT_RESOLUTION);

const GRID_CONFIG = {
  latMin: -38.4,
  latMax: 30.58,
  lonMin: 22.15,
  lonMax: 142.48,
  step: RESOLUTION,
};

async function generateGrid() {
  console.log('🌊 Starting Indian Ocean Grid Generation with Land Detection...\n');
  console.log('Grid Configuration:');
  console.log(`  Latitude Range: ${GRID_CONFIG.latMin}° to ${GRID_CONFIG.latMax}°`);
  console.log(`  Longitude Range: ${GRID_CONFIG.lonMin}° to ${GRID_CONFIG.lonMax}°`);
  console.log(`  Step Size: ${GRID_CONFIG.step}°\n`);

  const landDetector = new LandDetectionService();

  const gridData = {
    metadata: {
      region: 'Indian Ocean',
      bounds: {
        north: GRID_CONFIG.latMax,
        south: GRID_CONFIG.latMin,
        east: GRID_CONFIG.lonMax,
        west: GRID_CONFIG.lonMin,
      },
      name: 'Indian Ocean Navigation Grid',
      latRange: [GRID_CONFIG.latMin, GRID_CONFIG.latMax],
      lonRange: [GRID_CONFIG.lonMin, GRID_CONFIG.lonMax],
      resolution: GRID_CONFIG.step,
      totalPoints: 0,
      waterPoints: 0,
      landPoints: 0,
      generatedAt: new Date().toISOString(),
      version: 'v1',
    },
    grid: [],
  };

  let pointCount = 0;
  let waterCount = 0;
  let landCount = 0;

  // Generate grid points with land detection
  console.log('🔍 Generating grid points first...');
  
  // First, generate all grid points without detection
  const tempGrid = [];
  for (let lat = GRID_CONFIG.latMin; lat <= GRID_CONFIG.latMax; lat += GRID_CONFIG.step) {
    for (let lon = GRID_CONFIG.lonMin; lon <= GRID_CONFIG.lonMax; lon += GRID_CONFIG.step) {
      tempGrid.push({
        id: `grid_${lat}_${lon}`,
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lon.toFixed(6)),
        weather: {
          temperature: null,
          windSpeed: null,
          windDirection: null,
          waveHeight: null,
          visibility: null,
          lastUpdated: null,
        },
        safety: 0,
        fuel_efficiency: 0,
        distance: 0,
      });
      pointCount++;
    }
  }

  console.log(`✅ Generated ${pointCount} grid points`);
  console.log(`\n🌍 Now detecting land/water using FREE-first multi-tier detection (boundary -> marine -> public is-on-water -> fallback)...`);
  console.log(`⏱️  Estimated time (rough): ${((pointCount * 0.15) / 60).toFixed(1)} minutes\n`);
  
  // Now detect land for all points in batch
  const gridWithLand = await landDetector.detectLandBatch(tempGrid);
  
  gridData.grid = gridWithLand;
  
  // Count land and water
  landCount = gridWithLand.filter(p => p.is_land === true).length;
  waterCount = gridWithLand.filter(p => p.is_land === false).length;
  gridData.metadata.totalPoints = pointCount;
  gridData.metadata.waterPoints = waterCount;
  gridData.metadata.landPoints = landCount;

  // Save to JSON file AND create cache
  const outputPath = path.join(__dirname, 'gridData.json');
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(gridData, null, 2));
    console.log(`✅ Grid generation complete!`);
    console.log(`📊 Total Points Generated: ${pointCount}`);
    console.log(`   🌊 Water Points: ${waterCount} (${((waterCount/pointCount)*100).toFixed(1)}%)`);
    console.log(`   🏔️  Land Points: ${landCount} (${((landCount/pointCount)*100).toFixed(1)}%)`);
    console.log(`💾 Saved to: ${outputPath}\n`);
    
    // Create compressed cache for distribution
    const GridCacheManager = require('./gridCacheManager');
    const cacheManager = new GridCacheManager();
    cacheManager.saveGrid(gridData);
    
    // Display sample data
    console.log('📍 Sample Grid Points:');
    console.log(JSON.stringify(gridData.grid.slice(0, 3), null, 2));
    
    // Display statistics
    const fileSize = fs.statSync(outputPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    console.log(`\n📦 File Size: ${fileSizeMB} MB`);
    
    return gridData;
  } catch (error) {
    console.error('❌ Error saving grid data:', error.message);
    throw error;
  }
}

// Helper function to calculate grid dimensions
function getGridDimensions() {
  const latPoints = Math.floor((GRID_CONFIG.latMax - GRID_CONFIG.latMin) / GRID_CONFIG.step) + 1;
  const lonPoints = Math.floor((GRID_CONFIG.lonMax - GRID_CONFIG.lonMin) / GRID_CONFIG.step) + 1;
  const totalPoints = latPoints * lonPoints;
  
  console.log('\n📐 Grid Dimensions:');
  console.log(`  Latitude Points: ${latPoints}`);
  console.log(`  Longitude Points: ${lonPoints}`);
  console.log(`  Total Grid Points: ${totalPoints}`);
  
  return { latPoints, lonPoints, totalPoints };
}

// Run the generator
if (require.main === module) {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   🌊 INDIAN OCEAN GRID GENERATOR 🌊');
  console.log('   Maritime Navigation System');
  console.log('═══════════════════════════════════════════════════\n');
  
  getGridDimensions();
  console.log('');
  
  generateGrid()
    .then(() => {
      console.log('\n✨ Grid generation successful!');
      console.log('You can now use this data for maritime navigation.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Grid generation failed:', error);
      process.exit(1);
    });
}

// Export for use in other modules
module.exports = { generateGrid, GRID_CONFIG };
