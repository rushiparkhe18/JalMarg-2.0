/**
 * Parse Indian Ocean Ports CSV and generate ports database
 * Filters only ports in the Indian Ocean region
 */

const fs = require('fs');
const path = require('path');

function parseCSV() {
  console.log('📊 Parsing Indian Ocean Ports CSV file...\n');

  const csvPath = path.join(__dirname, '..', 'Indian Ocean Ports Data-updated.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  
  console.log(`✅ Found ${lines.length} total rows in CSV file\n`);
  
  // Parse header
  const header = lines[0].split(',');
  const portNameIndex = header.findIndex(h => h.includes('Main Port Name'));
  const countryIndex = header.findIndex(h => h.includes('Country'));
  const regionIndex = header.findIndex(h => h.includes('Region Name'));
  const waterBodyIndex = header.findIndex(h => h.includes('World Water Body'));
  const latIndex = header.findIndex(h => h.includes('Latitude'));
  const lonIndex = header.findIndex(h => h.includes('Longitude'));

  console.log('📍 Column indices:');
  console.log(`   Port Name: ${portNameIndex}`);
  console.log(`   Country: ${countryIndex}`);
  console.log(`   Region: ${regionIndex}`);
  console.log(`   Water Body: ${waterBodyIndex}`);
  console.log(`   Latitude: ${latIndex}`);
  console.log(`   Longitude: ${lonIndex}\n`);

  // Indian Ocean keywords to filter
  const indianOceanKeywords = [
    'Indian Ocean',
    'Andaman Sea',
    'Arabian Sea',
    'Bay of Bengal',
    'Red Sea',
    'Persian Gulf',
    'Gulf of Aden',
    'Mozambique Channel',
    'Teluk Bone',
    'Banda Sea'
  ];

  // Countries in Indian Ocean region
  const indianOceanCountries = [
    'India', 'Indonesia', 'Burma', 'Thailand', 'Malaysia', 'Singapore',
    'Sri Lanka', 'Maldives', 'Bangladesh', 'Pakistan', 'Oman', 'Yemen',
    'Somalia', 'Kenya', 'Tanzania', 'Mozambique', 'South Africa',
    'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Australia',
    'Saudi Arabia', 'United Arab Emirates', 'Iran', 'Iraq', 'Kuwait',
    'Bahrain', 'Qatar', 'Djibouti', 'Eritrea', 'Sudan', 'Egypt'
  ];

  const ports = [];
  let validCount = 0;
  let skipCount = 0;

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma but handle quoted fields
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const portName = values[portNameIndex]?.trim();
    const country = values[countryIndex]?.trim();
    const region = values[regionIndex]?.trim() || '';
    const waterBody = values[waterBodyIndex]?.trim() || '';
    const lat = parseFloat(values[latIndex]);
    const lon = parseFloat(values[lonIndex]);

    // Filter for Indian Ocean ports
    const isIndianOcean = 
      indianOceanKeywords.some(keyword => waterBody.includes(keyword)) ||
      indianOceanCountries.some(c => country?.includes(c));

    // Additional coordinate filter for Indian Ocean region
    const inIndianOceanCoords = (
      lat >= -38.4 && lat <= 30.58 &&
      lon >= 22.15 && lon <= 142.48
    );

    if (portName && country && !isNaN(lat) && !isNaN(lon) && (isIndianOcean || inIndianOceanCoords)) {
      ports.push({
        name: portName,
        country: country,
        region: region || waterBody || 'Indian Ocean',
        lat: lat,
        lon: lon,
        waterBody: waterBody
      });
      validCount++;
    } else {
      skipCount++;
    }
  }

  console.log(`\n📊 Processing Results:`);
  console.log(`   Indian Ocean ports: ${validCount}`);
  console.log(`   Skipped (outside region): ${skipCount}\n`);

  // Group by country
  const byCountry = {};
  ports.forEach(port => {
    if (!byCountry[port.country]) {
      byCountry[port.country] = [];
    }
    byCountry[port.country].push(port);
  });

  console.log('📍 Ports by Country:');
  Object.keys(byCountry).sort().forEach(country => {
    console.log(`   ${country}: ${byCountry[country].length} ports`);
  });

  // Generate JavaScript module
  const jsContent = `/**
 * Indian Ocean Ports Database
 * Generated from Indian Ocean Ports Data-updated.csv
 * Filtered for Indian Ocean region only
 * Total ports: ${validCount}
 * Coverage: Latitude -38.4° to 30.58°, Longitude 22.15° to 142.48°
 * Generated: ${new Date().toISOString()}
 */

const INDIAN_OCEAN_PORTS = ${JSON.stringify(ports, null, 2)};

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
  const countries = [...new Set(INDIAN_OCEAN_PORTS.map(p => p.country))];
  return countries.sort();
}

function getRegions() {
  const regions = [...new Set(INDIAN_OCEAN_PORTS.map(p => p.region))];
  return regions.filter(r => r).sort();
}

function findNearestPort(lat, lon, maxResults = 10) {
  // Calculate distance using Haversine formula
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const portsWithDistance = INDIAN_OCEAN_PORTS.map(port => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(port.lat - lat);
    const dLon = toRad(port.lon - lon);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(port.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
`;

  // Save to file
  const outputPath = path.join(__dirname, 'indianOceanPorts.js');
  fs.writeFileSync(outputPath, jsContent);
  
  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`   Total ports: ${validCount}`);
  console.log(`   Countries: ${Object.keys(byCountry).length}\n`);

  // Save JSON version
  const jsonOutputPath = path.join(__dirname, 'indianOceanPorts.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify({
    metadata: {
      totalPorts: validCount,
      countries: Object.keys(byCountry).length,
      coverage: {
        latMin: -38.4,
        latMax: 30.58,
        lonMin: 22.15,
        lonMax: 142.48
      },
      generatedAt: new Date().toISOString(),
      source: 'Indian Ocean Ports Data-updated.csv'
    },
    ports: ports
  }, null, 2));
  
  console.log(`✅ Generated: ${jsonOutputPath}\n`);

  return ports;
}

// Run if called directly
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════');
  console.log('   📊 INDIAN OCEAN PORTS CSV PARSER');
  console.log('═══════════════════════════════════════════════════\n');
  
  const ports = parseCSV();
  
  console.log('✅ Parsing complete!\n');
  console.log('💡 Summary:');
  console.log(`   - ${ports.length} ports in Indian Ocean region`);
  console.log(`   - Coordinates: ${-38.4}° to ${30.58}° N, ${22.15}° to ${142.48}° E`);
  console.log(`   - Ready for use in dropdown and routing\n`);
  
  // Show sample ports
  console.log('📍 Sample ports (first 10):');
  ports.slice(0, 10).forEach(port => {
    console.log(`   ${port.name}, ${port.country} (${port.lat}, ${port.lon})`);
  });
}

module.exports = { parseCSV };
