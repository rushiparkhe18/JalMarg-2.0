const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Grid = require('./models/Grid');

/**
 * Weather Service - Real-Time Weather Integration
 * Fetches weather data from Open-Meteo API for maritime navigation
 * Updates both gridData.json and MongoDB Atlas
 */

class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
    this.marineUrl = 'https://marine-api.open-meteo.com/v1/marine';
    this.requestCount = 0;
    this.successCount = 0;
    this.failCount = 0;
  }

  /**
   * Fetch weather data for a single point
   */
  async fetchWeatherData(latitude, longitude) {
    try {
      const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_speed_80m,wind_direction_10m,temperature_2m,precipitation,visibility&wind_speed_unit=ms&timezone=auto`;
      
      const response = await axios.get(url);
      this.requestCount++;
      
      return {
        current: response.data.current,
        hourly: response.data.hourly,
        success: true,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch weather for (${latitude}, ${longitude}):`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch marine weather data (waves)
   */
  async fetchMarineData(latitude, longitude) {
    try {
      const url = `${this.marineUrl}?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height&hourly=wave_height,wave_direction,wave_period&timezone=auto`;
      
      const response = await axios.get(url);
      
      return {
        current: response.data.current,
        hourly: response.data.hourly,
        success: true,
      };
    } catch (error) {
      // Marine data might not be available for all locations (especially inland)
      return { success: false, error: error.message };
    }
  }

  /**
   * Process and combine weather + marine data
   */
  processWeatherData(weatherData, marineData) {
    const current = weatherData.current || {};
    const marine = marineData.success ? marineData.current : {};

    return {
      temperature: current.temperature_2m || null,
      windSpeed: current.wind_speed_10m || null,
      windDirection: current.wind_direction_10m || null,
      windGusts: current.wind_gusts_10m || null,
      waveHeight: marine.wave_height || null,
      waveDirection: marine.wave_direction || null,
      wavePeriod: marine.wave_period || null,
      precipitation: current.precipitation || 0,
      rain: current.rain || 0,
      showers: current.showers || 0,
      snowfall: current.snowfall || 0,
      visibility: this.calculateVisibility(current.cloud_cover),
      cloudCover: current.cloud_cover || null,
      humidity: current.relative_humidity_2m || null,
      pressure: current.pressure_msl || null,
      weatherCode: current.weather_code || null,
      lastUpdated: current.time || new Date().toISOString(),
    };
  }

  /**
   * Calculate visibility based on cloud cover and weather conditions
   */
  calculateVisibility(cloudCover) {
    if (!cloudCover) return 10000; // Default 10km
    if (cloudCover > 90) return 2000;  // Heavy clouds
    if (cloudCover > 70) return 5000;  // Moderate clouds
    if (cloudCover > 50) return 8000;  // Light clouds
    return 10000; // Clear
  }

  /**
   * Calculate safety score (0-100)
   */
  calculateSafetyScore(weather) {
    let score = 100;

    // Wind speed penalties (m/s)
    if (weather.windSpeed) {
      if (weather.windSpeed > 25) score -= 50;      // Storm force
      else if (weather.windSpeed > 20) score -= 40;  // Very strong
      else if (weather.windSpeed > 15) score -= 30;  // Strong gale
      else if (weather.windSpeed > 10) score -= 15;  // Moderate
      else if (weather.windSpeed > 5) score -= 5;    // Fresh breeze
    }

    // Wave height penalties (meters)
    if (weather.waveHeight) {
      if (weather.waveHeight > 6) score -= 40;      // Very high
      else if (weather.waveHeight > 4) score -= 30;  // High
      else if (weather.waveHeight > 2.5) score -= 20; // Moderate
      else if (weather.waveHeight > 1.5) score -= 10; // Slight
    }

    // Precipitation penalties
    if (weather.precipitation) {
      if (weather.precipitation > 10) score -= 20;   // Heavy rain
      else if (weather.precipitation > 5) score -= 15; // Moderate rain
      else if (weather.precipitation > 1) score -= 5;  // Light rain
    }

    // Visibility penalties
    if (weather.visibility < 1000) score -= 30;      // Very poor
    else if (weather.visibility < 5000) score -= 15; // Poor
    else if (weather.visibility < 8000) score -= 5;  // Moderate

    // Weather code penalties (severe weather)
    if (weather.weatherCode) {
      if ([95, 96, 99].includes(weather.weatherCode)) score -= 40; // Thunderstorm
      else if ([71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) score -= 25; // Snow
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate fuel efficiency (0-100)
   */
  calculateFuelEfficiency(weather) {
    let efficiency = 100;

    // Wind impact
    if (weather.windSpeed) {
      if (weather.windSpeed > 20) efficiency -= 40;
      else if (weather.windSpeed > 15) efficiency -= 30;
      else if (weather.windSpeed > 10) efficiency -= 20;
      else if (weather.windSpeed < 3) efficiency -= 10; // Too calm
    }

    // Wave impact
    if (weather.waveHeight) {
      if (weather.waveHeight > 5) efficiency -= 40;
      else if (weather.waveHeight > 3) efficiency -= 30;
      else if (weather.waveHeight > 2) efficiency -= 20;
      else if (weather.waveHeight > 1) efficiency -= 10;
    }

    // Temperature impact
    if (weather.temperature) {
      if (weather.temperature < 0) efficiency -= 15;  // Freezing
      else if (weather.temperature < 5) efficiency -= 10; // Cold
      else if (weather.temperature > 35) efficiency -= 10; // Very hot
    }

    // Precipitation impact
    if (weather.precipitation > 5) efficiency -= 15;

    return Math.max(0, Math.min(100, efficiency));
  }

  /**
   * Calculate movement cost for pathfinding
   */
  calculateCost(safety, fuelEfficiency) {
    // Cost ranges from 1 (best) to 10 (worst)
    const avgScore = (safety + fuelEfficiency) / 2;
    
    if (avgScore >= 90) return 1;
    if (avgScore >= 80) return 2;
    if (avgScore >= 70) return 3;
    if (avgScore >= 60) return 4;
    if (avgScore >= 50) return 5;
    if (avgScore >= 40) return 6;
    if (avgScore >= 30) return 7;
    if (avgScore >= 20) return 8;
    if (avgScore >= 10) return 9;
    return 10;
  }

  /**
   * Update a single grid point with weather data
   */
  async updateGridPoint(point) {
    const weatherData = await this.fetchWeatherData(point.lat, point.lon);
    const marineData = await this.fetchMarineData(point.lat, point.lon);

    if (!weatherData.success) {
      this.failCount++;
      return null;
    }

    const weather = this.processWeatherData(weatherData, marineData);
    const safety = this.calculateSafetyScore(weather);
    const fuelEfficiency = this.calculateFuelEfficiency(weather);
    const cost = this.calculateCost(safety, fuelEfficiency);

    this.successCount++;

    return {
      ...point,
      weather: {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        waveHeight: weather.waveHeight,
        visibility: weather.visibility,
        lastUpdated: weather.lastUpdated,
      },
      safety,
      fuel_efficiency: fuelEfficiency,
      cost,
      obstacle: safety < 20 ? true : point.obstacle, // Mark as obstacle if too dangerous
    };
  }

  /**
   * Update all grid points from JSON file
   */
  async updateGridFromJSON(sampleSize = null, delayMs = 100) {
    console.log('📂 Loading grid data from JSON...\n');
    
    const gridPath = path.join(__dirname, 'gridData.json');
    if (!fs.existsSync(gridPath)) {
      throw new Error('gridData.json not found. Run gridGenerator.js first.');
    }

    const gridData = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
    const points = sampleSize ? gridData.grid.slice(0, sampleSize) : gridData.grid;

    console.log(`📊 Total points: ${gridData.grid.length}`);
    console.log(`🎯 Updating: ${points.length} points\n`);
    console.log('⏳ Fetching weather data...\n');

    const startTime = Date.now();

    for (let i = 0; i < points.length; i++) {
      const updatedPoint = await this.updateGridPoint(points[i]);
      
      if (updatedPoint) {
        Object.assign(points[i], updatedPoint);
      }

      // Progress indicator
      const progress = ((i + 1) / points.length * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${i + 1}/${points.length} (${progress}%) | ✅ ${this.successCount} | ❌ ${this.failCount}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n\n✅ Weather update complete!');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Success: ${this.successCount} | ❌ Failed: ${this.failCount}\n`);

    // Save updated data
    gridData.metadata.lastWeatherUpdate = new Date().toISOString();
    const outputPath = path.join(__dirname, 'gridData_with_weather.json');
    fs.writeFileSync(outputPath, JSON.stringify(gridData, null, 2));
    console.log(`💾 Saved to: ${outputPath}\n`);

    return gridData;
  }

  /**
   * Update MongoDB grid with weather data
   */
  async updateGridInMongoDB(gridId = null, sampleSize = null, delayMs = 100) {
    console.log('🔌 Connecting to MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Find the grid
    let grid;
    if (gridId) {
      grid = await Grid.findById(gridId);
    } else {
      grid = await Grid.findOne().sort({ createdAt: -1 }); // Latest grid
    }

    if (!grid) {
      throw new Error('No grid found in database. Run importGrid.js first.');
    }

    console.log(`📊 Grid: ${grid.name}`);
    console.log(`📍 Total cells: ${grid.cells.length}`);
    
    const cellsToUpdate = sampleSize ? grid.cells.slice(0, sampleSize) : grid.cells;
    console.log(`🎯 Updating: ${cellsToUpdate.length} cells\n`);
    console.log('⏳ Fetching weather data...\n');

    const startTime = Date.now();

    for (let i = 0; i < cellsToUpdate.length; i++) {
      const cell = cellsToUpdate[i];
      const weatherData = await this.fetchWeatherData(cell.lat, cell.lon);
      const marineData = await this.fetchMarineData(cell.lat, cell.lon);

      if (weatherData.success) {
        const weather = this.processWeatherData(weatherData, marineData);
        const safety = this.calculateSafetyScore(weather);
        const fuelEfficiency = this.calculateFuelEfficiency(weather);
        const cost = this.calculateCost(safety, fuelEfficiency);

        // Update cell
        cell.weatherData = {
          temperature: weather.temperature,
          windSpeed: weather.windSpeed,
          windDirection: weather.windDirection,
          waveHeight: weather.waveHeight,
          visibility: weather.visibility,
        };
        cell.cost = cost;
        cell.obstacle = safety < 20 ? true : cell.obstacle;

        this.successCount++;
      } else {
        this.failCount++;
      }

      // Progress
      const progress = ((i + 1) / cellsToUpdate.length * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${i + 1}/${cellsToUpdate.length} (${progress}%) | ✅ ${this.successCount} | ❌ ${this.failCount}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n\n✅ Weather update complete!');
    console.log(`⏱️  Duration: ${duration}s\n`);

    // Save to database
    grid.updatedAt = new Date();
    await grid.save();

    console.log('💾 Grid updated in MongoDB\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');

    return grid;
  }
}

// CLI Interface
if (require.main === module) {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   🌦️  WEATHER SERVICE - OPEN-METEO INTEGRATION');
  console.log('   Real-Time Weather Data Updater');
  console.log('═══════════════════════════════════════════════════\n');

  const args = process.argv.slice(2);
  const mode = args[0] || 'json'; // 'json' or 'mongodb'
  const sampleSize = args[1] === 'all' ? null : parseInt(args[1]) || 50;

  const service = new WeatherService();

  if (mode === 'json') {
    console.log('📝 Mode: Update JSON file\n');
    service.updateGridFromJSON(sampleSize)
      .then(() => {
        console.log('✨ Weather service completed successfully!\n');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Weather service failed:', error.message);
        process.exit(1);
      });
  } else if (mode === 'mongodb') {
    console.log('🗄️  Mode: Update MongoDB\n');
    service.updateGridInMongoDB(null, sampleSize)
      .then(() => {
        console.log('✨ Weather service completed successfully!\n');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Weather service failed:', error.message);
        process.exit(1);
      });
  } else {
    console.error('❌ Invalid mode. Use "json" or "mongodb"');
    console.log('\nUsage:');
    console.log('  node weatherService.js json 50        # Update JSON with 50 sample points');
    console.log('  node weatherService.js json all       # Update JSON with all points');
    console.log('  node weatherService.js mongodb 50     # Update MongoDB with 50 sample points');
    console.log('  node weatherService.js mongodb all    # Update MongoDB with all points\n');
    process.exit(1);
  }
}

module.exports = WeatherService;
