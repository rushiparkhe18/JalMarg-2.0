/**
 * Smart Weather Cache - Regional weather updates
 * Divides ocean into regions, updates one region at a time
 * Much faster than updating all cells!
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Grid = require('./models/Grid');

// Define regions (lat/lon boundaries)
const REGIONS = {
  arabian_sea: { latMin: 8, latMax: 25, lonMin: 60, lonMax: 75 },
  bay_of_bengal: { latMin: 5, latMax: 22, lonMin: 80, lonMax: 95 },
  indian_ocean_west: { latMin: -10, latMax: 5, lonMin: 50, lonMax: 75 },
  indian_ocean_east: { latMin: -10, latMax: 5, lonMin: 75, lonMax: 100 },
  southern_ocean: { latMin: -45, latMax: -10, lonMin: 20, lonMax: 120 }
};

/**
 * Get cells in a specific region
 */
async function getCellsInRegion(regionName) {
  const region = REGIONS[regionName];
  if (!region) {
    throw new Error(`Unknown region: ${regionName}`);
  }

  const cells = await Grid.find({
    lat: { $gte: region.latMin, $lte: region.latMax },
    lon: { $gte: region.lonMin, $lte: region.lonMax },
    is_land: false
  }).select('lat lon weather').lean();

  return cells;
}

/**
 * Fetch weather for a single cell
 */
async function fetchWeather(lat, lon) {
  try {
    const [forecast, marine] = await Promise.all([
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat.toFixed(2),
          longitude: lon.toFixed(2),
          current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
          timezone: 'auto'
        },
        timeout: 5000
      }),
      axios.get('https://marine-api.open-meteo.com/v1/marine', {
        params: {
          latitude: lat.toFixed(2),
          longitude: lon.toFixed(2),
          current: 'wave_height,wave_direction,wave_period',
          timezone: 'auto'
        },
        timeout: 5000
      })
    ]);

    return {
      temperature: forecast.data.current.temperature_2m || 25,
      windSpeed: forecast.data.current.wind_speed_10m || 10,
      windDirection: forecast.data.current.wind_direction_10m || 0,
      windGusts: forecast.data.current.wind_gusts_10m || 15,
      waveHeight: marine.data.current.wave_height || 1.5,
      waveDirection: marine.data.current.wave_direction || 0,
      wavePeriod: marine.data.current.wave_period || 6,
      visibility: 10000,
      cloudCover: 50,
      precipitation: 0,
      timestamp: new Date()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Update weather for a specific region
 */
async function updateRegionWeather(regionName) {
  console.log(`\n🌊 Updating weather for region: ${regionName}`);
  
  const cells = await getCellsInRegion(regionName);
  console.log(`   Found ${cells.length} water cells in this region`);
  
  if (cells.length === 0) {
    console.log('   ⚠️  No cells to update in this region');
    return { updated: 0, failed: 0 };
  }

  let updated = 0;
  let failed = 0;

  // Sample cells (every 2nd cell for faster updates)
  const sampledCells = cells.filter((_, i) => i % 2 === 0);
  console.log(`   📊 Updating ${sampledCells.length} sampled cells (50% coverage)`);

  for (let i = 0; i < sampledCells.length; i++) {
    const cell = sampledCells[i];
    
    // Rate limiting: 5 req/sec = 200ms delay
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const weather = await fetchWeather(cell.lat, cell.lon);
    
    if (weather) {
      await Grid.updateOne(
        { lat: cell.lat, lon: cell.lon },
        { $set: { weather } }
      );
      updated++;
    } else {
      failed++;
    }

    if ((i + 1) % 20 === 0 || i === sampledCells.length - 1) {
      const progress = ((i + 1) / sampledCells.length * 100).toFixed(1);
      const eta = Math.ceil((sampledCells.length - i - 1) * 0.2);
      console.log(`   Progress: ${progress}% | ETA: ${eta}s`);
    }
  }

  console.log(`\n✅ Region ${regionName} update complete!`);
  console.log(`   Updated: ${updated} | Failed: ${failed}`);
  
  return { updated, failed };
}

/**
 * Update all regions in rotation
 */
async function updateAllRegionsRotating() {
  const regionNames = Object.keys(REGIONS);
  let totalUpdated = 0;
  let totalFailed = 0;

  console.log(`🔄 Starting regional weather updates (${regionNames.length} regions)`);
  
  for (const regionName of regionNames) {
    const result = await updateRegionWeather(regionName);
    totalUpdated += result.updated;
    totalFailed += result.failed;
    
    // 5 second delay between regions
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`\n🎉 All regions updated!`);
  console.log(`   Total updated: ${totalUpdated}`);
  console.log(`   Total failed: ${totalFailed}`);
  
  return { updated: totalUpdated, failed: totalFailed };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const regionName = args[0];

  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');

      if (regionName && REGIONS[regionName]) {
        // Update specific region
        await updateRegionWeather(regionName);
      } else if (regionName === 'all') {
        // Update all regions
        await updateAllRegionsRotating();
      } else {
        // Show available regions
        console.log('\n📍 Available regions:');
        Object.keys(REGIONS).forEach(name => {
          console.log(`   - ${name}`);
        });
        console.log('\nUsage:');
        console.log('  node smartWeatherCache.js <region_name>  # Update one region');
        console.log('  node smartWeatherCache.js all            # Update all regions');
        console.log('\nExample:');
        console.log('  node smartWeatherCache.js arabian_sea');
      }

      await mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { updateRegionWeather, updateAllRegionsRotating, getCellsInRegion };
