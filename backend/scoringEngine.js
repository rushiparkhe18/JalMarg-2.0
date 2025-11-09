/**
 * Maritime Route Scoring Engine
 * 
 * Implements 4 route calculation modes:
 * 1. Optimal Route - Balanced between fuel, safety, and distance
 * 2. Fuel Efficient Route - Prioritizes fuel consumption
 * 3. Safe Route - Prioritizes safety conditions
 * 4. Normal Route - Shortest path (distance-based)
 * 
 * Scoring factors:
 * - Safety: Based on weather conditions (wind speed, wave height, visibility)
 * - Fuel Efficiency: Based on distance and wind direction
 * - Distance: Shortest path optimization
 */

class ScoringEngine {
  constructor() {
    // Normalization factors
    this.SAFETY_NORMALIZATION = 20;
    this.FUEL_NORMALIZATION = 10;
    this.DISTANCE_NORMALIZATION = 100; // km
    
    // Wind penalty factors
    this.TAILWIND_FACTOR = 0.8;  // 20% reduction with favorable wind
    this.HEADWIND_FACTOR = 1.2;  // 20% increase with opposing wind
    
    // Route mode weights
    this.ROUTE_WEIGHTS = {
      optimal: {
        safety: 0.4,
        fuel: 0.4,
        distance: 0.2,
      },
      fuel_efficient: {
        safety: 0.2,
        fuel: 0.6,
        distance: 0.2,
      },
      safe: {
        safety: 0.6,
        fuel: 0.2,
        distance: 0.2,
      },
      normal: {
        safety: 0.1,
        fuel: 0.1,
        distance: 0.8,
      },
    };
  }

  /**
   * Check if cell is land (should be excluded from routing)
   * 
   * @param {Object} cell - Grid cell
   * @returns {boolean} True if cell is land
   */
  isLandCell(cell) {
    return cell.is_land === true || cell.obstacle === true;
  }

  /**
   * Calculate safety score based on weather conditions
   * Formula: safety_score = 1 / (1 + (wind_speed + wave_height) / normalization_factor)
   * 
   * @param {Object} weather - Weather data
   * @param {number} weather.windSpeed - Wind speed in m/s
   * @param {number} weather.waveHeight - Wave height in meters
   * @param {number} weather.visibility - Visibility in meters
   * @returns {number} Safety score between 0 and 1
   */
  calculateSafetyScore(weather) {
    if (!weather) {
      return 0.5; // Neutral score if no weather data
    }

    const windSpeed = weather.windSpeed || weather.wind_speed || 0;
    const waveHeight = weather.waveHeight || weather.wave_height || 0;
    const visibility = weather.visibility || 10000;

    // Base safety calculation
    const weatherHazard = (windSpeed + waveHeight) / this.SAFETY_NORMALIZATION;
    let safetyScore = 1 / (1 + weatherHazard);

    // Adjust for visibility
    if (visibility < 1000) {
      safetyScore *= 0.5; // Very poor visibility
    } else if (visibility < 5000) {
      safetyScore *= 0.8; // Poor visibility
    } else if (visibility < 8000) {
      safetyScore *= 0.9; // Moderate visibility
    }

    // Penalty for extreme conditions
    if (windSpeed > 25 || waveHeight > 6) {
      safetyScore *= 0.3; // Dangerous conditions
    } else if (windSpeed > 15 || waveHeight > 4) {
      safetyScore *= 0.6; // Very rough conditions
    }

    return Math.max(0, Math.min(1, safetyScore));
  }

  /**
   * Calculate wind penalty based on wind direction relative to ship heading
   * 
   * @param {number} windDirection - Wind direction in degrees (0-360)
   * @param {number} shipHeading - Ship heading in degrees (0-360)
   * @returns {number} Wind penalty factor (0.8 to 1.2)
   */
  calculateWindPenalty(windDirection, shipHeading) {
    if (windDirection == null || shipHeading == null) {
      return 1.0; // Neutral if no data
    }

    // Calculate relative wind angle
    let relativeAngle = Math.abs(windDirection - shipHeading);
    if (relativeAngle > 180) {
      relativeAngle = 360 - relativeAngle;
    }

    // Tailwind (wind from behind): 0.8x fuel consumption
    // Headwind (wind from front): 1.2x fuel consumption
    // Beam wind (from side): 1.0x fuel consumption
    
    if (relativeAngle <= 45) {
      // Tailwind
      return this.TAILWIND_FACTOR;
    } else if (relativeAngle >= 135) {
      // Headwind
      return this.HEADWIND_FACTOR;
    } else {
      // Beam wind - interpolate between tailwind and headwind
      const factor = (relativeAngle - 45) / 90;
      return this.TAILWIND_FACTOR + (this.HEADWIND_FACTOR - this.TAILWIND_FACTOR) * factor;
    }
  }

