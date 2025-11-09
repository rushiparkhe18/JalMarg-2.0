const fs = require('fs');

/**
 * Strict Ocean Router - Ensures routes never cross land or get close to coastlines
 * Features:
 * 1. Marks land cells with coastal buffer zones
 * 2. Validates every waypoint is in safe open water
 * 3. Checks line segments between waypoints don't cross land
 * 4. Maintains minimum distance from coastlines
 */

class StrictOceanRouter {
  constructor(gridFile, options = {}) {
    console.log('🌊 Initializing Strict Ocean Router...');
    
    this.options = {
      coastalBufferKm: options.coastalBufferKm || 20, // 20km buffer from coast
      minWaterDepth: options.minWaterDepth || 10,     // Minimum depth in meters
      checkPointsPerSegment: options.checkPointsPerSegment || 50, // Points to check along each line
      maxRouteDeviation: options.maxRouteDeviation || 1.5 // Max ratio vs direct distance
    };
    
    this.loadGrid(gridFile);
    this.identifyLandAndCoast();
    this.buildSafeWaterNetwork();
  }

  loadGrid(gridFile) {
    const data = JSON.parse(fs.readFileSync(gridFile, 'utf8'));
    this.grid = data.grid;
    this.metadata = data.metadata;
    
    // Create spatial index for fast lookups
    this.gridMap = new Map();
    this.grid.forEach(point => {
      const key = `${point.lat.toFixed(2)}_${point.lon.toFixed(2)}`;
      this.gridMap.set(key, point);
    });
    
    console.log(`✓ Loaded ${this.grid.length} grid points`);
  }

