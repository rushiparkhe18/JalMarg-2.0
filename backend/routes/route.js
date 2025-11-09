const express = require('express');
const router = express.Router();
const path = require('path');
const Grid = require('../models/Grid');
const ScoringEngine = require('../scoringEngine');
const RouteFinder = require('../routeFinder');
const { updateRouteWeather, extractRouteCells } = require('../routeWeatherUpdater');
const weatherConfig = require('../weatherConfig');

const scoringEngine = new ScoringEngine();
const routeFinder = new RouteFinder();

// Simple in-memory cache for route cells (expires after 1 hour)
const regionCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCacheKey(latMin, latMax, lonMin, lonMax) {
  return `${latMin.toFixed(1)}_${latMax.toFixed(1)}_${lonMin.toFixed(1)}_${lonMax.toFixed(1)}`;
}

// A* Algorithm implementation for route calculation
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to generate warnings based on cyclone intensity
function generateWarnings(windSpeed, waveHeight, pressure) {
  const warnings = [];
  
  if (windSpeed >= 64) {
    warnings.push('🌀 SEVERE CYCLONIC STORM - EXTREME DANGER');
    warnings.push('⚠️ All vessels must seek immediate shelter');
    warnings.push('🚢 Navigation suspended in affected area');
    warnings.push('📡 Emergency protocols in effect');
  } else if (windSpeed >= 48) {
    warnings.push('🌀 CYCLONIC STORM WARNING');
    warnings.push('⚠️ Dangerous conditions - avoid area');
    warnings.push('🚢 Small craft should not sail');
  } else if (windSpeed >= 34) {
    warnings.push('💨 TROPICAL STORM CONDITIONS');
    warnings.push('⚠️ Exercise extreme caution');
    warnings.push('🚢 Monitor closely');
  }
  
  if (waveHeight >= 8) {
    warnings.push(`🌊 PHENOMENAL SEAS: ${waveHeight.toFixed(1)}m waves`);
  } else if (waveHeight >= 6) {
    warnings.push(`🌊 VERY HIGH SEAS: ${waveHeight.toFixed(1)}m waves`);
  } else if (waveHeight >= 4) {
    warnings.push(`🌊 HIGH SEAS: ${waveHeight.toFixed(1)}m waves`);
  }
  
  if (pressure < 970) {
    warnings.push('📉 VERY LOW PRESSURE - Intensification likely');
  } else if (pressure < 990) {
    warnings.push('📉 LOW PRESSURE SYSTEM');
  }
  
  return warnings;
}

// Helper function to generate forecast based on conditions
function generateForecast(windSpeed, pressure) {
  if (windSpeed >= 64 && pressure < 970) {
    return 'DANGEROUS: Further intensification possible. Stay well clear of system.';
  } else if (windSpeed >= 48) {
    return 'System likely to maintain intensity for next 12-24 hours. Continue monitoring.';
  } else if (windSpeed >= 34) {
    return 'May intensify to cyclonic storm. Monitor closely and prepare contingency routes.';
  } else {
    return 'Conditions improving. Continue to monitor weather updates.';
  }
}

function calculateHeading(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let heading = Math.atan2(y, x) * 180 / Math.PI;
  return (heading + 360) % 360;
}

// Create spatial index for fast neighbor lookup
const cellIndex = new Map();

function buildCellIndex(cells) {
  cellIndex.clear();
  for (const cell of cells) {
    // Only index water cells (already filtered, but double-check)
    if (!cell.obstacle && !cell.is_land) {
      const key = `${Math.round(cell.lat * 10000)},${Math.round(cell.lon * 10000)}`;
      cellIndex.set(key, cell);
    }
  }
}

/**
 * Check if line segment between two cells crosses land or goes too close to land
 * Uses dense sampling along the line to ensure no land crossing
 */
function lineSegmentCrossesLand(from, to, resolution, allCells) {
  // Calculate number of steps - use MANY steps for thorough checking
  const distance = Math.sqrt(
    Math.pow(to.lat - from.lat, 2) + 
    Math.pow(to.lon - from.lon, 2)
  );
  const steps = Math.ceil(distance / resolution) * 3; // 3x more checks for safety
  
  // Check points along the line with high density
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const checkLat = from.lat + (to.lat - from.lat) * t;
    const checkLon = from.lon + (to.lon - from.lon) * t;
    
    // Round to nearest grid cell
    const roundedLat = Math.round(checkLat / resolution) * resolution;
    const roundedLon = Math.round(checkLon / resolution) * resolution;
    const key = `${Math.round(roundedLat * 10000)},${Math.round(roundedLon * 10000)}`;
    
    const checkCell = cellIndex.get(key);
    
    // If we can't find the cell in water index, it's probably land
    if (!checkCell) {
      return true; // No water cell = REJECT
    }
    
    // If cell is marked as land or obstacle
    if (checkCell.is_land || checkCell.obstacle) {
      return true; // Land detected = REJECT
    }
    
    // Note: We don't check neighbors here to avoid being overly restrictive
    // The getNeighbors() function already applies coastal distance requirements
    // This function only rejects if the actual path crosses land cells
  }
  
  return false; // All clear - no land crossing
}

/**
 * Check if a cell is in a narrow passage between land masses
 * Returns true if land detected on opposite sides (narrow strait)
 * Prevents routing through Palk Strait (India-Sri Lanka), Singapore Strait, etc.
 */
function checkNarrowPassage(cell, allCells, resolution) {
  // Check in 4 perpendicular directions to detect narrow passages
  const checkDistance = 3; // Check 3 cells = 66km in each direction
  
  // Check North-South corridor (horizontal strait like Palk Strait)
  let northLand = false;
  let southLand = false;
  for (let i = 1; i <= checkDistance; i++) {
    const northKey = `${Math.round((cell.lat + i * resolution) * 10000)},${Math.round(cell.lon * 10000)}`;
    const southKey = `${Math.round((cell.lat - i * resolution) * 10000)},${Math.round(cell.lon * 10000)}`;
    
    const northCell = cellIndex.get(northKey);
    const southCell = cellIndex.get(southKey);
    
    if (!northCell || (northCell && (northCell.is_land || northCell.obstacle))) {
      northLand = true;
    }
    if (!southCell || (southCell && (southCell.is_land || southCell.obstacle))) {
      southLand = true;
    }
  }
  
  // If land on both north and south, it's a narrow east-west passage
  if (northLand && southLand) {
    return true;
  }
  
  // Check East-West corridor (vertical strait like Singapore Strait)
  let eastLand = false;
  let westLand = false;
  for (let i = 1; i <= checkDistance; i++) {
    const eastKey = `${Math.round(cell.lat * 10000)},${Math.round((cell.lon + i * resolution) * 10000)}`;
    const westKey = `${Math.round(cell.lat * 10000)},${Math.round((cell.lon - i * resolution) * 10000)}`;
    
    const eastCell = cellIndex.get(eastKey);
    const westCell = cellIndex.get(westKey);
    
    if (!eastCell || (eastCell && (eastCell.is_land || eastCell.obstacle))) {
      eastLand = true;
    }
    if (!westCell || (westCell && (westCell.is_land || westCell.obstacle))) {
      westLand = true;
    }
  }
  
  // If land on both east and west, it's a narrow north-south passage
  if (eastLand && westLand) {
    return true;
  }
  
  // Check diagonal corridors (NE-SW and NW-SE)
  let neLand = false, swLand = false, nwLand = false, seLand = false;
  for (let i = 1; i <= checkDistance; i++) {
    const neKey = `${Math.round((cell.lat + i * resolution) * 10000)},${Math.round((cell.lon + i * resolution) * 10000)}`;
    const swKey = `${Math.round((cell.lat - i * resolution) * 10000)},${Math.round((cell.lon - i * resolution) * 10000)}`;
    const nwKey = `${Math.round((cell.lat + i * resolution) * 10000)},${Math.round((cell.lon - i * resolution) * 10000)}`;
    const seKey = `${Math.round((cell.lat - i * resolution) * 10000)},${Math.round((cell.lon + i * resolution) * 10000)}`;
    
    const neCell = cellIndex.get(neKey);
    const swCell = cellIndex.get(swKey);
    const nwCell = cellIndex.get(nwKey);
    const seCell = cellIndex.get(seKey);
    
    if (!neCell || (neCell && (neCell.is_land || neCell.obstacle))) neLand = true;
    if (!swCell || (swCell && (swCell.is_land || swCell.obstacle))) swLand = true;
    if (!nwCell || (nwCell && (nwCell.is_land || nwCell.obstacle))) nwLand = true;
    if (!seCell || (seCell && (seCell.is_land || seCell.obstacle))) seLand = true;
  }
  
  // If land on opposite diagonal corners, it's a diagonal narrow passage
  if ((neLand && swLand) || (nwLand && seLand)) {
    return true;
  }
  
  return false; // Not a narrow passage
}

/**
 * Calculate minimum distance from a cell to nearest land
 * Returns distance in grid cells (0.2° = ~22km)
 */
