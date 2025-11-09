const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('indianOceanPorts.json', 'utf8'));

console.log('Before:', data.ports.length, 'ports');

// River ports to remove
const riverPorts = ['Mongla', 'Calcutta', 'Kolkata', 'Chittagong', 'Haldia'];

// Filter out river ports
const filtered = data.ports.filter(port => {
  const shouldRemove = riverPorts.some(r => port.name.toLowerCase().includes(r.toLowerCase()));
  if (shouldRemove) {
    console.log('Removing:', port.name, `(${port.lat}, ${port.lon})`);
  }
  return !shouldRemove;
});

data.ports = filtered;
data.metadata.totalPorts = filtered.length;

console.log('After:', data.ports.length, 'ports');

// Write back
fs.writeFileSync('indianOceanPorts.json', JSON.stringify(data, null, 2));
console.log('✅ Updated indianOceanPorts.json');
