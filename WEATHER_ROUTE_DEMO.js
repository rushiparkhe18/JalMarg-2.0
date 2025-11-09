/**
 * ========================================================================
 * JALMARG 2.0 - DYNAMIC WEATHER-BASED ROUTE RECALCULATION DEMO
 * ========================================================================
 * 
 * This standalone demonstration showcases how maritime routes dynamically
 * adjust based on real-time weather conditions.
 * 
 * Features Demonstrated:
 * - Real-time weather simulation (temperature, wind, visibility, rainfall)
 * - Dynamic route recalculation based on weather changes
 * - Visual ASCII representation of route changes
 * - Safety and efficiency metrics
 * 
 * Run: node WEATHER_ROUTE_DEMO.js
 * ========================================================================
 */

const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEMO_CONFIG = {
  // Route endpoints
  startPort: { name: 'Mumbai', lat: 18.96, lon: 72.82 },
  endPort: { name: 'Chennai', lat: 13.08, lon: 80.27 },
  
  // Weather simulation intervals
  weatherUpdateInterval: 3000, // Update weather every 3 seconds
  totalDuration: 30000, // Run demo for 30 seconds
  
  // Weather thresholds
  thresholds: {
    maxSafeWindSpeed: 25, // knots
    minSafeVisibility: 2, // km
    maxSafeRainfall: 50, // mm/hr
    maxSafeWaveHeight: 3.5, // meters
    optimalTemp: 25, // celsius
  }
};

// ============================================================================
// WEATHER SIMULATION ENGINE
// ============================================================================

class WeatherSimulator {
  constructor() {
    this.currentConditions = {
      temperature: 26,
      windSpeed: 12,
      visibility: 10,
      rainfall: 0,
      waveHeight: 1.5,
      timestamp: new Date()
    };
    
    this.weatherScenarios = [
      { name: 'Clear', temp: [24, 28], wind: [8, 15], vis: [8, 12], rain: [0, 5], wave: [1, 2] },
      { name: 'Moderate', temp: [22, 26], wind: [15, 22], vis: [5, 8], rain: [5, 20], wave: [2, 3] },
      { name: 'Rough', temp: [20, 24], wind: [22, 30], vis: [2, 5], rain: [20, 50], wave: [3, 4.5] },
      { name: 'Storm', temp: [18, 22], wind: [30, 45], vis: [0.5, 2], rain: [50, 100], wave: [4.5, 7] },
    ];
    
    this.currentScenario = this.weatherScenarios[0];
  }
  
  /**
   * Generate random value within range
   */
  randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }
  
  /**
   * Simulate weather change
   */
  updateWeather() {
    // Randomly change scenario with 30% probability
    if (Math.random() < 0.3) {
      const newScenarioIndex = Math.floor(Math.random() * this.weatherScenarios.length);
      this.currentScenario = this.weatherScenarios[newScenarioIndex];
    }
    
    // Generate new weather values with some smoothing
    const scenario = this.currentScenario;
    const smoothing = 0.7; // 70% old + 30% new for smooth transitions
    
    const newTemp = this.randomInRange(scenario.temp[0], scenario.temp[1]);
    const newWind = this.randomInRange(scenario.wind[0], scenario.wind[1]);
    const newVis = this.randomInRange(scenario.vis[0], scenario.vis[1]);
    const newRain = this.randomInRange(scenario.rain[0], scenario.rain[1]);
    const newWave = this.randomInRange(scenario.wave[0], scenario.wave[1]);
    
    this.currentConditions = {
      temperature: (this.currentConditions.temperature * smoothing + newTemp * (1 - smoothing)),
      windSpeed: (this.currentConditions.windSpeed * smoothing + newWind * (1 - smoothing)),
      visibility: (this.currentConditions.visibility * smoothing + newVis * (1 - smoothing)),
      rainfall: (this.currentConditions.rainfall * smoothing + newRain * (1 - smoothing)),
      waveHeight: (this.currentConditions.waveHeight * smoothing + newWave * (1 - smoothing)),
      scenario: scenario.name,
      timestamp: new Date()
    };
    
    return this.currentConditions;
  }
  
  /**
   * Get current weather
   */
  getCurrentWeather() {
    return this.currentConditions;
  }
}

