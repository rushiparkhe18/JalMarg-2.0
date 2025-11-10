const fs = require('fs');

// Read the file
const content = fs.readFileSync('routes/route.js', 'utf8');

// Find and replace the cache block
// Look for the pattern starting with "STEP 1: Check precomputed" and ending with "STEP 2: Check if route"
const regex = /(\n\s+console\.log\(`\\n[^`]+Segment \$\{i \+ 1\}:[^\n]+\n\s+)(\/\/ [^\n]+ STEP 1: Check precomputed route cache[^]*?continue;[^\n]+\n\s+\}\n)(\s+\/\/ [^\n]+ STEP 2: Check if route)/;

const replacement = '$1// CACHE REMOVED - Let regional exceptions execute\n$3';

const newContent = content.replace(regex, replacement);

if (newContent === content) {
  console.log('❌ Pattern not found! No changes made.');
} else {
  // Write back
  fs.writeFileSync('routes/route.js', newContent, 'utf8');
  console.log('✅ Cache block removed successfully!');
  console.log(`   Original length: ${content.length} chars`);
  console.log(`   New length: ${newContent.length} chars`);
  console.log(`   Removed: ${content.length - newContent.length} chars`);
}