  /**
   * Calculate fuel efficiency score
   * Formula: fuel_efficiency_score = 1 / (1 + adjusted_fuel_cost)
   * 
   * @param {number} distance - Distance to next point in km
   * @param {number} fuelRatePerKm - Base fuel consumption rate
   * @param {number} windDirection - Wind direction in degrees
   * @param {number} shipHeading - Ship heading in degrees
   * @returns {number} Fuel efficiency score between 0 and 1
   */
  calculateFuelEfficiencyScore(distance, fuelRatePerKm = 0.5, windDirection = null, shipHeading = null) {
    if (distance <= 0) {
      return 1.0;
    }

    // Base fuel cost
    const baseFuelCost = distance * fuelRatePerKm;

    // Apply wind penalty
    const windPenalty = this.calculateWindPenalty(windDirection, shipHeading);
    const adjustedFuelCost = (baseFuelCost * windPenalty) / this.FUEL_NORMALIZATION;

    // Calculate score
    const fuelScore = 1 / (1 + adjustedFuelCost);

    return Math.max(0, Math.min(1, fuelScore));
  }

  /**
   * Calculate distance score (normalized)
   * Formula: distance_score = 1 / (1 + distance / normalization)
   * 
   * @param {number} distance - Distance in km
   * @returns {number} Distance score between 0 and 1
   */
  calculateDistanceScore(distance) {
    if (distance <= 0) {
      return 1.0;
    }

    const normalizedDistance = distance / this.DISTANCE_NORMALIZATION;
    const distanceScore = 1 / (1 + normalizedDistance);

    return Math.max(0, Math.min(1, distanceScore));
  }

  /**
   * Calculate total score for a grid cell based on route mode
   * 
   * @param {Object} cell - Grid cell data
   * @param {string} mode - Route mode: 'optimal', 'fuel_efficient', 'safe', or 'normal'
   * @param {number} shipHeading - Current ship heading in degrees
   * @returns {Object} Scores object with all components
   */
  calculateCellScore(cell, mode = 'optimal', shipHeading = null) {
    // Check if cell is land - return zero scores
    if (this.isLandCell(cell)) {
      return {
        safety_score: 0,
        fuel_efficiency_score: 0,
        distance_score: 0,
        total_score: 0,
        mode: mode,
        is_land: true,
        weights: this.ROUTE_WEIGHTS[mode] || this.ROUTE_WEIGHTS.optimal,
      };
    }

    // Get weights for the selected mode
    const weights = this.ROUTE_WEIGHTS[mode] || this.ROUTE_WEIGHTS.optimal;

    // Calculate individual scores
    const safetyScore = this.calculateSafetyScore(cell.weather);
    
    const fuelEfficiencyScore = this.calculateFuelEfficiencyScore(
      cell.distance_to_next || 0,
      cell.fuel_rate_per_km || 0.5,
      cell.wind_direction || cell.weather?.windDirection || cell.weather?.wind_direction,
      shipHeading
    );
    
    const distanceScore = this.calculateDistanceScore(cell.distance_to_next || 0);

    // Calculate weighted total score
    const totalScore = (
      safetyScore * weights.safety +
      fuelEfficiencyScore * weights.fuel +
      distanceScore * weights.distance
    );

    return {
      safety_score: parseFloat(safetyScore.toFixed(4)),
      fuel_efficiency_score: parseFloat(fuelEfficiencyScore.toFixed(4)),
      distance_score: parseFloat(distanceScore.toFixed(4)),
      total_score: parseFloat(totalScore.toFixed(4)),
      mode: mode,
      is_land: false,
      weights: weights,
    };
  }