// ============================================================================
// ROUTE CALCULATOR WITH WEATHER INTELLIGENCE
// ============================================================================

class DynamicRouteCalculator {
  constructor(startPort, endPort) {
    this.startPort = startPort;
    this.endPort = endPort;
    this.currentRoute = null;
    this.routeHistory = [];
  }
  
  /**
   * Calculate safety score based on weather (0-100)
   */
  calculateSafetyScore(weather) {
    const thresholds = DEMO_CONFIG.thresholds;
    
    // Wind factor (0-1, lower is better)
    const windFactor = Math.min(1, weather.windSpeed / thresholds.maxSafeWindSpeed);
    
    // Visibility factor (0-1, higher is better)
    const visFactor = Math.min(1, weather.visibility / thresholds.minSafeVisibility);
    
    // Rain factor (0-1, lower is better)
    const rainFactor = Math.min(1, weather.rainfall / thresholds.maxSafeRainfall);
    
    // Wave factor (0-1, lower is better)
    const waveFactor = Math.min(1, weather.waveHeight / thresholds.maxSafeWaveHeight);
    
    // Combined safety score (0-100)
    const safetyScore = (
      (1 - windFactor) * 0.35 +  // Wind: 35% weight
      visFactor * 0.25 +          // Visibility: 25% weight
      (1 - rainFactor) * 0.20 +   // Rain: 20% weight
      (1 - waveFactor) * 0.20     // Waves: 20% weight
    ) * 100;
    
    return Math.max(0, Math.min(100, safetyScore));
  }
  
  /**
   * Calculate fuel efficiency based on weather (0-100)
   */
  calculateFuelEfficiency(weather) {
    const thresholds = DEMO_CONFIG.thresholds;
    
    // Wind resistance impact
    const windPenalty = Math.max(0, (weather.windSpeed - 10) / 20); // 0-1
    
    // Wave resistance impact
    const wavePenalty = Math.max(0, (weather.waveHeight - 1.5) / 3); // 0-1
    
    // Temperature efficiency (optimal at 25°C)
    const tempDiff = Math.abs(weather.temperature - thresholds.optimalTemp);
    const tempPenalty = Math.min(1, tempDiff / 10); // 0-1
    
    // Combined fuel efficiency (0-100)
    const fuelEfficiency = (
      (1 - windPenalty) * 0.40 +   // Wind: 40% weight
      (1 - wavePenalty) * 0.35 +   // Waves: 35% weight
      (1 - tempPenalty) * 0.25     // Temperature: 25% weight
    ) * 100;
    
    return Math.max(0, Math.min(100, fuelEfficiency));
  }
  
  /**
   * Determine route strategy based on weather
   */
  determineRouteStrategy(weather, safetyScore, fuelEfficiency) {
    const thresholds = DEMO_CONFIG.thresholds;
    
    // Critical conditions - SAFETY route mandatory
    if (weather.windSpeed > thresholds.maxSafeWindSpeed * 1.2 ||
        weather.visibility < thresholds.minSafeVisibility * 0.5 ||
        weather.waveHeight > thresholds.maxSafeWaveHeight * 1.2) {
      return {
        mode: 'SAFE',
        reason: 'Critical weather conditions detected',
        deviation: 'HIGH', // +15-25% distance
        speedReduction: 25 // 25% slower
      };
    }
    
    // Poor conditions - SAFE route recommended
    if (safetyScore < 60) {
      return {
        mode: 'SAFE',
        reason: 'Poor weather conditions',
        deviation: 'MEDIUM', // +10-15% distance
        speedReduction: 15
      };
    }
    
    // Poor fuel efficiency - FUEL route recommended
    if (fuelEfficiency < 70) {
      return {
        mode: 'FUEL',
        reason: 'Inefficient conditions, optimize fuel',
        deviation: 'LOW', // +5-10% distance
        speedReduction: 5
      };
    }
    
    // Good conditions - OPTIMAL route
    return {
      mode: 'OPTIMAL',
      reason: 'Favorable conditions',
      deviation: 'NONE', // Direct route
      speedReduction: 0
    };
  }
  
