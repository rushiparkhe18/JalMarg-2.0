/**
 * Route Weather Updater - Fast on-demand weather updates
 * Only updates weather for cells along a specific route
 * Takes seconds instead of hours!
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Grid = require('./models/Grid');
const config = require('./weatherConfig');

/**
 * Fetch weather for a single cell from Open-Meteo API
 */
async function fetchWeatherForCell(lat, lon) {
  try {
    // Use simpler API format - single request with current weather
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat.toFixed(2),
        longitude: lon.toFixed(2),
        current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation',
        timezone: 'auto'
      },
      timeout: 5000
    });

    const current = response.data.current;

    // Estimate wave conditions from wind speed (simplified marine data)
    const windSpeed = current.wind_speed_10m || 10;
    const estimatedWaveHeight = Math.min(windSpeed * 0.15, 6); // Rough estimate: wind/6.67
    const estimatedWavePeriod = Math.max(3, Math.min(estimatedWaveHeight * 2, 12));

    return {
      temperature: current.temperature_2m || 25,
      windSpeed: windSpeed,
      windDirection: current.wind_direction_10m || 0,
      windGusts: current.wind_gusts_10m || windSpeed * 1.5,
      waveHeight: parseFloat(estimatedWaveHeight.toFixed(1)),
      waveDirection: current.wind_direction_10m || 0, // Waves follow wind
      wavePeriod: parseFloat(estimatedWavePeriod.toFixed(1)),
      visibility: 10000,
      cloudCover: current.cloud_cover || 50,
      precipitation: current.precipitation || 0,
      timestamp: new Date()
    };
  } catch (error) {
    // Don't log every error to reduce noise
    if (config.VERBOSE_LOGGING) {
      console.error(`❌ Weather fetch failed for (${lat.toFixed(2)}, ${lon.toFixed(2)}):`, error.message);
    }
    return null;
  }
}

/**
 * Update weather for specific route cells
 * @param {Array} routeCells - Array of {lat, lon} coordinates
 */
async function updateRouteWeather(routeCells) {
  if (!config.ENABLE_ROUTE_WEATHER_UPDATE) {
    if (config.VERBOSE_LOGGING) {
      console.log('ℹ️  Route weather updates disabled in config');
    }
    return { updated: 0, failed: 0, skipped: true };
  }

  if (!routeCells || routeCells.length === 0) {
    console.log('❌ No route cells provided');
    return { updated: 0, failed: 0 };
  }

  // SMART SAMPLING: Fetch weather for key points (start, 25%, 50%, 75%, end) + random samples
  const keyIndices = [
    0, // Start
    Math.floor(routeCells.length * 0.25), // 25%
    Math.floor(routeCells.length * 0.50), // Middle
    Math.floor(routeCells.length * 0.75), // 75%
    routeCells.length - 1 // End
  ];
  
  const sampledIndices = new Set(keyIndices);
  
  // Add random samples
  for (let i = 0; i < routeCells.length; i++) {
    if (Math.random() < config.SAMPLE_RATE) {
      sampledIndices.add(i);
    }
  }
  
  const sampledCells = Array.from(sampledIndices)
    .sort((a, b) => a - b)
    .map(i => ({ ...routeCells[i], index: i }));

  if (config.VERBOSE_LOGGING) {
    console.log(`🔄 Fetching weather for ${sampledCells.length}/${routeCells.length} cells (key points + ${(config.SAMPLE_RATE * 100).toFixed(0)}% random)`);
  }
  
  let updated = 0;
  let failed = 0;
  const weatherMap = new Map(); // Store fetched weather data

  for (let i = 0; i < sampledCells.length; i++) {
    const { lat, lon, index } = sampledCells[i];
    
    // Add delay between requests
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, config.API_DELAY_MS));
    }

    const weather = await fetchWeatherForCell(lat, lon);
    
    if (weather) {
      try {
        // Store weather in map for immediate use
        const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
        weatherMap.set(key, weather);
        
        // Also update database for caching (fire and forget)
        Grid.updateOne(
          { lat, lon },
          { $set: { weather } }
        ).catch(err => {}); // Ignore DB errors
        
        updated++;
        
        if (config.VERBOSE_LOGGING && ((i + 1) % 5 === 0 || i === sampledCells.length - 1)) {
          const progress = ((i + 1) / sampledCells.length * 100).toFixed(1);
          console.log(`   Progress: ${progress}% (${updated} updated, ${failed} failed)`);
        }
      } catch (error) {
        console.error(`❌ Weather fetch failed for (${lat}, ${lon}):`, error.message);
        failed++;
      }
    } else {
      failed++;
    }
  }

  if (config.VERBOSE_LOGGING) {
    console.log(`✅ Weather fetch complete: ${updated} cells, ${failed} failed`);
  }

  return { updated, failed, weatherMap }; // Return weather data directly
}

/**
 * Extract unique cells from a route path
 */
function extractRouteCells(routePath) {
  const uniqueCells = new Map();
  
  for (const point of routePath) {
    const key = `${point.lat},${point.lon}`;
    if (!uniqueCells.has(key)) {
      uniqueCells.set(key, { lat: point.lat, lon: point.lon });
    }
  }
  
  return Array.from(uniqueCells.values());
}

// CLI usage
if (require.main === module) {
  const testRoute = [
    { lat: 18.97, lon: 72.83 }, // Mumbai
    { lat: 18.50, lon: 73.00 },
    { lat: 17.50, lon: 74.00 },
    { lat: 16.50, lon: 75.50 },
    { lat: 15.50, lon: 77.00 },
    { lat: 14.50, lon: 78.50 },
    { lat: 13.08, lon: 80.27 }  // Chennai
  ];

  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected\n');
      
      await updateRouteWeather(testRoute);
      
      await mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { updateRouteWeather, extractRouteCells, fetchWeatherForCell };
