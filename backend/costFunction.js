/**/**

 * 🧮 MARITIME ROUTE COST FUNCTION * 🧮 MARITIME ROUTE COST FUNCTION

 * Calculates routing costs based on safety, fuel efficiency, and mode * Calculates routing costs based on safety, fuel efficiency, and mode

 */ */



const EARTH_RADIUS_KM = 6371;const EARTH_RADIUS_KM = 6371;



/**/**

 * Calculate Haversine distance between two points * Calculate Haversine distance between two points

 */ */

function haversineDistance(lat1, lon1, lat2, lon2) {function haversineDistance(lat1, lon1, lat2, lon2) {

  const toRad = (deg) => (deg * Math.PI) / 180;  const toRad = (deg) => (deg * Math.PI) / 180;

    

  const dLat = toRad(lat2 - lat1);  const dLat = toRad(lat2 - lat1);

  const dLon = toRad(lon2 - lon1);  const dLon = toRad(lon2 - lon1);

    

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +

            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *

            Math.sin(dLon / 2) * Math.sin(dLon / 2);            Math.sin(dLon / 2) * Math.sin(dLon / 2);

    

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;  return EARTH_RADIUS_KM * c;

}}



/**/**

 * Calculate bearing (direction) between two points * Calculate bearing (direction) between two points

 */ */

function calculateBearing(lat1, lon1, lat2, lon2) {function calculateBearing(lat1, lon1, lat2, lon2) {

  const toRad = (deg) => (deg * Math.PI) / 180;  const toRad = (deg) => (deg * Math.PI) / 180;

  const toDeg = (rad) => (rad * 180) / Math.PI;  const toDeg = (rad) => (rad * 180) / Math.PI;

    

  const dLon = toRad(lon2 - lon1);  const dLon = toRad(lon2 - lon1);

    

  const y = Math.sin(dLon) * Math.cos(toRad(lat2));  const y = Math.sin(dLon) * Math.cos(toRad(lat2));

  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -

            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    

  let bearing = toDeg(Math.atan2(y, x));  let bearing = toDeg(Math.atan2(y, x));

  return (bearing + 360) % 360; // Normalize to 0-360  return (bearing + 360) % 360; // Normalize to 0-360

}}



/**/**

 * Calculate turn penalty for heading changes * Calculate turn penalty for heading changes

 * Encourages smooth, fuel-efficient routes * Encourages smooth, fuel-efficient routes

 */ */

function calculateTurnPenalty(prevLat, prevLon, currLat, currLon, nextLat, nextLon) {function calculateTurnPenalty(prevLat, prevLon, currLat, currLon, nextLat, nextLon) {

  if (!prevLat || !prevLon) return 0; // First segment, no turn  if (!prevLat || !prevLon) return 0; // First segment, no turn

    

  const bearing1 = calculateBearing(prevLat, prevLon, currLat, currLon);  const bearing1 = calculateBearing(prevLat, prevLon, currLat, currLon);

  const bearing2 = calculateBearing(currLat, currLon, nextLat, nextLon);  const bearing2 = calculateBearing(currLat, currLon, nextLat, nextLon);

    

  let angle = Math.abs(bearing2 - bearing1);  let turnAngle = Math.abs(bearing2 - bearing1);

  if (angle > 180) angle = 360 - angle; // Normalize to 0-180  if (turnAngle > 180) turnAngle = 360 - turnAngle; // Use smaller angle

    

  // Exponential penalty for sharp turns  // Penalize sharp turns (exponential increase for turns > 30°)

  if (angle < 10) return 0; // No penalty for minor adjustments  if (turnAngle > 30) {

  if (angle < 30) return 2; // Small penalty (2km equivalent)    return Math.pow((turnAngle - 30) / 10, 2); // ~0 for 30°, ~4 for 50°, ~16 for 70°

  if (angle < 60) return 5; // Medium penalty (5km equivalent)  }

  if (angle < 90) return 10; // Large penalty (10km equivalent)  

  return 16; // Very large penalty for 90+ degree turns  return 0;

}}



