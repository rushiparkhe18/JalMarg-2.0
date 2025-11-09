const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Weather Fetcher for Grid Points
 * Fetches weather data from Open-Meteo API for all grid points
 */

// Load grid data
function loadGridData() {
  const gridPath = path.join(__dirname, 'gridData.json');
  if (!fs.existsSync(gridPath)) {
    throw new Error('Grid data not found. Run gridGenerator.js first.');
  }
  return JSON.parse(fs.readFileSync(gridPath, 'utf8'));
}

// Fetch weather for a single point
async function fetchWeatherForPoint(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=ms&timezone=auto`;
    
    const response = await axios.get(url);
    const current = response.data.current;

    return {
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      pressure: current.pressure_msl,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      lastUpdated: current.time,
    };
  } catch (error) {
    console.error(`Failed to fetch weather for (${lat}, ${lon}):`, error.message);
    return null;
  }
}

// Fetch marine weather for a single point
async function fetchMarineWeatherForPoint(lat, lon) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&timezone=auto`;
    
    const response = await axios.get(url);
    const current = response.data.current;

    return {
      waveHeight: current.wave_height,
      waveDirection: current.wave_direction,
      wavePeriod: current.wave_period,
    };
  } catch (error) {
    console.error(`Failed to fetch marine weather for (${lat}, ${lon}):`, error.message);
    return null;
  }
}

// Calculate safety score based on weather conditions
function calculateSafetyScore(weather, marine) {
  let score = 100;

  // Penalize based on wind speed (m/s)
  if (weather?.windSpeed) {
    if (weather.windSpeed > 25) score -= 50; // Severe wind
    else if (weather.windSpeed > 15) score -= 30; // Strong wind
    else if (weather.windSpeed > 10) score -= 15; // Moderate wind
  }

  // Penalize based on wave height (m)
  if (marine?.waveHeight) {
    if (marine.waveHeight > 6) score -= 40; // Very high waves
    else if (marine.waveHeight > 4) score -= 25; // High waves
    else if (marine.waveHeight > 2) score -= 10; // Moderate waves
  }

  // Penalize based on precipitation
  if (weather?.precipitation > 5) score -= 15;

  // Penalize based on cloud cover
  if (weather?.cloudCover > 80) score -= 5;

  return Math.max(0, score);
}

// Calculate fuel efficiency based on weather
function calculateFuelEfficiency(weather, marine) {
  let efficiency = 100;

  // Wind impact on fuel efficiency
  if (weather?.windSpeed) {
    if (weather.windSpeed > 20) efficiency -= 40;
    else if (weather.windSpeed > 15) efficiency -= 25;
    else if (weather.windSpeed > 10) efficiency -= 15;
    else if (weather.windSpeed < 5) efficiency -= 5; // Too calm can also be inefficient
  }

  // Wave impact on fuel efficiency
  if (marine?.waveHeight) {
    if (marine.waveHeight > 5) efficiency -= 35;
    else if (marine.waveHeight > 3) efficiency -= 20;
    else if (marine.waveHeight > 1.5) efficiency -= 10;
  }

  // Current/temperature impact
  if (weather?.temperature < 5) efficiency -= 10; // Cold affects fuel

  return Math.max(0, efficiency);
}

// Update grid with weather data
async function updateGridWithWeather(sampleSize = null) {
  console.log('🌦️  Starting weather data fetch...\n');

  const gridData = loadGridData();
  const gridPoints = gridData.grid;
  
  // If sampleSize is specified, only fetch for a subset
  const pointsToFetch = sampleSize ? gridPoints.slice(0, sampleSize) : gridPoints;
  
  console.log(`📊 Total grid points: ${gridPoints.length}`);
  console.log(`🎯 Fetching weather for: ${pointsToFetch.length} points\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pointsToFetch.length; i++) {
    const point = pointsToFetch[i];
    process.stdout.write(`\rProgress: ${i + 1}/${pointsToFetch.length} | Success: ${successCount} | Failed: ${failCount}`);

    // Fetch weather data
    const weather = await fetchWeatherForPoint(point.lat, point.lon);
    const marine = await fetchMarineWeatherForPoint(point.lat, point.lon);

    if (weather) {
      // Update weather data
      point.weather = {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        waveHeight: marine?.waveHeight || null,
        visibility: weather.cloudCover < 50 ? 10000 : 5000, // Simplified visibility
        lastUpdated: weather.lastUpdated,
      };

      // Calculate scores
      point.safety = calculateSafetyScore(weather, marine);
      point.fuel_efficiency = calculateFuelEfficiency(weather, marine);

      // Update cost based on safety and efficiency
      point.cost = Math.max(1, Math.round((200 - point.safety - point.fuel_efficiency) / 50));

      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting: delay between requests
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  }

  console.log('\n\n✅ Weather fetch complete!');
  console.log(`📈 Success: ${successCount} | ❌ Failed: ${failCount}\n`);

  // Save updated grid data
  const outputPath = path.join(__dirname, 'gridData_with_weather.json');
  fs.writeFileSync(outputPath, JSON.stringify(gridData, null, 2));
  console.log(`💾 Saved to: ${outputPath}\n`);

  return gridData;
}

// Run the weather fetcher
if (require.main === module) {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   🌦️  WEATHER DATA FETCHER');
  console.log('   Open-Meteo API Integration');
  console.log('═══════════════════════════════════════════════════\n');

  // For testing, fetch weather for first 50 points only
  // Remove the parameter to fetch for all points (will take ~12 minutes for 7171 points)
  const sampleSize = process.argv[2] ? parseInt(process.argv[2]) : 50;

  console.log(`⚠️  Fetching weather for ${sampleSize} sample points (use "node weatherFetcher.js all" for all points)\n`);

  updateGridWithWeather(sampleSize === 'all' ? null : sampleSize)
    .then(() => {
      console.log('✨ Weather data fetch completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Weather fetch failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  updateGridWithWeather,
  fetchWeatherForPoint,
  fetchMarineWeatherForPoint,
  calculateSafetyScore,
  calculateFuelEfficiency,
};