  /**
   * Calculate ship heading between two points
   * 
   * @param {number} lat1 - Start latitude
   * @param {number} lon1 - Start longitude
   * @param {number} lat2 - End latitude
   * @param {number} lon2 - End longitude
   * @returns {number} Heading in degrees (0-360)
   */
  calculateHeading(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360; // Normalize to 0-360

    return heading;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * 
   * @param {number} lat1 - Start latitude
   * @param {number} lon1 - Start longitude
   * @param {number} lat2 - End latitude
   * @param {number} lon2 - End longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Score an entire route path
   * 
   * @param {Array} path - Array of grid cells representing the route
   * @param {string} mode - Route mode
   * @returns {Object} Complete route scoring
   */
  scoreRoute(path, mode = 'optimal') {
    if (!path || path.length === 0) {
      return null;
    }

    const scores = [];
    let totalDistance = 0;
    let totalFuelCost = 0;
    let avgSafety = 0;
    let avgFuelEfficiency = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      // Calculate distance and heading
      const distance = this.calculateDistance(current.lat, current.lon, next.lat, next.lon);
      const heading = this.calculateHeading(current.lat, current.lon, next.lat, next.lon);

      // Create cell object with distance
      const cellWithDistance = {
        ...current,
        distance_to_next: distance,
      };

      // Calculate scores
      const score = this.calculateCellScore(cellWithDistance, mode, heading);
      scores.push({
        ...cellWithDistance,
        ...score,
      });

      // Accumulate totals
      totalDistance += distance;
      totalFuelCost += distance * (current.fuel_rate_per_km || 0.5);
      avgSafety += score.safety_score;
      avgFuelEfficiency += score.fuel_efficiency_score;
    }

    // Add final point
    scores.push({
      ...path[path.length - 1],
      ...this.calculateCellScore(path[path.length - 1], mode),
    });

    // Calculate averages
    avgSafety /= (path.length - 1);
    avgFuelEfficiency /= (path.length - 1);

    return {
      mode: mode,
      path: scores,
      summary: {
        total_distance_km: parseFloat(totalDistance.toFixed(2)),
        total_fuel_cost: parseFloat(totalFuelCost.toFixed(2)),
        average_safety_score: parseFloat(avgSafety.toFixed(4)),
        average_fuel_efficiency: parseFloat(avgFuelEfficiency.toFixed(4)),
        waypoints: path.length,
      },
    };
  }

  /**
   * Compare multiple routes across different modes
   * 
   * @param {Array} path - Route path
   * @returns {Object} Comparison of all route modes
   */
  compareRouteModes(path) {
    const modes = ['optimal', 'fuel_efficient', 'safe', 'normal'];
    const comparison = {};

    for (const mode of modes) {
      comparison[mode] = this.scoreRoute(path, mode);
    }

    return comparison;
  }

  /**
   * Compute scores for all grid cells (batch processing)
   * Filters out land cells automatically
   * 
   * @param {Array} gridCells - Array of grid cells
   * @param {string} mode - Route mode
   * @returns {Array} Scored grid cells (land cells excluded)
   */
  computeScores(gridCells, mode = 'optimal') {
    if (!Array.isArray(gridCells)) {
      throw new Error('gridCells must be an array');
    }

    return gridCells.map((cell, index) => {
      // Filter land cells - return with zero scores
      if (this.isLandCell(cell)) {
        return {
          ...cell,
          safety_score: 0,
          fuel_efficiency_score: 0,
          distance_score: 0,
          total_score: 0,
          is_land: true,
        };
      }

      // Calculate scores for water cells
      const scores = this.calculateCellScore(cell, mode);
      
      return {
        ...cell,
        ...scores,
      };
    });
  }

  /**
   * Filter out land cells from grid
   * 
   * @param {Array} gridCells - Array of grid cells
   * @returns {Array} Only water cells
   */
  filterLandCells(gridCells) {
    return gridCells.filter(cell => !this.isLandCell(cell));
  }
}

