/**
 * 🚢 COASTAL ROUTING CORRIDORS
 * Pre-defined safe shipping lanes for reliable East Coast navigation
 * Based on actual commercial vessel routes
 */

const COASTAL_CORRIDORS = {
  
  // East Coast India Corridor (Chennai to Visakhapatnam)
  EAST_COAST_INDIA: {
    name: "East Coast India Shipping Lane",
    region: "BAY_OF_BENGAL",
    description: "Primary corridor for Chennai-Visakhapatnam-Paradip-Kolkata routes",
    waypoints: [
      // Chennai departure zone
      { lat: 13.05, lon: 80.35, name: "Chennai Outer Anchorage", type: "departure" },
      { lat: 13.50, lon: 80.40, name: "North Chennai", type: "corridor" },
      { lat: 14.00, lon: 80.50, name: "Nellore Offshore", type: "corridor" },
      { lat: 14.50, lon: 80.60, name: "Ongole Offshore", type: "corridor" },
      { lat: 15.00, lon: 80.70, name: "Machilipatnam Offshore", type: "corridor" },
      { lat: 15.50, lon: 80.80, name: "Krishna Delta Offshore", type: "corridor" },
      { lat: 16.00, lon: 81.00, name: "Kakinada Offshore", type: "corridor" },
      { lat: 16.50, lon: 81.30, name: "Visakhapatnam Approach South", type: "approach" },
      { lat: 17.50, lon: 83.00, name: "Visakhapatnam Outer Anchorage", type: "arrival" },
      { lat: 17.70, lon: 83.25, name: "Visakhapatnam Inner Approach", type: "port" },
      
      // Continue north to Paradip/Kolkata
      { lat: 18.00, lon: 84.00, name: "Gopalpur Offshore", type: "corridor" },
      { lat: 19.00, lon: 85.00, name: "Puri Offshore", type: "corridor" },
      { lat: 19.80, lon: 86.00, name: "Paradip Approach", type: "approach" },
      { lat: 20.30, lon: 86.70, name: "Paradip Outer Anchorage", type: "arrival" },
      { lat: 21.00, lon: 87.50, name: "Digha Offshore", type: "corridor" },
      { lat: 21.50, lon: 88.00, name: "Haldia Approach", type: "approach" }
    ],
    
    minDistanceFromShore: 15, // km
    maxDistanceFromShore: 50, // km
    allowedDepthRange: [20, 4000] // meters
  },
  
  // Bay of Bengal Crossing (Chennai to Bangladesh)
  BAY_OF_BENGAL_CROSSING: {
    name: "Bay of Bengal Direct Route",
    region: "BAY_OF_BENGAL",
    description: "Deep water route across Bay of Bengal to Bangladesh",
    waypoints: [
      { lat: 13.05, lon: 80.35, name: "Chennai Departure", type: "departure" },
      { lat: 14.00, lon: 82.00, name: "Bay Entry Point", type: "corridor" },
      { lat: 16.00, lon: 85.00, name: "Mid Bay Waypoint 1", type: "corridor" },
      { lat: 18.00, lon: 87.50, name: "Mid Bay Waypoint 2", type: "corridor" },
      { lat: 20.00, lon: 89.00, name: "Bangladesh Approach", type: "approach" },
      { lat: 21.50, lon: 90.50, name: "Chittagong Offshore", type: "arrival" }
    ],
    minDistanceFromShore: 50,
    maxDistanceFromShore: 300
  }
};

/**
 * Port-specific approach waypoints for accurate port entry
 */
