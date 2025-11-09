/**
 * Add Mock Weather Data to Grid
 * 
 * This adds realistic weather variations so route modes can differentiate.
 * In production, use real weather API (weatherOnlyUpdater.js)
 */

const fs = require('fs');
const path = require('path');

function generateMockWeather(lat, lon) {
  // Create realistic variations based on location
  // Bay of Bengal (80-92°E) tends to have rougher seas
  // Southern Indian Ocean has stronger winds
  // Western coast generally calmer
  
  const isBayOfBengal = lon > 80 && lon < 92 && lat > 10 && lat < 22;
  const isSouthernOcean = lat < 0;
  const isWesternCoast = lon < 75;
  
  // Base values
  let windSpeed = 8 + Math.random() * 12; // 8-20 m/s
  let waveHeight = 1 + Math.random() * 3; // 1-4 m
  let temperature = 25 + Math.random() * 5; // 25-30°C
  let visibility = 8000 + Math.random() * 2000; // 8-10 km
  
  // Apply regional variations
  if (isBayOfBengal) {
    windSpeed += 5; // Rougher in Bay of Bengal
    waveHeight += 1.5;
    visibility -= 2000; // More humid, less visibility
  }
  
  if (isSouthernOcean) {
    windSpeed += 8; // Much rougher in southern latitudes
    waveHeight += 2;
    temperature -= 10; // Colder
  }
  
  if (isWesternCoast) {
    windSpeed -= 3; // Calmer near western coast
    waveHeight -= 0.5;
    visibility += 1000;
  }
  
  // Random wind direction (0-360°)
  const windDirection = Math.floor(Math.random() * 360);
  
  return {
    temperature: parseFloat(temperature.toFixed(1)),
    windSpeed: parseFloat(windSpeed.toFixed(1)),
    windDirection: windDirection,
    waveHeight: parseFloat(Math.max(0.5, waveHeight).toFixed(1)),
    visibility: Math.round(Math.max(1000, visibility)),
    lastUpdated: new Date().toISOString()
  };
}

async function addMockWeatherToGrid() {
  console.log('🌤️  Adding mock weather data to grid...\n');
  
  const gridPath = path.join(__dirname, 'gridData.json');
  
  if (!fs.existsSync(gridPath)) {
    console.log('❌ gridData.json not found!');
    return;
  }
  
  console.log('📂 Loading grid...');
  const gridData = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
  
  console.log(`📊 Processing ${gridData.grid.length} cells...\n`);
  
  let waterCount = 0;
  let landCount = 0;
  
  // Add weather to water cells only
  for (const cell of gridData.grid) {
    if (cell.is_land) {
      landCount++;
      // Land cells don't need weather
      cell.weather = {
        temperature: null,
        windSpeed: null,
        windDirection: null,
        waveHeight: null,
        visibility: null,
        lastUpdated: null
      };
    } else {
      waterCount++;
      // Water cells get realistic mock weather
      cell.weather = generateMockWeather(cell.lat, cell.lon);
    }
  }
  
  // Update metadata
  gridData.metadata.weatherLastUpdated = new Date().toISOString();
  gridData.metadata.weatherSource = 'Mock Data (for testing)';
  
  console.log('💾 Saving updated grid...');
  fs.writeFileSync(gridPath, JSON.stringify(gridData, null, 2));
  
  console.log('\n✅ Mock weather data added!');
  console.log(`   🌊 Water cells with weather: ${waterCount}`);
  console.log(`   🏔️  Land cells (no weather): ${landCount}`);
  console.log('\n📌 Sample weather data:');
  
  const waterCells = gridData.grid.filter(c => !c.is_land).slice(0, 5);
  waterCells.forEach(cell => {
    console.log(`   (${cell.lat}, ${cell.lon}): Wind ${cell.weather.windSpeed}m/s, Waves ${cell.weather.waveHeight}m, Vis ${cell.weather.visibility}m`);
  });
  
  console.log('\n🎯 Next steps:');
  console.log('   1. node loadGrid.js  (import to MongoDB)');
  console.log('   2. npm start         (restart backend)');
  console.log('   3. node testRouteModes.js (test different routes)\n');
}

if (require.main === module) {
  addMockWeatherToGrid()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { addMockWeatherToGrid, generateMockWeather };