  /**
   * Identify land cells and coastal zones
   */
  identifyLandAndCoast() {
    console.log('🏝️  Identifying land and coastal areas...');
    
    // Define detailed land boundaries for Indian Ocean region
    const landPolygons = [
      // India mainland
      { name: 'India West Coast', coords: [[68, 8], [77, 8], [77, 23], [68, 23], [68, 8]] },
      { name: 'India East Coast', coords: [[77, 8], [88, 8], [88, 23], [77, 23], [77, 8]] },
      { name: 'India South', coords: [[76, 6], [80, 6], [80, 12], [76, 12], [76, 8]] },
      
      // Sri Lanka
      { name: 'Sri Lanka', coords: [[79.5, 5.9], [82, 5.9], [82, 10], [79.5, 10], [79.5, 5.9]] },
      
      // Arabian Peninsula
      { name: 'Oman', coords: [[52, 16], [60, 16], [60, 26], [52, 26], [52, 16]] },
      { name: 'Yemen', coords: [[42, 12], [54, 12], [54, 19], [42, 19], [42, 12]] },
      
      // East Africa
      { name: 'Somalia', coords: [[41, -2], [52, -2], [52, 12], [41, 12], [41, -2]] },
      { name: 'Kenya-Tanzania', coords: [[38, -12], [42, -12], [42, 2], [38, 2], [38, -12]] },
      { name: 'Mozambique', coords: [[32, -27], [41, -27], [41, -10], [32, -10], [32, -27]] },
      { name: 'Madagascar', coords: [[43, -26], [51, -26], [51, -11], [43, -11], [43, -26]] },
      
      // Southeast Asia - DETAILED
      { name: 'Myanmar', coords: [[92, 10], [102, 10], [102, 21], [92, 21], [92, 10]] },
      { name: 'Thailand West', coords: [[97, 6], [100, 6], [100, 13], [97, 13], [97, 6]] },
      { name: 'Malaysia Peninsula', coords: [[99.5, 1], [104.5, 1], [104.5, 7], [99.5, 7], [99.5, 1]] },
      
      // Singapore and surrounding islands - CRITICAL AREA
      { name: 'Singapore Island', coords: [[103.6, 1.15], [104.1, 1.15], [104.1, 1.5], [103.6, 1.5], [103.6, 1.15]] },
      { name: 'Batam-Bintan', coords: [[103.9, 0.7], [104.7, 0.7], [104.7, 1.3], [103.9, 1.3], [103.9, 0.7]] },
      { name: 'Riau Islands', coords: [[104, 0], [105, 0], [105, 2], [104, 2], [104, 0]] },
      
      // Sumatra - DETAILED
      { name: 'Sumatra North', coords: [[95, 2], [100, 2], [100, 6], [95, 6], [95, 2]] },
      { name: 'Sumatra Central', coords: [[98, -2], [104, -2], [104, 2], [98, 2], [98, -2]] },
      { name: 'Sumatra South', coords: [[101, -6], [106, -6], [106, -2], [101, -2], [101, -6]] },
      
      // Java
      { name: 'Java', coords: [[105, -9], [115, -9], [115, -5.5], [105, -5.5], [105, -9]] },
      
      // Borneo/Kalimantan
      { name: 'Borneo West', coords: [[108, -4], [112, -4], [112, 2], [108, 2], [108, -4]] },
      { name: 'Borneo North', coords: [[112, 0], [119, 0], [119, 7], [112, 7], [112, 0]] },
      
      // Sulawesi
      { name: 'Sulawesi', coords: [[118, -6], [125, -6], [125, 2], [118, 2], [118, -6]] },
      
      // Philippines
      { name: 'Philippines', coords: [[117, 5], [127, 5], [127, 19], [117, 19], [117, 5]] },
      
      // Australia
      { name: 'Australia West', coords: [[112, -35], [130, -35], [130, -10], [112, -10], [112, -35]] },
      
      // Small islands and straits
      { name: 'Andaman Islands', coords: [[92, 6], [94, 6], [94, 14], [92, 14], [92, 6]] },
      { name: 'Nicobar Islands', coords: [[92, 6], [94, 6], [94, 10], [92, 10], [92, 6]] },
      { name: 'Maldives', coords: [[72.5, -1], [74, -1], [74, 7.5], [72.5, 7.5], [72.5, -1]] },
      { name: 'Lakshadweep', coords: [[71.5, 8], [74, 8], [74, 12.5], [71.5, 12.5], [71.5, 8]] }
    ];

    // Mark land cells
    this.landCells = [];
    this.coastalCells = [];
    this.safeWaterCells = [];
    
    this.grid.forEach(point => {
      let isLand = false;
      
      // Check if point is inside any land polygon
      for (let poly of landPolygons) {
        if (this.isPointInPolygon(point.lat, point.lon, poly.coords)) {
          isLand = true;
          point.isLand = true;
          point.landName = poly.name;
          point.cost = Infinity;
          this.landCells.push(point);
          break;
        }
      }
      
      if (!isLand) {
        point.isLand = false;
        point.isCoastal = false;
      }
    });
    
    // Identify coastal zones (water cells near land)
    const bufferDegrees = this.options.coastalBufferKm / 111; // rough conversion
    
    this.grid.forEach(point => {
      if (point.isLand) return;
      
      // Check distance to nearest land
      let minDistToLand = Infinity;
      for (let land of this.landCells) {
        const dist = this.distance(point.lat, point.lon, land.lat, land.lon);
        if (dist < minDistToLand) {
          minDistToLand = dist;
        }
      }
      
      point.distanceToLand = minDistToLand;
      
      if (minDistToLand < this.options.coastalBufferKm) {
        point.isCoastal = true;
        point.cost = 10; // High cost for coastal areas
        this.coastalCells.push(point);
      } else {
        point.isCoastal = false;
        point.cost = 1;
        this.safeWaterCells.push(point);
      }
    });
    
    console.log(`✓ Land cells: ${this.landCells.length}`);
    console.log(`✓ Coastal buffer cells: ${this.coastalCells.length}`);
    console.log(`✓ Safe water cells: ${this.safeWaterCells.length}`);
  }

  /**
   * Build network of safe water connections
   */
  buildSafeWaterNetwork() {
    console.log('🔗 Building safe water network...');
    
    this.connections = [];
    const maxConnectionDist = 2.0; // degrees, ~200km
    
    // Only connect safe water cells
    for (let i = 0; i < this.safeWaterCells.length; i++) {
      const cell1 = this.safeWaterCells[i];
      
      for (let j = i + 1; j < this.safeWaterCells.length; j++) {
        const cell2 = this.safeWaterCells[j];
        
        const dist = Math.sqrt(
          Math.pow(cell1.lat - cell2.lat, 2) + 
          Math.pow(cell1.lon - cell2.lon, 2)
        );
        
        if (dist > maxConnectionDist) continue;
        
        // Check if line crosses land or coastal zones
        if (this.isLineSafe(cell1, cell2)) {
          this.connections.push({
            from: cell1,
            to: cell2,
            distance: this.distance(cell1.lat, cell1.lon, cell2.lat, cell2.lon)
          });
        }
      }
    }
    
    console.log(`✓ Safe connections: ${this.connections.length}`);
  }