  /**
   * Calculate route based on current weather
   */
  calculateRoute(weather) {
    const safetyScore = this.calculateSafetyScore(weather);
    const fuelEfficiency = this.calculateFuelEfficiency(weather);
    const strategy = this.determineRouteStrategy(weather, safetyScore, fuelEfficiency);
    
    // Calculate distance (simplified)
    const baseLat = Math.abs(this.endPort.lat - this.startPort.lat);
    const baseLon = Math.abs(this.endPort.lon - this.startPort.lon);
    const baseDistance = Math.sqrt(baseLat * baseLat + baseLon * baseLon) * 111; // km
    
    // Apply deviation based on strategy
    let distanceMultiplier = 1.0;
    if (strategy.deviation === 'HIGH') distanceMultiplier = 1.20;
    else if (strategy.deviation === 'MEDIUM') distanceMultiplier = 1.12;
    else if (strategy.deviation === 'LOW') distanceMultiplier = 1.07;
    
    const totalDistance = baseDistance * distanceMultiplier;
    
    // Calculate speed and duration
    const baseSpeed = 22; // knots
    const adjustedSpeed = baseSpeed * (1 - strategy.speedReduction / 100);
    const durationHours = (totalDistance / 1.852) / adjustedSpeed;
    
    // Calculate fuel (simplified)
    const baseFuelRate = 3.2; // tons/hour
    const weatherFactor = 1 + ((100 - fuelEfficiency) / 100);
    const totalFuel = durationHours * baseFuelRate * weatherFactor;
    const fuelCost = totalFuel * 600 * 83; // USD to INR
    
    const route = {
      timestamp: new Date(),
      strategy: strategy,
      metrics: {
        safetyScore: safetyScore.toFixed(1),
        fuelEfficiency: fuelEfficiency.toFixed(1),
        distance: totalDistance.toFixed(1),
        duration: durationHours.toFixed(1),
        speed: adjustedSpeed.toFixed(1),
        fuel: totalFuel.toFixed(1),
        cost: (fuelCost / 100000).toFixed(1) // Lakhs
      },
      weather: weather
    };
    
    // Check if route changed
    const routeChanged = !this.currentRoute || 
                        this.currentRoute.strategy.mode !== route.strategy.mode;
    
    if (routeChanged) {
      this.routeHistory.push({
        from: this.currentRoute ? this.currentRoute.strategy.mode : 'INITIAL',
        to: route.strategy.mode,
        timestamp: new Date(),
        reason: route.strategy.reason
      });
    }
    
    this.currentRoute = route;
    return { route, changed: routeChanged };
  }
  
  /**
   * Get route visualization (ASCII art)
   */
  getRouteVisualization(mode) {
    const routes = {
      'OPTIMAL': `
      Mumbai                    Chennai
         ●━━━━━━━━━━━━━━━━━━━━━━━━●
              (Direct Route)
      `,
      'FUEL': `
      Mumbai                    Chennai
         ●━━━━┓                 ●
              ┗━━━━━━━━━━━━━━━━┛
           (Coastal Route)
      `,
      'SAFE': `
      Mumbai                    Chennai
         ●━━━┓                  ●
             ┃                  ┃
             ┗━━━━━━━━━━━━━━━━━━┛
        (Deep Ocean Route)
      `
    };
    
    return routes[mode] || routes['OPTIMAL'];
  }
}

// ============================================================================
// DEMONSTRATION CONTROLLER
// ============================================================================