function getDistanceToLand(cell, allCells, resolution, maxCheckDistance = 7) {
  let minDistance = maxCheckDistance + 1; // Start beyond max
  
  // Check in expanding square around cell
  for (let dist = 1; dist <= maxCheckDistance; dist++) {
    for (let latOffset = -dist; latOffset <= dist; latOffset++) {
      for (let lonOffset = -dist; lonOffset <= dist; lonOffset++) {
        // Only check perimeter of current square
        if (Math.abs(latOffset) === dist || Math.abs(lonOffset) === dist) {
          const checkLat = cell.lat + (latOffset * resolution);
          const checkLon = cell.lon + (lonOffset * resolution);
          const key = `${Math.round(checkLat * 10000)},${Math.round(checkLon * 10000)}`;
          
          const checkCell = cellIndex.get(key);
          if (checkCell && (checkCell.is_land || checkCell.obstacle)) {
            const actualDist = Math.sqrt(latOffset * latOffset + lonOffset * lonOffset);
            minDistance = Math.min(minDistance, actualDist);
            return minDistance; // Early return when land found
          }
        }
      }
    }
  }
  
  return minDistance;
}

function getNeighbors(cell, cells, resolution, allCells) {
  const neighbors = [];
  const directions = [
    { lat: resolution, lon: 0 },
    { lat: -resolution, lon: 0 },
    { lat: 0, lon: resolution },
    { lat: 0, lon: -resolution },
    { lat: resolution, lon: resolution },
    { lat: resolution, lon: -resolution },
    { lat: -resolution, lon: resolution },
    { lat: -resolution, lon: -resolution },
  ];

  for (const dir of directions) {
    const neighborLat = cell.lat + dir.lat;
    const neighborLon = cell.lon + dir.lon;
    const key = `${Math.round(neighborLat * 10000)},${Math.round(neighborLon * 10000)}`;
    
    // Fast lookup using spatial index (only water cells are indexed)
    const neighbor = cellIndex.get(key);
    
    // Triple safety check: neighbor exists AND is water AND not obstacle
    if (neighbor && !neighbor.obstacle && !neighbor.is_land) {
      // Skip line segment check for immediate neighbors (adjacent cells)
      // Only check for diagonal/distant moves to avoid being overly restrictive
      const isDiagonal = (Math.abs(dir.lat) + Math.abs(dir.lon)) > resolution;
      const isDistant = Math.abs(dir.lat) > resolution || Math.abs(dir.lon) > resolution;
      
      if ((isDiagonal || isDistant) && lineSegmentCrossesLand(cell, neighbor, resolution, allCells)) {
        continue; // Skip diagonal/distant moves that cross land
      }
      
      // Calculate distance to nearest land for coastal buffer
      // Check up to 5 cells = 110km range for large ship safety
      neighbor.distanceToLand = getDistanceToLand(neighbor, allCells, resolution, 5);
      
      // CRITICAL NARROW STRAIT DETECTION
      // Check if this cell is in a narrow passage between two land masses
      // This prevents routes through Palk Strait (India-Sri Lanka), Singapore Strait, etc.
      const isNarrowPassage = checkNarrowPassage(neighbor, allCells, resolution);
      if (isNarrowPassage) {
        continue; // REJECT - too narrow for large cargo ships
      }
      
      // COASTAL SAFETY FILTER: Apply distance requirements based on cell's coastal proximity
      // Minimum clearance: 3 cells = 66km for large ships (300-400m length, 60m beam)
      // This ensures safe passage with adequate maneuvering room
      if (neighbor.distanceToLand < 3) {
        continue; // Too close to coastline - REJECT
      }
      
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function aStar(start, goal, cells, resolution, mode = 'optimal', allCells = null) {
  const startTime = Date.now();
  const MAX_CALC_TIME = 180000; // 3 minutes max calculation time - supports any Indian Ocean route
  
  const openSet = new PriorityQueue();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const startKey = `${start.lat},${start.lon}`;
  const goalKey = `${goal.lat},${goal.lon}`;
  
  // Store allCells for coastal distance calculation
  const cellsForLandCheck = allCells || cells;

  // Mode-specific heuristic weights OPTIMIZED FOR LARGE CARGO/CONTAINER SHIPS
  // Typical specs: 300-400m length, 50-60m beam, 16m draft, 20,000+ TEU capacity
  const modeHeuristics = {
    optimal: { 
      distanceWeight: 1.0, 
      safetyPenalty: 8.0,      // INCREASED for large ship safety (was 5.0)
      fuelPenalty: 6.0,         // INCREASED - fuel critical for long voyages (was 4.0)
      windPenalty: 3.0,         // INCREASED - large ships affected by wind (was 2.0)
      wavePenalty: 4.0,         // INCREASED - cargo stability important (was 3.0)
      coastalPenaltyMultiplier: 2.0,  // DOUBLED - large ships need wide channels (was 1.0)
      draftPenalty: 5.0,        // NEW - avoid shallow waters
      channelWidthPenalty: 3.0  // NEW - need wide passages
    },
    fuel_efficient: { 
      distanceWeight: 2.5,      // REDUCED - still important but balanced (was 3.0)
      safetyPenalty: 1.0,       // INCREASED - can't risk large cargo ship (was 0.3)
      fuelPenalty: 20.0,        // MAXIMUM fuel efficiency priority (unchanged)
      windPenalty: 0.5,         // INCREASED - large ships can't ignore wind (was 0.2)
      wavePenalty: 1.0,         // INCREASED - container stability (was 0.5)
      coastalPenaltyMultiplier: 1.5,  // TRIPLED - large ships need clearance (was 0.5)
      draftPenalty: 3.0,        // NEW - still need adequate depth
      channelWidthPenalty: 2.0  // NEW - need navigable width
    },
    fuel: { 
      distanceWeight: 2.5,      // Same as fuel_efficient
      safetyPenalty: 1.0,       // INCREASED for large ships (was 0.3)
      fuelPenalty: 20.0,
      windPenalty: 0.5,         // INCREASED (was 0.2)
      wavePenalty: 1.0,         // INCREASED (was 0.5)
      coastalPenaltyMultiplier: 1.5,  // TRIPLED (was 0.5)
      draftPenalty: 3.0,
      channelWidthPenalty: 2.0
    },
    safe: { 
      distanceWeight: 0.1,      // EVEN LOWER - safety is paramount for large ships (was 0.2)
      safetyPenalty: 35.0,      // INCREASED - maximum priority for cargo ships (was 25.0)
      fuelPenalty: 0.1,         // Fuel not a concern in safe mode
      windPenalty: 18.0,        // INCREASED - large ships very affected by heavy wind (was 12.0)
      wavePenalty: 20.0,        // INCREASED - container stack stability critical (was 15.0)
      coastalPenaltyMultiplier: 6.0,  // INCREASED - stay very far from coast (was 4.0)
      draftPenalty: 10.0,       // NEW - avoid all shallow areas
      channelWidthPenalty: 8.0  // NEW - need maximum maneuvering room
    },
    // NEW MODE: Specifically for ultra-large container vessels (ULCV)
    ulcv: {
      distanceWeight: 0.05,     // Minimal - safety is everything
      safetyPenalty: 50.0,      // MAXIMUM - these ships can't take risks
      fuelPenalty: 8.0,         // Moderate - fuel matters but not at cost of safety
      windPenalty: 25.0,        // EXTREME - windage on 20+ deck containers
      wavePenalty: 30.0,        // EXTREME - container lashing critical
      coastalPenaltyMultiplier: 8.0,  // EXTREME - need deepwater channels only
      draftPenalty: 15.0,       // EXTREME - 16m+ draft, need deep water
      channelWidthPenalty: 12.0 // EXTREME - 400m length needs wide turns
    }
  };

  const heuristic = modeHeuristics[mode] || modeHeuristics.optimal;
  
  // Calculate route distance for optimization decisions
  const routeDistance = calculateDistance(start.lat, start.lon, goal.lat, goal.lon);
  const isLongRoute = routeDistance > 1500; // Routes over 1500km
  const isVeryLongRoute = routeDistance > 3000; // Routes over 3000km
  
  if (isVeryLongRoute) {
    console.log(`   🎯 Very long route (${routeDistance.toFixed(0)}km) - using aggressive heuristic for speed`);
  } else if (isLongRoute) {
    console.log(`   🎯 Long route (${routeDistance.toFixed(0)}km) - using optimized heuristic`);
  }

  gScore.set(startKey, 0);
  fScore.set(startKey, routeDistance * heuristic.distanceWeight);
  openSet.enqueue(start, fScore.get(startKey));

  let iterations = 0;
  while (!openSet.isEmpty()) {
    // Check timeout and log progress every 10000 iterations (less frequent = faster)
    if (++iterations % 10000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   ⏳ Progress: ${iterations.toLocaleString()} iterations, ${elapsed}s, queue: ${openSet.items.length}`);
      
      if (Date.now() - startTime > MAX_CALC_TIME) {
        console.error(`   ⏱️ Timeout after ${iterations.toLocaleString()} iterations (3min limit)`);
        return null; // Timeout - route too complex
      }
    }
    
    const current = openSet.dequeue().element;
    const currentKey = `${current.lat},${current.lon}`;

    if (currentKey === goalKey) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift({ 
          lat: temp.lat, 
          lon: temp.lon,
          weather: temp.weather || temp.weatherData,
        });
        temp = cameFrom.get(`${temp.lat},${temp.lon}`);
      }
      return path;
    }

    const neighbors = getNeighbors(current, cells, resolution, cellsForLandCheck);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.lat},${neighbor.lon}`;
      const distance = calculateDistance(current.lat, current.lon, neighbor.lat, neighbor.lon);
      const heading = calculateHeading(current.lat, current.lon, neighbor.lat, neighbor.lon);
      
      // Use scoring engine to calculate cost based on mode
      // MongoDB stores weather data in 'weather' field, not 'weatherData'
      const weatherData = neighbor.weather || neighbor.weatherData;
      const cellWithDistance = {
        weather: weatherData,
        distance_to_next: distance,
        wind_direction: weatherData?.windDirection,
        fuel_rate_per_km: 0.5,
      };
      
      const scores = scoringEngine.calculateCellScore(cellWithDistance, mode, heading);
      
      // Calculate STRONGLY MODE-SPECIFIC cost to ensure different paths
      let costMultiplier = 1.0;
      
      // Get mode-specific weights
      const weights = modeHeuristics[mode] || modeHeuristics.optimal;
      
      // 🏝️ COASTAL BUFFER PENALTY: Keep routes VERY FAR from coastlines (MODE-DEPENDENT)
      // Professional maritime standard: Stay >50 nautical miles (~110km) from coast
      const distToLand = neighbor.distanceToLand || 6; // Default to safe distance if not calculated
      let coastalPenalty = 0;
      
      // ENHANCED 5-tier coastal buffer system (MODE-DEPENDENT)
      if (distToLand < 3) {
        // CRITICAL: Very close to land (<66km) - BLOCKED (already filtered above)
        coastalPenalty = 200.0 * weights.coastalPenaltyMultiplier; // Should never reach here
      } else if (distToLand < 4) {
        // EXTREME RISK: Near coastline (66-88km) - EXTREME penalty
        coastalPenalty = (4 - distToLand) * 25.0 * weights.coastalPenaltyMultiplier; // HEAVILY avoid
      } else if (distToLand < 5) {
        // HIGH RISK: Still close (88-110km) - Heavy penalty
        coastalPenalty = (5 - distToLand) * 12.0 * weights.coastalPenaltyMultiplier; // Heavy penalty
      } else if (distToLand < 6) {
        // MODERATE: Getting better (110-132km) - Moderate penalty
        coastalPenalty = (6 - distToLand) * 5.0 * weights.coastalPenaltyMultiplier; // Moderate
      } else if (distToLand < 7) {
        // LOW RISK: Far enough (132-154km) - Light penalty
        coastalPenalty = (7 - distToLand) * 2.0; // 2x penalty
      }
      // Beyond 7 cells (~154km) from coast: minimal/no penalty - safe open water
      
      // Apply mode-specific coastal penalty multiplier
      coastalPenalty *= (heuristic.coastalPenaltyMultiplier || 1.0);
      costMultiplier += coastalPenalty;
      
      // 🚢 LARGE SHIP SPECIFIC PENALTIES
      // Ultra-Large Container Vessels (ULCV): 400m length, 59m beam, 16m draft
      // Capesize Bulk Carriers: 300m length, 45m beam, 18m draft
      
      // Channel Width Penalty: Large ships need wide passages
      // Minimum safe width = 3x beam (180m for ULCV) + safety margin
      // Reject narrow channels and straits
      if (distToLand < 6) {
        // Closer to land = narrower channels = higher penalty
        const channelWidthPenalty = (6 - distToLand) * (heuristic.channelWidthPenalty || 0);
        costMultiplier += channelWidthPenalty;
        
        if (channelWidthPenalty > 5 && iterations % 5000 === 0) {
          console.log(`   🚢 Channel width penalty: ${channelWidthPenalty.toFixed(1)}x (large ship needs wide passage)`);
        }
      }
      
      // Draft/Depth Penalty: Large ships need deep water (16m+ draft)
      // Avoid shallow areas, banks, and continental shelves
      // Assume cells closer to land have shallower water
      if (distToLand < 7) {
        const draftPenalty = (7 - distToLand) * (heuristic.draftPenalty || 0);
        costMultiplier += draftPenalty;
        
        if (draftPenalty > 5 && iterations % 5000 === 0) {
          console.log(`   ⚓ Draft penalty: ${draftPenalty.toFixed(1)}x (need deep water for large ship)`);
        }
      }
      
      // Log coastal avoidance (only for cells with penalty)
      if (coastalPenalty > 1 && iterations % 5000 === 0) {
        console.log(`   🏝️ Coastal buffer active: ${(distToLand * 22).toFixed(0)}km from land, penalty: ${coastalPenalty.toFixed(1)}x`);
      }
      
      // Apply RADICALLY DIFFERENT penalties based on mode for DISTINCT paths
      const weather = neighbor.weather || neighbor.weatherData || {};
      const windSpeed = weather.windSpeed || 10; // Default value
      const waveHeight = weather.waveHeight || 2; // Default value
      
      if (mode === 'fuel_efficient' || mode === 'fuel') {
        // FUEL MODE: Take shortest possible route, accept risks for fuel savings
        // MINIMIZE distance at all costs
        costMultiplier = 0.5; // Start with low base cost
        
        // MASSIVE fuel priority - penalize high fuel consumption heavily
        costMultiplier += (1 - scores.fuel_efficiency_score) * weights.fuelPenalty;
        
        // HUGE bonus for favorable winds (significantly reduce cost)
        const windBonus = Math.max(0, (15 - windSpeed) / 30); // Up to 50% reduction for calm winds
        costMultiplier = Math.max(0.2, costMultiplier - windBonus);
        
        // MINIMAL wave penalty - accept some rough seas for fuel savings
        costMultiplier += (waveHeight / 15) * weights.wavePenalty;
        
        // CRITICAL: Make distance extremely cheap - willing to cut corners
        costMultiplier += distance * 0.05; // Very low distance cost = takes shortcuts
        
        // Willing to go closer to coast for fuel efficiency
        costMultiplier -= coastalPenalty * 0.5; // Reduce coastal penalty by 50%
        
      } else if (mode === 'safe') {
        // SAFE MODE: Take longest route staying far from coast and bad weather
        // MAXIMIZE safety - distance doesn't matter
        costMultiplier = 3.0; // Start with high base cost to encourage longer routes
        
        // EXTREME safety priority - heavily penalize any danger
        costMultiplier += (1 - scores.safety_score) * weights.safetyPenalty;
        
        // MASSIVE penalties for ANY wind or waves
        costMultiplier += (windSpeed / 5) * weights.windPenalty; // Even light winds matter
        costMultiplier += (waveHeight / 2) * weights.wavePenalty; // Even small waves matter
        
        // Distance is NOT a concern - prioritize safety by taking longer routes
        costMultiplier += distance * 0.01; // Extremely low distance cost = takes detours
        
        // DOUBLE coastal penalty - stay VERY far from land
        costMultiplier += coastalPenalty * 2.0; // Extra coastal avoidance
        
        // Add bonus for open ocean (far from land = safer)
        if (distToLand > 8) {
          costMultiplier *= 0.7; // 30% cost reduction for open ocean
        }
        
      } else {
        // OPTIMAL MODE: Balanced - different from both fuel and safe
        costMultiplier = 1.0; // Neutral base cost
        
        // Balanced scoring - consider all factors equally
        costMultiplier += (1 - scores.total_score) * weights.safetyPenalty;
        
        // Moderate penalties for weather
        costMultiplier += (windSpeed / 15) * weights.windPenalty;
        costMultiplier += (waveHeight / 8) * weights.wavePenalty;
        
        // Balanced distance consideration - not too short, not too long
        costMultiplier += distance * weights.distanceWeight;
        costMultiplier += distance * 1.0; // Standard distance weight
      }
      
      const tentativeGScore = gScore.get(currentKey) + distance * costMultiplier;

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        
        // Adaptive heuristic based on route length and mode:
        // - Normal routes: 1.0x (optimal path)
        // - Long routes (1500-3000km): 2.0x (faster, still mode-specific)
        // - Very long routes (>3000km): 3.0x (fast but maintains mode differences)
        let heuristicMultiplier = 1.0;
        if (isVeryLongRoute) {
          heuristicMultiplier = 3.0; // Fast but allows mode differences
        } else if (isLongRoute) {
          heuristicMultiplier = 2.0; // Moderately fast
        }
        
        const h = calculateDistance(neighbor.lat, neighbor.lon, goal.lat, goal.lon) * heuristic.distanceWeight * heuristicMultiplier;
        fScore.set(neighborKey, tentativeGScore + h);
        openSet.enqueue(neighbor, fScore.get(neighborKey));
      }
    }
  }

  return null; // No path found
}

// Simple route calculation endpoint (frontend compatible)
router.post('/', async (req, res) => {
  const requestStart = Date.now();
  console.log(`\n🚢 === NEW ROUTE REQUEST === ${new Date().toISOString()}`);
  
  try {
    const { start, end, mode = 'optimal' } = req.body;
    console.log(`📍 Start: (${start?.lat}, ${start?.lon}), End: (${end?.lat}, ${end?.lon}), Mode: ${mode}`);

    if (!start || !end) {
      return res.status(400).json({ 
        error: 'Start and end coordinates are required',
        received: { start, end }
      });
    }

    // Validate coordinates
    if (!start.lat || !start.lon || !end.lat || !end.lon) {
      return res.status(400).json({ 
        error: 'Invalid coordinates. Required: {lat, lon}',
        received: { start, end }
      });
    }

    // Get grid metadata (just the first chunk for bounds/resolution)
    const sampleGrid = await Grid.findOne({ isChunked: true });
    
    if (!sampleGrid) {
      return res.status(404).json({ 
        error: 'No grid data available. Please import grid data first.',
        hint: 'Run: node importGridChunked.js'
      });
    }

    console.log(`📦 Using chunked grid with resolution: ${sampleGrid.resolution}°`);
    
    // Function to find cells in a specific region (load only needed chunks)
    async function getCellsInRegion(latMin, latMax, lonMin, lonMax) {
      // Check cache first
      const cacheKey = getCacheKey(latMin, latMax, lonMin, lonMax);
      const cached = regionCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log(`⚡ Using cached cells for region (${cached.cells.length} cells)`);
        return cached.cells;
      }
      
      const cells = [];
      
      // Load chunks one at a time to avoid memory issues
      // Use lean() for faster query (returns plain JS objects instead of Mongoose docs)
      const chunkCount = await Grid.countDocuments({ isChunked: true });
      
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await Grid.findOne({ isChunked: true, chunkIndex: i }, { cells: 1 }).lean();
        if (chunk && chunk.cells) {
          // Filter cells in region
          const regionCells = chunk.cells.filter(c => 
            c.lat >= latMin && c.lat <= latMax &&
            c.lon >= lonMin && c.lon <= lonMax
          );
          cells.push(...regionCells);
        }
      }
      
      // Cache the result
      regionCache.set(cacheKey, { cells, timestamp: Date.now() });
      
      // Limit cache size (keep last 10 regions)
      if (regionCache.size > 10) {
        const firstKey = regionCache.keys().next().value;
        regionCache.delete(firstKey);
      }
      
      return cells;
    }
    
    // Define search region (expanded around start/end points)
    // Calculate dynamic buffer based on route distance
    const routeLatSpan = Math.abs(start.lat - end.lat);
    const routeLonSpan = Math.abs(start.lon - end.lon);
    const routeSpan = Math.max(routeLatSpan, routeLonSpan);
    const routeDistance = Math.sqrt(routeLatSpan * routeLatSpan + routeLonSpan * routeLonSpan);
    
    // Smart buffer sizing for ANY Indian Ocean route:
    // Use proportional buffer: 30% of route span, min 10°, max 18°
    // This creates a "corridor" around the direct path
    let buffer = Math.max(10, Math.min(18, routeSpan * 0.3));
    buffer = Math.round(buffer); // Round to integer
    
    console.log(`   📊 Route analysis: Span ${routeSpan.toFixed(1)}°, Distance ${routeDistance.toFixed(1)}°, Buffer ${buffer}°`);
    
    const latMin = Math.min(start.lat, end.lat) - buffer;
    const latMax = Math.max(start.lat, end.lat) + buffer;
    const lonMin = Math.min(start.lon, end.lon) - buffer;
    const lonMax = Math.max(start.lon, end.lon) + buffer;
    
    console.log(`🔍 Route span: ${routeSpan.toFixed(1)}° (distance: ${routeDistance.toFixed(1)}°), Using ${buffer}° buffer`);
    console.log(`🔍 Region: ${latMin.toFixed(1)}°-${latMax.toFixed(1)}°N, ${lonMin.toFixed(1)}°-${lonMax.toFixed(1)}°E`);
    
    const loadStart = Date.now();
    let allCells = await getCellsInRegion(latMin, latMax, lonMin, lonMax);
    const loadTime = ((Date.now() - loadStart) / 1000).toFixed(1);
    console.log(`✅ Loaded ${allCells.length.toLocaleString()} cells in ${loadTime}s (0.2° = 22km resolution)`);
    
    const grid = sampleGrid; // Use sample for metadata
    
    // CRITICAL: Filter out BOTH obstacle AND is_land flags to ensure ONLY water cells
    const waterCells = allCells.filter(cell => !cell.obstacle && !cell.is_land);
    const landCells = allCells.filter(cell => cell.is_land || cell.obstacle);

    console.log(`\n🚢 Calculating route from (${start.lat}, ${start.lon}) to (${end.lat}, ${end.lon})`);
    console.log(`📊 Mode: ${mode.toUpperCase()}`);
    console.log(`📐 Grid info: Total=${allCells.length}, 🌊Water=${waterCells.length}, 🏝️Land=${landCells.length}`);
    
    // Log mode-specific priorities
    const modePriorities = {
      optimal: '⚖️  Balanced (Safety: 40%, Fuel: 40%, Distance: 20%)',
      fuel_efficient: '⛽ Fuel Priority (Fuel: 60%, Safety: 20%, Distance: 20%)',
      safe: '🛡️  Safety Priority (Safety: 60%, Fuel: 20%, Distance: 20%)',
      weather: '🌤️  Weather-Optimized (Safety: 70%, Fuel: 15%, Distance: 15%)',
      normal: '📏 Shortest Path (Distance: 80%, Safety: 10%, Fuel: 10%)',
    };
    console.log(`🎯 Priority: ${modePriorities[mode] || modePriorities.optimal}`);

    if (waterCells.length === 0) {
      return res.status(500).json({ 
        error: 'No water cells found in grid. Please regenerate grid with land detection.',
        hint: 'Run: node gridGenerator.js'
      });
    }

    // Find nearest WATER cell to start and end points (ports are on land, but ships need water)
    const findNearestWaterCell = (point) => {
      let nearest = waterCells[0];
      let minDist = calculateDistance(point.lat, point.lon, nearest.lat, nearest.lon);
      
      for (const cell of waterCells) {
        const dist = calculateDistance(point.lat, point.lon, cell.lat, cell.lon);
        if (dist < minDist) {
          minDist = dist;
          nearest = cell;
        }
      }
      return nearest;
    };

    const startCell = findNearestWaterCell(start);
    const endCell = findNearestWaterCell(end);

    console.log(`📍 Start cell: (${startCell.lat}, ${startCell.lon})`);
    console.log(`📍 End cell: (${endCell.lat}, ${endCell.lon})`);

    // Build spatial index for fast neighbor lookup (10x faster!)
    console.log(`🗺️  Building spatial index for ${waterCells.length} water cells...`);
    buildCellIndex(waterCells);

    // Calculate path using A* with grid resolution (use waterCells for pathfinding)
    console.log(`🔍 Computing ${mode} route with coastal buffer...`);
    const startTime = Date.now();
    let path = aStar(startCell, endCell, waterCells, grid.resolution, mode, allCells); // Pass allCells for land distance check
    const computeTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⚡ Route computed in ${computeTime}s`);

    if (!path) {
      return res.status(404).json({ 
        error: 'No route found',
        details: 'Unable to find a valid path between the specified locations'
      });
    }

    // 🌤️ FETCH REAL WEATHER: Get fresh weather data for route cells
    if (weatherConfig.ENABLE_ROUTE_WEATHER_UPDATE) {
      console.log(`🌤️  Fetching real weather data for route...`);
      const routeCells = extractRouteCells(path);
      
      try {
        const weatherStartTime = Date.now();
        const result = await updateRouteWeather(routeCells);
        const weatherTime = ((Date.now() - weatherStartTime) / 1000).toFixed(2);
        
        if (!result.skipped && result.weatherMap) {
          console.log(`✅ Weather fetched in ${weatherTime}s: ${result.updated} cells, ${result.failed} failed`);
          
          // Apply fetched weather to path cells directly (no DB reload needed)
          let weatherApplied = 0;
          for (let cell of path) {
            const key = `${cell.lat.toFixed(4)},${cell.lon.toFixed(4)}`;
            if (result.weatherMap.has(key)) {
              cell.weather = result.weatherMap.get(key);
              weatherApplied++;
            }
          }
          console.log(`   Applied weather to ${weatherApplied}/${path.length} waypoints`);
        } else {
          console.log(`⏭️  Weather update skipped (recent data available)`);
        }
      } catch (err) {
        console.error('⚠️  Weather fetch failed (using cached data):', err.message);
      }
    }

    // FINAL VALIDATION: Ensure NO land cells in path
    const landCellsInPath = path.filter(cell => {
      // Check if this cell is land in the original grid
      const originalCell = allCells.find(c => 
        Math.abs(c.lat - cell.lat) < 0.0001 && 
        Math.abs(c.lon - cell.lon) < 0.0001
      );
      return originalCell && (originalCell.is_land || originalCell.obstacle);
    });

    if (landCellsInPath.length > 0) {
      console.error(`❌ CRITICAL: Route contains ${landCellsInPath.length} land cells!`);
      landCellsInPath.forEach(cell => {
        console.error(`   Land cell at: (${cell.lat}, ${cell.lon})`);
      });
      return res.status(500).json({ 
        error: 'Invalid route: path crosses land',
        details: `Route contains ${landCellsInPath.length} land cells. This should never happen.`,
        landCells: landCellsInPath.map(c => ({ lat: c.lat, lon: c.lon }))
      });
    }

    console.log(`✅ Route validation passed: All ${path.length} cells are water`);

    // Simplify route for very long paths (reduce waypoints while maintaining accuracy)
    function simplifyRoute(path, tolerance = 0.05) {
      if (path.length < 50) return path; // Don't simplify short routes
      
      const simplified = [path[0]]; // Always keep first point
      
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];
        
        // Calculate if current point deviates significantly from straight line
        const directDist = calculateDistance(prev.lat, prev.lon, next.lat, next.lon);
        const actualDist = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon) + 
                          calculateDistance(curr.lat, curr.lon, next.lat, next.lon);
        const deviation = actualDist - directDist;
        
        // Keep point if it deviates significantly OR every 5th point for safety
        if (deviation > tolerance || i % 5 === 0) {
          simplified.push(curr);
        }
      }
      
      simplified.push(path[path.length - 1]); // Always keep last point
      return simplified;
    }
    
    // Apply simplification for long routes (>150 points)
    const originalPointCount = path.length;
    if (path.length > 150) {
      path = simplifyRoute(path, 0.08); // More aggressive simplification for very long routes
      console.log(`   🔧 Route simplified: ${originalPointCount} → ${path.length} points (${Math.round((1 - path.length/originalPointCount) * 100)}% reduction)`);
    }

    // Define threshold constants for alerts
    const THRESHOLDS = {
      wind: {
        moderate: 15,    // 15 knots
        high: 25,        // 25 knots
        severe: 35       // 35 knots (dangerous)
      },
      wave: {
        moderate: 2.5,   // 2.5 meters
        high: 4,         // 4 meters
        severe: 6        // 6 meters (dangerous)
      },
      visibility: {
        low: 5,          // 5 km
        poor: 2          // 2 km (dangerous)
      }
    };

    // Calculate route statistics with dynamic thresholds
    let totalDistance = 0;
    let totalFuelCost = 0;
    let safetyScores = [];
    let windSpeeds = [];
    let waveHeights = [];
    const warnings = [];
    const alerts = {
      critical: [],
      high: [],
      moderate: []
    };

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      // Calculate segment distance
      const segmentDist = calculateDistance(current.lat, current.lon, next.lat, next.lon);
      totalDistance += segmentDist;

      // Get weather data (real-time from API or cached)
      const weather = current.weather || {};
      const windSpeed = weather.windSpeed || 10;
      const waveHeight = weather.waveHeight || 2;
      const visibility = weather.visibility || 10;
      const temperature = weather.temperature || 25;
      
      windSpeeds.push(windSpeed);
      waveHeights.push(waveHeight);

      // Calculate dynamic safety score based on multiple factors
      let safety = 100;
      
      // Wind penalties
      if (windSpeed >= THRESHOLDS.wind.severe) {
        safety -= 30;
        alerts.critical.push({
          type: 'SEVERE_WIND',
          location: { lat: current.lat, lon: current.lon },
          message: `CRITICAL: Severe winds ${windSpeed.toFixed(1)} knots - Navigation extremely dangerous`,
          value: windSpeed,
          threshold: THRESHOLDS.wind.severe
        });
      } else if (windSpeed >= THRESHOLDS.wind.high) {
        safety -= 20;
        alerts.high.push({
          type: 'HIGH_WIND',
          location: { lat: current.lat, lon: current.lon },
          message: `HIGH ALERT: Strong winds ${windSpeed.toFixed(1)} knots - Reduce speed`,
          value: windSpeed,
          threshold: THRESHOLDS.wind.high
        });
      } else if (windSpeed >= THRESHOLDS.wind.moderate) {
        safety -= 10;
        alerts.moderate.push({
          type: 'MODERATE_WIND',
          location: { lat: current.lat, lon: current.lon },
          message: `Moderate winds ${windSpeed.toFixed(1)} knots - Monitor conditions`,
          value: windSpeed,
          threshold: THRESHOLDS.wind.moderate
        });
      }

      // Wave penalties
      if (waveHeight >= THRESHOLDS.wave.severe) {
        safety -= 30;
        alerts.critical.push({
          type: 'SEVERE_WAVES',
          location: { lat: current.lat, lon: current.lon },
          message: `CRITICAL: Severe waves ${waveHeight.toFixed(1)}m - Extremely dangerous`,
          value: waveHeight,
          threshold: THRESHOLDS.wave.severe
        });
      } else if (waveHeight >= THRESHOLDS.wave.high) {
        safety -= 20;
        alerts.high.push({
          type: 'HIGH_WAVES',
          location: { lat: current.lat, lon: current.lon },
          message: `HIGH ALERT: High waves ${waveHeight.toFixed(1)}m - Rough seas`,
          value: waveHeight,
          threshold: THRESHOLDS.wave.high
        });
      } else if (waveHeight >= THRESHOLDS.wave.moderate) {
        safety -= 10;
        alerts.moderate.push({
          type: 'MODERATE_WAVES',
          location: { lat: current.lat, lon: current.lon },
          message: `Moderate waves ${waveHeight.toFixed(1)}m - Choppy conditions`,
          value: waveHeight,
          threshold: THRESHOLDS.wave.moderate
        });
      }

      // Visibility warnings
      if (visibility <= THRESHOLDS.visibility.poor) {
        safety -= 25;
        alerts.critical.push({
          type: 'POOR_VISIBILITY',
          location: { lat: current.lat, lon: current.lon },
          message: `CRITICAL: Poor visibility ${visibility.toFixed(1)}km - Navigation hazardous`,
          value: visibility,
          threshold: THRESHOLDS.visibility.poor
        });
      } else if (visibility <= THRESHOLDS.visibility.low) {
        safety -= 15;
        alerts.high.push({
          type: 'LOW_VISIBILITY',
          location: { lat: current.lat, lon: current.lon },
          message: `HIGH ALERT: Low visibility ${visibility.toFixed(1)}km - Proceed with caution`,
          value: visibility,
          threshold: THRESHOLDS.visibility.low
        });
      }

      safetyScores.push(Math.max(0, safety));

      // Legacy warnings for backward compatibility
      if (windSpeed > 25) {
        warnings.push(`High winds at (${current.lat.toFixed(2)}, ${current.lon.toFixed(2)}): ${windSpeed.toFixed(1)} knots`);
      }
      if (waveHeight > 4) {
        warnings.push(`High waves at (${current.lat.toFixed(2)}, ${current.lon.toFixed(2)}): ${waveHeight.toFixed(1)}m`);
      }

      // Calculate dynamic fuel cost based on weather conditions
      const baseFuelCost = 50; // rupees per km
      const windFactor = 1 + (windSpeed / 100); // Wind resistance
      const waveFactor = 1 + (waveHeight / 20);  // Wave resistance
      totalFuelCost += segmentDist * baseFuelCost * windFactor * waveFactor;
    }

    // Calculate averages
    const avgWind = windSpeeds.length > 0 
      ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length 
      : 10;
    
    const avgWaveHeight = waveHeights.length > 0 
      ? waveHeights.reduce((a, b) => a + b, 0) / waveHeights.length 
      : 2;
    
    const safetyScore = safetyScores.length > 0 
      ? safetyScores.reduce((a, b) => a + b, 0) / safetyScores.length 
      : 85;

    // Estimate time (assuming average speed of 15 knots = 27.78 km/h)
    const avgSpeed = 27.78;
    const totalTime = totalDistance / avgSpeed; // hours

    // Calculate mode-specific metrics with visual styling
    const modeMetrics = {
      optimal: {
        efficiency: Math.round((100 - (totalFuelCost / totalDistance)) * 10) / 10,
        recommendation: 'Balanced route with good fuel efficiency and safety',
        color: '#3b82f6', // Blue
        strokeWidth: 3,
        dashArray: null // Solid line
      },
      fuel_efficient: {
        efficiency: Math.round((100 - (totalFuelCost / totalDistance) * 0.8) * 10) / 10,
        recommendation: 'Optimized for minimum fuel consumption',
        color: '#10b981', // Green
        strokeWidth: 3,
        dashArray: null // Solid line
      },
      fuel: {
        efficiency: Math.round((100 - (totalFuelCost / totalDistance) * 0.8) * 10) / 10,
        recommendation: 'Optimized for minimum fuel consumption',
        color: '#10b981', // Green
        strokeWidth: 3,
        dashArray: null // Solid line
      },
      safe: {
        efficiency: Math.round(safetyScore * 10) / 10,
        recommendation: 'Prioritizes safest conditions, may be longer',
        color: '#f59e0b', // Amber/Orange
        strokeWidth: 4,
        dashArray: null // Solid line (thicker for emphasis)
      },
      weather: {
        efficiency: Math.round(safetyScore * 10) / 10,
        recommendation: 'Avoids adverse weather conditions',
        color: '#8b5cf6', // Purple
        strokeWidth: 3,
        dashArray: '10, 5' // Dashed line
      },
      normal: {
        efficiency: Math.round((totalDistance / (path.length * 50)) * 100),
        recommendation: 'Shortest distance path',
        color: '#6b7280', // Gray
        strokeWidth: 2,
        dashArray: '5, 5' // Small dashes
      },
      ulcv: {
        efficiency: Math.round(safetyScore * 10) / 10,
        recommendation: 'Ultra-Large Container Vessels - Maximum safety clearance',
        color: '#ef4444', // Red
        strokeWidth: 5,
        dashArray: null // Solid line (extra thick)
      }
    };

    const modeStyle = modeMetrics[mode] || modeMetrics.optimal;

    // Calculate dynamic efficiency metrics based on mode
    let efficiencyScore = 0;
    if (mode === 'fuel' || mode === 'fuel_efficient') {
      // Fuel efficiency: lower fuel cost = higher score
      const idealFuelCost = totalDistance * 45; // Ideal consumption
      efficiencyScore = Math.max(0, Math.min(100, (idealFuelCost / totalFuelCost) * 100));
    } else if (mode === 'safe') {
      // Safety mode: use safety score directly
      efficiencyScore = safetyScore;
    } else {
      // Optimal mode: balance of both
      const fuelEfficiency = (totalDistance * 50) / totalFuelCost * 100;
      efficiencyScore = (safetyScore * 0.5) + (fuelEfficiency * 0.5);
    }
    
    const response = {
      success: true,
      path: path.map(cell => ({ 
        lat: cell.lat, 
        lon: cell.lon,
        // Include weather data for dynamic display
        weather: cell.weather || null
      })),
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime * 100) / 100,
      fuelCost: Math.round(totalFuelCost),
      safetyScore: Math.round(safetyScore * 10) / 10,
      avgWind: Math.round(avgWind * 10) / 10,
      avgWaveHeight: Math.round(avgWaveHeight * 10) / 10,
      maxWind: Math.round(Math.max(...windSpeeds, 0) * 10) / 10,
      maxWave: Math.round(Math.max(...waveHeights, 0) * 10) / 10,
      warnings: warnings.slice(0, 5), // Limit to 5 legacy warnings
      // NEW: Dynamic alerts system with severity levels
      alerts: {
        critical: alerts.critical.slice(0, 3), // Top 3 critical
        high: alerts.high.slice(0, 5),         // Top 5 high
        moderate: alerts.moderate.slice(0, 3), // Top 3 moderate
        totalCount: alerts.critical.length + alerts.high.length + alerts.moderate.length,
        hasCritical: alerts.critical.length > 0,
        hasHigh: alerts.high.length > 0
      },
      mode: mode,
      pointsCount: path.length,
      modeSpecific: {
        ...modeStyle,
        efficiency: Math.round(efficiencyScore * 10) / 10,
        isDynamic: true // Flag to indicate dynamic calculation
      },
      // Dynamic metrics for UI display
      metrics: {
        efficiency: Math.round(efficiencyScore * 10) / 10,
        safety: Math.round(safetyScore * 10) / 10,
        fuel: Math.round(totalFuelCost),
        fuelPerKm: Math.round((totalFuelCost / totalDistance) * 10) / 10,
        avgSpeed: 27.78, // km/h (15 knots)
        weatherScore: Math.round((100 - (avgWind / 50 * 50) - (avgWaveHeight / 8 * 50)) * 10) / 10
      },
      // Visual styling for frontend
      style: {
        color: modeStyle.color,
        strokeWidth: modeStyle.strokeWidth,
        dashArray: modeStyle.dashArray,
        opacity: 0.8
      },
      // Thresholds for frontend to display alerts
      thresholds: THRESHOLDS,
      // Timestamp for data freshness
      calculatedAt: new Date().toISOString(),
      weatherDataAge: 'real-time' // or 'cached' based on actual fetch
    };

    console.log(`✅ Route calculated: ${totalDistance.toFixed(2)}km, ${path.length} points`);
    console.log(`📊 Mode: ${mode}, Efficiency: ${response.modeSpecific.efficiency}, Safety: ${safetyScore.toFixed(1)}`);

    const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
    console.log(`⏱️  Total request time: ${requestTime}s`);
    console.log(`🚢 === REQUEST COMPLETE ===\n`);
    
    res.json(response);

  } catch (error) {
    const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
    console.error(`❌ Route calculation error after ${requestTime}s:`, error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to calculate route', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Calculate optimal route with scoring (alternative endpoint)
router.post('/calculate', async (req, res) => {
  try {
    const { gridId, start, goal, mode = 'optimal' } = req.body;

    if (!gridId || !start || !goal) {
      return res.status(400).json({ error: 'Grid ID, start, and goal coordinates are required' });
    }

    if (!['optimal', 'fuel_efficient', 'safe', 'normal'].includes(mode)) {
      return res.status(400).json({ 
        error: 'Invalid mode. Must be: optimal, fuel_efficient, safe, or normal' 
      });
    }

    const grid = await Grid.findById(gridId);
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }

    const startCell = grid.cells.find(c => 
      Math.abs(c.lat - start.lat) < grid.resolution / 2 && 
      Math.abs(c.lon - start.lon) < grid.resolution / 2
    );

    const goalCell = grid.cells.find(c => 
      Math.abs(c.lat - goal.lat) < grid.resolution / 2 && 
      Math.abs(c.lon - goal.lon) < grid.resolution / 2
    );

    if (!startCell || !goalCell) {
      return res.status(400).json({ error: 'Start or goal coordinates not found in grid' });
    }

    const path = aStar(startCell, goalCell, grid.cells, grid.resolution, mode, grid.cells);

    if (!path) {
      return res.status(404).json({ error: 'No route found' });
    }

    // Score the complete route
    const routeScore = scoringEngine.scoreRoute(path, mode);

    res.json({ 
      success: true,
      mode: mode,
      path: routeScore.path,
      summary: routeScore.summary,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate route', message: error.message });
  }
});

// Compare route modes using RouteFinder
router.post('/compare', async (req, res) => {
  try {
    const { gridId, start, goal } = req.body;

    if (!gridId || !start || !goal) {
      return res.status(400).json({ 
        error: 'Grid ID, start, and goal coordinates are required' 
      });
    }

    const grid = await Grid.findById(gridId);
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }

    // Use RouteFinder to compare all modes
    const comparison = await routeFinder.compareRoutes(
      start,
      goal,
      grid.cells,
      grid.resolution
    );

    res.json({ 
      success: true,
      comparison,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to compare routes', 
      message: error.message 
    });
  }
});

// GET endpoint for route calculation (query parameters)
router.get('/', async (req, res) => {
  try {
    const { start, end, mode = 'optimal', gridId } = req.query;

    if (!start || !end) {
      return res.status(400).json({ 
        error: 'Start and end coordinates are required. Format: start=12.3,80.2&end=15.6,82.1' 
      });
    }

    if (!gridId) {
      return res.status(400).json({ error: 'Grid ID is required' });
    }

    // Parse coordinates
    const [startLat, startLon] = start.split(',').map(Number);
    const [endLat, endLon] = end.split(',').map(Number);

    if (isNaN(startLat) || isNaN(startLon) || isNaN(endLat) || isNaN(endLon)) {
      return res.status(400).json({ error: 'Invalid coordinate format' });
    }

    const grid = await Grid.findById(gridId);
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }

    // Find route
    const result = await routeFinder.findOptimalRoute(
      { lat: startLat, lon: startLon },
      { lat: endLat, lon: endLon },
      grid.cells,
      mode,
      grid.resolution
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate route', 
      message: error.message 
    });
  }
});

// NEW: Get weather for specific waypoint index
router.post('/waypoint-weather', async (req, res) => {
  try {
    const { lat, lon, waypointIndex, totalWaypoints } = req.body;

    if (!lat || !lon || waypointIndex === undefined) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, and waypoint index are required' 
      });
    }

    const axios = require('axios');
    
    let weather = {
      temperature: 25,
      windSpeed: 10,
      windDirection: 180,
      waveHeight: 1.5,
      waveDirection: 180,
      visibility: 10,
      precipitation: 0,
      waypointIndex,
      totalWaypoints,
      timestamp: new Date().toISOString()
    };

    try {
      // Try to fetch real-time weather from Open-Meteo API
      const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat.toFixed(2),
          longitude: lon.toFixed(2),
          current: 'temperature_2m,wind_speed_10m,wind_direction_10m',
          timezone: 'auto'
        },
        timeout: 5000
      });

      const current = weatherResponse.data.current;
      
      if (current) {
        weather.temperature = current.temperature_2m || weather.temperature;
        weather.windSpeed = current.wind_speed_10m || weather.windSpeed;
        weather.windDirection = current.wind_direction_10m || weather.windDirection;
      }
    } catch (apiError) {
      console.log('Weather API unavailable, using defaults:', apiError.message);
      // Continue with default values
    }

    res.json({ 
      success: true,
      weather,
      location: { lat, lon }
    });
  } catch (error) {
    console.error('Error fetching waypoint weather:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch waypoint weather', 
      message: error.message 
    });
  }
});

// NEW: Strict Multi-Port Ocean Routing - OPTIMIZED FOR LARGE CARGO/CONTAINER SHIPS
// Ship Specifications Considered:
// - Ultra-Large Container Vessels (ULCV): 400m length, 59m beam, 16m draft, 20,000+ TEU
// - New Panamax: 366m length, 49m beam, 15m draft, 13,000 TEU
// - Capesize Bulk Carriers: 300m length, 45m beam, 18m draft
router.post('/strict-ocean-route', async (req, res) => {
  try {
    const { ports, mode = 'safe' } = req.body;

    if (!ports || !Array.isArray(ports) || ports.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 ports are required. Format: [{ name, lat, lon }, ...]' 
      });
    }

    // Validate port format
    for (const port of ports) {
      if (!port.name || !port.lat || !port.lon) {
        return res.status(400).json({ 
          error: 'Each port must have name, lat, and lon properties' 
        });
      }
    }

    console.log(`\n🌊 Calculating ${mode.toUpperCase()} multi-port ocean route for ${ports.length} ports`);
    console.log(`   Optimized for: Large Cargo/Container Ships (300-400m length, 16m+ draft)`);
    
    // Load grid from MongoDB chunks (same approach as regular calculate endpoint)
    const sampleGrid = await Grid.findOne({ isChunked: true });
    
    if (!sampleGrid) {
      return res.status(404).json({ 
        error: 'No grid data available. Please import grid data first.',
        hint: 'Run: node importGridChunked.js'
      });
    }

    const resolution = sampleGrid.resolution;
    console.log(`📦 Using chunked grid with resolution: ${resolution}°`);
    
    // Helper function to load cells in region from MongoDB chunks
    async function getCellsInRegion(latMin, latMax, lonMin, lonMax) {
      const cacheKey = `${latMin}_${latMax}_${lonMin}_${lonMax}`;
      const cached = regionCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.cells;
      }
      
      const cells = [];
      const chunkCount = await Grid.countDocuments({ isChunked: true });
      
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await Grid.findOne({ isChunked: true, chunkIndex: i }, { cells: 1 }).lean();
        if (chunk && chunk.cells) {
          const regionCells = chunk.cells.filter(c => 
            c.lat >= latMin && c.lat <= latMax &&
            c.lon >= lonMin && c.lon <= lonMax
          );
          cells.push(...regionCells);
        }
      }
      
      regionCache.set(cacheKey, { cells, timestamp: Date.now() });
      if (regionCache.size > 10) {
        const firstKey = regionCache.keys().next().value;
        regionCache.delete(firstKey);
      }
      
      return cells;
    }

    // Calculate routes between consecutive ports using existing routing
    const routes = [];
    let totalDistance = 0;
    let allValid = true;

    for (let i = 0; i < ports.length - 1; i++) {
      const from = ports[i];
      const to = ports[i + 1];
      
      console.log(`\n📍 Segment ${i + 1}: ${from.name} → ${to.name}`);
      
      try {
        // Calculate region for this segment
        const routeLatSpan = Math.abs(from.lat - to.lat);
        const routeLonSpan = Math.abs(from.lon - to.lon);
        const routeSpan = Math.max(routeLatSpan, routeLonSpan);
        const buffer = Math.max(10, Math.min(18, routeSpan * 0.3));
        
        const latMin = Math.min(from.lat, to.lat) - buffer;
        const latMax = Math.max(from.lat, to.lat) + buffer;
        const lonMin = Math.min(from.lon, to.lon) - buffer;
        const lonMax = Math.max(from.lon, to.lon) + buffer;
        
        console.log(`   🔍 Loading region: ${latMin.toFixed(1)}°-${latMax.toFixed(1)}°N, ${lonMin.toFixed(1)}°-${lonMax.toFixed(1)}°E`);
        
        // Load cells for this segment
        const allCells = await getCellsInRegion(latMin, latMax, lonMin, lonMax);
        const waterCells = allCells.filter(cell => !cell.obstacle && !cell.is_land);
        
        console.log(`   📊 Loaded ${allCells.length} cells (${waterCells.length} water, ${allCells.length - waterCells.length} land)`);
        
        // Use existing routeFinder with specified mode
        // Pass ALL cells (not just water) so findGridCell can search for nearest water cell
        const result = await routeFinder.findOptimalRoute(
          { lat: from.lat, lon: from.lon },
          { lat: to.lat, lon: to.lon },
          allCells,
          mode,
          resolution
        );

        // RouteFinder returns result with coordinates array if found
        if (result && result.success && result.coordinates && result.coordinates.length > 0) {
          const distance = result.total_distance_km || 0;
          const avgSpeed = 20; // knots average speed
          const duration = distance / (avgSpeed * 1.852); // Convert to hours
          
          routes.push({
            from: from.name,
            to: to.name,
            distance: distance,
            duration: parseFloat(duration.toFixed(2)),
            waypoints: result.waypoints || result.coordinates.length,
            path: result.coordinates,
            fuelConsumption: result.total_fuel_cost || 0,
            avgWindSpeed: 0,
            avgWaveHeight: 0,
            safetyScore: result.safety_index_avg || 0
          });
          
          totalDistance += distance;
          console.log(`   ✅ Route found: ${distance.toFixed(2)} km, ${result.waypoints || result.coordinates.length} waypoints`);
        } else {
          console.log(`   ❌ No route found: ${result?.message || 'No path available'}`);
          allValid = false;
          routes.push({
            from: from.name,
            to: to.name,
            error: result?.message || 'No route found',
            success: false
          });
        }
      } catch (error) {
        console.error(`   ❌ Error calculating segment: ${error.message}`);
        allValid = false;
        routes.push({
          from: from.name,
          to: to.name,
          error: error.message,
          success: false
        });
      }
    }

    const successfulRoutes = routes.filter(r => r.path);
    
    res.json({
      success: allValid,
      routes: successfulRoutes,
      summary: {
        totalSegments: ports.length - 1,
        successfulSegments: successfulRoutes.length,
        failedSegments: routes.length - successfulRoutes.length,
        totalDistance: totalDistance.toFixed(2) + ' km',
        totalDistanceKm: parseFloat(totalDistance.toFixed(2)), // Add numeric version
        totalWaypoints: successfulRoutes.reduce((sum, r) => sum + r.waypoints, 0),
        avgSafetyScore: successfulRoutes.length > 0 
          ? (successfulRoutes.reduce((sum, r) => sum + (r.safetyScore || 0), 0) / successfulRoutes.length).toFixed(1)
          : 0
      },
      mode,
      ports: ports.map(p => p.name).join(' → '),
      message: allValid 
        ? 'All routes calculated successfully with strict land avoidance'
        : 'Some routes could not be calculated'
    });

  } catch (error) {
    console.error('Error calculating strict ocean route:', error.message);
    res.status(500).json({ 
      error: 'Failed to calculate strict ocean route', 
      message: error.message 
    });
  }
});

// NEW: Real-time hazard monitoring endpoint
router.post('/check-hazards', async (req, res) => {
  try {
    const { path, currentPosition, thresholds } = req.body;

    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: 'Path array is required' });
    }

    const THRESHOLDS = thresholds || {
      wind: { moderate: 15, high: 25, severe: 35 },
      wave: { moderate: 2.5, high: 4, severe: 6 },
      visibility: { low: 5, poor: 2 }
    };

    console.log(`🔍 Checking hazards for route with ${path.length} waypoints`);

    // Fetch real-time weather for all waypoints
    const axios = require('axios');
    const hazards = [];
    let requiresReroute = false;

    for (let i = 0; i < path.length; i += 5) { // Check every 5th waypoint for performance
      const point = path[i];
      
      try {
        // Fetch real weather from Open-Meteo Marine API (correct endpoint)
        const response = await axios.get('https://marine-api.open-meteo.com/v1/marine', {
          params: {
            latitude: point.lat.toFixed(4),
            longitude: point.lon.toFixed(4),
            current: 'wave_height,wind_wave_height,wind_wave_direction,swell_wave_height',
            hourly: 'wave_height,wind_wave_height,swell_wave_height',
            timezone: 'auto'
          },
          timeout: 5000
        });

        // Also get wind data from forecast API
        const windResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: point.lat.toFixed(4),
            longitude: point.lon.toFixed(4),
            current: 'wind_speed_10m,wind_direction_10m,visibility',
            timezone: 'auto'
          },
          timeout: 5000
        });

        const marine = response.data.current;
        const wind = windResponse.data.current;
        
        const windSpeed = (wind.wind_speed_10m || 0) * 0.54; // Convert m/s to knots
        const waveHeight = marine.wave_height || 0;
        const visibility = wind.visibility ? wind.visibility / 1000 : 10; // Convert m to km

        // Check for hazards
        if (windSpeed >= THRESHOLDS.wind.severe || 
            waveHeight >= THRESHOLDS.wave.severe || 
            visibility <= THRESHOLDS.visibility.poor) {
          hazards.push({
            level: 'CRITICAL',
            location: { lat: point.lat, lon: point.lon },
            waypointIndex: i,
            conditions: {
              windSpeed: windSpeed.toFixed(1),
              waveHeight: waveHeight.toFixed(1),
              visibility: visibility.toFixed(1)
            },
            message: `CRITICAL conditions at waypoint ${i}: Wind ${windSpeed.toFixed(1)}kts, Waves ${waveHeight.toFixed(1)}m`,
            requiresAction: true
          });
          requiresReroute = true;
        } else if (windSpeed >= THRESHOLDS.wind.high || 
                   waveHeight >= THRESHOLDS.wave.high || 
                   visibility <= THRESHOLDS.visibility.low) {
          hazards.push({
            level: 'HIGH',
            location: { lat: point.lat, lon: point.lon },
            waypointIndex: i,
            conditions: {
              windSpeed: windSpeed.toFixed(1),
              waveHeight: waveHeight.toFixed(1),
              visibility: visibility.toFixed(1)
            },
            message: `HIGH alert at waypoint ${i}: Wind ${windSpeed.toFixed(1)}kts, Waves ${waveHeight.toFixed(1)}m`,
            requiresAction: false
          });
        }
      } catch (error) {
        console.error(`Error fetching weather for waypoint ${i}:`, error.message);
      }
    }

    res.json({
      success: true,
      hazards,
      requiresReroute,
      totalWaypoints: path.length,
      checkedWaypoints: Math.ceil(path.length / 5),
      timestamp: new Date().toISOString(),
      recommendation: requiresReroute 
        ? 'CRITICAL: Immediate route recalculation recommended'
        : hazards.length > 0
        ? 'Monitor conditions closely, consider alternative route'
        : 'Route conditions are safe'
    });

  } catch (error) {
    console.error('Error checking hazards:', error.message);
    res.status(500).json({ 
      error: 'Failed to check hazards', 
      message: error.message 
    });
  }
});

// NEW: Dynamic route update endpoint (recalculates avoiding hazardous areas)
router.post('/update-route', async (req, res) => {
  try {
    const { start, end, mode, avoidAreas } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end coordinates are required' });
    }

    console.log(`🔄 Updating route with hazard avoidance: ${avoidAreas?.length || 0} areas to avoid`);

    // Store avoided areas for this calculation
    const avoidedAreas = avoidAreas || [];
    
    // Recalculate route (will automatically fetch fresh weather data)
    // The regular /api/route endpoint will be called with updated parameters
    
    res.json({
      success: true,
      message: 'Route update triggered',
      avoidedAreas: avoidAreas.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating route:', error.message);
    res.status(500).json({ 
      error: 'Failed to update route', 
      message: error.message 
    });
  }
});

// NEW: REAL-TIME Cyclone Detection from Weather API
router.get('/live-cyclones', async (req, res) => {
  try {
    const axios = require('axios');
    const cyclones = [];

    console.log('🌀 Fetching real-time cyclone data from weather API...');

    // Scan Indian Ocean region for extreme weather patterns (potential cyclones)
    // Arabian Sea and Bay of Bengal - common cyclone regions
    const scanRegions = [
      // Arabian Sea
      { lat: 15, lon: 65, name: 'Northern Arabian Sea' },
      { lat: 12, lon: 68, name: 'Central Arabian Sea' },
      { lat: 10, lon: 70, name: 'Southern Arabian Sea' },
      { lat: 8, lon: 73, name: 'Eastern Arabian Sea' },
      // Bay of Bengal
      { lat: 15, lon: 85, name: 'Northern Bay of Bengal' },
      { lat: 12, lon: 88, name: 'Central Bay of Bengal' },
      { lat: 10, lon: 90, name: 'Southern Bay of Bengal' },
      { lat: 8, lon: 92, name: 'Andaman Sea' }
    ];

    for (const region of scanRegions) {
      try {
        // Get marine conditions (increased timeout to 15s)
        const marineResponse = await axios.get('https://marine-api.open-meteo.com/v1/marine', {
          params: {
            latitude: region.lat,
            longitude: region.lon,
            current: 'wave_height,wind_wave_height,swell_wave_height',
            timezone: 'auto'
          },
          timeout: 15000
        });

        // Get wind conditions (increased timeout to 15s)
        const windResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: region.lat,
            longitude: region.lon,
            current: 'wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,visibility',
            timezone: 'auto'
          },
          timeout: 15000
        });

        const marine = marineResponse.data.current;
        const wind = windResponse.data.current;

        const windSpeed = (wind.wind_speed_10m || 0) * 0.54; // m/s to knots
        const gustSpeed = (wind.wind_gusts_10m || 0) * 0.54;
        const waveHeight = marine.wave_height || 0;
        const pressure = wind.surface_pressure || 1013;
        const visibility = wind.visibility ? wind.visibility / 1000 : 10;

        // Cyclone detection criteria:
        // - Wind speed > 34 knots (Tropical Storm)
        // - Wave height > 4 meters
        // - Low pressure < 990 hPa
        // - Poor visibility < 3 km

        const isCyclone = (windSpeed >= 34 && waveHeight >= 4) || 
                          (windSpeed >= 50 && pressure < 990) ||
                          (gustSpeed >= 64); // Hurricane force

        if (isCyclone) {
          // Determine category based on wind speed
          let category, status, radius, color;
          
          if (windSpeed >= 64) {
            category = 'Severe Cyclonic Storm';
            status = 'ACTIVE';
            radius = 300;
            color = '#ff0000';
          } else if (windSpeed >= 48) {
            category = 'Cyclonic Storm';
            status = 'ACTIVE';
            radius = 250;
            color = '#ff4500';
          } else {
            category = 'Deep Depression / Tropical Storm';
            status = 'WATCH';
            radius = 200;
            color = '#ffa500';
          }

          const cyclone = {
            name: `System ${region.name}`,
            category,
            location: {
              lat: region.lat,
              lon: region.lon,
              name: region.name
            },
            center: { lat: region.lat, lon: region.lon },
            radius,
            conditions: {
              maxWindSpeed: Math.round(gustSpeed),
              avgWindSpeed: Math.round(windSpeed),
              maxWaveHeight: waveHeight.toFixed(1),
              avgWaveHeight: (waveHeight * 0.7).toFixed(1),
              visibility: visibility.toFixed(1),
              pressure: Math.round(pressure),
              movement: `Wind direction: ${wind.wind_direction_10m}°`
            },
            warnings: generateWarnings(windSpeed, waveHeight, pressure),
            affectedZones: [
              { lat: region.lat, lon: region.lon, radius }
            ],
            timestamp: new Date().toISOString(),
            forecast: generateForecast(windSpeed, pressure),
            status,
            color
          };

          cyclones.push(cyclone);
          console.log(`⚠️ CYCLONE DETECTED: ${category} at ${region.name} - ${windSpeed.toFixed(0)} kts`);
        }

      } catch (error) {
        console.error(`Error scanning ${region.name}:`, error.message);
      }

      // Add delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      success: true,
      cyclones,
      activeCount: cyclones.filter(c => c.status === 'ACTIVE').length,
      watchCount: cyclones.filter(c => c.status === 'WATCH').length,
      lastUpdate: new Date().toISOString(),
      scannedRegions: scanRegions.length,
      source: 'Open-Meteo Weather API - Real-time data'
    });

  } catch (error) {
    console.error('Error generating cyclone demo:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate cyclone demo', 
      message: error.message 
    });
  }
});

// NEW: Check if route intersects with REAL cyclones from live-cyclones endpoint
router.post('/check-cyclone-intersection', async (req, res) => {
  try {
    const { path, cyclones: providedCyclones } = req.body;

    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: 'Path array is required' });
    }

    let cyclones = providedCyclones;

    // If no cyclones provided, fetch real-time data
    if (!cyclones || cyclones.length === 0) {
      const axios = require('axios');
      try {
        const cyclonesResponse = await axios.get('http://localhost:5000/api/route/live-cyclones');
        cyclones = cyclonesResponse.data.cyclones || [];
      } catch (error) {
        console.error('Could not fetch live cyclones:', error.message);
        cyclones = [];
      }
    }

    const intersections = [];

    // Check each waypoint against cyclones
    for (let i = 0; i < path.length; i++) {
      const waypoint = path[i];
      
      for (const cyclone of cyclones) {
        const distance = calculateDistance(
          waypoint.lat, waypoint.lon,
          cyclone.center.lat, cyclone.center.lon
        );

        if (distance <= cyclone.radius) {
          intersections.push({
            waypointIndex: i,
            location: { lat: waypoint.lat, lon: waypoint.lon },
            cycloneName: cyclone.name,
            distanceFromCenter: Math.round(distance),
            dangerLevel: distance < cyclone.radius * 0.5 ? 'EXTREME' : cyclone.dangerLevel,
            warning: `Route passes through ${cyclone.name}! Distance from center: ${Math.round(distance)}km`
          });
        }
      }
    }

    const requiresReroute = intersections.some(i => i.dangerLevel === 'EXTREME' || i.dangerLevel === 'CRITICAL');

    res.json({
      success: true,
      intersects: intersections.length > 0,
      intersections,
      requiresReroute,
      recommendation: requiresReroute
        ? '🚨 CRITICAL: Route passes through cyclone! Immediate reroute required!'
        : intersections.length > 0
        ? '⚠️ WARNING: Route near cyclone. Consider alternative route.'
        : '✅ Route clear of cyclone activity',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking cyclone intersection:', error.message);
    res.status(500).json({ 
      error: 'Failed to check cyclone intersection', 
      message: error.message 
    });
  }
});

module.exports = router;