  /**
   * Check if a line segment between two points crosses land or coastal zones
   */
  isLineSafe(point1, point2) {
    const numChecks = this.options.checkPointsPerSegment;
    
    for (let i = 0; i <= numChecks; i++) {
      const t = i / numChecks;
      const lat = point1.lat + t * (point2.lat - point1.lat);
      const lon = point1.lon + t * (point2.lon - point1.lon);
      
      // Check if this intermediate point is in land or coastal zone
      const nearestCell = this.getNearestCell(lat, lon);
      
      if (!nearestCell) continue;
      
      if (nearestCell.isLand || nearestCell.isCoastal) {
        return false;
      }
      
      // Additional check: ensure minimum distance from land
      if (nearestCell.distanceToLand < this.options.coastalBufferKm * 0.8) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Find route between two ports using A* with strict ocean-only paths
   */
  findSafeRoute(startLat, startLon, endLat, endLon, portNames = {}) {
    console.log(`\n🚢 Finding safe route from ${portNames.start || 'Start'} to ${portNames.end || 'End'}`);
    console.log(`   From: (${startLat}, ${startLon})`);
    console.log(`   To: (${endLat}, ${endLon})`);
    
    // Find nearest safe water cells
    const start = this.getNearestSafeWaterCell(startLat, startLon);
    const end = this.getNearestSafeWaterCell(endLat, endLon);
    
    if (!start) {
      return { success: false, error: `Start point is on land or too close to coast` };
    }
    
    if (!end) {
      return { success: false, error: `End point is on land or too close to coast` };
    }
    
    console.log(`   Start adjusted to: (${start.lat}, ${start.lon}) - ${start.distanceToLand.toFixed(1)}km from land`);
    console.log(`   End adjusted to: (${end.lat}, ${end.lon}) - ${end.distanceToLand.toFixed(1)}km from land`);
    
    // A* pathfinding
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = this.getCellKey(start);
    const endKey = this.getCellKey(end);
    
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, end));
    
    let iterations = 0;
    const maxIterations = 100000;
    
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Get node with lowest fScore
      openSet.sort((a, b) => {
        const aKey = this.getCellKey(a);
        const bKey = this.getCellKey(b);
        return (fScore.get(aKey) || Infinity) - (fScore.get(bKey) || Infinity);
      });
      
      const current = openSet.shift();
      const currentKey = this.getCellKey(current);
      
      // Check if we reached the goal
      if (this.getCellKey(current) === endKey) {
        const path = this.reconstructPath(cameFrom, current);
        const validation = this.validatePath(path);
        
        console.log(`✓ Route found after ${iterations} iterations`);
        console.log(`   Waypoints: ${path.length}`);
        console.log(`   Distance: ${validation.totalDistance.toFixed(2)} km`);
        console.log(`   Min distance from land: ${validation.minDistanceFromLand.toFixed(2)} km`);
        console.log(`   Route status: ${validation.isValid ? '✓ SAFE' : '✗ UNSAFE'}`);
        
        return {
          success: true,
          path: path,
          waypoints: path.length,
          distance: validation.totalDistance,
          minDistanceFromLand: validation.minDistanceFromLand,
          validation: validation
        };
      }
      
      // Get safe neighbors
      const neighbors = this.getSafeNeighbors(current);
      
      for (let neighbor of neighbors) {
        const neighborKey = this.getCellKey(neighbor);
        
        // Check if line to neighbor is safe
        if (!this.isLineSafe(current, neighbor)) {
          continue;
        }
        
        const tentativeGScore = (gScore.get(currentKey) || Infinity) + 
                                this.distance(current.lat, current.lon, neighbor.lat, neighbor.lon) * 
                                neighbor.cost;
        
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));
          
          if (!openSet.some(n => this.getCellKey(n) === neighborKey)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    console.log(`✗ No safe route found after ${iterations} iterations`);
    return { success: false, error: 'No safe route found avoiding land and coastlines' };
  }