class WeatherRouteDemonstration {
  constructor() {
    this.weatherSimulator = new WeatherSimulator();
    this.routeCalculator = new DynamicRouteCalculator(
      DEMO_CONFIG.startPort,
      DEMO_CONFIG.endPort
    );
    this.updateCount = 0;
    this.startTime = Date.now();
  }
  
  /**
   * Print header
   */
  printHeader() {
    console.clear();
    console.log('\n' + '='.repeat(80));
    console.log('   JALMARG 2.0 - DYNAMIC WEATHER-BASED ROUTE DEMONSTRATION');
    console.log('='.repeat(80));
    console.log(`\n🚢 Route: ${DEMO_CONFIG.startPort.name} → ${DEMO_CONFIG.endPort.name}`);
    console.log(`⏱️  Demo Duration: ${DEMO_CONFIG.totalDuration / 1000}s | Update Interval: ${DEMO_CONFIG.weatherUpdateInterval / 1000}s\n`);
  }
  
  /**
   * Format weather display
   */
  formatWeather(weather) {
    const getWindEmoji = (speed) => {
      if (speed < 15) return '🌤️';
      if (speed < 25) return '🌥️';
      if (speed < 35) return '⛈️';
      return '🌪️';
    };
    
    const getRainEmoji = (rain) => {
      if (rain < 10) return '☀️';
      if (rain < 30) return '🌧️';
      return '⛈️';
    };
    
    return `
┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 CURRENT WEATHER CONDITIONS                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Scenario:      ${weather.scenario.padEnd(20)} ${getWindEmoji(weather.windSpeed)} ${getRainEmoji(weather.rainfall)}      │
│ Temperature:   ${weather.temperature.toFixed(1).padEnd(8)}°C                                      │
│ Wind Speed:    ${weather.windSpeed.toFixed(1).padEnd(8)} knots  ${weather.windSpeed > 25 ? '⚠️  HIGH' : '✓'}              │
│ Visibility:    ${weather.visibility.toFixed(1).padEnd(8)} km     ${weather.visibility < 2 ? '⚠️  LOW' : '✓'}              │
│ Rainfall:      ${weather.rainfall.toFixed(1).padEnd(8)} mm/hr   ${weather.rainfall > 50 ? '⚠️  HEAVY' : '✓'}              │
│ Wave Height:   ${weather.waveHeight.toFixed(1).padEnd(8)} m      ${weather.waveHeight > 3.5 ? '⚠️  HIGH' : '✓'}              │
└─────────────────────────────────────────────────────────────────────┘
`;
  }
  
  /**
   * Format route display
   */
  formatRoute(routeData) {
    const route = routeData.route;
    const changed = routeData.changed;
    
    const getModeColor = (mode) => {
      const colors = {
        'OPTIMAL': '🟢',
        'FUEL': '🟡',
        'SAFE': '🔴'
      };
      return colors[mode] || '⚪';
    };
    
    return `
┌─────────────────────────────────────────────────────────────────────┐
│ 🧭 RECOMMENDED ROUTE ${changed ? '✨ ROUTE CHANGED!' : ''}                              │
├─────────────────────────────────────────────────────────────────────┤
│ Mode:          ${getModeColor(route.strategy.mode)} ${route.strategy.mode.padEnd(15)} ${route.strategy.deviation.padEnd(10)} deviation  │
│ Reason:        ${route.strategy.reason.padEnd(40)} │
│                                                                     │
│ 📊 ROUTE METRICS:                                                   │
│   Safety Score:       ${route.metrics.safetyScore.padEnd(8)}% ${route.metrics.safetyScore < 60 ? '⚠️' : '✓'}                        │
│   Fuel Efficiency:    ${route.metrics.fuelEfficiency.padEnd(8)}% ${route.metrics.fuelEfficiency < 70 ? '⚠️' : '✓'}                        │
│   Distance:           ${route.metrics.distance.padEnd(8)} km                           │
│   Duration:           ${route.metrics.duration.padEnd(8)} hours                        │
│   Avg Speed:          ${route.metrics.speed.padEnd(8)} knots                       │
│   Fuel Required:      ${route.metrics.fuel.padEnd(8)} tons                         │
│   Estimated Cost:     ₹${route.metrics.cost.padEnd(8)} Lakhs                       │
└─────────────────────────────────────────────────────────────────────┘
${this.routeCalculator.getRouteVisualization(route.strategy.mode)}
`;
  }
  
