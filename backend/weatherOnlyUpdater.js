const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Grid = require('./models/Grid');

/**
 * WEATHER-ONLY UPDATER
 * Updates ONLY weather data (NOT land status) every 3-4 hours
 * Land detection is done ONCE during grid generation and never changes
 */

class WeatherOnlyUpdater {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
    this.marineUrl = 'https://marine-api.open-meteo.com/v1/marine';
    this.requestCount = 0;
    this.updateInterval = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
  }

  /**
   * Fetch weather data for a point (NO land detection)
   * Handles rate limits with exponential backoff
   * Uses simplified API format - single request only
   */
  async fetchWeatherOnly(latitude, longitude, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Add small delay before each request to avoid rate limits
        if (attempt > 0) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }

        // Single API request - simpler and faster
        const weather = await axios.get(`${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,pressure_msl&timezone=auto`);

        this.requestCount++;

        const current = weather.data.current;
        const windSpeed = current?.wind_speed_10m || 10;
        
        // Estimate wave conditions from wind speed
        const estimatedWaveHeight = Math.min(windSpeed * 0.15, 6);
        const estimatedWavePeriod = Math.max(3, Math.min(estimatedWaveHeight * 2, 12));

        return {
          temperature: current?.temperature_2m || null,
          windSpeed: windSpeed,
          windDirection: current?.wind_direction_10m || null,
          windGusts: current?.wind_gusts_10m || null,
          waveHeight: parseFloat(estimatedWaveHeight.toFixed(1)),
          waveDirection: current?.wind_direction_10m || null, // Waves follow wind
          wavePeriod: parseFloat(estimatedWavePeriod.toFixed(1)),
          precipitation: current?.precipitation || 0,
          cloudCover: current?.cloud_cover || null,
          pressure: current?.pressure_msl || null,
          visibility: this.calculateVisibility(current?.cloud_cover),
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        if (error.response?.status === 429 && attempt < retries - 1) {
          // Rate limited, will retry
          continue;
        }
        // Final attempt failed or other error
        if (attempt === retries - 1) {
          console.error(`❌ Weather fetch failed for (${latitude.toFixed(1)}, ${longitude.toFixed(1)}) after ${retries} attempts`);
        }
        return null;
      }
    }
    return null;
  }

  calculateVisibility(cloudCover) {
    if (!cloudCover) return 10000;
    if (cloudCover > 90) return 2000;
    if (cloudCover > 70) return 5000;
    if (cloudCover > 50) return 8000;
    return 10000;
  }

  /**
   * Update weather for all grid cells (batch with rate limiting)
   * IMPORTANT: This ONLY updates weather fields - is_land stays PERMANENT
   * 
   * Rate limits: Open-Meteo allows ~5 requests/second
   * With 200ms delay between requests = 5 req/sec max
   */
  async updateAllWeather(batchSize = 10, delayMs = 2000) {
    try {
      console.log('\n═══════════════════════════════════════════════════');
      console.log('   🌦️  WEATHER-ONLY UPDATE');
      console.log('   ✅ Land status: PERMANENT (not changed)');
      console.log('   🔄 Weather data: UPDATING from API');
      console.log('═══════════════════════════════════════════════════\n');

      const startTime = Date.now();

      // Connect to MongoDB
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
      }

      // Get grid
      const grids = await Grid.find({});
      if (!grids || grids.length === 0) {
        console.error('❌ No grid found in database');
        return;
      }

      const grid = grids[0];
      const cells = grid.cells;
      const waterCells = cells.filter(c => !c.obstacle && !c.is_land);

      console.log(`📊 Grid Stats:`);
      console.log(`   Total cells: ${cells.length.toLocaleString()}`);
      console.log(`   🌊 Water cells (to update): ${waterCells.length.toLocaleString()}`);
      console.log(`   🏔️  Land cells (skip): ${(cells.length - waterCells.length).toLocaleString()}`);
      console.log(`   📍 Resolution: ${grid.resolution}°\n`);

      // Only update WATER cells (no point updating weather for land)
      console.log(`🔄 Fetching real weather data from Open-Meteo API...`);
      console.log(`   Batch size: ${batchSize} cells`);
      console.log(`   Delay: ${delayMs}ms between batches`);
      console.log(`   Estimated time: ~${Math.ceil((waterCells.length / batchSize) * delayMs / 1000 / 60)} minutes\n`);

      let updated = 0;
      let failed = 0;
      let rateLimited = 0;

      for (let i = 0; i < waterCells.length; i += batchSize) {
        const batch = waterCells.slice(i, i + batchSize);
        
        // Process batch sequentially to respect rate limits
        const results = [];
        for (const cell of batch) {
          const weather = await this.fetchWeatherOnly(cell.lat, cell.lon);
          results.push(weather);
          
          // Small delay between individual requests
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms between requests
        }

        // Update cells with new weather data
        results.forEach((weather, idx) => {
          if (weather) {
            const cell = batch[idx];
            cell.weather = weather;
            updated++;
          } else {
            failed++;
          }
        });

        const progress = Math.min(100, ((i + batchSize) / waterCells.length * 100)).toFixed(1);
        const eta = Math.ceil(((waterCells.length - i) / batchSize) * (delayMs + (batchSize * 200)) / 1000 / 60);
        console.log(`   Progress: ${progress}% (${updated} updated, ${failed} failed) | ETA: ~${eta} min`);

        // Rate limiting delay
        if (i + batchSize < waterCells.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      // Save updated grid
      console.log('\n💾 Saving updated grid to database...');
      await grid.save();

      console.log('\n✅ Weather update complete!');
      console.log(`   Updated: ${updated}`);
      console.log(`   Failed: ${failed}`);
      console.log(`   API calls: ${this.requestCount}`);
      console.log(`   Next update in: ${(this.updateInterval / (60 * 60 * 1000)).toFixed(1)} hours\n`);

    } catch (error) {
      console.error('❌ Weather update failed:', error.message);
      throw error;
    }
  }

  /**
   * Start automatic weather updates (every 3-4 hours)
   */
  startScheduler() {
    console.log('🕐 Weather-Only Scheduler Started');
    console.log(`📅 Update Interval: ${(this.updateInterval / (60 * 60 * 1000)).toFixed(1)} hours\n`);

    // Immediate update
    this.updateAllWeather();

    // Schedule periodic updates
    setInterval(() => {
      console.log('\n⏰ Scheduled weather update triggered...');
      this.updateAllWeather();
    }, this.updateInterval);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down weather scheduler...');
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      process.exit(0);
    });
  }
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const updater = new WeatherOnlyUpdater();

  if (args[0] === 'once') {
    // One-time update
    updater.updateAllWeather()
      .then(() => {
        console.log('✨ One-time weather update completed');
        mongoose.disconnect();
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Update failed:', error);
        process.exit(1);
      });
  } else {
    // Start scheduler (default)
    updater.startScheduler();
  }
}

module.exports = WeatherOnlyUpdater;
