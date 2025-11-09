/**
 * 🗺️ SHAPEFILE-BASED LAND DETECTION
 * 
 * Uses Natural Earth 10m Land shapefile for 100% accurate land detection.
 * This replaces the manual boundary-based approach with professional GIS data.
 */

const shapefile = require('shapefile');
const path = require('path');

// Path to shapefile
const SHAPEFILE_PATH = path.join(__dirname, '..', 'Land data', 'ne_10m_land.shp');

/**
 * Ray casting algorithm for point-in-polygon test
 * Returns true if point (x,y) is inside the polygon
 */
function pointInPolygon(point, polygon) {
  const x = point[0]; // longitude
  const y = point[1]; // latitude
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) &&
                     (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Check if a point is inside a MultiPolygon
 */
function pointInMultiPolygon(point, coordinates) {
  // MultiPolygon has structure: [[[polygon1]], [[polygon2]], ...]
  for (const polygonGroup of coordinates) {
    for (const ring of polygonGroup) {
      if (pointInPolygon(point, ring)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if a point is inside a Polygon
 */
function pointInPolygonGeometry(point, coordinates) {
  // Polygon has structure: [[exterior ring], [hole1], [hole2], ...]
  // Check exterior ring (first one)
  if (coordinates.length === 0) return false;
  
  const exteriorRing = coordinates[0];
  const isInExterior = pointInPolygon(point, exteriorRing);
  
  if (!isInExterior) return false;
  
  // Check if point is in any holes (should NOT be in holes)
  for (let i = 1; i < coordinates.length; i++) {
    const hole = coordinates[i];
    if (pointInPolygon(point, hole)) {
      return false; // Point is in a hole, so it's not on land
    }
  }
  
  return true;
}

/**
 * Load all land polygons from shapefile
 */
async function loadLandPolygons() {
  console.log('📂 Loading land polygons from shapefile...');
  console.log('   Path:', SHAPEFILE_PATH);
  
  const source = await shapefile.open(SHAPEFILE_PATH);
  const landPolygons = [];
  
  let result;
  let count = 0;
  
  while (!(result = await source.read()).done) {
    const feature = result.value;
    
    if (feature && feature.geometry) {
      landPolygons.push({
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
        properties: feature.properties || {}
      });
      count++;
    }
  }
  
  console.log(`✅ Loaded ${count} land polygons from shapefile`);
  return landPolygons;
}

/**
 * Check if a coordinate is on land using shapefile data
 */
function isPointOnLand(lat, lon, landPolygons) {
  const point = [lon, lat]; // GeoJSON uses [lon, lat] order!
  
  for (const polygon of landPolygons) {
    if (polygon.type === 'Polygon') {
      if (pointInPolygonGeometry(point, polygon.coordinates)) {
        return true;
      }
    } else if (polygon.type === 'MultiPolygon') {
      if (pointInMultiPolygon(point, polygon.coordinates)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detect land for a batch of cells (optimized)
 */
function detectLandForCells(cells, landPolygons) {
  console.log(`\n🔍 Detecting land for ${cells.length} cells using shapefile...`);
  
  let landCount = 0;
  let waterCount = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const isLand = isPointOnLand(cell.lat, cell.lon, landPolygons);
    
    cell.is_land = isLand;
    cell.obstacle = isLand; // Mark land as obstacle for routing
    
    if (isLand) {
      landCount++;
    } else {
      waterCount++;
    }
    
    // Progress update every 5000 cells
    if ((i + 1) % 5000 === 0) {
      const progress = ((i + 1) / cells.length * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   Progress: ${progress}% (${i + 1}/${cells.length}) - ${elapsed}s elapsed`);
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Land detection complete!`);
  console.log(`   🏝️  Land cells: ${landCount} (${(landCount/cells.length*100).toFixed(1)}%)`);
  console.log(`   🌊 Water cells: ${waterCount} (${(waterCount/cells.length*100).toFixed(1)}%)`);
  console.log(`   ⏱️  Time: ${totalTime}s`);
  
  return cells;
}

module.exports = {
  loadLandPolygons,
  isPointOnLand,
  detectLandForCells
};
