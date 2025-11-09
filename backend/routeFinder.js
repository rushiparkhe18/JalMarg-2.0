const ScoringEngine = require('./scoringEngine');

/**
 * Maritime Route Finder using A* Pathfinding Algorithm
 * 
 * Implements mode-based route optimization for Indian Ocean navigation
 * Supports 4 modes: optimal, fuel_efficient, safe, normal
 * Avoids land masses and prioritizes based on scoring weights
 */

class RouteFinder {
  constructor() {
    this.scoringEngine = new ScoringEngine();
    
    // Route mode weights - STRONG DIFFERENCES for visual distinction
    // Higher multipliers = stronger influence on route path
    this.ROUTE_WEIGHTS = {
      // FUEL MODE: Shortest path, ignore weather/safety
      fuel: { 
        distance: 10.0,    // Heavily prioritize shortest distance
        safety: 0.1,       // Minimal safety concern
        weather: 0.1,      // Ignore weather
        coastal: 0         // Can go near coast (0 = no buffer)
      },
      fuel_efficient: { 
        distance: 10.0, 
        safety: 0.1, 
        weather: 0.1, 
        coastal: 0 
      },
      
      // SAFE MODE: Avoid coast, avoid bad weather, longer route OK
      safe: { 
        distance: 1.0,     // Distance less important
        safety: 15.0,      // Heavily prioritize safety
        weather: 10.0,     // Avoid bad weather strongly
        coastal: 5.0       // Stay far from coast (100km+ buffer)
      },
      
      // OPTIMAL MODE: Balanced - moderate weather/coast consideration
      optimal: { 
        distance: 5.0,     // Distance important but not critical
        safety: 3.0,       // Moderate safety
        weather: 2.0,      // Consider weather moderately
        coastal: 1.0       // Moderate coastal buffer (50km)
      },
      
      // NORMAL MODE: Similar to fuel but slightly more cautious
      normal: { 
        distance: 8.0, 
        safety: 1.0, 
        weather: 0.5, 
        coastal: 0.5 
      },
    };
    
    // EXCLUSION ZONES for large vessels (ULCV: 300-400m length, 16m+ draft)
    // These areas are too shallow or narrow for safe navigation
    this.EXCLUSION_ZONES = [
      {
        name: 'Palk Strait',
        description: 'Shallow water passage between India and Sri Lanka',
        reason: 'Depth 3-10m, unsuitable for vessels with 16m+ draft',
        latMin: 8.5,
        latMax: 10.5,
        lonMin: 78.5,
        lonMax: 80.5
      },
      {
        name: 'Gulf of Mannar (Southern)',
        description: 'Shallow waters south of Palk Strait',
        reason: 'Narrow passage with shallow depths',
        latMin: 7.5,
        latMax: 9.0,
        lonMin: 78.0,
        lonMax: 79.5
      }
    ];
    
    // NEW: Cache for open water cells (cells far from coast)
    // These cells get routing preference in SAFE and OPTIMAL modes
    this.openWaterCells = new Set();
    
    // INDUSTRY STANDARD: Vessel specifications for realistic calculations
    // Based on typical Panamax bulk carrier (50,000 DWT class)
    this.VESSEL_SPECS = {
      // Physical specifications
      deadweight: 50000,           // DWT (cargo capacity in tons)
      mainEngineKW: 15000,         // Main engine power (15 MW)
      auxiliaryKW: 1500,           // Auxiliary engines (1.5 MW)
      
      // Fuel consumption (industry standard for Panamax vessels)
      baseConsumptionTonsPerDay: 35,  // At service speed (20 knots)
      auxiliaryConsumptionTonsPerDay: 3, // Generators, heating, cooling
      serviceSpeedKnots: 20,       // Design service speed
      
      // Fuel economics
      fuelType: 'HFO',             // Heavy Fuel Oil (standard for cargo ships)
      fuelPriceUSD: 600,           // USD per ton (Nov 2024 average)
      
      // Speed limits by mode (industry best practices)
      speedLimits: {
        fuel: 15,      // Slow steaming for fuel efficiency (saves 40-50%)
        optimal: 20,   // Service speed (balanced)
        safe: 18       // Moderate speed for better control
      }
    };
  }
  
