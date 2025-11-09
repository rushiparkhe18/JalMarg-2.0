const gridData = require('./gridData.json');
const grid = gridData.cells || gridData;

console.log(`Total cells in gridData.json: ${grid.length}`);

let minLat = Infinity, maxLat = -Infinity;
let minLon = Infinity, maxLon = -Infinity;

for (const cell of grid) {
  if (cell.lat < minLat) minLat = cell.lat;
  if (cell.lat > maxLat) maxLat = cell.lat;
  if (cell.lon < minLon) minLon = cell.lon;
  if (cell.lon > maxLon) maxLon = cell.lon;
}

console.log('\nGrid bounds:');
console.log(`  Latitude: ${minLat}° to ${maxLat}°`);
console.log(`  Longitude: ${minLon}° to ${maxLon}°`);

// Check for cells near Mumbai
const nearMumbai = grid.filter(c => 
  Math.abs(c.lat - 18.97) < 0.5 && Math.abs(c.lon - 72.87) < 0.5
);
console.log(`\nCells near Mumbai (18.97, 72.87): ${nearMumbai.length}`);
if (nearMumbai.length > 0) {
  console.log('Sample:');
  nearMumbai.slice(0, 3).forEach(c => {
    console.log(`  (${c.lat}, ${c.lon}) - land: ${c.is_land}`);
  });
}

// Check for cells near Visakhapatnam
const nearVizag = grid.filter(c => 
  Math.abs(c.lat - 17.68) < 0.5 && Math.abs(c.lon - 83.30) < 0.5
);
console.log(`\nCells near Visakhapatnam (17.68, 83.30): ${nearVizag.length}`);
if (nearVizag.length > 0) {
  console.log('Sample:');
  nearVizag.slice(0, 3).forEach(c => {
    console.log(`  (${c.lat}, ${c.lon}) - land: ${c.is_land}`);
  });
}
