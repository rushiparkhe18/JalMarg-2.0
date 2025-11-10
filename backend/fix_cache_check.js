const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'routes', 'route.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic line with a safe check
content = content.replace(
  /const cachedRoute = routeCache\.getRoute\(/g,
  'const cachedRoute = (typeof routeCache !== "undefined" && routeCache) ? routeCache.getRoute('
);

// Add closing parenthesis after the mode parameter
content = content.replace(
  /routeCache\.getRoute\(\s*\{\s*lat:\s*from\.lat,\s*lon:\s*from\.lon\s*\},\s*\{\s*lat:\s*to\.lat,\s*lon:\s*to\.lon\s*\},\s*mode\s*\);/g,
  'routeCache.getRoute({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }, mode) : null;'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Cache check wrapped with safety check!');
