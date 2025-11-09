/**
 * 🗺️ SHAPEFILE-BASED LAND DETECTION
 * 
 * This module uses shapefiles (SHP) for 100% accurate land/water detection.
 * Uses point-in-polygon algorithm with Turf.js for precision.
 * 
 * Recommended shapefiles:
 * - Natural Earth (10m resolution): https://www.naturalearthdata.com/downloads/10m-physical-vectors/
 * - GSHHG (Global Self-consistent Hierarchical High-resolution Geography)
 * 
 * Usage:
 *   const landDetector = new ShapefileLandDetector('./path/to/land.shp');
 *   await landDetector.load();
 *   const isLand = landDetector.isPointOnLand(19.1, 72.6);
 */

const shapefile = require('shapefile');
const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

class ShapefileLandDetector {
  constructor(shapefilePath) {
    this.shapefilePath = shapefilePath;
    this.landPolygons = [];
    this.loaded = false;
    this.stats = {
      totalPolygons: 0,
      totalPoints: 0,
      loadTime: 0
    };
  }

  /**
   * Load shapefile and convert to GeoJSON polygons
   */
  async load() {
    console.log('🗺️  Loading shapefile:', this.shapefilePath);
    const startTime = Date.now();

    try {
      // Check if file exists
      if (!fs.existsSync(this.shapefilePath)) {
        throw new Error(`Shapefile not found: ${this.shapefilePath}`);
      }

      // Read shapefile
      const source = await shapefile.open(this.shapefilePath);
      let result;
      let featureCount = 0;

      // Process each feature
      while (true) {
        result = await source.read();
        if (result.done) break;

        const feature = result.value;
        featureCount++;

        // Convert to Turf polygon for point-in-polygon checks
        if (feature.geometry) {
          try {
            let polygon;
            
            // Handle different geometry types
            if (feature.geometry.type === 'Polygon') {
              polygon = turf.polygon(feature.geometry.coordinates);
            } else if (feature.geometry.type === 'MultiPolygon') {
              // For MultiPolygon, create multiple polygons
              feature.geometry.coordinates.forEach(coords => {
                const poly = turf.polygon(coords);
                this.landPolygons.push(poly);
              });
              continue;
            } else {
              console.warn(`⚠️  Skipping unsupported geometry type: ${feature.geometry.type}`);
              continue;
            }

            this.landPolygons.push(polygon);
          } catch (err) {
            console.warn(`⚠️  Error processing feature ${featureCount}:`, err.message);
          }
        }

        // Progress update every 100 features
        if (featureCount % 100 === 0) {
          console.log(`   Processed ${featureCount} features...`);
        }
      }

      this.stats.totalPolygons = this.landPolygons.length;
      this.stats.loadTime = (Date.now() - startTime) / 1000;
      this.loaded = true;

      console.log('✅ Shapefile loaded successfully!');
      console.log(`   📊 Total features: ${featureCount}`);
      console.log(`   🗺️  Total polygons: ${this.landPolygons.length}`);
      console.log(`   ⏱️  Load time: ${this.stats.loadTime.toFixed(2)}s`);

      return true;
    } catch (error) {
      console.error('❌ Error loading shapefile:', error.message);
      throw error;
    }
  }

  /**
   * Check if a point (lat, lon) is on land
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean} - True if point is on land
   */
  isPointOnLand(lat, lon) {
    if (!this.loaded) {
      throw new Error('Shapefile not loaded. Call load() first.');
    }

    // Create point (Turf uses [lon, lat] format!)
    const point = turf.point([lon, lat]);

    // Check if point is inside any land polygon
    for (const polygon of this.landPolygons) {
      try {
        if (turf.booleanPointInPolygon(point, polygon)) {
          return true; // Point is on land
        }
      } catch (err) {
        // Skip invalid polygons
        continue;
      }
    }

    return false; // Point is in water
  }

  /**
   * Batch check multiple points (more efficient)
   * @param {Array<{lat, lon}>} points - Array of points to check
   * @returns {Array<boolean>} - Array of results
   */
  checkMultiplePoints(points) {
    if (!this.loaded) {
      throw new Error('Shapefile not loaded. Call load() first.');
    }

    return points.map(p => this.isPointOnLand(p.lat, p.lon));
  }

  /**
   * Get statistics about loaded shapefile
   */
  getStats() {
    return this.stats;
  }
}

// Export for use in other modules
module.exports = ShapefileLandDetector;

// CLI usage example
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🗺️  SHAPEFILE LAND DETECTOR - CLI Usage

Usage:
  node landDetectionShapefile.js <shapefile.shp> [lat] [lon]

Examples:
  # Load and test a single point
  node landDetectionShapefile.js ./data/land.shp 19.1 72.6

  # Just load and show stats
  node landDetectionShapefile.js ./data/land.shp

Download shapefiles from:
  - Natural Earth: https://www.naturalearthdata.com/downloads/10m-physical-vectors/
  - File: ne_10m_land.shp (extract from ZIP)
    `);
    process.exit(1);
  }

  const shapefilePath = args[0];
  const testLat = args[1] ? parseFloat(args[1]) : null;
  const testLon = args[2] ? parseFloat(args[2]) : null;

  (async () => {
    try {
      const detector = new ShapefileLandDetector(shapefilePath);
      await detector.load();

      if (testLat !== null && testLon !== null) {
        console.log(`\n🔍 Testing point: (${testLat}, ${testLon})`);
        const isLand = detector.isPointOnLand(testLat, testLon);
        console.log(`   Result: ${isLand ? '🏝️  LAND' : '🌊 WATER'}`);
      }

      console.log('\n✨ Shapefile loaded and ready for use!');
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