  /**
   * NEW: Identify open water cells (>50km from land) at route start
   * This pre-calculation helps routes prefer deep ocean over coastal paths
   */
  identifyOpenWaterCells(gridData, resolution = 0.2) {
    console.log('   🌊 Identifying open water cells for route preference...');
    const startTime = Date.now();
    
    this.openWaterCells.clear();
    
    // Check each water cell for nearby land
    for (const cell of gridData) {
      if (cell.is_land || cell.obstacle) continue;
      
      // Quick check: Count land cells in immediate 8 neighbors
      let landCount = 0;
      const directions = [
        { lat: resolution, lon: 0 }, { lat: -resolution, lon: 0 },
        { lat: 0, lon: resolution }, { lat: 0, lon: -resolution },
        { lat: resolution, lon: resolution }, { lat: resolution, lon: -resolution },
        { lat: -resolution, lon: resolution }, { lat: -resolution, lon: -resolution }
      ];
      
      for (const dir of directions) {
        const checkLat = cell.lat + dir.lat;
        const checkLon = cell.lon + dir.lon;
        const neighbor = this.findGridCell(gridData, checkLat, checkLon, resolution);
        if (neighbor && neighbor.is_land) {
          landCount++;
        }
      }
      
      // If NO land in immediate neighbors, it's open water
      if (landCount === 0) {
        const key = this.getNodeKey(cell.lat, cell.lon);
        this.openWaterCells.add(key);
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const percentage = ((this.openWaterCells.size / gridData.length) * 100).toFixed(1);
    console.log(`   ✅ Found ${this.openWaterCells.size} open water cells (${percentage}% of grid) in ${elapsed}s`);
  }

  /**
   * Haversine distance calculation (in kilometers)
   * Used as heuristic h(n) for A* algorithm
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
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
   * Calculate bearing between two points (for wind direction consideration)
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Get node key for caching
   */
  getNodeKey(lat, lon) {
    return `${lat.toFixed(3)},${lon.toFixed(3)}`;
  }

  /**
   * Find grid cell by coordinates - simple exact match
   * Used for neighbor lookups during pathfinding
   */
  findGridCell(gridData, lat, lon, resolution = 1) {
    return gridData.find(cell => 
      Math.abs(cell.lat - lat) < resolution / 2 && 
      Math.abs(cell.lon - lon) < resolution / 2
    );
  }

  /**
   * Find grid cell with fallback to nearest water cell
   * Used for start/end points that might be on land or near coast
   */
  findGridCellWithFallback(gridData, lat, lon, resolution = 1) {
    // First try exact match
    let cell = this.findGridCell(gridData, lat, lon, resolution);
    
    // If found and it's water, return it
    if (cell && !cell.is_land && !cell.obstacle) {
      return cell;
    }
    
    // If not found or it's land, search for nearest water cell within 1 degree
    console.log(`   🔍 Searching for nearest water cell to (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    
    let nearestWaterCell = null;
    let minDistance = Infinity;
    const searchRadius = 1.0; // Search within 1 degree (~111km)
    
    for (const candidate of gridData) {
      if (candidate.is_land || candidate.obstacle) continue;
      
      const distance = Math.sqrt(
        Math.pow(candidate.lat - lat, 2) + 
        Math.pow(candidate.lon - lon, 2)
      );
      
      if (distance <= searchRadius && distance < minDistance) {
        minDistance = distance;
        nearestWaterCell = candidate;
      }
    }
    
    if (nearestWaterCell) {
      const distanceKm = minDistance * 111; // Convert degrees to km
      console.log(`   ✅ Found water cell ${distanceKm.toFixed(2)}km away at (${nearestWaterCell.lat.toFixed(4)}, ${nearestWaterCell.lon.toFixed(4)})`);
      return nearestWaterCell;
    }
    
    return null;
  }

  /**
   * Check if a cell is within an exclusion zone for large vessels
   * @param {Object} cell - Grid cell with lat, lon
   * @returns {boolean|Object} - False if not in zone, zone object if in zone
   */
  isInExclusionZone(cell) {
    if (!cell || typeof cell.lat !== 'number' || typeof cell.lon !== 'number') {
      return false;
    }
    
    for (const zone of this.EXCLUSION_ZONES) {
      if (cell.lat >= zone.latMin && cell.lat <= zone.latMax &&
          cell.lon >= zone.lonMin && cell.lon <= zone.lonMax) {
        return zone; // Return the zone object for logging
      }
    }
    return false;
  }

  /**
   * Mode-based coastal buffer for visual route differentiation
   * OPTIMIZED: Only checks immediate neighbors (8 cells) for O(8) complexity
   * 
   * @param {Object} cell - Current cell to check
   * @param {Array} gridData - All grid cells
   * @param {number} resolution - Grid resolution
   * @param {Object} startPoint - Route start point {lat, lon}
   * @param {Object} endPoint - Route end point {lat, lon}
   * @param {string} mode - Route mode (fuel/safe/optimal)
   * @returns {number} - Penalty score (0 = no penalty, higher = worse)
   */
  hasLandNearby(cell, gridData, resolution, startPoint = null, endPoint = null, mode = 'optimal') {
    // Get mode-specific coastal buffer setting
    const weights = this.ROUTE_WEIGHTS[mode] || this.ROUTE_WEIGHTS['optimal'];
    let coastalWeight = weights.coastal || 0;  // Changed to 'let' so we can modify it
    
    // FUEL mode: No coastal penalty (coastal = 0)
    if (coastalWeight === 0) {
      return 0; // Allow coastal routing
    }
    
    // Check if near port (within 111km) - reduce coastal penalty near ports
    const PORT_APPROACH_RADIUS = 111; // km
    if (startPoint || endPoint) {
      const distToStart = startPoint ? this.haversineDistance(
        cell.lat, cell.lon, startPoint.lat, startPoint.lon
      ) : Infinity;
      
      const distToEnd = endPoint ? this.haversineDistance(
        cell.lat, cell.lon, endPoint.lat, endPoint.lon
      ) : Infinity;
      
      // Near port - reduce coastal penalty by 50%
      if (distToStart < PORT_APPROACH_RADIUS || distToEnd < PORT_APPROACH_RADIUS) {
        coastalWeight *= 0.5;
      }
    }
    
    // OPTIMIZED: Only check immediate 8 neighbors (not entire grid!)
    let landCount = 0;
    const directions = [
      { lat: resolution, lon: 0 }, { lat: -resolution, lon: 0 },
      { lat: 0, lon: resolution }, { lat: 0, lon: -resolution },
      { lat: resolution, lon: resolution }, { lat: resolution, lon: -resolution },
      { lat: -resolution, lon: resolution }, { lat: -resolution, lon: -resolution }
    ];
    
    for (const dir of directions) {
      const checkLat = cell.lat + dir.lat;
      const checkLon = cell.lon + dir.lon;
      const checkCell = this.findGridCell(gridData, checkLat, checkLon, resolution);
      
      if (checkCell && checkCell.is_land) {
        landCount++;
      }
    }
    
    // Return penalty based on land proximity and mode
    // SAFE mode (coastal=5.0): High penalty if ANY land nearby
    // OPTIMAL mode (coastal=1.0): Moderate penalty
    // FUEL mode (coastal=0): No penalty
    if (landCount > 0) {
      return landCount * coastalWeight * 50; // Penalty scales with land cells and mode weight
    }
    
    return 0; // No penalty
  }

  /**
   * Check if straight path between cells crosses land
   * Prevents diagonal shortcuts through islands
   */
  crossesLand(cell1, cell2, gridData, resolution) {
    const steps = 3;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lat = cell1.lat + (cell2.lat - cell1.lat) * t;
      const lon = cell1.lon + (cell2.lon - cell1.lon) * t;
      
      const check = this.findGridCell(gridData, lat, lon, resolution);
      if (check && check.is_land) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get 8-directional neighbors with mode-based filtering
   * CRITICAL for safe navigation - prevents land bridge crossings
   */
  getNeighbors(currentNode, gridData, resolution = 1, startPoint = null, endPoint = null, mode = 'optimal') {
    const neighbors = [];
    
    // 8 directions: N, S, E, W, NE, NW, SE, SW
    const directions = [
      { lat: resolution, lon: 0 },      // North
      { lat: -resolution, lon: 0 },     // South
      { lat: 0, lon: resolution },      // East
      { lat: 0, lon: -resolution },     // West
      { lat: resolution, lon: resolution },   // NE
      { lat: resolution, lon: -resolution },  // NW
      { lat: -resolution, lon: resolution },  // SE
      { lat: -resolution, lon: -resolution }, // SW
    ];

    for (const dir of directions) {
      const neighborLat = currentNode.lat + dir.lat;
      const neighborLon = currentNode.lon + dir.lon;
      
      const neighborCell = this.findGridCell(gridData, neighborLat, neighborLon, resolution);
      
      // SKIP if cell not found
      if (!neighborCell) {
        continue;
      }
      
      // CRITICAL: Strict land check (handles undefined, null, true)
      // Treat undefined or missing is_land as potentially land for safety
      if (neighborCell.is_land === true || neighborCell.is_land === undefined) {
        continue;
      }
      
      // SKIP if obstacle
      if (neighborCell.obstacle === true) {
        continue;
      }
      
      // CRITICAL CHECK 1: Skip if in exclusion zone (Palk Strait, shallow areas)
      const zone = this.isInExclusionZone(neighborCell);
      if (zone) {
        // Silently skip - exclusion zones block large vessel navigation
        continue;
      }
      
      // CRITICAL CHECK 2: For diagonal moves, check intermediate cells
      // This prevents cutting through peninsulas or island corners
      const isDiagonal = (dir.lat !== 0 && dir.lon !== 0);
      if (isDiagonal) {
        // Check both intermediate cells
        const mid1Lat = currentNode.lat + dir.lat;
        const mid1Lon = currentNode.lon;
        const mid2Lat = currentNode.lat;
        const mid2Lon = currentNode.lon + dir.lon;
        
        const midCell1 = this.findGridCell(gridData, mid1Lat, mid1Lon, resolution);
        const midCell2 = this.findGridCell(gridData, mid2Lat, mid2Lon, resolution);
        
        // Block if either intermediate cell is land or undefined
        if (!midCell1 || midCell1.is_land === true || midCell1.is_land === undefined ||
            !midCell2 || midCell2.is_land === true || midCell2.is_land === undefined) {
          continue;
        }
      }
      
      // CRITICAL CHECK 3: Skip if path to this cell crosses land (prevents diagonal shortcuts)
      if (this.crossesLand(currentNode, neighborCell, gridData, resolution)) {
        continue;
      }
      
      // Calculate coastal penalty (not blocking, just increases cost)
      const coastalPenalty = this.hasLandNearby(neighborCell, gridData, resolution, startPoint, endPoint, mode);
      
      // Create a new object with penalty (can't modify frozen MongoDB objects)
      const cellWithPenalty = Object.assign({}, neighborCell, { coastalPenalty });
      
      neighbors.push(cellWithPenalty);
    }

    return neighbors;
  }

  /**
   * Calculate movement cost with STRONG mode-based penalties + OPEN WATER BONUS
   * This creates VISUALLY DIFFERENT routes for each mode
   */
  calculateMovementCost(node, mode = 'optimal', distance = 1) {
    // Get weights for mode, fallback to optimal if mode not found
    const weights = this.ROUTE_WEIGHTS[mode] || this.ROUTE_WEIGHTS['optimal'];
    
    // Base cost from distance
    let cost = distance * weights.distance;
    
    // Add safety penalty (bad weather, high waves, low visibility)
    const safetyScore = node.safety_score || 0.5;
    const safetyPenalty = (1 - safetyScore) * weights.safety * 100;
    cost += safetyPenalty;
    
    // Add fuel penalty (currents, wind resistance)
    const fuelScore = node.fuel_efficiency_score || 0.5;
    const fuelPenalty = (1 - fuelScore) * weights.weather * 50;
    cost += fuelPenalty;
    
    // Add coastal penalty (mode-specific, calculated in hasLandNearby)
    const coastalPenalty = node.coastalPenalty || 0;
    cost += coastalPenalty;
    
    // NEW: Open water bonus - encourage routes through deep ocean
    const nodeKey = this.getNodeKey(node.lat, node.lon);
    const isOpenWater = this.openWaterCells.has(nodeKey);
    
    if (isOpenWater) {
      if (mode === 'safe') {
        // SAFE mode: Major discount for open water (40% off)
        cost *= 0.6;
      } else if (mode === 'optimal') {
        // OPTIMAL mode: Moderate discount (20% off)
        cost *= 0.8;
      }
      // FUEL mode: No discount (wants shortest path regardless)
    }
    
    return cost;
  }

  /**
   * Priority Queue implementation for A*
   */
  createPriorityQueue() {
    const items = [];
    
    return {
      enqueue: (item, priority) => {
        items.push({ item, priority });
        items.sort((a, b) => a.priority - b.priority);
      },
      dequeue: () => items.shift(),
      isEmpty: () => items.length === 0,
      size: () => items.length,
    };
  }

  /**
   * Reconstruct path from cameFrom map
   */
  reconstructPath(cameFrom, currentNode) {
    const path = [currentNode];
    let current = currentNode;
    
    while (cameFrom.has(this.getNodeKey(current.lat, current.lon))) {
      current = cameFrom.get(this.getNodeKey(current.lat, current.lon));
      path.unshift(current);
    }
    
    return path;
  }
  
  /**
   * NEW: Smooth path using Douglas-Peucker algorithm
   * Removes unnecessary waypoints that cause coastal hugging
   * @param {Array} path - Array of {lat, lon} waypoints
   * @param {number} epsilon - Tolerance (higher = more aggressive smoothing)
   * @returns {Array} Smoothed path with fewer waypoints
   */
  smoothPath(path, epsilon = 0.1) {
    if (path.length <= 2) return path;
    
    // Find point with maximum distance from line
    let maxDist = 0;
    let maxIndex = 0;
    const start = path[0];
    const end = path[path.length - 1];
    
    for (let i = 1; i < path.length - 1; i++) {
      const dist = this.perpendicularDistance(path[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    
    // If max distance > epsilon, recursively simplify
    if (maxDist > epsilon) {
      const left = this.smoothPath(path.slice(0, maxIndex + 1), epsilon);
      const right = this.smoothPath(path.slice(maxIndex), epsilon);
      return [...left.slice(0, -1), ...right];
    } else {
      // All points close to line, keep only endpoints
      return [start, end];
    }
  }
  
  /**
   * Calculate perpendicular distance from point to line segment
   */
  perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.lat - lineStart.lat;
    const dy = lineEnd.lon - lineStart.lon;
    const mag = Math.sqrt(dx * dx + dy * dy);
    
    if (mag === 0) return 0;
    
    const u = ((point.lat - lineStart.lat) * dx + (point.lon - lineStart.lon) * dy) / (mag * mag);
    const closestLat = lineStart.lat + u * dx;
    const closestLon = lineStart.lon + u * dy;
    
    const distLat = point.lat - closestLat;
    const distLon = point.lon - closestLon;
    
    return Math.sqrt(distLat * distLat + distLon * distLon);
  }

  /**
   * INDUSTRY STANDARD: Calculate optimal speed based on mode and conditions
   * 
   * Maritime industry best practices:
   * - FUEL mode: Slow steaming (14-15 knots) saves 40-50% fuel via cubic relationship
   * - OPTIMAL mode: Service speed (18-20 knots) weather-adjusted
   * - SAFE mode: Reduced speed (12-18 knots) for better control in bad weather
   * 
   * @param {string} mode - Route mode (fuel, optimal, safe)
   * @param {number} weatherIndex - Weather severity (0-100, 50=good)
   * @param {boolean} isOpenWater - Whether route is mostly open water
   * @returns {number} Optimal speed in knots
   */
  getOptimalSpeed(mode, weatherIndex, isOpenWater) {
    const baseSpeed = this.VESSEL_SPECS.speedLimits[mode] || this.VESSEL_SPECS.serviceSpeedKnots;
    
    // Weather impact on safe speed
    // Bad weather (>70): reduce speed by up to 20%
    // Good weather (<50): maintain full speed
    let weatherFactor = 1.0;
    if (mode === 'safe' && weatherIndex > 70) {
      weatherFactor = 0.85; // Reduce to 85% speed in storms
    } else if (mode === 'safe' && weatherIndex > 60) {
      weatherFactor = 0.92; // Reduce to 92% in moderate weather
    }
    
    // Open water allows slightly higher speeds (better visibility, more room)
    const openWaterBonus = (isOpenWater && mode === 'optimal') ? 1.05 : 1.0;
    
    return baseSpeed * weatherFactor * openWaterBonus;
  }

  /**
   * INDUSTRY STANDARD: Calculate realistic fuel consumption
   * 
   * Based on maritime engineering cubic speed relationship:
   * Fuel = BaseConsumption × (ActualSpeed/ServiceSpeed)³ × WeatherFactor × LoadFactor × Days + Auxiliary
   * 
   * Key factors:
   * - Speed³: Marine engines follow cubic relationship (double speed = 8x fuel)
   * - Weather: Storms increase fuel 0-40% (higher waves = more resistance)
   * - Load: Engine load varies by mode (fuel=75%, optimal=82%, safe=85%)
   * - Auxiliary: Generators, HVAC, pumps (~3 tons/day regardless of speed)
   * 
   * @param {number} distanceKm - Total distance in kilometers
   * @param {number} speedKnots - Average speed in knots
   * @param {number} weatherIndex - Average weather severity (0-100)
   * @param {string} mode - Route mode (affects load factor)
   * @returns {Object} {totalFuel, mainEngineFuel, auxiliaryFuel, fuelCostUSD, durationHours, durationDays}
   */
  calculateFuelConsumption(distanceKm, speedKnots, weatherIndex, mode) {
    const specs = this.VESSEL_SPECS;
    
    // Convert distance to nautical miles and calculate duration
    const distanceNM = distanceKm / 1.852;
    const durationHours = distanceNM / speedKnots;
    const durationDays = durationHours / 24;
    
    // CUBIC SPEED RELATIONSHIP: Fuel scales with speed³
    // This is fundamental to marine propulsion (resistance increases exponentially)
    const speedRatio = speedKnots / specs.serviceSpeedKnots;
    const speedFactor = Math.pow(speedRatio, 3);
    
    // WEATHER FACTOR: Bad weather increases resistance
    // Light seas (<50): 1.0 (no increase)
    // Moderate seas (50-70): 1.0-1.2 (+0-20%)
    // Heavy seas (>70): 1.2-1.4 (+20-40%)
    let weatherFactor = 1.0;
    if (weatherIndex > 70) {
      weatherFactor = 1.3; // Heavy weather (+30%)
    } else if (weatherIndex > 60) {
      weatherFactor = 1.15; // Moderate weather (+15%)
    } else if (weatherIndex > 50) {
      weatherFactor = 1.05; // Slightly rough (+5%)
    }
    
    // LOAD FACTOR: Engine load varies by operational mode
    // Fuel-efficient: 75% load (reduced RPM, optimal efficiency zone)
    // Optimal: 82% load (balanced operation)
    // Safe: 85% load (more power reserve for maneuvering)
    const loadFactors = {
      fuel: 0.75,
      optimal: 0.82,
      safe: 0.85
    };
    const loadFactor = loadFactors[mode] || 0.82;
    
    // MAIN ENGINE FUEL: BaseConsumption × Speed³ × Weather × Load × Days
    const mainEngineFuel = specs.baseConsumptionTonsPerDay * speedFactor * weatherFactor * loadFactor * durationDays;
    
    // AUXILIARY FUEL: Constant daily consumption for ship systems
    // Generators, HVAC, cargo equipment, navigation systems
    const auxiliaryFuel = specs.auxiliaryConsumptionTonsPerDay * durationDays;
    
    // TOTAL FUEL AND COST
    const totalFuel = mainEngineFuel + auxiliaryFuel;
    const fuelCostUSD = totalFuel * specs.fuelPriceUSD;
    
    return {
      totalFuel: parseFloat(totalFuel.toFixed(2)),
      mainEngineFuel: parseFloat(mainEngineFuel.toFixed(2)),
      auxiliaryFuel: parseFloat(auxiliaryFuel.toFixed(2)),
      fuelCostUSD: parseFloat(fuelCostUSD.toFixed(2)),
      durationHours: parseFloat(durationHours.toFixed(2)),
      durationDays: parseFloat(durationDays.toFixed(2)),
      avgSpeedKnots: parseFloat(speedKnots.toFixed(2)),
      speedFactor: parseFloat(speedFactor.toFixed(3)),
      weatherFactor: parseFloat(weatherFactor.toFixed(2)),
      loadFactor: parseFloat(loadFactor.toFixed(2))
    };
  }

  /**
   * Main A* pathfinding algorithm
   * 
   * @param {Object} start - Start coordinates { lat, lon }
   * @param {Object} end - End coordinates { lat, lon }
   * @param {Array} gridData - Array of grid cells
   * @param {string} mode - Route mode (optimal, fuel_efficient, safe, normal)
   * @param {number} resolution - Grid resolution in degrees
   * @returns {Object} Route result with path and statistics
   */
  async findOptimalRoute(start, end, gridData, mode = 'optimal', resolution = 1) {
    console.log(`🧭 Finding ${mode} route from (${start.lat}, ${start.lon}) to (${end.lat}, ${end.lon})`);
    console.log(`   Grid contains ${gridData.length} cells, Resolution: ${resolution}°`);
    
    // NEW: Identify open water cells for route preference (SAFE/OPTIMAL modes benefit)
    if (mode === 'safe' || mode === 'optimal') {
      this.identifyOpenWaterCells(gridData, resolution);
    }
    
    // Find start and end nodes with fallback to nearest water cell
    const startNode = this.findGridCellWithFallback(gridData, start.lat, start.lon, resolution);
    const endNode = this.findGridCellWithFallback(gridData, end.lat, end.lon, resolution);
    
    if (!startNode) {
      throw new Error(`Start point (${start.lat}, ${start.lon}) not found in grid or no water cells nearby`);
    }
    
    if (!endNode) {
      throw new Error(`End point (${end.lat}, ${end.lon}) not found in grid or no water cells nearby`);
    }
    
    // Check if start/end are in open water
    const startKey = this.getNodeKey(startNode.lat, startNode.lon);
    const endKey = this.getNodeKey(endNode.lat, endNode.lon);
    const startIsOpenWater = this.openWaterCells.has(startKey);
    const endIsOpenWater = this.openWaterCells.has(endKey);
    
    console.log(`   📍 Start node: (${startNode.lat}, ${startNode.lon}), is_land: ${startNode.is_land}, open_water: ${startIsOpenWater}`);
    console.log(`   📍 End node: (${endNode.lat}, ${endNode.lon}), is_land: ${endNode.is_land}, open_water: ${endIsOpenWater}`);
    
    if (startNode.is_land) {
      throw new Error('Start point is on land - no navigable water found nearby');
    }
    
    if (endNode.is_land) {
      throw new Error('End point is on land - no navigable water found nearby');
    }

    // Initialize A* data structures
    const openSet = this.createPriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    // Initialize start node (startKey and endKey already declared above)
    gScore.set(startKey, 0);
    fScore.set(startKey, this.haversineDistance(startNode.lat, startNode.lon, endNode.lat, endNode.lon));
    openSet.enqueue(startNode, fScore.get(startKey));

    let nodesExplored = 0;
    const startTime = Date.now();
    const MAX_NODES = 100000; // Limit search to prevent infinite loops on impossible routes
    
    console.log(`   🎯 Starting A* search...`);
    console.log(`   🔑 Start key: ${startKey}, End key: ${endKey}`);

    // A* main loop
    while (!openSet.isEmpty()) {
      const current = openSet.dequeue().item;
      const currentKey = this.getNodeKey(current.lat, current.lon);
      nodesExplored++;
      
      // Debug first iteration
      if (nodesExplored === 1) {
        console.log(`   🚀 First node: (${current.lat}, ${current.lon}), key: ${currentKey}`);
      }
      
      // Progress logging for long routes
      if (nodesExplored % 10000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const distToGoal = this.haversineDistance(current.lat, current.lon, endNode.lat, endNode.lon);
        console.log(`   ⏳ Explored ${nodesExplored} nodes in ${elapsed}s, ${distToGoal.toFixed(0)}km from goal`);
      }
      
      // Prevent infinite search on impossible routes
      if (nodesExplored > MAX_NODES) {
        throw new Error(`Route search exceeded ${MAX_NODES} nodes - route may be impossible or too complex. Try selecting ports closer together or within the Indian Ocean region.`);
      }

      // Goal reached
      if (currentKey === endKey) {
        const rawPath = this.reconstructPath(cameFrom, current);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ Route found! Nodes explored: ${nodesExplored}, Time: ${duration}s`);
        console.log(`   📍 Raw path: ${rawPath.length} waypoints`);
        
        // Apply path smoothing to remove coastal hugging waypoints
        const smoothedPath = this.smoothPath(rawPath, 0.1);
        console.log(`   ✨ Smoothed path: ${smoothedPath.length} waypoints (removed ${rawPath.length - smoothedPath.length})`);
        
        return this.formatRouteResult(smoothedPath, mode);
      }

      closedSet.add(currentKey);

      // Explore neighbors with mode-based filtering
      // Pass start/end points and mode for coastal penalty calculation
      const neighbors = this.getNeighbors(current, gridData, resolution, start, end, mode);
      
      // Debug: Log if no neighbors found for first few nodes
      if (nodesExplored <= 3 && neighbors.length === 0) {
        console.log(`   ⚠️ Node ${nodesExplored} at (${current.lat}, ${current.lon}) has NO neighbors!`);
      }

      for (const neighbor of neighbors) {
        const neighborKey = this.getNodeKey(neighbor.lat, neighbor.lon);

        if (closedSet.has(neighborKey)) {
          continue; // Already evaluated
        }

        // Calculate distance between cells
        const distance = this.haversineDistance(current.lat, current.lon, neighbor.lat, neighbor.lon);
        const bearing = this.calculateBearing(current.lat, current.lon, neighbor.lat, neighbor.lon);
        
        // Calculate movement cost with mode-specific penalties
        // This is what makes routes VISUALLY DIFFERENT
        const movementCost = this.calculateMovementCost(neighbor, mode, distance);
        
        // g(n) = cost from start to current + movement cost (includes distance + penalties)
        const tentativeGScore = (gScore.get(currentKey) || 0) + movementCost;

        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          // This path to neighbor is better
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          
          // h(n) = heuristic (Haversine distance to goal)
          const h = this.haversineDistance(neighbor.lat, neighbor.lon, endNode.lat, endNode.lon);
          
          // f(n) = g(n) + h(n)
          const f = tentativeGScore + h;
          fScore.set(neighborKey, f);
          
          openSet.enqueue(neighbor, f);
        }
      }
    }

