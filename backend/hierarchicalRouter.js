/**
 * 🎯 HIERARCHICAL A* MARITIME ROUTER
 * Two-stage routing: Coarse (1°) → Fine (0.2°)
 * Optimized for long-distance ocean routes
 */

const Grid = require('./models/Grid');
const { haversineDistance, calculateHeuristic } = require('./costFunction');

class HierarchicalRouter {
  constructor() {
    this.COARSE_RESOLUTION = 1.0;  // Stage 1: 1° grid
    this.FINE_RESOLUTION = 0.2;    // Stage 2: 0.2° grid
    this.CORRIDOR_WIDTH = 2.0;     // Corridor around waypoints (degrees)
  }

  /**
   * Adjust waypoints based on routing mode to create different paths
   */
  adjustWaypointsForMode(waypoints, mode, start, end) {
    if (waypoints.length < 3) return waypoints; // Can't adjust too few waypoints
    
    const adjusted = [start]; // Always keep start point exact
    
    for (let i = 1; i < waypoints.length - 1; i++) {
      const wp = waypoints[i];
      let adjustedWp = { ...wp };
      
      switch(mode) {
        case 'fuel':
        case 'fuel-efficient':
          // Fuel mode: Pull waypoints INWARD (shorter, more direct path)
          // Move waypoints 0.3° closer to straight line
          const straightLat = start.lat + (end.lat - start.lat) * (i / (waypoints.length - 1));
          const straightLon = start.lon + (end.lon - start.lon) * (i / (waypoints.length - 1));
          adjustedWp.lat = wp.lat + (straightLat - wp.lat) * 0.3;
          adjustedWp.lon = wp.lon + (straightLon - wp.lon) * 0.3;
          adjustedWp.name = `${wp.name} (fuel-optimized)`;
          break;
          
        case 'safe':
          // Safe mode: Push waypoints OUTWARD (wider arc, farther from coast)
          // Move waypoints 0.5° away from straight line (perpendicular)
          const midLat = (start.lat + end.lat) / 2;
          const midLon = (start.lon + end.lon) / 2;
          const perpLat = -(end.lon - start.lon); // Perpendicular vector
          const perpLon = (end.lat - start.lat);
          const perpLength = Math.sqrt(perpLat * perpLat + perpLon * perpLon);
          
          // Push outward by 0.5° (~55km)
          adjustedWp.lat = wp.lat + (perpLat / perpLength) * 0.5;
          adjustedWp.lon = wp.lon + (perpLon / perpLength) * 0.5;
          adjustedWp.name = `${wp.name} (safe-wide)`;
          break;
          
        case 'optimal':
        default:
          // Optimal mode: Keep original waypoints (balanced)
          adjustedWp = wp;
          break;
      }
      
      adjusted.push(adjustedWp);
    }
    
    adjusted.push(end); // Always keep end point exact
    
    console.log(`   🎯 Waypoints adjusted for ${mode} mode`);
    return adjusted;
  }

  /**
   * STAGE 1: Coarse routing to find major waypoints
   * Uses predefined waypoints if available, otherwise auto-generates
   * Then adjusts waypoints based on mode for different paths
   */
  async findCoarseWaypoints(start, end, coastalOptimizer, mode = 'optimal') {
    console.log(`\n   🗺️  STAGE 1: Coarse waypoint planning (1° resolution)`);
    
    // First, try to use predefined strategic waypoints
    let predefinedWaypoints = coastalOptimizer.getStrategicWaypoints(start, end, mode);
    
    if (predefinedWaypoints && predefinedWaypoints.length > 2) {
      console.log(`   ✅ Using ${predefinedWaypoints.length} predefined strategic waypoints for ${mode.toUpperCase()} mode`);
      
      // Adjust waypoints based on mode to create different paths
      predefinedWaypoints = this.adjustWaypointsForMode(predefinedWaypoints, mode, start, end);
      
      return predefinedWaypoints;
    }
    
    // Fallback: Auto-generate waypoints for routes without predefined paths
    const distance = haversineDistance(start.lat, start.lon, end.lat, end.lon);
    
    // For very long routes (>500km), create waypoints every ~500km
    if (distance > 500) {
      const numWaypoints = Math.ceil(distance / 500);
      const waypoints = [start];
      
      for (let i = 1; i < numWaypoints; i++) {
        const ratio = i / numWaypoints;
        waypoints.push({
          lat: start.lat + (end.lat - start.lat) * ratio,
          lon: start.lon + (end.lon - start.lon) * ratio,
          name: `Waypoint ${i}`
        });
      }
      
      waypoints.push(end);
      
      console.log(`   ⚠️  Generated ${waypoints.length} auto waypoints (every ~500km) - may cross land!`);
      return waypoints;
    }
    
    // For shorter routes, use direct routing
    console.log(`   ℹ️  Short route (<500km), using direct routing`);
    return [start, end];
  }

