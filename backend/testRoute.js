/**
 * Test the Smart Regional Exception System
 */

const http = require('http');

async function testRoute(fromPort, toPort) {
  console.log(`\n🧪 Testing ${fromPort.name} → ${toPort.name}...\n`);
  
  const requestBody = JSON.stringify({
    ports: [fromPort, toPort],
    mode: "optimal"
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/route/strict-ocean-route',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    },
    timeout: 300000
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.success) {
            console.log(`✅ SUCCESS! Route calculated:`);
            console.log(`   Total Distance: ${result.totalDistance.toFixed(2)} km`);
            console.log(`   Total Duration: ${result.totalDuration.toFixed(2)} hours`);
            console.log(`   Waypoints: ${result.routes[0]?.waypoints || 'N/A'}`);
            resolve(true);
          } else {
            console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
            resolve(false);
          }
        } catch (error) {
          console.error(`❌ Parse error: ${error.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`❌ Request timeout after 5 minutes`);
      req.destroy();
      resolve(false);
    });

    req.write(requestBody);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 SMART REGIONAL EXCEPTION SYSTEM - TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tests = [
    {
      name: 'West → East India (Mumbai → Visakhapatnam)',
      from: { name: "Mumbai", lat: 18.97, lon: 72.87 },
      to: { name: "Visakhapatnam", lat: 17.68, lon: 83.30 }
    },
    {
      name: 'West India → Bangladesh (Mumbai → Chittagong)',
      from: { name: "Mumbai", lat: 18.97, lon: 72.87 },
      to: { name: "Chittagong", lat: 22.33, lon: 91.80 }
    },
    {
      name: 'India → Southeast Asia (Chennai → Singapore)',
      from: { name: "Chennai", lat: 13.08, lon: 80.27 },
      to: { name: "Singapore", lat: 1.28, lon: 103.85 }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📋 Test: ${test.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const result = await testRoute(test.from, test.to);
    
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests();
