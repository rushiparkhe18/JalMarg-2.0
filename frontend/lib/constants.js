export const PORTS = [
  { name: 'Mumbai', lat: 18.9388, lon: 72.8354, code: 'BOM' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, code: 'MAA' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, code: 'CCU' },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, code: 'COK' },
  { name: 'Vizag', lat: 17.6869, lon: 83.2185, code: 'VTZ' },
  { name: 'Mangalore', lat: 12.9141, lon: 74.8560, code: 'IXE' },
  { name: 'Kandla', lat: 23.0333, lon: 70.2167, code: 'IXY' },
  { name: 'Tuticorin', lat: 8.7642, lon: 78.1348, code: 'TCR' },
]

export const ROUTE_MODES = {
  OPTIMAL: 'optimal',
  FUEL: 'fuel',
  SAFE: 'safe',
  NORMAL: 'normal',
}

export const MODE_CONFIG = {
  optimal: {
    name: 'Optimal',
    description: 'Best balance of safety, fuel, and distance',
    color: '#ff6b35',
    weights: { safety: 0.4, fuel: 0.3, distance: 0.3 },
  },
  fuel: {
    name: 'Fuel Efficient',
    description: 'Minimize fuel consumption and costs',
    color: '#00ffa3',
    weights: { safety: 0.2, fuel: 0.6, distance: 0.2 },
  },
  safe: {
    name: 'Safe',
    description: 'Prioritize weather and safety conditions',
    color: '#00d4ff',
    weights: { safety: 0.7, fuel: 0.15, distance: 0.15 },
  },
  normal: {
    name: 'Normal',
    description: 'Shortest distance route',
    color: '#ffffff',
    weights: { safety: 0.15, fuel: 0.15, distance: 0.7 },
  },
}

export const WEATHER_THRESHOLDS = {
  windSpeed: {
    low: 10,
    medium: 15,
    high: 20,
  },
  waveHeight: {
    low: 2,
    medium: 3,
    high: 5,
  },
  visibility: {
    low: 5,
    medium: 10,
    high: 20,
  },
}

export const MAP_CONFIG = {
  center: [15.0, 75.0],
  zoom: 5,
  minZoom: 3,
  maxZoom: 12,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
}

export const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
}
