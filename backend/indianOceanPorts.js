// Indian Ocean ports data
// Dynamically loaded from indianOceanPorts.json
const fs = require('fs');
const path = require('path');

// Load ports data from JSON file
let portsData;
try {
  const jsonPath = path.join(__dirname, 'indianOceanPorts.json');
  portsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`✅ Loaded ${portsData.ports.length} ports from indianOceanPorts.json`);
} catch (error) {
  console.error('❌ Error loading ports from JSON:', error);
  portsData = { ports: [] };
}

// Main port data array - loaded dynamically from JSON
const INDIAN_OCEAN_PORTS = portsData.ports || [];

// Helper functions
function getAllPorts() {
  return INDIAN_OCEAN_PORTS;
}

function getPortsByCountry(country) {
  return INDIAN_OCEAN_PORTS.filter(port => 
    port.country.toLowerCase() === country.toLowerCase()
  );
}

function getPortsByRegion(region) {
  return INDIAN_OCEAN_PORTS.filter(port => 
    port.region.toLowerCase().includes(region.toLowerCase()) ||
    port.waterBody.toLowerCase().includes(region.toLowerCase())
  );
}

function searchPorts(query) {
  const lowerQuery = query.toLowerCase();
  return INDIAN_OCEAN_PORTS.filter(port =>
    port.name.toLowerCase().includes(lowerQuery) ||
    port.country.toLowerCase().includes(lowerQuery) ||
    port.region.toLowerCase().includes(lowerQuery) ||
    port.waterBody.toLowerCase().includes(lowerQuery)
  );
}

function getCountries() {
  const countries = new Set(INDIAN_OCEAN_PORTS.map(port => port.country));
  return Array.from(countries).sort();
}

function getRegions() {
  const regions = new Set(INDIAN_OCEAN_PORTS.map(port => port.region));
  return Array.from(regions).sort();
}

function findNearestPort(lat, lon, maxResults = 5) {
  const R = 6371; // Earth's radius in km
  
  const portsWithDistance = INDIAN_OCEAN_PORTS.map(port => {
    const dLat = (port.lat - lat) * Math.PI / 180;
    const dLon = (port.lon - lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI / 180) * Math.cos(port.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return { ...port, distance: distance.toFixed(2) };
  });

  return portsWithDistance
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, maxResults);
}

function getPortByName(name) {
  return INDIAN_OCEAN_PORTS.find(port => 
    port.name.toLowerCase() === name.toLowerCase()
  );
}

module.exports = {
  INDIAN_OCEAN_PORTS,
  getAllPorts,
  getPortsByCountry,
  getPortsByRegion,
  searchPorts,
  getCountries,
  getRegions,
  findNearestPort,
  getPortByName
};