    // No path found - openSet is empty
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ❌ Search exhausted after ${nodesExplored} nodes in ${elapsed}s`);
    console.log(`   💡 Possible causes:`);
    console.log(`      - Destination is outside grid coverage (Indian Ocean: 22°E to 142°E)`);
    console.log(`      - Route requires going through land (Malaysia/Southeast Asia mainland)`);
    console.log(`      - Ports are in different ocean basins with no water connection`);
    
    throw new Error(`No navigable route found between (${start.lat.toFixed(2)}, ${start.lon.toFixed(2)}) and (${end.lat.toFixed(2)}, ${end.lon.toFixed(2)}). This may be because: (1) Route is outside Indian Ocean coverage, (2) Route blocked by land masses, or (3) Ports are in disconnected water bodies. Try selecting ports within the Indian Ocean region.`);
  }

  /**
   * Format route result with statistics
   */
  formatRouteResult(path, mode) {
    let totalDistance = 0;
    let safetySum = 0;
    let fuelEfficiencySum = 0;
    let weatherSum = 0;
    let safetyCount = 0;
    let openWaterWaypoints = 0;

    const coordinates = path.map((node, index) => {
      if (index > 0) {
        const distance = this.haversineDistance(
          path[index - 1].lat,
          path[index - 1].lon,
          node.lat,
          node.lon
        );
        totalDistance += distance;
      }

      // Track safety, fuel efficiency, and weather indices
      if (node.safety_score !== undefined) {
        safetySum += node.safety_score;
        safetyCount++;
      }

      if (node.fuel_efficiency_score !== undefined) {
        fuelEfficiencySum += node.fuel_efficiency_score;
      }
      
      // Track average weather conditions along route
      if (node.weather_index !== undefined) {
        weatherSum += node.weather_index;
      }
      
      // Track open water usage
      const nodeKey = this.getNodeKey(node.lat, node.lon);
      if (this.openWaterCells.has(nodeKey)) {
        openWaterWaypoints++;
      }

      return {
        lat: parseFloat(node.lat.toFixed(6)),
        lon: parseFloat(node.lon.toFixed(6)),
        safety_score: node.safety_score,
        fuel_efficiency_score: node.fuel_efficiency_score,
        distance_score: node.distance_score,
        total_score: node.total_score,
        // Include weather data from grid cell for frontend display
        weather: node.weather ? {
          temperature: node.weather.temperature,
          windSpeed: node.weather.windSpeed,
          waveHeight: node.weather.waveHeight,
          visibility: node.weather.visibility,
          humidity: node.weather.humidity,
          lastUpdated: node.weather.lastUpdated
        } : null
      };
    });

    // Calculate average weather conditions (default 50 if no data)
    const avgWeatherIndex = safetyCount > 0 ? weatherSum / safetyCount : 50;
    
    // Calculate aggregate weather statistics from waypoints
    let windSum = 0, waveSum = 0, tempSum = 0, visSum = 0;
    let maxWind = 0, maxWave = 0;
    let weatherDataCount = 0;
    
    path.forEach(node => {
      if (node.weather) {
        windSum += node.weather.windSpeed || 0;
        waveSum += node.weather.waveHeight || 0;
        tempSum += node.weather.temperature || 0;
        visSum += node.weather.visibility || 0;
        maxWind = Math.max(maxWind, node.weather.windSpeed || 0);
        maxWave = Math.max(maxWave, node.weather.waveHeight || 0);
        weatherDataCount++;
      }
    });
    
    const avgWind = weatherDataCount > 0 ? windSum / weatherDataCount : 12;
    const avgWave = weatherDataCount > 0 ? waveSum / weatherDataCount : 2;
    const avgTemp = weatherDataCount > 0 ? tempSum / weatherDataCount : 25;
    const avgVis = weatherDataCount > 0 ? visSum / weatherDataCount : 8;
    
    // Calculate open water percentage
    const openWaterPercentage = path.length > 0 ? (openWaterWaypoints / path.length) * 100 : 0;
    const isOpenWater = openWaterPercentage > 50;
    
    // INDUSTRY STANDARD: Calculate realistic fuel and duration
    const optimalSpeed = this.getOptimalSpeed(mode, avgWeatherIndex, isOpenWater);
    const fuelData = this.calculateFuelConsumption(totalDistance, optimalSpeed, avgWeatherIndex, mode);
    
    // Convert scores to percentages (0-100%) for better readability
    // Scores are stored as 0-1 range (e.g., 0.85 = 85%), so multiply by 100
    // Add bounds checking to ensure valid percentage range
    const avgSafety = safetyCount > 0 ? (safetySum / safetyCount) : 0.5;
    const avgFuelEfficiency = safetyCount > 0 ? (fuelEfficiencySum / safetyCount) : 0.5;
    
    // Ensure scores are in 0-1 range before converting to percentage
    const safetyPercentage = Math.min(100, Math.max(0, parseFloat((avgSafety * 100).toFixed(1))));
    const fuelEfficiencyPercentage = Math.min(100, Math.max(0, parseFloat((avgFuelEfficiency * 100).toFixed(1))));

    return {
      success: true,
      mode: mode,
      
      // Distance metrics
      total_distance_km: parseFloat(totalDistance.toFixed(2)),
      total_distance_nm: parseFloat((totalDistance / 1.852).toFixed(2)),
      
      // INDUSTRY STANDARD: Realistic fuel consumption
      fuel_consumption: {
        total_tons: fuelData.totalFuel,
        main_engine_tons: fuelData.mainEngineFuel,
        auxiliary_tons: fuelData.auxiliaryFuel,
        total_cost_usd: fuelData.fuelCostUSD,
        breakdown: {
          speed_factor: fuelData.speedFactor,      // Cubic relationship impact
          weather_factor: fuelData.weatherFactor,   // Weather resistance impact
          load_factor: fuelData.loadFactor          // Engine load efficiency
        }
      },
      
      // INDUSTRY STANDARD: Realistic duration estimation
      duration: {
        hours: fuelData.durationHours,
        days: fuelData.durationDays,
        avg_speed_knots: fuelData.avgSpeedKnots,
        avg_speed_kmh: parseFloat((fuelData.avgSpeedKnots * 1.852).toFixed(2))
      },
      
      // Route quality metrics (0-100%)
      safety_percentage: safetyPercentage,
      fuel_efficiency_percentage: fuelEfficiencyPercentage,
      
      // Vessel specifications for frontend display
      vessel_specs: {
        fuel_price_usd_per_ton: this.VESSEL_SPECS.fuelPriceUSD,
        fuel_price_inr_per_ton: Math.round(this.VESSEL_SPECS.fuelPriceUSD * 83), // $1 = ₹83
        deadweight_dwt: this.VESSEL_SPECS.deadweight,
        fuel_type: this.VESSEL_SPECS.fuelType,
        service_speed_knots: this.VESSEL_SPECS.serviceSpeedKnots
      },
      
      // Weather and route characteristics
      conditions: {
        avg_weather_index: parseFloat(avgWeatherIndex.toFixed(1)),
        open_water_percentage: parseFloat(openWaterPercentage.toFixed(1)),
        weather_description: avgWeatherIndex < 50 ? 'favorable' : avgWeatherIndex < 70 ? 'moderate' : 'challenging'
      },
      
      // Real-time weather statistics along route
      weather_stats: {
        avg_wind_speed: parseFloat(avgWind.toFixed(1)),
        max_wind_speed: parseFloat(maxWind.toFixed(1)),
        avg_wave_height: parseFloat(avgWave.toFixed(1)),
        max_wave_height: parseFloat(maxWave.toFixed(1)),
        avg_temperature: parseFloat(avgTemp.toFixed(1)),
        avg_visibility: parseFloat(avgVis.toFixed(1)),
        data_coverage: weatherDataCount > 0 ? parseFloat(((weatherDataCount / path.length) * 100).toFixed(1)) : 0
      },
      
      // Route structure
      waypoints: path.length,
      coordinates: coordinates,
      
      // Route characteristics for display
      route_characteristics: {
        is_coastal: mode === 'fuel',
        uses_open_water: mode === 'safe' || mode === 'optimal',
        prioritizes: mode === 'fuel' ? 'shortest_distance' : mode === 'safe' ? 'safety_and_deep_water' : 'balanced_approach'
      }
    };
  }

  /**
   * Compare multiple route modes
   */
  async compareRoutes(start, end, gridData, resolution = 1) {
    const modes = ['optimal', 'fuel_efficient', 'safe', 'normal'];
    const comparison = {};

    for (const mode of modes) {
      try {
        const result = await this.findOptimalRoute(start, end, gridData, mode, resolution);
        comparison[mode] = {
          total_distance_km: result.total_distance_km,
          total_fuel_cost: result.total_fuel_cost,
          safety_index_avg: result.safety_index_avg,
          fuel_efficiency_avg: result.fuel_efficiency_avg,
          waypoints: result.waypoints,
        };
      } catch (error) {
        comparison[mode] = { error: error.message };
      }
    }

    return comparison;
  }
}

// Example usage and testing
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════');
  console.log('   🧭 MARITIME ROUTE FINDER TEST');
  console.log('   A* Pathfinding Algorithm');
  console.log('═══════════════════════════════════════════════════\n');

  const routeFinder = new RouteFinder();

  // Test with sample grid data
  const sampleGrid = [
    { lat: 0, lon: 40, safety_score: 0.8, fuel_efficiency_score: 0.7, distance_score: 0.9, total_score: 0.8, is_land: false },
    { lat: 0, lon: 41, safety_score: 0.75, fuel_efficiency_score: 0.72, distance_score: 0.88, total_score: 0.78, is_land: false },
    { lat: 1, lon: 40, safety_score: 0.82, fuel_efficiency_score: 0.68, distance_score: 0.91, total_score: 0.79, is_land: false },
    { lat: 1, lon: 41, safety_score: 0.85, fuel_efficiency_score: 0.75, distance_score: 0.92, total_score: 0.82, is_land: false },
    { lat: 2, lon: 40, safety_score: 0.78, fuel_efficiency_score: 0.71, distance_score: 0.87, total_score: 0.77, is_land: false },
    { lat: 2, lon: 41, safety_score: 0.8, fuel_efficiency_score: 0.73, distance_score: 0.89, total_score: 0.79, is_land: false },
  ];

  const start = { lat: 0, lon: 40 };
  const end = { lat: 2, lon: 41 };

  (async () => {
    try {
      console.log('🧪 Testing route finding...\n');
      
      const route = await routeFinder.findOptimalRoute(start, end, sampleGrid, 'optimal');
      
      console.log('📊 Route Result:');
      console.log(JSON.stringify(route, null, 2));
      
      console.log('\n✨ Test complete!\n');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  })();
}

module.exports = RouteFinder;
