/**
 * 🚢 ENHANCED COASTAL ROUTE OPTIMIZER
 * Handles ALL long-distance routes in Indian Ocean region
 * Supports: India coastal, Southeast Asia, Middle East, East Africa
 * Uses hierarchical A* routing for performance
 */

const Grid = require('./models/Grid');
const HierarchicalRouter = require('./hierarchicalRouter');

class CoastalRouteOptimizer {
  constructor() {
    // Strategic waypoints for different regional corridors
    this.STRATEGIC_WAYPOINTS = {
      
      // 1. MUMBAI TO EAST COAST (Around Southern India) - ENHANCED GRANULARITY
      MUMBAI_TO_EAST_COAST: [
        { lat: 18.97, lon: 72.87, name: 'Mumbai' },
        { lat: 18.5, lon: 73.0, name: 'Mumbai offshore' },
        { lat: 17.5, lon: 73.2, name: 'Ratnagiri region' },
        { lat: 16.5, lon: 73.5, name: 'Goa approach' },
        { lat: 15.5, lon: 73.8, name: 'Goa region' },
        { lat: 14.5, lon: 74.2, name: 'Karwar region' },
        { lat: 13.5, lon: 74.5, name: 'Mangalore approach' },
        { lat: 12.5, lon: 74.8, name: 'Mangalore region' },
        { lat: 11.5, lon: 75.2, name: 'Calicut region' },
        { lat: 10.5, lon: 75.5, name: 'Kochi approach' },
        { lat: 9.5, lon: 76.0, name: 'Kochi region' },
        { lat: 8.5, lon: 76.5, name: 'Southern Kerala' },
        { lat: 7.5, lon: 77.0, name: 'Deep South Kerala' },
        { lat: 6.5, lon: 77.5, name: 'Approaching Sri Lanka' },
        { lat: 6.0, lon: 78.5, name: 'West of Sri Lanka' },
        { lat: 5.8, lon: 79.5, name: 'Southwest Sri Lanka' },
        { lat: 5.5, lon: 80.5, name: 'South of Sri Lanka' },
        { lat: 5.8, lon: 81.5, name: 'Southeast Sri Lanka' },
        { lat: 6.5, lon: 82.0, name: 'East of Sri Lanka' },
        { lat: 7.5, lon: 81.8, name: 'Northeast Sri Lanka' },
        { lat: 8.5, lon: 81.5, name: 'Tamil Nadu approach' },
        { lat: 9.5, lon: 81.0, name: 'Tamil Nadu coast' },
        { lat: 10.5, lon: 80.5, name: 'Tuticorin region' },
        { lat: 11.5, lon: 80.3, name: 'Nagapattinam region' },
        { lat: 12.5, lon: 80.2, name: 'Pondicherry region' },
        { lat: 13.0, lon: 80.3, name: 'Chennai region' },
        { lat: 14.0, lon: 80.5, name: 'North Tamil Nadu' },
        { lat: 15.0, lon: 81.0, name: 'South Andhra' },
        { lat: 16.0, lon: 82.0, name: 'Central Andhra' },
        { lat: 17.0, lon: 82.5, name: 'North Andhra' },
        { lat: 17.68, lon: 83.30, name: 'Visakhapatnam' }
      ],

      // 1B. MUMBAI TO BANGLADESH/KOLKATA (Extended East Coast)
      MUMBAI_TO_BANGLADESH: [
        { lat: 18.97, lon: 72.87, name: 'Mumbai' },
        { lat: 18.5, lon: 73.0, name: 'Mumbai offshore' },
        { lat: 17.0, lon: 73.5, name: 'Maharashtra coast' },
        { lat: 15.0, lon: 74.0, name: 'Goa region' },
        { lat: 13.0, lon: 75.0, name: 'Karnataka coast' },
        { lat: 11.0, lon: 76.0, name: 'Kerala coast' },
        { lat: 9.0, lon: 77.0, name: 'Southern Kerala' },
        { lat: 7.0, lon: 78.5, name: 'Sri Lanka West' },
        { lat: 6.0, lon: 80.5, name: 'Sri Lanka South' },
        { lat: 6.5, lon: 82.5, name: 'Sri Lanka East' },
        { lat: 8.0, lon: 84.0, name: 'Bay of Bengal Southwest' },
        { lat: 10.0, lon: 85.5, name: 'Bay of Bengal Central' },
        { lat: 12.0, lon: 86.5, name: 'Bay of Bengal Northeast' },
        { lat: 14.0, lon: 87.5, name: 'Odisha coast' },
        { lat: 16.0, lon: 87.8, name: 'Odisha offshore' },
        { lat: 18.0, lon: 88.5, name: 'West Bengal approach' },
        { lat: 20.0, lon: 89.0, name: 'West Bengal coast' },
        { lat: 21.5, lon: 89.5, name: 'Bangladesh approach' },
        { lat: 22.0, lon: 89.8, name: 'Bangladesh offshore' }  // Offshore waypoint before river delta
      ],

      // 2. MUMBAI TO SINGAPORE (Full West India to Southeast Asia)
      MUMBAI_TO_SINGAPORE: [
        { lat: 18.97, lon: 72.87, name: 'Mumbai' },
        { lat: 17.0, lon: 73.5, name: 'Maharashtra coast' },
        { lat: 15.0, lon: 74.0, name: 'Goa region' },
        { lat: 13.0, lon: 75.0, name: 'Karnataka coast' },
        { lat: 11.0, lon: 76.0, name: 'Kerala coast' },
        { lat: 9.0, lon: 77.0, name: 'Southern Kerala' },
        { lat: 7.0, lon: 78.5, name: 'Sri Lanka West' },
        { lat: 6.0, lon: 80.5, name: 'Sri Lanka South' },
        { lat: 6.5, lon: 82.5, name: 'Sri Lanka East' },
        { lat: 8.0, lon: 84.0, name: 'Bay of Bengal West' },
        { lat: 9.0, lon: 87.0, name: 'Andaman approach' },
        { lat: 8.5, lon: 91.0, name: 'Andaman Islands' },
        { lat: 7.0, lon: 94.0, name: 'Nicobar approach' },
        { lat: 6.0, lon: 96.0, name: 'Nicobar Islands' },
        { lat: 5.0, lon: 98.0, name: 'Northern Sumatra' },
        { lat: 3.5, lon: 100.0, name: 'Malacca Strait North' },
        { lat: 2.5, lon: 101.5, name: 'Malacca Strait Central' },
        { lat: 1.5, lon: 103.0, name: 'Malacca Strait South' },
        { lat: 1.23, lon: 103.77, name: 'Singapore' }
      ],

      // 3. INDIA TO SINGAPORE (Bay of Bengal to Malacca Strait)
      INDIA_TO_SINGAPORE: [
        { lat: 13.0, lon: 80.3, name: 'Chennai' },
        { lat: 11.0, lon: 82.0, name: 'Andaman Sea approach' },
        { lat: 9.0, lon: 85.0, name: 'Andaman Islands West' },
        { lat: 7.0, lon: 92.0, name: 'Andaman Islands South' },
        { lat: 6.0, lon: 95.0, name: 'Nicobar Islands' },
        { lat: 5.0, lon: 97.0, name: 'Northern Sumatra approach' },
        { lat: 3.5, lon: 99.0, name: 'Malacca Strait North' },
        { lat: 2.0, lon: 100.5, name: 'Malacca Strait Central' },
        { lat: 1.3, lon: 103.8, name: 'Singapore Strait' }
      ],

      // 4. INDIA TO PHILIPPINES (Across Bay of Bengal)
      INDIA_TO_PHILIPPINES: [
        { lat: 13.0, lon: 80.3, name: 'Chennai' },
        { lat: 12.0, lon: 85.0, name: 'Bay of Bengal East' },
        { lat: 10.0, lon: 90.0, name: 'Andaman Sea' },
        { lat: 8.0, lon: 95.0, name: 'Myanmar coast' },
        { lat: 7.0, lon: 98.0, name: 'Thailand approach' },
        { lat: 6.0, lon: 102.0, name: 'South China Sea entry' },
        { lat: 7.0, lon: 108.0, name: 'South China Sea Central' },
        { lat: 9.0, lon: 115.0, name: 'Palawan approach' },
        { lat: 11.0, lon: 120.0, name: 'Manila Bay approach' }
      ],

      // 5. INDIA TO MIDDLE EAST (Arabian Sea routes)
      INDIA_TO_MIDDLE_EAST: [
        { lat: 18.97, lon: 72.87, name: 'Mumbai' },
        { lat: 20.0, lon: 70.0, name: 'Kathiawar coast' },
        { lat: 22.5, lon: 68.5, name: 'Gulf of Kutch' },
        { lat: 24.0, lon: 65.0, name: 'Pakistan coast' },
        { lat: 25.0, lon: 60.0, name: 'Makran coast' },
        { lat: 25.5, lon: 56.5, name: 'Oman approach' },
        { lat: 25.3, lon: 55.3, name: 'Dubai/UAE' }
      ],

      // 5. INDIA TO EAST AFRICA (Cross Indian Ocean)
      INDIA_TO_AFRICA: [
        { lat: 13.0, lon: 80.3, name: 'Chennai' },
        { lat: 10.0, lon: 75.0, name: 'Lakshadweep' },
        { lat: 5.0, lon: 70.0, name: 'Maldives region' },
        { lat: 0.0, lon: 60.0, name: 'Central Indian Ocean' },
        { lat: -5.0, lon: 50.0, name: 'Seychelles region' },
        { lat: -10.0, lon: 45.0, name: 'Madagascar approach' },
        { lat: -15.0, lon: 42.0, name: 'Mozambique Channel' }
      ],

      // 6. SOUTHEAST ASIA INTERCONNECTION
      SOUTHEAST_ASIA_ROUTES: [
        { lat: 1.3, lon: 103.8, name: 'Singapore' },
        { lat: 3.0, lon: 107.0, name: 'Borneo West' },
        { lat: 5.0, lon: 112.0, name: 'Borneo North' },
        { lat: 7.0, lon: 117.0, name: 'Sulu Sea' },
        { lat: 10.0, lon: 120.0, name: 'Philippines West' }
      ],

      // 7. MUMBAI TO SINGAPORE (Complete West to Southeast route)
      MUMBAI_TO_SINGAPORE: [
        { lat: 18.0, lon: 72.8, name: 'Mumbai' },
        { lat: 15.0, lon: 73.0, name: 'Goa' },
        { lat: 12.0, lon: 75.0, name: 'Mangalore' },
        { lat: 10.0, lon: 76.0, name: 'Kochi' },
        { lat: 8.0, lon: 77.0, name: 'South Kerala' },
        { lat: 6.0, lon: 79.5, name: 'South Sri Lanka' },
        { lat: 8.0, lon: 82.0, name: 'East Sri Lanka' },
        { lat: 10.0, lon: 85.0, name: 'Bay of Bengal' },
        { lat: 9.0, lon: 90.0, name: 'Andaman approach' },
        { lat: 7.0, lon: 95.0, name: 'Andaman Islands' },
        { lat: 5.0, lon: 98.0, name: 'Nicobar' },
        { lat: 3.0, lon: 100.0, name: 'Malacca North' },
        { lat: 1.3, lon: 103.8, name: 'Singapore' }
      ]
    };

    // Regional definitions for automatic waypoint selection
    this.REGIONS = {
      WEST_INDIA: { lat: [15, 23], lon: [68, 73] },
      SOUTH_INDIA: { lat: [8, 15], lon: [75, 77] },
      EAST_INDIA: { lat: [13, 22], lon: [80, 88] },
      BANGLADESH: { lat: [20, 24], lon: [88, 93] },
      SRI_LANKA: { lat: [6, 10], lon: [79, 82] },
      MALDIVES: { lat: [0, 7], lon: [72, 74] },
      MIDDLE_EAST: { lat: [24, 26], lon: [50, 60] },
      SINGAPORE: { lat: [1, 2], lon: [103, 104] },
      MALAYSIA: { lat: [1, 7], lon: [99, 104] },
      PHILIPPINES: { lat: [10, 15], lon: [119, 122] },
      ANDAMAN: { lat: [6, 14], lon: [92, 94] },
      THAILAND: { lat: [5, 15], lon: [98, 102] },
      VIETNAM: { lat: [8, 20], lon: [105, 110] },
      INDONESIA: { lat: [-6, 6], lon: [95, 120] },
      EAST_AFRICA: { lat: [-15, 5], lon: [39, 45] }
    };
    
    // ⚓ STRATEGIC HUBS (connection points for multi-leg routes)
    this.HUBS = {
      CHENNAI: { lat: 13.08, lon: 80.27, name: 'Chennai' },
      KOCHI: { lat: 9.97, lon: 76.27, name: 'Kochi' },
      TUTICORIN: { lat: 8.76, lon: 78.15, name: 'Tuticorin' }
    };
  }

