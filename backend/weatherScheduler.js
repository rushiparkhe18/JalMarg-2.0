const cron = require('node-cron');
const WeatherService = require('./weatherService');

/**
 * Scheduled Weather Updates
 * Automatically updates weather data at regular intervals
 */

class WeatherScheduler {
  constructor(updateInterval = '0 */6 * * *') { // Default: every 6 hours
    this.service = new WeatherService();
    this.updateInterval = updateInterval;
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log('🕐 Weather Scheduler Started');
    console.log(`📅 Update Interval: ${this.updateInterval}`);
    console.log('⏳ Next update: Based on cron schedule\n');

    // Immediate update on start
    this.runUpdate();

    // Schedule regular updates
    this.job = cron.schedule(this.updateInterval, () => {
      this.runUpdate();
    });

    this.isRunning = true;
  }

  /**
   * Run weather update
   */
  async runUpdate() {
    if (this.isRunning) {
      console.log('⚠️  Update already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`   🌦️  SCHEDULED WEATHER UPDATE`);
    console.log(`   ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════\n');

    try {
      // Update MongoDB (use 'all' for production, or limit for testing)
      await this.service.updateGridInMongoDB(null, 100); // Update 100 points per cycle
      console.log('✅ Scheduled update completed successfully\n');
    } catch (error) {
      console.error('❌ Scheduled update failed:', error.message);
    }

    this.isRunning = false;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('🛑 Weather Scheduler Stopped');
    }
  }
}

// Run scheduler if executed directly
if (require.main === module) {
  // Cron patterns:
  // '0 */6 * * *'    - Every 6 hours
  // '0 */3 * * *'    - Every 3 hours
  // '*/30 * * * *'   - Every 30 minutes
  // '0 0 * * *'      - Daily at midnight
  
  const scheduler = new WeatherScheduler('0 */6 * * *');
  scheduler.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down scheduler...');
    scheduler.stop();
    process.exit(0);
  });
}

module.exports = WeatherScheduler;
