const fs = require('fs');

// Read ports file
const portsData = fs.readFileSync('indianOceanPorts.json', 'utf8');
const portsObj = JSON.parse(portsData);
const ports = portsObj.ports;

// Read grid file to check which ports are on land
const gridData = fs.readFileSync('gridData.json', 'utf8');
const gridObj = JSON.parse(gridData);
const grid = gridObj.cells || gridObj;

console.log('🔍 Checking ALL ports for land/river locations...\n');

// Suspected river/inland port keywords
const riverKeywords = ['River', 'river', 'Creek', 'creek', 'Inland', 'inland'];

const problematicPorts = [];

for (const port of ports) {
  // Find closest grid cell
  let closestCell = null;
  let minDist = Infinity;
  
  for (const cell of grid) {
    const dist = Math.abs(cell.lat - port.lat) + Math.abs(cell.lon - port.lon);
    if (dist < minDist) {
      minDist = dist;
      closestCell = cell;
    }
  }
  
  if (closestCell) {
    const distKm = minDist * 111;
    
    // Mark as problematic if:
    // 1. On land cell
    // 2. Name contains river keywords
    // 3. Very far from nearest grid cell (>30km means likely inland)
    if (closestCell.is_land || 
        riverKeywords.some(kw => port.name.includes(kw)) ||
        distKm > 30) {
      
      problematicPorts.push({
        name: port.name,
        country: port.country,
        lat: port.lat,
        lon: port.lon,
        cellLat: closestCell.lat,
        cellLon: closestCell.lon,
        isLand: closestCell.is_land,
        distance: distKm.toFixed(1),
        reason: closestCell.is_land ? '❌ ON LAND' : 
                riverKeywords.some(kw => port.name.includes(kw)) ? '⚠️ RIVER NAME' :
                '📍 FAR FROM GRID'
      });
    }
  }
}

console.log(`Found ${problematicPorts.length} problematic ports:\n`);

problematicPorts.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name} (${p.country})`);
  console.log(`   Coordinates: ${p.lat}, ${p.lon}`);
  console.log(`   Nearest cell: ${p.cellLat}, ${p.cellLon}`);
  console.log(`   Distance: ${p.distance} km`);
  console.log(`   Status: ${p.reason}`);
  console.log('');
});

console.log('\n📊 Summary:');
console.log(`Total ports: ${ports.length}`);
console.log(`Problematic ports: ${problematicPorts.length}`);
console.log(`Should remove: ${problematicPorts.filter(p => p.isLand).length} (on land)`);

// Write to file for review
fs.writeFileSync('problematic_ports.json', JSON.stringify(problematicPorts, null, 2));
console.log('\n✅ Details saved to problematic_ports.json');
