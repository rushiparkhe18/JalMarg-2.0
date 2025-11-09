/**
 * INITIALIZE WEATHER DATA
 * 
 * Run this ONCE after grid generation to fetch real weather data from API
 * This replaces mock data with actual weather from Open-Meteo
 * 
 * Usage: node initWeather.js
 */

const WeatherOnlyUpdater = require('./weatherOnlyUpdater');

async function initializeWeather() {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log('   🌦️  INITIALIZE REAL WEATHER DATA');
  console.log('   Maritime Navigation System');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('📋 This will:');
  console.log('   ✅ Fetch REAL weather from Open-Meteo API');
  console.log('   ✅ Update ALL water cells with live data');
  console.log('   ✅ Keep land status PERMANENT (not changed)');
  console.log('   ✅ Save to MongoDB for route calculations\n');
  
  console.log('⏱️  This will take ~10-15 minutes for ~27,000 water cells\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Continue? (y/n): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled by user\n');
        process.exit(0);
      }
      
      console.log('\n🚀 Starting weather initialization...\n');
      
      try {
        const updater = new WeatherOnlyUpdater();
        await updater.updateAllWeather(50, 1000); // 50 cells/batch, 1s delay
        
        console.log('\n✅ Weather initialization complete!');
        console.log('\n📋 Next steps:');
        console.log('   1. Routes now use REAL weather data');
        console.log('   2. Different modes will show DIFFERENT routes');
        console.log('   3. Run: node autoWeatherScheduler.js (for auto-updates every 3-4hrs)');
        console.log('   4. Or: node weatherOnlyUpdater.js once (for manual updates)\n');
        
        resolve();
      } catch (error) {
        console.error('\n❌ Initialization failed:', error.message);
        console.log('\nYou can try again by running: node initWeather.js\n');
        process.exit(1);
      }
    });
  });
}

if (require.main === module) {
  initializeWeather()
    .then(() => {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        mongoose.disconnect();
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = initializeWeather;