  /**
   * Run single update
   */
  async runUpdate() {
    this.updateCount++;
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    // Update weather
    const weather = this.weatherSimulator.updateWeather();
    
    // Calculate route
    const routeData = this.routeCalculator.calculateRoute(weather);
    
    // Display
    this.printHeader();
    console.log(`📍 Update #${this.updateCount} | Elapsed: ${elapsed}s\n`);
    console.log(this.formatWeather(weather));
    console.log(this.formatRoute(routeData));
    
    // Show route change history
    if (this.routeCalculator.routeHistory.length > 0) {
      console.log('┌─────────────────────────────────────────────────────────────────────┐');
      console.log('│ 📜 ROUTE CHANGE HISTORY                                             │');
      console.log('├─────────────────────────────────────────────────────────────────────┤');
      
      this.routeCalculator.routeHistory.slice(-5).forEach((change, idx) => {
        const time = new Date(change.timestamp).toLocaleTimeString();
        console.log(`│ ${idx + 1}. ${time} | ${change.from} → ${change.to}`.padEnd(70) + '│');
        console.log(`│    Reason: ${change.reason}`.padEnd(70) + '│');
      });
      
      console.log('└─────────────────────────────────────────────────────────────────────┘');
    }
    
    console.log('\n💡 Press Ctrl+C to stop demonstration\n');
  }
  
  /**
   * Start demonstration
   */
  async start() {
    console.log('\n🚀 Starting Weather-Based Route Demonstration...\n');
    
    // Initial update
    await this.runUpdate();
    
    // Set up periodic updates
    const interval = setInterval(async () => {
      if (Date.now() - this.startTime >= DEMO_CONFIG.totalDuration) {
        clearInterval(interval);
        this.stop();
      } else {
        await this.runUpdate();
      }
    }, DEMO_CONFIG.weatherUpdateInterval);
  }
  
  /**
   * Stop demonstration
   */
  stop() {
    console.log('\n' + '='.repeat(80));
    console.log('   DEMONSTRATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Updates: ${this.updateCount}`);
    console.log(`   Route Changes: ${this.routeCalculator.routeHistory.length}`);
    console.log(`   Final Route: ${this.routeCalculator.currentRoute.strategy.mode}`);
    console.log(`   Duration: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s\n`);
    
    // Save log
    this.saveDemoLog();
    
    process.exit(0);
  }
  
  /**
   * Save demonstration log
   */
  saveDemoLog() {
    const log = {
      timestamp: new Date().toISOString(),
      route: `${DEMO_CONFIG.startPort.name} → ${DEMO_CONFIG.endPort.name}`,
      totalUpdates: this.updateCount,
      routeChanges: this.routeCalculator.routeHistory,
      finalRoute: this.routeCalculator.currentRoute
    };
    
    fs.writeFileSync(
      'WEATHER_ROUTE_DEMO_LOG.json',
      JSON.stringify(log, null, 2)
    );
    
    console.log('✅ Demo log saved to: WEATHER_ROUTE_DEMO_LOG.json\n');
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

if (require.main === module) {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  JALMARG 2.0 - Dynamic Weather-Based Route Recalculation Demo     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  const demo = new WeatherRouteDemonstration();
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    demo.stop();
  });
  
  // Start demonstration
  demo.start();
}

module.exports = { WeatherSimulator, DynamicRouteCalculator, WeatherRouteDemonstration };