  /**
   * Determine which region a port belongs to
   */
  getRegion(lat, lon) {
    for (const [name, bounds] of Object.entries(this.REGIONS)) {
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
          lon >= bounds.lon[0] && lon <= bounds.lon[1]) {
        return name;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Intelligently select waypoint set based on origin and destination
   */
  selectWaypointSet(start, end) {
    const startRegion = this.getRegion(start.lat, start.lon);
    const endRegion = this.getRegion(end.lat, end.lon);
    
    console.log(`   🗺️  Route regions: ${startRegion} → ${endRegion}`);
    
    // ========== HUB-BASED ROUTING FOR WEST INDIA ==========
    // Route all West India → Southeast/East destinations via Chennai/Kochi hub
    
    // West India → East India (via Chennai hub)
    if (startRegion === 'WEST_INDIA' && endRegion === 'EAST_INDIA') {
      console.log(`   🔄 Using hub routing: West → Chennai → East India`);
      return { set: 'MUMBAI_TO_EAST_COAST', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // East India → West India (reverse, via Chennai hub)
    if (startRegion === 'EAST_INDIA' && endRegion === 'WEST_INDIA') {
      console.log(`   🔄 Using hub routing: East India → Chennai → West`);
      return { set: 'MUMBAI_TO_EAST_COAST', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // West India → Bangladesh/Andaman (via Chennai hub + Bay of Bengal)
    if (startRegion === 'WEST_INDIA' && (endRegion === 'BANGLADESH' || endRegion === 'ANDAMAN')) {
      console.log(`   🔄 Using hub routing: West → Chennai → ${endRegion}`);
      return { set: 'MUMBAI_TO_BANGLADESH', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // Bangladesh/Andaman → West India (reverse)
    if ((startRegion === 'BANGLADESH' || startRegion === 'ANDAMAN') && endRegion === 'WEST_INDIA') {
      console.log(`   🔄 Using hub routing: ${startRegion} → Chennai → West`);
      return { set: 'MUMBAI_TO_BANGLADESH', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // West India → Singapore/Malaysia/Indonesia (via Chennai hub + Malacca Strait)
    if (startRegion === 'WEST_INDIA' && 
        (endRegion === 'SINGAPORE' || endRegion === 'MALAYSIA' || endRegion === 'INDONESIA')) {
      console.log(`   🔄 Using hub routing: West → Chennai → ${endRegion}`);
      return { set: 'MUMBAI_TO_SINGAPORE', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // Singapore/Malaysia/Indonesia → West India (reverse)
    if ((startRegion === 'SINGAPORE' || startRegion === 'MALAYSIA' || startRegion === 'INDONESIA') && 
        endRegion === 'WEST_INDIA') {
      console.log(`   🔄 Using hub routing: ${startRegion} → Chennai → West`);
      return { set: 'MUMBAI_TO_SINGAPORE', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // West India → Philippines/Thailand/Vietnam (via Chennai hub + Southeast Asia)
    if (startRegion === 'WEST_INDIA' && 
        (endRegion === 'PHILIPPINES' || endRegion === 'THAILAND' || endRegion === 'VIETNAM')) {
      console.log(`   🔄 Using hub routing: West → Chennai → ${endRegion}`);
      return { set: 'INDIA_TO_PHILIPPINES', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // Philippines/Thailand/Vietnam → West India (reverse)
    if ((startRegion === 'PHILIPPINES' || endRegion === 'THAILAND' || endRegion === 'VIETNAM') && 
        endRegion === 'WEST_INDIA') {
      console.log(`   🔄 Using hub routing: ${startRegion} → Chennai → West`);
      return { set: 'INDIA_TO_PHILIPPINES', bidirectional: true, viaHub: 'CHENNAI' };
    }
    
    // ========== DIRECT ROUTES (No hub needed) ==========
    
    // Mumbai/West India → Middle East (direct Arabian Sea route)
    if ((startRegion === 'WEST_INDIA' || startRegion === 'SOUTH_INDIA') && 
        endRegion === 'MIDDLE_EAST') {
      return { set: 'INDIA_TO_MIDDLE_EAST', bidirectional: true };
    }
    
    // East India → Singapore (direct via Bay of Bengal)
    if (startRegion === 'EAST_INDIA' && 
        (endRegion === 'SINGAPORE' || endRegion === 'MALAYSIA')) {
      return { set: 'INDIA_TO_SINGAPORE', bidirectional: true };
    }
    
    // East India → Philippines (direct via Andaman Sea)
    if (startRegion === 'EAST_INDIA' && 
        (endRegion === 'PHILIPPINES' || endRegion === 'THAILAND' || endRegion === 'VIETNAM')) {
      return { set: 'INDIA_TO_PHILIPPINES', bidirectional: true };
    }
    
    // India → East Africa (trans-Indian Ocean route)
    if ((startRegion === 'WEST_INDIA' || startRegion === 'EAST_INDIA') && 
        endRegion === 'EAST_AFRICA') {
      return { set: 'INDIA_TO_AFRICA', bidirectional: true };
    }
    
    // Southeast Asia interconnection
    if ((startRegion === 'SINGAPORE' || startRegion === 'MALAYSIA') && 
        (endRegion === 'PHILIPPINES' || endRegion === 'INDONESIA')) {
      return { set: 'SOUTHEAST_ASIA_ROUTES', bidirectional: true };
    }
    
    return null;
  }

  /**
   * Check if route needs strategic waypoints
   * Use for long routes or routes that go around land masses
   * PRIORITIZE RELIABILITY over speed - it's okay to take time for accurate results
   */
  needsStrategicWaypoints(start, end) {
    // Calculate distance in degrees
    const distance = Math.sqrt(
      Math.pow(end.lat - start.lat, 2) + 
      Math.pow(end.lon - start.lon, 2)
    );
    
    // Get regions first
    const startRegion = this.getRegion(start.lat, start.lon);
    const endRegion = this.getRegion(end.lat, end.lon);
    
    // CRITICAL ROUTES: Always use waypoints (routes that MUST go around land)
    // West to East coast (goes around India) - always use waypoints
    if (startRegion === 'WEST_INDIA' && endRegion === 'EAST_INDIA') {
      console.log(`   🔄 West-to-East coast route (requires circumnavigation)`);
      return true;
    }
    
    // East to West coast
    if (startRegion === 'EAST_INDIA' && endRegion === 'WEST_INDIA') {
      console.log(`   🔄 East-to-West coast route (requires circumnavigation)`);
      return true;
    }
    
    // West India to Bangladesh (goes around east coast)
    if (startRegion === 'WEST_INDIA' && endRegion === 'BANGLADESH') {
      console.log(`   🔄 West India to Bangladesh (requires circumnavigation)`);
      return true;
    }
    
    // Use waypoints for routes longer than 8 degrees (~900km)
    // This prevents "out of grid" errors and ensures all ports work
    if (distance > 8) {
      console.log(`   📏 Long distance detected: ${(distance * 111).toFixed(0)}km - using waypoints for reliability`);
      return true;
    }
    
    // All other routes use direct A*
    return false;
  }

  /**
   * Get strategic waypoints for the route
   */
  getStrategicWaypoints(start, end) {
    const waypointInfo = this.selectWaypointSet(start, end);
    
    if (!waypointInfo) {
      console.log(`   ⚠️  No predefined waypoints, using direct route`);
      return null;
    }
    
    let waypoints = [...this.STRATEGIC_WAYPOINTS[waypointInfo.set]];
    
    // Reverse if going opposite direction
    if (waypointInfo.bidirectional) {
      const firstWp = waypoints[0];
      const lastWp = waypoints[waypoints.length - 1];
      
      const distToFirst = Math.sqrt(
        Math.pow(start.lat - firstWp.lat, 2) + 
        Math.pow(start.lon - firstWp.lon, 2)
      );
      
      const distToLast = Math.sqrt(
        Math.pow(start.lat - lastWp.lat, 2) + 
        Math.pow(start.lon - lastWp.lon, 2)
      );
      
      if (distToLast < distToFirst) {
        waypoints.reverse();
        console.log(`   🔄 Reversed waypoint order`);
      }
    }
    
    console.log(`   📍 Using waypoint set: ${waypointInfo.set} (${waypoints.length} points)`);
    
    return waypoints;
  }

  /**
   * Load cells only in a corridor along the route - OPTIMIZED
   */
  async loadCorridorCells(waypoints, corridorWidth = 2.0) {
    console.log(`   📦 Loading corridor cells (width: ${corridorWidth}°)...`);
    
    const allCells = [];
    const cellKeys = new Set();
    
    // Load all chunks ONCE (not per segment!)
    console.log(`   📦 Loading chunks from MongoDB...`);
    const chunks = await Grid.find({ isChunked: true }).select('cells').lean();
    console.log(`   ✅ Loaded ${chunks.length} chunks from database`);
    
    // Filter cells for corridor around each waypoint pair
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];
      
      const minLat = Math.min(wp1.lat, wp2.lat) - corridorWidth;
      const maxLat = Math.max(wp1.lat, wp2.lat) + corridorWidth;
      const minLon = Math.min(wp1.lon, wp2.lon) - corridorWidth;
      const maxLon = Math.max(wp1.lon, wp2.lon) + corridorWidth;
      
      // Filter cells from already-loaded chunks
      for (const chunk of chunks) {
        if (!chunk.cells) continue;
        
        for (const cell of chunk.cells) {
          if (cell.is_land || cell.obstacle) continue;
          
          if (cell.lat >= minLat && cell.lat <= maxLat &&
              cell.lon >= minLon && cell.lon <= maxLon) {
            
            const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
            if (!cellKeys.has(key)) {
              cellKeys.add(key);
              allCells.push(cell);
            }
          }
        }
      }
      
      if ((i + 1) % 3 === 0 && waypoints.length > 5) {
        console.log(`      Segment ${i + 1}/${waypoints.length - 1}... (${allCells.length} cells)`);
      }
    }
    
    console.log(`   ✅ Filtered to ${allCells.length} corridor cells`);
    return allCells;
  }

  /**
   * Calculate route using strategic waypoints
   * @param {Object} start - Start coordinates {lat, lon}
   * @param {Object} end - End coordinates {lat, lon}
   * @param {Object} routeFinder - RouteFinder instance
   * @param {Number} resolution - Grid resolution
   * @param {String} mode - Route mode: 'fuel-efficient', 'safe', 'optimal'
   */
  async calculateMultiSegmentRoute(start, end, routeFinder, resolution = 0.2, mode = 'optimal') {
    console.log(`\n🎯 === HIERARCHICAL MARITIME ROUTE OPTIMIZER ===`);
    console.log(`   📍 Route: (${start.lat}, ${start.lon}) → (${end.lat}, ${end.lon})`);
    console.log(`   🚢 Mode: ${mode}`);
    
    // Use hierarchical router for efficient long-distance routing
    const hierarchicalRouter = new HierarchicalRouter();
    
    try {
      // Pass 'this' (coastalOptimizer) to use predefined waypoints
      const result = await hierarchicalRouter.calculateRoute(start, end, routeFinder, this, mode);
      
      if (!result || !result.success) {
        throw new Error('Hierarchical routing failed');
      }
      
      // Format response to match expected API format
      const avgSpeed = 27.78; // km/h (15 knots)
      const fuelCostPerTon = 500;
      const totalFuelCost = result.fuelConsumption * fuelCostPerTon;
      
      return {
        success: true,
        path: result.path,
        totalDistance: Math.round(result.distance * 100) / 100,
        totalTime: Math.round(result.duration * 100) / 100,
        fuelCost: Math.round(totalFuelCost),
        safetyScore: 85,
        avgWind: 15,
        avgWaveHeight: 2,
        maxWind: 20,
        maxWave: 3,
        warnings: [],
        alerts: {
          critical: [],
          high: [],
          moderate: [],
          totalCount: 0,
          hasCritical: false,
          hasHigh: false
        },
        mode: mode,
        pointsCount: result.waypoints,
        modeSpecific: {
          efficiency: 85,
          recommendation: `Hierarchical ${mode} route optimized for long distance`,
          color: mode === 'fuel-efficient' ? '#22c55e' : mode === 'safe' ? '#3b82f6' : '#8b5cf6',
          strokeWidth: 3,
          dashArray: null,
          isDynamic: true
        },
        metrics: {
          efficiency: 85,
          safety: 85,
          fuel: Math.round(totalFuelCost),
          fuelPerKm: Math.round((totalFuelCost / result.distance) * 10) / 10,
          avgSpeed: avgSpeed,
          weatherScore: 85
        },
        style: {
          color: mode === 'fuel-efficient' ? '#22c55e' : mode === 'safe' ? '#3b82f6' : '#8b5cf6',
          strokeWidth: 3,
          dashArray: null,
          opacity: 0.8
        },
        calculatedAt: new Date().toISOString(),
        weatherDataAge: 'real-time',
        waypointMetadata: result.metadata
      };
      
    } catch (error) {
      console.error(`   ❌ Hierarchical routing error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CoastalRouteOptimizer;
