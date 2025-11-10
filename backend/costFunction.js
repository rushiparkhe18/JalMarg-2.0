/**
 * Maritime Route Cost Function
 * Calculates routing costs based on safety, fuel efficiency, and mode
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate Haversine distance between two points
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate bearing (direction) between two points
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  
  const dLon = toRad(lon2 - lon1);
  
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Calculate turn penalty for heading changes
 */
function calculateTurnPenalty(prevLat, prevLon, currLat, currLon, nextLat, nextLon) {
  if (!prevLat || !prevLon) return 0;
  
  const bearing1 = calculateBearing(prevLat, prevLon, currLat, currLon);
  const bearing2 = calculateBearing(currLat, currLon, nextLat, nextLon);
  
  let turnAngle = Math.abs(bearing2 - bearing1);
  if (turnAngle > 180) turnAngle = 360 - turnAngle;
  
  if (turnAngle > 30) {
    return Math.pow((turnAngle - 30) / 10, 2);
  }
  
  return 0;
}

/**
 * Check if cell is near coastline
 */
function isNearCoast(cellLat, cellLon, gridCells, resolution) {
  const cellMap = new Map();
  
  for (const cell of gridCells) {
    const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;
    cellMap.set(key, cell);
  }
  
  const offsets = [
    [-resolution, -resolution], [-resolution, 0], [-resolution, resolution],
    [0, -resolution], [0, resolution],
    [resolution, -resolution], [resolution, 0], [resolution, resolution]
  ];
  
  for (const [dLat, dLon] of offsets) {
    const neighborKey = `${(cellLat + dLat).toFixed(1)},${(cellLon + dLon).toFixed(1)}`;
    const neighbor = cellMap.get(neighborKey);
    
    if (neighbor && (neighbor.is_land || neighbor.obstacle)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate A* heuristic
 */
function calculateHeuristic(currentLat, currentLon, goalLat, goalLon) {
  return haversineDistance(currentLat, currentLon, goalLat, goalLon);
}

/**
 * Calculate cell cost for A* routing with mode-specific weights
 */
function calculateCellCost(currentCell, targetCell, goalLat, goalLon, mode = 'optimal', prevCell = null, gridCells = [], resolution = 0.2) {
  const distance = haversineDistance(
    currentCell.lat, currentCell.lon,
    targetCell.lat, targetCell.lon
  );
  
  let cost = distance;
  
  const weather = targetCell.weather || {};
  const windSpeed = weather.wind_speed_kmh || 0;
  const waveHeight = weather.wave_height_m || 0;
  const visibility = weather.visibility_km || 10;
  
  switch (mode) {
    case 'fuel':
    case 'fuel_efficient':
      if (waveHeight < 2.0) cost *= 0.90;
      else if (waveHeight > 3.5) cost *= 1.30;
      if (windSpeed > 40) cost *= 1.25;
      break;
      
    case 'safe':
      if (waveHeight > 4.0) cost *= 2.0;
      else if (waveHeight > 3.0) cost *= 1.5;
      if (windSpeed > 50) cost *= 1.8;
      else if (windSpeed > 40) cost *= 1.4;
      if (visibility < 5) cost *= 1.6;
      if (isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {
        cost *= 1.3;
      }
      break;
      
    case 'optimal':
    default:
      if (waveHeight > 3.5) cost *= 1.20;
      else if (waveHeight < 2.0) cost *= 0.95;
      if (windSpeed > 45) cost *= 1.15;
      if (isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {
        cost *= 1.10;
      }
      break;
  }
  
  if (prevCell) {
    const turnPenalty = calculateTurnPenalty(
      prevCell.lat, prevCell.lon,
      currentCell.lat, currentCell.lon,
      targetCell.lat, targetCell.lon
    );
    cost += turnPenalty;
  }
  
  return cost;
}

module.exports = {
  haversineDistance,
  calculateBearing,
  calculateTurnPenalty,
  isNearCoast,
  calculateHeuristic,
  calculateCellCost,
  EARTH_RADIUS_KM
};
