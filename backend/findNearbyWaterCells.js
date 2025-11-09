const gridData = require('./gridData.json');
const grid = gridData.cells || gridData;

console.log('🔍 Finding water cells near Visakhapatnam (17.68°N, 83.30°E)\n');

const vizagLat = 17.68;
const vizagLon = 83.30;

// Find cells within 0.5 degree radius
const nearbyCells = grid.filter(c => {
  const dist = Math.sqrt(
    Math.pow(c.lat - vizagLat, 2) + 
    Math.pow(c.lon - vizagLon, 2)
  );
  return dist <= 0.5;
});

const waterCells = nearbyCells.filter(c => !c.is_land && !c.obstacle);
const landCells = nearbyCells.filter(c => c.is_land || c.obstacle);

console.log(`Total nearby cells: ${nearbyCells.length}`);
console.log(`Water cells: ${waterCells.length}`);
console.log(`Land cells: ${landCells.length}\n`);

console.log('Water cells closest to Visakhapatnam:');
const sortedWater = waterCells
  .map(c => ({
    ...c,
    dist: Math.sqrt(Math.pow(c.lat - vizagLat, 2) + Math.pow(c.lon - vizagLon, 2))
  }))
  .sort((a, b) => a.dist - b.dist);

sortedWater.slice(0, 10).forEach((c, i) => {
  console.log(`${i + 1}. (${c.lat}, ${c.lon}) - ${(c.dist * 111).toFixed(2)}km away`);
});

console.log('\n🎯 Recommended adjustment:');
if (sortedWater.length > 0) {
  const best = sortedWater[0];
  console.log(`Use water cell at (${best.lat}, ${best.lon}) instead`);
  console.log(`Only ${(best.dist * 111).toFixed(2)}km from port`);
}

// Also check Mumbai
console.log('\n\n🔍 Checking Mumbai (18.97°N, 72.87°E)\n');

const mumbaiLat = 18.97;
const mumbaiLon = 72.87;

const mumbaiNearby = grid.filter(c => {
  const dist = Math.sqrt(
    Math.pow(c.lat - mumbaiLat, 2) + 
    Math.pow(c.lon - mumbaiLon, 2)
  );
  return dist <= 0.5;
});

const mumbaiWater = mumbaiNearby.filter(c => !c.is_land && !c.obstacle);
const mumbaiLand = mumbaiNearby.filter(c => c.is_land || c.obstacle);

console.log(`Total nearby cells: ${mumbaiNearby.length}`);
console.log(`Water cells: ${mumbaiWater.length}`);
console.log(`Land cells: ${mumbaiLand.length}\n`);

console.log('Water cells closest to Mumbai:');
const sortedMumbaiWater = mumbaiWater
  .map(c => ({
    ...c,
    dist: Math.sqrt(Math.pow(c.lat - mumbaiLat, 2) + Math.pow(c.lon - mumbaiLon, 2))
  }))
  .sort((a, b) => a.dist - b.dist);

sortedMumbaiWater.slice(0, 5).forEach((c, i) => {
  console.log(`${i + 1}. (${c.lat}, ${c.lon}) - ${(c.dist * 111).toFixed(2)}km away`);
});
