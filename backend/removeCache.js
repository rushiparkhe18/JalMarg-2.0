const fs = require('fs');

// Read the file
const content = fs.readFileSync('routes/route.js', 'utf8');
const lines = content.split('\n');

// Find and remove lines 1606-1639 (0-indexed: 1605-1638)
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 1605 && i <= 1638) {
    if (i === 1605) {
      newLines.push('      // CACHE REMOVED - Let regional exceptions execute');
    }
    continue; // Skip these lines
  }
  newLines.push(lines[i]);
}

// Write back
fs.writeFileSync('routes/route.js', newLines.join('\n'), 'utf8');
console.log('✅ Cache block removed successfully!');
console.log(`   Removed lines 1606-1639 (34 lines)`);
console.log(`   Original: ${lines.length} lines`);
console.log(`   New: ${newLines.length} lines`);