const PORT_APPROACH_WAYPOINTS = {
  
  // Visakhapatnam Port
  'Vishakhapatnam': {
    portCoordinates: { lat: 17.6868, lon: 83.2985 },
    approachSequence: [
      {
        lat: 17.50,
        lon: 83.00,
        name: "Visakhapatnam Outer Anchorage",
        distance_from_port: 40,
        type: "anchorage"
      },
      {
        lat: 17.60,
        lon: 83.15,
        name: "Pilot Boarding Station",
        distance_from_port: 20,
        type: "pilot_station"
      },
      {
        lat: 17.65,
        lon: 83.25,
        name: "Inner Approach Channel",
        distance_from_port: 8,
        type: "channel_entry"
      }
    ]
  },
  
  // Mumbai Port
  'Mumbai': {
    portCoordinates: { lat: 18.97, lon: 72.87 },
    approachSequence: [
      {
        lat: 18.90,
        lon: 72.75,
        name: "Mumbai Outer Anchorage",
        distance_from_port: 15,
        type: "anchorage"
      },
      {
        lat: 18.95,
        lon: 72.82,
        name: "Mumbai Pilot Station",
        distance_from_port: 8,
        type: "pilot_station"
      }
    ]
  },
  
  // Chennai Port
  'Chennai': {
    portCoordinates: { lat: 13.08, lon: 80.27 },
    approachSequence: [
      {
        lat: 13.05,
        lon: 80.35,
        name: "Chennai Outer Anchorage",
        distance_from_port: 10,
        type: "anchorage"
      }
    ]
  }
};

/**
 * Detect if route needs coastal corridor routing
 */
function needsCoastalCorridor(startLat, startLon, endLat, endLon) {
  // East coast routes (within Bay of Bengal region)
  const isEastCoastRoute = (
    (startLon > 79 && startLon < 89 && endLon > 79 && endLon < 89) &&
    (startLat > 8 && startLat < 23 && endLat > 8 && endLat < 23)
  );
  
  // West to East coast crossing (Mumbai to Visakhapatnam type routes)
  const isWestToEastCrossing = (
    (startLon < 75 && endLon > 80) || (startLon > 80 && endLon < 75)
  ) && Math.abs(endLat - startLat) < 10;
  
  // Bay of Bengal crossing
  const isBayOfBengalCrossing = (
    Math.abs(endLon - startLon) > 8 &&
    startLat > 10 && endLat > 10
  );
  
  return { isEastCoastRoute, isWestToEastCrossing, isBayOfBengalCrossing };
}

/**
 * Get relevant corridor waypoints for a route
 */
function getCorridorWaypoints(startPort, endPort) {
  const { lat: startLat, lon: startLon } = startPort;
  const { lat: endLat, lon: endLon } = endPort;
  
  const { isEastCoastRoute, isWestToEastCrossing, isBayOfBengalCrossing } = 
    needsCoastalCorridor(startLat, startLon, endLat, endLon);
  
  if (isBayOfBengalCrossing) {
    return COASTAL_CORRIDORS.BAY_OF_BENGAL_CROSSING.waypoints;
  }
  
  if (isEastCoastRoute || isWestToEastCrossing) {
    // Filter waypoints between start and end latitudes
    const minLat = Math.min(startLat, endLat) - 1.0;
    const maxLat = Math.max(startLat, endLat) + 1.0;
    
    const filtered = COASTAL_CORRIDORS.EAST_COAST_INDIA.waypoints.filter(wp => 
      wp.lat >= minLat && wp.lat <= maxLat
    );
    
    // Sort by latitude based on direction
    if (endLat > startLat) {
      return filtered.sort((a, b) => a.lat - b.lat); // North-bound
    } else {
      return filtered.sort((a, b) => b.lat - a.lat); // South-bound
    }
  }
  
  return [];
}

/**
 * Get port approach waypoints
 */
function getPortApproachWaypoints(portName) {
  // Normalize port name
  const normalizedName = portName.trim();
  
  const portData = PORT_APPROACH_WAYPOINTS[normalizedName];
  return portData?.approachSequence || [];
}

/**
 * Check if route should use corridor (for Mumbai-Visakhapatnam specifically)
 */
function shouldUseCorridor(startPort, endPort) {
  const startName = startPort.name || '';
  const endName = endPort.name || '';
  
  // Mumbai to Visakhapatnam or vice versa
  if ((startName.includes('Mumbai') && endName.includes('Vishakhapatnam')) ||
      (startName.includes('Vishakhapatnam') && endName.includes('Mumbai'))) {
    return true;
  }
  
  // Any west coast to east coast route
  const { isWestToEastCrossing } = needsCoastalCorridor(
    startPort.lat, startPort.lon,
    endPort.lat, endPort.lon
  );
  
  return isWestToEastCrossing;
}

module.exports = {
  COASTAL_CORRIDORS,
  PORT_APPROACH_WAYPOINTS,
  needsCoastalCorridor,
  getCorridorWaypoints,
  getPortApproachWaypoints,
  shouldUseCorridor
};
