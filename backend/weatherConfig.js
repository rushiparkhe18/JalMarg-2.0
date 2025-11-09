/**
 * Weather Update Configuration
 * Control on-demand weather updates for route calculations
 */

module.exports = {
  // Enable/disable on-demand weather updates
  ENABLE_ROUTE_WEATHER_UPDATE: true, // Enabled with smart sampling for weather-aware routing
  
  // Weather API settings
  API_DELAY_MS: 10, // Delay between API calls (100 req/sec) - VERY FAST
  API_TIMEOUT_MS: 1000, // Quick timeout for each API call
  
  // Update strategy
  UPDATE_STRATEGY: 'blocking', // 'blocking' = wait for weather before route response
  
  // Sampling (to reduce API calls)
  SAMPLE_RATE: 0.05, // 0.05 = update 5% of cells - FAST with representative samples
  
  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
  
  // Logging
  VERBOSE_LOGGING: true, // Log weather update progress
  
  // Cache settings
  WEATHER_CACHE_HOURS: 6, // Consider weather stale after 6 hours
};
