import { motion } from 'framer-motion'
import { Cloud, Wind, Droplets, Thermometer, Eye, Compass, MapPin, RefreshCw, Waves, AlertTriangle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function WeatherDashboard({ data, currentLocation, onLocationUpdate }) {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [location, setLocation] = useState(currentLocation || null)

  // Get user's GPS location
  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          setLocation(newLocation)
          if (onLocationUpdate) {
            onLocationUpdate(newLocation)
          }
        },
        (error) => {
          console.log('GPS not available or permission denied. Using default location.')
          // Use a default location (Mumbai) if GPS fails
          const fallbackLocation = {
            lat: 18.9663,
            lon: 72.8667
          }
          setLocation(fallbackLocation)
          if (onLocationUpdate) {
            onLocationUpdate(fallbackLocation)
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  }, [location, onLocationUpdate])

  // Fetch real weather data from API
  const fetchWeather = async (lat, lon) => {
    if (!lat || !lon) return
    
    setLoading(true)
    try {
      // Use Open-Meteo API (free, no API key needed)
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat.toFixed(2),
          longitude: lon.toFixed(2),
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover',
          timezone: 'auto'
        }
      })
      
      const current = response.data.current
      setWeatherData({
        temperature: Math.round(current.temperature_2m),
        windSpeed: Math.round(current.wind_speed_10m * 0.54), // Convert to knots
        humidity: current.relative_humidity_2m,
        visibility: 10, // Default value (Open-Meteo doesn't provide this)
        pressure: 1013, // Default value
        windDirection: getWindDirection(current.wind_direction_10m),
        windGusts: Math.round(current.wind_gusts_10m * 0.54),
        cloudCover: current.cloud_cover,
        precipitation: current.precipitation,
        lastUpdate: new Date().toLocaleTimeString()
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert wind direction degrees to compass direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  // Auto-refresh weather every 10 minutes
  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon)
      
      const interval = setInterval(() => {
        fetchWeather(location.lat, location.lon)
      }, 10 * 60 * 1000) // 10 minutes
      
      return () => clearInterval(interval)
    }
  }, [location])

  // Use fetched data or fallback to prop data or mock data
  const displayData = weatherData || data || {
    temperature: 28,
    windSpeed: 12,
    humidity: 75,
    visibility: 10,
    pressure: 1013,
    windDirection: 'NE',
  }

  // Define thresholds for alerts (matching backend)
  const THRESHOLDS = {
    wind: { moderate: 15, high: 25, severe: 35 },
    wave: { moderate: 2.5, high: 4, severe: 6 },
    visibility: { low: 5, poor: 2 },
    temperature: { hot: 35, cold: 10 }
  }

  // Determine alert status for each metric
  const getAlertStatus = (metric, value) => {
    switch(metric) {
      case 'wind':
        if (value >= THRESHOLDS.wind.severe) return { level: 'critical', message: 'SEVERE WINDS - Extremely dangerous' }
        if (value >= THRESHOLDS.wind.high) return { level: 'high', message: 'HIGH WINDS - Reduce speed' }
        if (value >= THRESHOLDS.wind.moderate) return { level: 'moderate', message: 'Moderate winds' }
        return { level: 'safe', message: 'Normal conditions' }
      
      case 'visibility':
        if (value <= THRESHOLDS.visibility.poor) return { level: 'critical', message: 'POOR VISIBILITY - Navigation hazardous' }
        if (value <= THRESHOLDS.visibility.low) return { level: 'high', message: 'LOW VISIBILITY - Proceed with caution' }
        return { level: 'safe', message: 'Good visibility' }
      
      case 'wave':
        if (value >= THRESHOLDS.wave.severe) return { level: 'critical', message: 'SEVERE WAVES - Extremely dangerous' }
        if (value >= THRESHOLDS.wave.high) return { level: 'high', message: 'HIGH WAVES - Rough seas' }
        if (value >= THRESHOLDS.wave.moderate) return { level: 'moderate', message: 'Moderate waves' }
        return { level: 'safe', message: 'Calm seas' }
      
      default:
        return { level: 'safe', message: 'Normal' }
    }
  }

  const windAlert = getAlertStatus('wind', displayData.windSpeed)
  const visibilityAlert = getAlertStatus('visibility', displayData.visibility)
  const waveAlert = displayData.waveHeight ? getAlertStatus('wave', displayData.waveHeight) : null

  const weatherMetrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${displayData.temperature}°C`,
      color: 'red',
      trend: displayData.temperature > 30 ? 'Hot' : displayData.temperature < 20 ? 'Cool' : 'Normal',
      alert: null
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${displayData.windSpeed} knots`,
      color: windAlert.level === 'critical' ? 'red' : windAlert.level === 'high' ? 'orange' : windAlert.level === 'moderate' ? 'yellow' : 'cyan',
      trend: windAlert.message,
      alert: windAlert.level !== 'safe' ? windAlert : null,
      threshold: `Threshold: ${THRESHOLDS.wind.high} kts`
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${displayData.humidity}%`,
      color: 'blue',
      trend: displayData.humidity > 80 ? 'High' : displayData.humidity < 40 ? 'Low' : 'Normal',
      alert: null
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${displayData.visibility} km`,
      color: visibilityAlert.level === 'critical' ? 'red' : visibilityAlert.level === 'high' ? 'orange' : 'purple',
      trend: visibilityAlert.message,
      alert: visibilityAlert.level !== 'safe' ? visibilityAlert : null,
      threshold: `Threshold: ${THRESHOLDS.visibility.low} km`
    },
    {
      icon: Cloud,
      label: 'Pressure',
      value: `${displayData.pressure} hPa`,
      color: 'gray',
      trend: displayData.pressure > 1015 ? 'High' : displayData.pressure < 1010 ? 'Low' : 'Stable',
      alert: null
    },
    {
      icon: Compass,
      label: 'Wind Dir',
      value: displayData.windDirection,
      color: 'green',
      trend: 'Steady',
      alert: null
    },
  ]

  // Add wave data if available
  if (displayData.waveHeight !== undefined && waveAlert) {
    weatherMetrics.splice(3, 0, {
      icon: Waves,
      label: 'Wave Height',
      value: `${displayData.waveHeight.toFixed(1)} m`,
      color: waveAlert.level === 'critical' ? 'red' : waveAlert.level === 'high' ? 'orange' : waveAlert.level === 'moderate' ? 'yellow' : 'teal',
      trend: waveAlert.message,
      alert: waveAlert.level !== 'safe' ? waveAlert : null,
      threshold: `Threshold: ${THRESHOLDS.wave.high} m`
    })
  }

  const chartData = [
    { time: '00:00', temp: 26, wind: 10 },
    { time: '04:00', temp: 25, wind: 11 },
    { time: '08:00', temp: 27, wind: 12 },
    { time: '12:00', temp: 29, wind: 14 },
    { time: '16:00', temp: 28, wind: 13 },
    { time: '20:00', temp: 27, wind: 11 },
  ]

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Cloud className="w-8 h-8 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold">Weather Conditions</h3>
              <p className="text-xs text-gray-400">
                {location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                  </span>
                ) : (
                  'Loading location...'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <div className="text-xs text-gray-400">
                Updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => location && fetchWeather(location.lat, location.lon)}
              disabled={loading}
              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
              title="Refresh weather"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {weatherMetrics.map((metric, index) => {
            const Icon = metric.icon
            const hasAlert = metric.alert && metric.alert.level !== 'safe'
            const borderColor = hasAlert 
              ? metric.alert.level === 'critical' ? 'border-red-500/50' 
              : metric.alert.level === 'high' ? 'border-orange-500/50'
              : 'border-yellow-500/50'
              : 'border-transparent'
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`glass-card p-3 rounded-xl border-2 ${borderColor} ${hasAlert ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <Icon className={`w-4 h-4 text-${metric.color}-400 mb-2`} />
                  {hasAlert && (
                    <AlertTriangle className={`w-3 h-3 ${
                      metric.alert.level === 'critical' ? 'text-red-400' :
                      metric.alert.level === 'high' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`} />
                  )}
                </div>
                <div className="text-xs text-gray-400">{metric.label}</div>
                <div className="text-sm font-bold">{metric.value}</div>
                <div className={`text-xs mt-1 ${
                  hasAlert 
                    ? metric.alert.level === 'critical' ? 'text-red-400 font-semibold' 
                    : metric.alert.level === 'high' ? 'text-orange-400 font-semibold'
                    : 'text-yellow-400'
                    : 'text-gray-500'
                }`}>
                  {metric.trend}
                </div>
                {metric.threshold && hasAlert && (
                  <div className="text-xs text-gray-600 mt-1">
                    {metric.threshold}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Active Alerts Summary */}
        {weatherMetrics.some(m => m.alert) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-red-400 mb-1">
                  Active Weather Alerts
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  {weatherMetrics
                    .filter(m => m.alert && m.alert.level !== 'safe')
                    .map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>
                          <strong>{m.label}:</strong> {m.alert.message}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          24-Hour Forecast
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="#888" style={{ fontSize: '10px' }} />
            <YAxis stroke="#888" style={{ fontSize: '10px' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#ff6b35"
              fillOpacity={1}
              fill="url(#colorTemp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          Wind Speed Trend
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="#888" style={{ fontSize: '10px' }} />
            <YAxis stroke="#888" style={{ fontSize: '10px' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="wind"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ fill: '#00d4ff', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

import { TrendingUp } from 'lucide-react'
