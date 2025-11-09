/**
 * AUTOMATIC WEATHER SCHEDULER
 * 
 * Runs in background and updates weather every 3-4 hours
 * Land detection is NEVER touched - stays permanent
 * 
 * Usage:
 *   node weatherScheduler.js           # Run every 3.5 hours
 *   node weatherScheduler.js 2         # Run every 2 hours
 *   node weatherScheduler.js once      # Run once and exit
 */

const WeatherOnlyUpdater = require('./weatherOnlyUpdater');

class AutoWeatherScheduler {
  constructor(intervalHours = 3.5) {
    this.updater = new WeatherOnlyUpdater();
    this.intervalMs = intervalHours * 60 * 60 * 1000;
    this.intervalHours = intervalHours;
    this.updateCount = 0;
    this.running = false;
  }

  /**
   * Start automatic weather updates
   */
  async start() {
    console.clear();
    console.log('═══════════════════════════════════════════════════');
    console.log('   🌦️  AUTOMATIC WEATHER SCHEDULER');
    console.log('   Maritime Navigation System');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📋 Configuration:');
    console.log(`   Update Interval: ${this.intervalHours} hours`);
    console.log(`   Next update: ${this.intervalHours} hours from now`);
    console.log(`   Press Ctrl+C to stop\n`);
    
    console.log('⚠️  IMPORTANT:');
    console.log('   ✅ Weather data: UPDATES every ' + this.intervalHours + ' hours');
    console.log('   ✅ Land status: PERMANENT (never changes)');
    console.log('   ✅ is_land flags: PRESERVED from grid generation\n');

    this.running = true;

    // First update immediately
    console.log('🚀 Starting initial weather update...\n');
    await this.runUpdate();

    // Schedule periodic updates
    console.log(`\n⏰ Scheduler active. Next update in ${this.intervalHours} hours...`);
    console.log('💤 You can minimize this window or run in background\n');

    this.interval = setInterval(async () => {
      console.log('\n' + '═'.repeat(55));
      console.log('⏰ SCHEDULED UPDATE TRIGGERED');
      console.log('═'.repeat(55) + '\n');
      await this.runUpdate();
      console.log(`\n⏰ Next update in ${this.intervalHours} hours...`);
    }, this.intervalMs);

    // Graceful shutdown handlers
    this.setupShutdownHandlers();
  }

  /**
   * Run a single weather update
   */
  async runUpdate() {
    try {
      const startTime = Date.now();
      this.updateCount++;
      
      console.log(`📊 Update #${this.updateCount} - ${new Date().toLocaleString()}\n`);
      
      await this.updater.updateAllWeather(50, 1000); // 50 cells per batch, 1s delay
      
      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`\n✅ Update #${this.updateCount} completed in ${duration} minutes`);
      console.log(`📅 Last updated: ${new Date().toLocaleString()}`);
      
    } catch (error) {
      console.error(`\n❌ Update #${this.updateCount} failed:`, error.message);
      console.log('⏰ Will retry at next scheduled time...');
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('\n🛑 Scheduler stopped');
    }
    this.running = false;
  }

  /**
   * Setup graceful shutdown
   */
  setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log(`\n\n🛑 Received ${signal} - Shutting down gracefully...`);
      
      this.stop();
      
      if (this.updater) {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
          console.log('✅ MongoDB disconnected');
        }
      }
      
      console.log('✅ Weather scheduler stopped');
      console.log(`📊 Total updates completed: ${this.updateCount}\n`);
      
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Catch uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('\n❌ Uncaught Exception:', error);
      console.log('⏰ Scheduler will continue running...\n');
    });
    
    process.on('unhandledRejection', (error) => {
      console.error('\n❌ Unhandled Rejection:', error);
      console.log('⏰ Scheduler will continue running...\n');
    });
  }
}

// CLI Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'once') {
    // One-time update only
    console.log('🔄 Running one-time weather update...\n');
    const updater = new WeatherOnlyUpdater();
    updater.updateAllWeather()
      .then(() => {
        console.log('\n✨ One-time update completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Update failed:', error);
        process.exit(1);
      });
  } else {
    // Continuous scheduler
    const intervalHours = parseFloat(args[0]) || 3.5;
    
    if (intervalHours < 0.5) {
      console.error('❌ Interval must be at least 0.5 hours (30 minutes)');
      process.exit(1);
    }
    
    const scheduler = new AutoWeatherScheduler(intervalHours);
    scheduler.start().catch(error => {
      console.error('❌ Scheduler failed to start:', error);
      process.exit(1);
    });
  }
}

module.exports = AutoWeatherScheduler;