  /**
   * STAGE 2: Load cells in corridor between two waypoints
   * Only loads ±CORRIDOR_WIDTH degrees around the direct line
   * Corridor width adjusts based on mode for path flexibility
   */
  async loadCorridorCells(waypoint1, waypoint2, mode = 'optimal') {
    const startTime = Date.now();
    
    // Adjust corridor width based on mode
    let corridorWidth = this.CORRIDOR_WIDTH;
    if (mode === 'safe') {
      corridorWidth = this.CORRIDOR_WIDTH * 1.5; // Wider corridor for safe mode (3.0°)
    } else if (mode === 'fuel' || mode === 'fuel-efficient') {
      corridorWidth = this.CORRIDOR_WIDTH * 0.75; // Narrower corridor for fuel mode (1.5°)
    }
    
    // Calculate bounding box with corridor buffer
    const minLat = Math.min(waypoint1.lat, waypoint2.lat) - corridorWidth;
    const maxLat = Math.max(waypoint1.lat, waypoint2.lat) + corridorWidth;
    const minLon = Math.min(waypoint1.lon, waypoint2.lon) - corridorWidth;
    const maxLon = Math.max(waypoint1.lon, waypoint2.lon) + corridorWidth;
    
    console.log(`      📦 Loading ${mode} corridor: ${minLat.toFixed(1)}° to ${maxLat.toFixed(1)}°N, ${minLon.toFixed(1)}° to ${maxLon.toFixed(1)}°E`);
    
    // Query MongoDB for cells in bounding box (lazy loading)
    const chunks = await Grid.find({ isChunked: true }).select('cells chunkIndex').lean();
    
    const corridorCells = [];
    const cellKeys = new Set();
    let totalChecked = 0;
    
    for (const chunk of chunks) {
      if (!chunk.cells) continue;
      
      for (const cell of chunk.cells) {
        totalChecked++;
        
        // Filter to corridor bounding box
        if (cell.lat >= minLat && cell.lat <= maxLat &&
            cell.lon >= minLon && cell.lon <= maxLon) {
          
          const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
          
          if (!cellKeys.has(key)) {
            cellKeys.add(key);
            corridorCells.push(cell);
          }
        }
      }
    }
    
    const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const waterCells = corridorCells.filter(c => !c.is_land && !c.obstacle).length;
    
    console.log(`      ✅ Loaded ${corridorCells.length} cells (${waterCells} water) in ${loadTime}s`);
    
    return corridorCells;
  }

  /**
   * Apply safety penalties to cells near coastlines
   */
  applySafetyPenalties(cells) {
    const landCells = new Set();
    
    // Index land cells for fast lookup
    for (const cell of cells) {
      if (cell.is_land || cell.obstacle) {
        const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
        landCells.add(key);
      }
    }
    
    // Mark cells near land with safety penalty
    let coastalCells = 0;
    
    for (const cell of cells) {
      if (cell.is_land || cell.obstacle) continue;
      
      // Check 8 neighbors for land
      let nearLand = false;
      
      for (let dLat = -this.FINE_RESOLUTION; dLat <= this.FINE_RESOLUTION; dLat += this.FINE_RESOLUTION) {
        for (let dLon = -this.FINE_RESOLUTION; dLon <= this.FINE_RESOLUTION; dLon += this.FINE_RESOLUTION) {
          if (dLat === 0 && dLon === 0) continue;
          
          const neighborKey = `${(cell.lat + dLat).toFixed(1)},${(cell.lon + dLon).toFixed(1)}`;
          
          if (landCells.has(neighborKey)) {
            nearLand = true;
            break;
          }
        }
        if (nearLand) break;
      }
      
      if (nearLand) {
        cell.near_coast = true;
        coastalCells++;
      }
    }
    
    console.log(`      🛡️  Marked ${coastalCells} cells near coastline with safety penalty`);
    
    return cells;
  }

