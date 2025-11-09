const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fetch current weather using Open-Meteo API (free, no API key needed)
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=ms&timezone=auto`;
    
    const response = await axios.get(url);
    const current = response.data.current;

    const weatherData = {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      pressure: current.pressure_msl,
      surfacePressure: current.surface_pressure,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      rain: current.rain,
      showers: current.showers,
      snowfall: current.snowfall,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      timestamp: current.time,
    };

    res.json({ success: true, weather: weatherData });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch weather data', 
      message: error.response?.data?.message || error.message 
    });
  }
});

// Fetch weather forecast using Open-Meteo API
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, days = 7 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,temperature_80m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=ms&timezone=auto&forecast_days=${days}`;
    
    const response = await axios.get(url);

    res.json({ success: true, forecast: response.data });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch weather forecast', 
      message: error.response?.data?.message || error.message 
    });
  }
});

// Fetch marine/maritime weather using Open-Meteo Marine API
router.get('/marine', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Open-Meteo Marine Weather API
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period&daily=wave_height_max,wave_direction_dominant,wave_period_max&timezone=auto`;
    
    const response = await axios.get(url);

    res.json({ 
      success: true, 
      marine: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch marine weather', 
      message: error.response?.data?.message || error.message 
    });
  }
});

// NEW: Get weather for route waypoints (optimized, samples points)
router.post('/route', async (req, res) => {
  try {
    const { waypoints } = req.body;
    
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      return res.status(400).json({ error: 'Valid waypoints array required' });
    }
    
    // Limit to 15 waypoints max for performance
    const sampledWaypoints = waypoints.slice(0, 15);
    
    // Fetch weather for each waypoint in parallel (max 15 requests)
    const weatherPromises = sampledWaypoints.map(async (wp) => {
      try {
        const lat = wp[0] || wp.lat;
        const lon = wp[1] || wp.lon;
        
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period&hourly=wave_height,wave_direction,wave_period`;
        
        const response = await axios.get(url, { timeout: 5000 });
        const current = response.data.current;
        
        return {
          lat,
          lon,
          waveHeight: current.wave_height,
          waveDirection: current.wave_direction,
          wavePeriod: current.wave_period,
          windWaveHeight: current.wind_wave_height,
          timestamp: current.time
        };
      } catch (err) {
        console.error(`Weather fetch failed for ${wp}:`, err.message);
        return null;
      }
    });
    
    const weatherData = await Promise.all(weatherPromises);
    const validData = weatherData.filter(w => w !== null);
    
    // Calculate aggregate statistics
    let avgWave = 0, maxWave = 0;
    validData.forEach(w => {
      avgWave += w.waveHeight || 0;
      maxWave = Math.max(maxWave, w.waveHeight || 0);
    });
    avgWave = validData.length > 0 ? avgWave / validData.length : 0;
    
    res.json({
      success: true,
      waypoints: validData,
      stats: {
        avgWaveHeight: avgWave.toFixed(2),
        maxWaveHeight: maxWave.toFixed(2),
        dataPoints: validData.length,
        coverage: ((validData.length / sampledWaypoints.length) * 100).toFixed(1)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Route weather error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch route weather', 
      message: error.message 
    });
  }
});

// NEW: Get aggregate weather statistics for entire route (fast)
router.post('/route-stats', async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || coordinates.length === 0) {
      return res.status(400).json({ error: 'Coordinates required' });
    }
    
    // Sample 5 points along route for quick stats
    const sampleSize = Math.min(5, coordinates.length);
    const step = Math.floor(coordinates.length / sampleSize);
    const samples = [];
    
    for (let i = 0; i < coordinates.length; i += step) {
      if (samples.length < sampleSize) {
        samples.push(coordinates[i]);
      }
    }
    
    // Fetch weather for samples
    const weatherPromises = samples.map(async ([lat, lon]) => {
      try {
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wind_wave_height`;
        const response = await axios.get(url, { timeout: 3000 });
        return response.data.current.wave_height || 0;
      } catch {
        return null;
      }
    });
    
    const waves = (await Promise.all(weatherPromises)).filter(w => w !== null);
    const avgWave = waves.length > 0 ? waves.reduce((a, b) => a + b, 0) / waves.length : 2;
    const maxWave = waves.length > 0 ? Math.max(...waves) : 3;
    
    res.json({
      success: true,
      stats: {
        avgWaveHeight: avgWave.toFixed(2),
        maxWaveHeight: maxWave.toFixed(2),
        samples: waves.length
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate route stats' });
  }
});

module.exports = router;
