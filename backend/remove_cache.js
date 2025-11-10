// Remove cache blocker from route.js
const fs = require('fs');
const path = require('path');

const routeFilePath = path.join(__dirname, 'routes', 'route.js');
let lines = fs.readFileSync(routeFilePath, 'utf8').split('\n');

console.log(`Total lines: ${lines.length}`);

// Find the cache block (looking for line containing "routeCache.getRoute")
let cacheStartLine = -1;
let cacheEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('routeCache.getRoute')) {
    console.log(`Found routeCache.getRoute at line ${i + 1}`);
    cacheStartLine = i - 1; // Start from comment line before
    
    // Find the continue statement
    for (let j = i; j < Math.min(i + 40, lines.length); j++) {
      if (lines[j].includes('continue; // Skip all computation')) {
        // Find closing brace after continue
        for (let k = j; k < Math.min(j + 5, lines.length); k++) {
          if (lines[k].trim() === '}') {
            cacheEndLine = k;
            console.log(`Found cache block end at line ${k + 1}`);
            break;
          }
        }
        break;
      }
    }
    break;
  }
}

if (cacheStartLine > -1 && cacheEndLine > -1) {
  console.log(`Commenting out lines ${cacheStartLine + 1} to ${cacheEndLine + 1}`);
  
  // Comment out the entire block
  lines.splice(cacheStartLine, 0, '      // ========== CACHE DISABLED ==========');
  lines.splice(cacheStartLine + 1, 0, '      /*');
  cacheEndLine += 2; // Adjust for inserted lines
  lines.splice(cacheEndLine + 1, 0, '      */');
  lines.splice(cacheEndLine + 2, 0, '      // ====================================');
  
  fs.writeFileSync(routeFilePath, lines.join('\n'), 'utf8');
  console.log('✅ Cache block commented out successfully!');
} else {
  console.log('❌ Could not find cache block boundaries');
  console.log(`   Start: ${cacheStartLine}, End: ${cacheEndLine}`);
}
