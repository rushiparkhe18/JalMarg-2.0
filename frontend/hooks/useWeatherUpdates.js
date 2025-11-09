/**
 * useWeatherUpdates Hook
 * 
 * Provides real-time weather updates for route waypoints WITHOUT affecting performance
 * Uses optimized polling and caching strategy
 */

import { useState, useEffect, useRef } from 'react';
import { getWeatherForRoute } from '../lib/api';

export function useWeatherUpdates(routeData, updateInterval = 300000) { // 5 minutes default
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch weather updates
  const fetchWeatherUpdate = async () => {
    // Don't fetch if no route data
    if (!routeData || !routeData.coordinates) {
      return;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      // Sample waypoints (don't fetch ALL - too expensive!)
      // Get weather for ~10-15 representative points along route
      const totalWaypoints = routeData.coordinates.length;
      const sampleInterval = Math.max(1, Math.floor(totalWaypoints / 12));
      const sampledWaypoints = [];
      
      for (let i = 0; i < totalWaypoints; i += sampleInterval) {
        sampledWaypoints.push(routeData.coordinates[i]);
      }
      
      // Always include start and end
      if (sampledWaypoints[0] !== routeData.coordinates[0]) {
        sampledWaypoints.unshift(routeData.coordinates[0]);
      }
      if (sampledWaypoints[sampledWaypoints.length - 1] !== routeData.coordinates[totalWaypoints - 1]) {
        sampledWaypoints.push(routeData.coordinates[totalWaypoints - 1]);
      }

      // Fetch weather (backend should handle this efficiently)
      const weatherData = await getWeatherForRoute(sampledWaypoints, {
        signal: abortControllerRef.current.signal
      });

      setWeather(weatherData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Weather fetch aborted');
      } else {
        console.error('Error fetching weather updates:', error);
      }
      setLoading(false);
    }
  };

  // Start/stop updates
  useEffect(() => {
    // Initial fetch
    fetchWeatherUpdate();

    // Set up interval if enabled
    if (updateInterval > 0) {
      intervalRef.current = setInterval(fetchWeatherUpdate, updateInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [routeData, updateInterval]);

  // Manual refresh function
  const refreshWeather = () => {
    fetchWeatherUpdate();
  };

  return {
    weather,
    loading,
    lastUpdate,
    refreshWeather
  };
}

export default useWeatherUpdates;