// Example usage and testing
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════');
  console.log('   🧮 MARITIME SCORING ENGINE TEST');
  console.log('═══════════════════════════════════════════════════\n');

  const engine = new ScoringEngine();

  // Test with sample grid cells including land
  const sampleGridCells = [
    {
      lat: 12.3,
      lon: 80.5,
      is_land: false,
      weather: { wind_speed: 10, wave_height: 2, visibility: 9000, wind_direction: 90 },
      distance_to_next: 50,
      fuel_rate_per_km: 0.5,
    },
    {
      lat: 12.4,
      lon: 80.6,
      is_land: true, // This is land - should be filtered
      weather: { wind_speed: 5, wave_height: 1, visibility: 10000 },
      distance_to_next: 50,
      fuel_rate_per_km: 0.5,
    },
    {
      lat: 12.5,
      lon: 80.7,
      is_land: false,
      weather: { wind_speed: 8, wave_height: 1.5, visibility: 10000, wind_direction: 45 },
      distance_to_next: 50,
      fuel_rate_per_km: 0.5,
    },
  ];

  console.log('📊 Batch Scoring Test (with land filtering):\n');
  
  const scoredCells = engine.computeScores(sampleGridCells, 'optimal');
  
  scoredCells.forEach((cell, idx) => {
    console.log(`Cell ${idx + 1}:`);
    console.log(`  Lat: ${cell.lat}, Lon: ${cell.lon}`);
    console.log(`  Is Land: ${cell.is_land}`);
    console.log(`  Safety Score: ${cell.safety_score}`);
    console.log(`  Fuel Efficiency: ${cell.fuel_efficiency_score}`);
    console.log(`  Distance Score: ${cell.distance_score}`);
    console.log(`  Total Score: ${cell.total_score}`);
    console.log('');
  });

  // Test land filtering
  console.log('═══════════════════════════════════════════════════');
  console.log('   🌍 LAND FILTERING TEST');
  console.log('═══════════════════════════════════════════════════\n');

  const waterCells = engine.filterLandCells(sampleGridCells);
  console.log(`Original cells: ${sampleGridCells.length}`);
  console.log(`Water cells: ${waterCells.length}`);
  console.log(`Land cells filtered: ${sampleGridCells.length - waterCells.length}\n`);

  // Test individual cell scoring
  console.log('═══════════════════════════════════════════════════');
  console.log('   🎯 INDIVIDUAL CELL SCORING');
  console.log('═══════════════════════════════════════════════════\n');

  const sampleCell = {
    lat: 12.5,
    lon: 80.3,
    weather: {
      windSpeed: 10,
      waveHeight: 2,
      visibility: 9000,
      windDirection: 90,
    },
    distance_to_next: 50,
    wind_direction: 90,
    fuel_rate_per_km: 0.5,
  };

  const shipHeading = 45;

  console.log('📍 Sample Grid Cell:');
  console.log(JSON.stringify(sampleCell, null, 2));
  console.log('\n🧭 Ship Heading:', shipHeading, '°\n');

  console.log('🎯 Scoring Results:\n');

  const modes = ['optimal', 'fuel_efficient', 'safe', 'normal'];
  
  modes.forEach(mode => {
    const score = engine.calculateCellScore(sampleCell, mode, shipHeading);
    console.log(`${mode.toUpperCase()} Mode:`);
    console.log(`  Safety Score:         ${score.safety_score}`);
    console.log(`  Fuel Efficiency:      ${score.fuel_efficiency_score}`);
    console.log(`  Distance Score:       ${score.distance_score}`);
    console.log(`  Total Score:          ${score.total_score}`);
    console.log(`  Weights: S:${score.weights.safety} F:${score.weights.fuel} D:${score.weights.distance}`);
    console.log('');
  });

  // Test with sample route
  console.log('═══════════════════════════════════════════════════');
  console.log('   🛤️  ROUTE SCORING TEST');
  console.log('═══════════════════════════════════════════════════\n');

  const sampleRoute = [
    { lat: 0, lon: 40, weather: { windSpeed: 8, waveHeight: 1.5, visibility: 10000 } },
    { lat: 5, lon: 45, weather: { windSpeed: 12, waveHeight: 2.5, visibility: 8000 } },
    { lat: 10, lon: 50, weather: { windSpeed: 6, waveHeight: 1, visibility: 10000 } },
    { lat: 15, lon: 55, weather: { windSpeed: 10, waveHeight: 2, visibility: 9000 } },
  ];

  const routeScore = engine.scoreRoute(sampleRoute, 'optimal');
  
  console.log('📊 Route Summary:');
  console.log(JSON.stringify(routeScore.summary, null, 2));
  console.log('\n✨ Scoring engine test complete!\n');
}

module.exports = ScoringEngine;