  /**
   * Main method: Calculate hierarchical route
   * MODE IS CRITICAL - passes it to waypoint adjustment for different paths
   */
  async calculateRoute(start, end, routeFinder, coastalOptimizer, mode = 'optimal') {
    console.log(`\n   🎯 HIERARCHICAL ROUTE CALCULATION`);
    console.log(`   📍 Start: (${start.lat.toFixed(2)}, ${start.lon.toFixed(2)})`);
    console.log(`   📍 End: (${end.lat.toFixed(2)}, ${end.lon.toFixed(2)})`);
    console.log(`   🚢 Mode: ${mode}`);
    
    const overallStart = Date.now();
    
    // STAGE 1: Find coarse waypoints (use predefined if available, adjust for mode)
    const waypoints = await this.findCoarseWaypoints(start, end, coastalOptimizer, mode);
    
    // STAGE 2: Fine routing between waypoints
    const fullPath = [];
    let totalDistance = 0;
    let totalFuel = 0;
    let totalDuration = 0;
    const segmentResults = [];
    
    console.log(`\n   🔗 STAGE 2: Fine routing through ${waypoints.length - 1} segments:`);
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];
      
      console.log(`\n   📌 Segment ${i + 1}/${waypoints.length - 1}: (${wp1.lat.toFixed(1)}, ${wp1.lon.toFixed(1)}) → (${wp2.lat.toFixed(1)}, ${wp2.lon.toFixed(1)})`);
      
      try {
        const segmentStart = Date.now();
        
        // Load corridor cells (optimized bounding box, adjusted width by mode)
        const corridorCells = await this.loadCorridorCells(wp1, wp2, mode);
        
        if (corridorCells.length === 0) {
          throw new Error('No cells in corridor');
        }
        
        // Apply safety penalties
        const safeCells = this.applySafetyPenalties(corridorCells);
        
        // Run fine A* on corridor
        const segmentResult = await routeFinder.findOptimalRoute(
          { lat: wp1.lat, lon: wp1.lon },
          { lat: wp2.lat, lon: wp2.lon },
          safeCells,
          mode,
          this.FINE_RESOLUTION
        );
        
        const segmentTime = ((Date.now() - segmentStart) / 1000).toFixed(2);
        
        // Extract path
        const segmentPath = segmentResult.coordinates || segmentResult.path || [];
        
        if (segmentPath.length === 0) {
          throw new Error('No path found in segment');
        }
        
        // Remove duplicate waypoint (except first segment)
        if (i > 0 && segmentPath.length > 0) {
          segmentPath.shift();
        }
        
        fullPath.push(...segmentPath);
        
        // Accumulate metrics
        const segmentDistance = segmentResult.total_distance_km || 0;
        totalDistance += segmentDistance;
        totalFuel += (segmentResult.fuel_consumption?.total_tons || 0);
        totalDuration += (segmentResult.duration?.hours || 0);
        
        segmentResults.push({
          segment: i + 1,
          distance: segmentDistance,
          points: segmentPath.length,
          time: parseFloat(segmentTime)
        });
        
        console.log(`      ✅ ${segmentDistance.toFixed(0)}km, ${segmentPath.length} points (${segmentTime}s)`);
        
      } catch (error) {
        console.log(`      ❌ Segment ${i + 1} failed: ${error.message}`);
        
        // If not the final segment, try to continue
        if (i < waypoints.length - 2) {
          console.log(`      🔄 Skipping to next segment...`);
          continue;
        } else {
          throw new Error(`Final segment failed: ${error.message}`);
        }
      }
    }
    
    const totalTime = ((Date.now() - overallStart) / 1000).toFixed(2);
    
    console.log(`\n   ✅ ROUTE COMPLETE!`);
    console.log(`   📏 Total distance: ${totalDistance.toFixed(1)} km`);
    console.log(`   📍 Total points: ${fullPath.length}`);
    console.log(`   ⏱️  Total time: ${totalTime}s`);
    console.log(`   ⛽ Total fuel: ${totalFuel.toFixed(1)} tons`);
    
    // Format response
    return {
      success: true,
      path: fullPath.map(cell => ({
        lat: cell.lat,
        lon: cell.lon,
        weather: cell.weather || null
      })),
      distance: totalDistance,
      duration: totalDuration,
      waypoints: fullPath.length,
      fuelConsumption: totalFuel,
      method: 'hierarchical-two-stage',
      mode: mode,
      metadata: {
        coarseWaypoints: waypoints.length,
        segments: segmentResults,
        totalTimeSeconds: parseFloat(totalTime),
        corridorWidth: this.CORRIDOR_WIDTH,
        resolution: this.FINE_RESOLUTION
      }
    };
  }
}

module.exports = HierarchicalRouter;