  /**
   * Calculate route for multiple ports
   */
  calculateMultiPortRoute(ports) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🌊 STRICT OCEAN ROUTING - MULTI-PORT CALCULATION');
    console.log(`${'='.repeat(60)}`);
    console.log(`Ports: ${ports.length}`);
    console.log(`Coastal buffer: ${this.options.coastalBufferKm} km`);
    console.log(`Check points per segment: ${this.options.checkPointsPerSegment}`);
    
    const routes = [];
    let totalDistance = 0;
    let allValid = true;
    
    for (let i = 0; i < ports.length - 1; i++) {
      const from = ports[i];
      const to = ports[i + 1];
      
      const result = this.findSafeRoute(
        from.lat, from.lon, 
        to.lat, to.lon,
        { start: from.name, end: to.name }
      );
      
      if (!result.success) {
        console.log(`\n❌ Failed: ${from.name} → ${to.name}`);
        console.log(`   Error: ${result.error}`);
        allValid = false;
        continue;
      }
      
      routes.push({
        from: from.name,
        to: to.name,
        path: result.path,
        distance: result.distance,
        waypoints: result.waypoints,
        minDistanceFromLand: result.minDistanceFromLand,
        validation: result.validation
      });
      
      totalDistance += result.distance;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 ROUTE SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total segments: ${routes.length}`);
    console.log(`Total distance: ${totalDistance.toFixed(2)} km`);
    console.log(`Total waypoints: ${routes.reduce((sum, r) => sum + r.waypoints, 0)}`);
    console.log(`All routes valid: ${allValid ? '✓ YES' : '✗ NO'}`);
    
    if (routes.length > 0) {
      const minClearance = Math.min(...routes.map(r => r.minDistanceFromLand));
      console.log(`Minimum clearance from land: ${minClearance.toFixed(2)} km`);
    }
    
    return {
      routes,
      totalDistance,
      allValid,
      summary: {
        segments: routes.length,
        totalDistance: totalDistance.toFixed(2),
        totalWaypoints: routes.reduce((sum, r) => sum + r.waypoints, 0),
        minClearance: routes.length > 0 ? Math.min(...routes.map(r => r.minDistanceFromLand)).toFixed(2) : 0
      }
    };
  }

  /**
   * Validate entire path doesn't cross land or get too close to coast
   */
  validatePath(path) {
    let totalDistance = 0;
    let minDistanceFromLand = Infinity;
    const violations = [];
    
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      
      // Check point itself
      if (point.isLand) {
        violations.push({
          index: i,
          type: 'LAND',
          location: `(${point.lat}, ${point.lon})`,
          issue: `Waypoint is on land: ${point.landName}`
        });
      }
      
      if (point.isCoastal) {
        violations.push({
          index: i,
          type: 'COASTAL',
          location: `(${point.lat}, ${point.lon})`,
          issue: `Waypoint in coastal zone: ${point.distanceToLand.toFixed(2)}km from land`
        });
      }
      
      minDistanceFromLand = Math.min(minDistanceFromLand, point.distanceToLand || Infinity);
      
      // Check line to next point
      if (i < path.length - 1) {
        const next = path[i + 1];
        totalDistance += this.distance(point.lat, point.lon, next.lat, next.lon);
        
        if (!this.isLineSafe(point, next)) {
          violations.push({
            index: i,
            type: 'LINE_CROSSING',
            location: `(${point.lat}, ${point.lon}) to (${next.lat}, ${next.lon})`,
            issue: 'Line segment crosses land or coastal zone'
          });
        }
      }
    }
    
    return {
      isValid: violations.length === 0,
      totalDistance,
      minDistanceFromLand,
      violations,
      safetyScore: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10)
    };
  }

  // ============= HELPER FUNCTIONS =============

  isPointInPolygon(lat, lon, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0], yi = coords[i][1];
      const xj = coords[j][0], yj = coords[j][1];
      
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  heuristic(a, b) {
    return this.distance(a.lat, a.lon, b.lat, b.lon);
  }

  getCellKey(cell) {
    return `${cell.lat.toFixed(2)}_${cell.lon.toFixed(2)}`;
  }

  getNearestCell(lat, lon) {
    const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    return this.gridMap.get(key) || null;
  }

  getNearestSafeWaterCell(lat, lon) {
    let nearest = null;
    let minDist = Infinity;
    
    for (let cell of this.safeWaterCells) {
      const dist = this.distance(lat, lon, cell.lat, cell.lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = cell;
      }
    }
    
    return nearest;
  }

  getSafeNeighbors(cell) {
    const neighbors = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    for (let [dLat, dLon] of directions) {
      const lat = cell.lat + dLat;
      const lon = cell.lon + dLon;
      const neighbor = this.getNearestCell(lat, lon);
      
      if (neighbor && !neighbor.isLand && !neighbor.isCoastal) {
        neighbors.push(neighbor);
      }
    }
    
    return neighbors;
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = this.getCellKey(current);
    
    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      path.unshift(current);
      currentKey = this.getCellKey(current);
    }
    
    return path;
  }

  /**
   * Export routes to GeoJSON for visualization
   */
  exportToGeoJSON(result, filename) {
    const features = [];
    
    // Add routes
    result.routes.forEach((route, index) => {
      features.push({
        type: 'Feature',
        properties: {
          segment: index + 1,
          from: route.from,
          to: route.to,
          distance: route.distance,
          waypoints: route.waypoints,
          minClearance: route.minDistanceFromLand,
          valid: route.validation.isValid,
          type: 'safe-route'
        },
        geometry: {
          type: 'LineString',
          coordinates: route.path.map(p => [p.lon, p.lat])
        }
      });
      
      // Add waypoints
      route.path.forEach((point, idx) => {
        if (idx % 5 === 0) { // Show every 5th waypoint
          features.push({
            type: 'Feature',
            properties: {
              segment: index + 1,
              waypointIndex: idx,
              distanceToLand: point.distanceToLand,
              type: 'waypoint'
            },
            geometry: {
              type: 'Point',
              coordinates: [point.lon, point.lat]
            }
          });
        }
      });
    });
    
    // Add coastal buffer zones for visualization
    const coastalSample = this.coastalCells.filter((_, i) => i % 10 === 0);
    coastalSample.forEach(cell => {
      features.push({
        type: 'Feature',
        properties: {
          type: 'coastal-buffer',
          distanceToLand: cell.distanceToLand
        },
        geometry: {
          type: 'Point',
          coordinates: [cell.lon, cell.lat]
        }
      });
    });
    
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };
    
    fs.writeFileSync(filename, JSON.stringify(geojson, null, 2));
    console.log(`\n💾 Route exported to ${filename}`);
  }

  /**
   * Generate detailed report
   */
  generateReport(result, filename) {
    const report = {
      generatedAt: new Date().toISOString(),
      parameters: this.options,
      gridStats: {
        totalCells: this.grid.length,
        landCells: this.landCells.length,
        coastalCells: this.coastalCells.length,
        safeWaterCells: this.safeWaterCells.length,
        safeConnections: this.connections.length
      },
      routeSummary: result.summary,
      routes: result.routes.map(r => ({
        from: r.from,
        to: r.to,
        distance: r.distance,
        waypoints: r.waypoints,
        minDistanceFromLand: r.minDistanceFromLand,
        valid: r.validation.isValid,
        violations: r.validation.violations
      })),
      overallStatus: result.allValid ? 'ALL ROUTES SAFE' : 'SOME ROUTES HAVE ISSUES'
    };
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to ${filename}`);
  }
}

// ============= USAGE EXAMPLE =============

if (require.main === module) {
  // Define ports
  const ports = [
    { name: 'Mumbai', lat: 18.94, lon: 72.83 },
    { name: 'Colombo', lat: 6.93, lon: 79.85 },
    { name: 'Port Klang', lat: 3.00, lon: 101.39 },
    { name: 'Singapore', lat: 1.29, lon: 103.85 }
  ];
  
  // Initialize router with strict settings
  const router = new StrictOceanRouter('./gridData_with_weather.json', {
    coastalBufferKm: 20,        // 20km minimum from coast
    minWaterDepth: 10,          // 10m minimum depth
    checkPointsPerSegment: 50,  // Check 50 points per line segment
    maxRouteDeviation: 1.5      // Allow 50% longer routes for safety
  });
  
  // Calculate multi-port route
  const result = router.calculateMultiPortRoute(ports);
  
  // Export results
  if (result.routes.length > 0) {
    router.exportToGeoJSON(result, 'strict_ocean_route.geojson');
    router.generateReport(result, 'route_report.json');
  }
}

module.exports = StrictOceanRouter;