/**/**

 * Check if cell is near coastline (adjacent to land cells) * Check if cell is near coastline

 */ * Returns true if any adjacent cell is land

function isNearCoast(cellLat, cellLon, gridCells, resolution = 0.2) { */

  // Check 8 surrounding cellsfunction isNearCoast(cellLat, cellLon, gridCells, resolution) {

  const offsets = [  const cellMap = new Map();

    [-resolution, 0], [resolution, 0], [0, -resolution], [0, resolution],  

    [-resolution, -resolution], [-resolution, resolution],  // Build fast lookup map

    [resolution, -resolution], [resolution, resolution]  for (const cell of gridCells) {

  ];    const key = `${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`;

      cellMap.set(key, cell);

  for (const [dlat, dlon] of offsets) {  }

    const neighborLat = cellLat + dlat;  

    const neighborLon = cellLon + dlon;  // Check 8 neighbors

      const offsets = [

    const neighbor = gridCells.find(cell =>     [-resolution, -resolution], [-resolution, 0], [-resolution, resolution],

      Math.abs(cell.lat - neighborLat) < resolution/2 &&    [0, -resolution],                              [0, resolution],

      Math.abs(cell.lon - neighborLon) < resolution/2    [resolution, -resolution],  [resolution, 0],   [resolution, resolution]

    );  ];

      

    if (neighbor && neighbor.is_land) {  for (const [dLat, dLon] of offsets) {

      return true; // Adjacent to land    const neighborKey = `${(cellLat + dLat).toFixed(1)},${(cellLon + dLon).toFixed(1)}`;

    }    const neighbor = cellMap.get(neighborKey);

  }    

      if (neighbor && (neighbor.is_land || neighbor.obstacle)) {

  return false;      return true; // Adjacent to land

}    }

  }

/**  

 * Calculate cell cost for A* routing  return false;

 */}

