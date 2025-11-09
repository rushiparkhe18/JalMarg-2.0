/**
 * 🚀 PRECOMPUTED ROUTE CACHE MANAGER
 * Ultra-fast route retrieval for common hub-to-hub segments
 * Eliminates computation time for frequently used routes
 */

const fs = require('fs');
const path = require('path');

class PrecomputedRouteCache {
  constructor() {
    this.cache = null;
    this.loadCache();
  }

  /**
   * Load precomputed routes from JSON file
   */
  loadCache() {
    try {
      const cachePath = path.join(__dirname, 'precomputedRoutes.json');
      const data = fs.readFileSync(cachePath, 'utf8');
      this.cache = JSON.parse(data);
      console.log(`✅ Loaded ${Object.keys(this.cache.routes).length} precomputed routes`);
    } catch (error) {
      console.warn('⚠️  Could not load precomputed routes cache:', error.message);
      this.cache = { routes: {} };
    }
  }

  /**
   * Generate cache key for route lookup
   */
  generateKey(from, to, mode) {
    // Normalize coordinates to 2 decimal places
    const fromLat = from.lat.toFixed(2);
    const fromLon = from.lon.toFixed(2);
    const toLat = to.lat.toFixed(2);
    const toLon = to.lon.toFixed(2);
    
    // Check if this matches any hub-to-hub route
    const hubs = {
      MUMBAI: { lat: 18.97, lon: 72.87 },
      CHENNAI: { lat: 13.08, lon: 80.27 },
      VISAKHAPATNAM: { lat: 17.68, lon: 83.30 },
      KOCHI: { lat: 9.97, lon: 76.27 },
      BANGLADESH: { lat: 22.0, lon: 89.8 },
      SINGAPORE: { lat: 1.28, lon: 103.85 }
    };

    // Find matching hubs (within 0.5° tolerance)
    let fromHub = null;
    let toHub = null;

    for (const [name, coords] of Object.entries(hubs)) {
      if (Math.abs(from.lat - coords.lat) < 0.5 && Math.abs(from.lon - coords.lon) < 0.5) {
        fromHub = name;
      }
      if (Math.abs(to.lat - coords.lat) < 0.5 && Math.abs(to.lon - coords.lon) < 0.5) {
        toHub = name;
      }
    }

    if (!fromHub || !toHub) return null;

    // Normalize mode name
    const normalizedMode = mode.toLowerCase().replace(/_/g, '').replace('efficient', '');
    
    // Try both directions
    const key1 = `${fromHub}_${toHub}_${normalizedMode.toUpperCase()}`;
    const key2 = `${toHub}_${fromHub}_${normalizedMode.toUpperCase()}`;

    return { key1, key2, fromHub, toHub };
  }

  /**
   * Get precomputed route if available
   * Returns route object or null if not found
   */
  getRoute(from, to, mode) {
    if (!this.cache || !this.cache.routes) {
      console.log('   ⚠️  Cache not loaded');
      return null;
    }

    const keys = this.generateKey(from, to, mode);
    if (!keys) {
      console.log(`   ⚠️  No hub match for ${from.lat.toFixed(2)},${from.lon.toFixed(2)} → ${to.lat.toFixed(2)},${to.lon.toFixed(2)}`);
      return null;
    }

    console.log(`   🔍 Checking cache: ${keys.key1} or ${keys.key2}`);

    // Try forward direction
    let route = this.cache.routes[keys.key1];
    
    // Try reverse direction if not found
    if (!route) {
      route = this.cache.routes[keys.key2];
      if (route) {
        console.log(`   🔄 Using reversed cached route: ${keys.key2}`);
        // Reverse the path
        route = {
          ...route,
          from: route.to,
          to: route.from,
          path: [...route.path].reverse(),
          reversed: true
        };
      } else {
        console.log(`   ❌ No cached route found for ${keys.fromHub} → ${keys.toHub} (${mode})`);
      }
    } else {
      console.log(`   ✅ Found cached route: ${keys.key1}`);
    }

    if (route) {
      console.log(`   🚀 Using precomputed route: ${keys.fromHub} → ${keys.toHub} (${mode})`);
      console.log(`      Distance: ${route.distance} km, Waypoints: ${route.waypoints}`);
      return route;
    }

    return null;
  }

  /**
   * Check if route can be served from cache
   */
  hasRoute(from, to, mode) {
    return this.getRoute(from, to, mode) !== null;
  }

  /**
   * Get all available precomputed routes
   */
  getAvailableRoutes() {
    if (!this.cache || !this.cache.routes) return [];
    return Object.keys(this.cache.routes);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    if (!this.cache || !this.cache.routes) {
      return { totalRoutes: 0, modes: [], hubs: [] };
    }

    const routes = this.cache.routes;
    const modes = new Set();
    const hubs = new Set();

    Object.values(routes).forEach(route => {
      modes.add(route.mode);
      hubs.add(route.from.name);
      hubs.add(route.to.name);
    });

    return {
      totalRoutes: Object.keys(routes).length,
      modes: Array.from(modes),
      hubs: Array.from(hubs),
      version: this.cache.metadata?.version || 'unknown',
      lastUpdated: this.cache.metadata?.lastUpdated || 'unknown'
    };
  }
}

module.exports = PrecomputedRouteCache;
