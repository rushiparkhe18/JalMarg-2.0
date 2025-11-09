import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDistance(meters) {
  const km = meters / 1000
  return km > 1 ? `${km.toFixed(1)} km` : `${meters.toFixed(0)} m`
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function getRouteColor(mode) {
  const colors = {
    optimal: '#ff6b35',
    fuel: '#00ffa3',
    safe: '#00d4ff',
    normal: '#ffffff',
  }
  return colors[mode] || '#00d4ff'
}

export function getWeatherIcon(condition) {
  const icons = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    storm: '⛈️',
    wind: '💨',
    fog: '🌫️',
  }
  return icons[condition] || '🌤️'
}

export function calculateSafetyScore(weather) {
  let score = 100
  
  if (weather.windSpeed > 15) score -= 20
  if (weather.waveHeight > 3) score -= 25
  if (weather.visibility < 5) score -= 15
  if (weather.temperature < 10 || weather.temperature > 35) score -= 10
  
  return Math.max(0, score)
}

export function getCoordinates(lat, lon) {
  return {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  }
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
