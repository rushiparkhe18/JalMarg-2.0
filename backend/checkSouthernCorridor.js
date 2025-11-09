const gridData = require('./gridData.json');
const grid = gridData.cells || gridData;

console.log('🔍 Checking water cells in southern corridor around India/Sri Lanka...\n');

// Check critical regions
const regions = [
  { name: 'Palk Strait Region', latMin: 8, latMax: 11, lonMin: 78, lonMax: 81 },
  { name: 'South of Sri Lanka', latMin: 5, latMax: 8, lonMin: 79, lonMax: 82 },
  { name: 'Southeast of India', latMin: 7, latMax: 10, lonMin: 82, lonMax: 85 },
  { name: 'Southwest of India', latMin: 7, latMax: 10, lonMin: 75, lonMax: 78 }
];

regions.forEach(region => {
  const cells = grid.filter(c => 
    c.lat >= region.latMin && 
    c.lat <= region.latMax && 
    c.lon >= region.lonMin && 
    c.lon <= region.lonMax
  );
  
  const waterCells = cells.filter(c => !c.is_land && !c.obstacle);
  const landCells = cells.filter(c => c.is_land || c.obstacle);
  
  console.log(`📍 ${region.name} (${region.latMin}-${region.latMax}°N, ${region.lonMin}-${region.lonMax}°E):`);
  console.log(`   Total cells: ${cells.length}`);
  console.log(`   Water cells: ${waterCells.length}`);
  console.log(`   Land cells: ${landCells.length}`);
  
  if (waterCells.length > 0) {
    console.log('   Sample water cells:');
    waterCells.slice(0, 3).forEach(c => {
      console.log(`     (${c.lat}, ${c.lon})`);
    });
  }
  console.log('');
});

// Check specific Mumbai-Visakhapatnam path cells
console.log('🎯 Checking key waypoints for Mumbai → Visakhapatnam route:\n');
const keyPoints = [
  { name: 'Mumbai', lat: 18.97, lon: 72.87 },
  { name: 'South of Goa', lat: 14, lon: 74 },
  { name: 'South of Kerala', lat: 8, lon: 76 },
  { name: 'South of Sri Lanka', lat: 6, lon: 80 },
  { name: 'East of Sri Lanka', lat: 8, lon: 82 },
  { name: 'Visakhapatnam', lat: 17.68, lon: 83.30 }
];

keyPoints.forEach(point => {
  const nearestCell = grid.reduce((closest, cell) => {
    const dist = Math.sqrt(
      Math.pow(cell.lat - point.lat, 2) + 
      Math.pow(cell.lon - point.lon, 2)
    );
    return dist < closest.dist ? { cell, dist } : closest;
  }, { cell: null, dist: Infinity });
  
  console.log(`${point.name} (${point.lat}, ${point.lon}):`);
  if (nearestCell.cell) {
    console.log(`  Nearest cell: (${nearestCell.cell.lat}, ${nearestCell.cell.lon})`);
    console.log(`  Is Land: ${nearestCell.cell.is_land}`);
    console.log(`  Is Obstacle: ${nearestCell.cell.obstacle}`);
    console.log(`  Distance: ${(nearestCell.dist * 111).toFixed(2)}km`);
  }
  console.log('');
});