function calculateCellCost(currentCell, targetCell, goalLat, goalLon, mode = 'optimal', prevCell = null, gridCells = [], resolution = 0.2) {

  // Base cost: Haversine distance/**

  let cost = haversineDistance( * Calculate total cost for moving to a cell

    currentCell.lat, currentCell.lon, * Mode-specific weights applied here

    targetCell.lat, targetCell.lon */

  );function calculateCellCost(

    currentCell,

  // Add turn penalty (fuel consumption from course changes)  targetCell,

  if (prevCell) {  goalLat,

    const turnCost = calculateTurnPenalty(  goalLon,

      prevCell.lat, prevCell.lon,  mode,

      currentCell.lat, currentCell.lon,  prevCell = null,

      targetCell.lat, targetCell.lon  gridCells = [],

    );  resolution = 0.2

    cost += turnCost;) {

  }  // Base cost: Haversine distance

    const distance = haversineDistance(

  // Coastline penalty (safety)    currentCell.lat, currentCell.lon,

  if (targetCell.near_coast || isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {    targetCell.lat, targetCell.lon

    cost += 10; // Add 10km equivalent for cells near coastline  );

  }  

    let cost = distance;

  // Weather penalty (if available)  

  if (targetCell.weather) {  // 🚫 IMPASSABLE: Land or obstacle

    const windSpeed = targetCell.weather.windSpeed || 0;  if (targetCell.is_land || targetCell.obstacle) {

    const waveHeight = targetCell.weather.waveHeight || 0;    return Infinity;

      }

    if (windSpeed > 20 || waveHeight > 3) {  

      cost += 5; // Rough conditions  // 🛡️ SAFETY PENALTY: Near coastline (+10 km equivalent)

    }  if (isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {

  }    cost += 10;

    }

  // 📊 MODE-SPECIFIC ADJUSTMENTS  

  switch (mode) {  // 🔄 TURN PENALTY: Penalize direction changes for fuel efficiency (+2-16 km)

    case 'fuel-efficient':  if (prevCell) {

    case 'fuel':    const turnCost = calculateTurnPenalty(

      // Heavily penalize turns (fuel consumption from course changes)      prevCell.lat, prevCell.lon,

      if (prevCell) {      currentCell.lat, currentCell.lon,

        const turnCost = calculateTurnPenalty(      targetCell.lat, targetCell.lon

          prevCell.lat, prevCell.lon,    );

          currentCell.lat, currentCell.lon,    cost += turnCost * 2; // Scale to km equivalent

          targetCell.lat, targetCell.lon  }

        );  

        cost += turnCost * 3; // Triple turn penalty  // 🌊 OPEN WATER BONUS: Prefer deep ocean routes

      }  if (targetCell.open_water) {

          cost *= 0.95; // 5% discount for open water

      // Favor wind/current assistance (if data available)  }

      if (targetCell.weather) {  

        const windSpeed = targetCell.weather.windSpeed || 0;  // 📊 MODE-SPECIFIC ADJUSTMENTS

        const waveHeight = targetCell.weather.waveHeight || 0;  switch (mode) {

            case 'fuel-efficient':

        // Lower cost in favorable conditions      // Heavily penalize turns (fuel consumption from course changes)

        if (windSpeed < 15 && waveHeight < 2.5) {      if (prevCell) {

          cost *= 0.9;        const turnCost = calculateTurnPenalty(

        }          prevCell.lat, prevCell.lon,

      }          currentCell.lat, currentCell.lon,

      break;          targetCell.lat, targetCell.lon

              );

    case 'safe':        cost += turnCost * 3; // Triple turn penalty

      // Heavily penalize near-coast cells      }

      if (isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {      

        cost += 20; // Double the safety penalty      // Favor wind/current assistance (if data available)

      }      if (targetCell.weather) {

              const windSpeed = targetCell.weather.windSpeed || 0;

      // Penalize rough weather        const waveHeight = targetCell.weather.waveHeight || 0;

      if (targetCell.weather) {        

        const windSpeed = targetCell.weather.windSpeed || 0;        // Lower cost in favorable conditions

        const waveHeight = targetCell.weather.waveHeight || 0;        if (windSpeed < 15 && waveHeight < 2.5) {

                  cost *= 0.9;

        if (windSpeed > 25 || waveHeight > 4) {        }

          cost += 30; // Significant penalty for dangerous conditions      }

        }      break;

      }      

      break;    case 'safe':

            // Heavily penalize near-coast cells

    case 'optimal':      if (isNearCoast(targetCell.lat, targetCell.lon, gridCells, resolution)) {

      // Balanced approach (default costs apply)        cost += 20; // Double the safety penalty

      break;      }

            

    default:      // Penalize rough weather

      // Default to optimal      if (targetCell.weather) {

      break;        const windSpeed = targetCell.weather.windSpeed || 0;

  }        const waveHeight = targetCell.weather.waveHeight || 0;

          

  return cost;        if (windSpeed > 25 || waveHeight > 4) {

}          cost += 30; // Significant penalty for dangerous conditions

        }

/**      }

 * Calculate heuristic (estimated cost to goal)      break;

 * Uses straight-line Haversine distance      

 */    case 'optimal':

function calculateHeuristic(cellLat, cellLon, goalLat, goalLon) {      // Balanced approach (default costs apply)

  return haversineDistance(cellLat, cellLon, goalLat, goalLon);      break;

}      

    default:

module.exports = {      // Default to optimal

  haversineDistance,      break;

  calculateBearing,  }

  calculateTurnPenalty,  

  isNearCoast,  return cost;

  calculateCellCost,}

  calculateHeuristic

};/**

 * Calculate heuristic (estimated cost to goal)
 * Uses straight-line Haversine distance
 */
function calculateHeuristic(cellLat, cellLon, goalLat, goalLon) {
  return haversineDistance(cellLat, cellLon, goalLat, goalLon);
}

module.exports = {
  haversineDistance,
  calculateBearing,
  calculateTurnPenalty,
  isNearCoast,
  calculateCellCost,
  calculateHeuristic
};
