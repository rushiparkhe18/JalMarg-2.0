import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Navigation as NavigationIcon, Wind, Waves } from 'lucide-react'
import axios from 'axios'

export default function RouteNavigation({ routeData, onWaypointChange }) {
  const [currentWaypoint, setCurrentWaypoint] = useState(0)
  const [waypointWeather, setWaypointWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState(0) // 1 = forward, -1 = backward

  const totalWaypoints = routeData?.path?.length || 0

  // Fetch weather for current waypoint
  useEffect(() => {
    if (!routeData?.path || currentWaypoint >= routeData.path.length) return

    const fetchWaypointWeather = async () => {
      setLoading(true)
      try {
        const waypoint = routeData.path[currentWaypoint]
        const response = await axios.post('http://localhost:5000/api/route/waypoint-weather', {
          lat: waypoint.lat,
          lon: waypoint.lon,
          waypointIndex: currentWaypoint,
          totalWaypoints: totalWaypoints
        })

        if (response.data.success) {
          setWaypointWeather(response.data.weather)
          if (onWaypointChange) {
            onWaypointChange(currentWaypoint, response.data.weather)
          }
        }
      } catch (error) {
        console.error('Failed to fetch waypoint weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWaypointWeather()
  }, [currentWaypoint, routeData])

  const goToNext = () => {
    if (currentWaypoint < totalWaypoints - 1) {
      setDirection(1)
      setCurrentWaypoint(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentWaypoint > 0) {
      setDirection(-1)
      setCurrentWaypoint(prev => prev - 1)
    }
  }

  const goToWaypoint = (index) => {
    if (index >= 0 && index < totalWaypoints) {
      setDirection(index > currentWaypoint ? 1 : -1)
      setCurrentWaypoint(index)
    }
  }

  if (!routeData || !routeData.path || routeData.path.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="text-center text-gray-400">
          <NavigationIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Calculate a route to start navigation</p>
        </div>
      </motion.div>
    )
  }

  const waypoint = routeData.path[currentWaypoint]
  const progress = ((currentWaypoint / (totalWaypoints - 1)) * 100).toFixed(1)
  
  // Calculate distance from start
  let distanceFromStart = 0
  for (let i = 0; i < currentWaypoint; i++) {
    const p1 = routeData.path[i]
    const p2 = routeData.path[i + 1]
    const R = 6371 // Earth radius in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180
    const dLon = (p2.lon - p1.lon) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    distanceFromStart += R * c
  }

  // Get weather direction as text
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <NavigationIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Route Navigation</h3>
        </div>
        <div className="text-sm text-gray-400">
          {currentWaypoint + 1} / {totalWaypoints}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Waypoint Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWaypoint}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/50 rounded-lg p-4 space-y-3"
        >
          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                Waypoint {currentWaypoint + 1}
              </div>
              <div className="text-xs text-gray-400">
                {waypoint.lat.toFixed(4)}°N, {waypoint.lon.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Distance from start</span>
            <span className="text-white font-medium">{distanceFromStart.toFixed(1)} km</span>
          </div>

          {/* Weather Data */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : waypointWeather ? (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
              {/* Wind */}
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">Wind</div>
                  <div className="text-sm text-white font-medium">
                    {waypointWeather.windSpeed.toFixed(1)} kts
                  </div>
                  <div className="text-xs text-gray-500">
                    {getWindDirection(waypointWeather.windDirection)}
                  </div>
                </div>
              </div>

              {/* Waves */}
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs text-gray-400">Waves</div>
                  <div className="text-sm text-white font-medium">
                    {waypointWeather.waveHeight.toFixed(1)} m
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-orange-400">
                  🌡️
                </div>
                <div>
                  <div className="text-xs text-gray-400">Temp</div>
                  <div className="text-sm text-white font-medium">
                    {waypointWeather.temperature.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  👁️
                </div>
                <div>
                  <div className="text-xs text-gray-400">Visibility</div>
                  <div className="text-sm text-white font-medium">
                    {waypointWeather.visibility} km
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-2">
              No weather data available
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToPrevious}
          disabled={currentWaypoint === 0}
          className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToNext}
          disabled={currentWaypoint === totalWaypoints - 1}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Quick Jump */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400">Quick jump:</span>
        <button
          onClick={() => goToWaypoint(0)}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          Start
        </button>
        <button
          onClick={() => goToWaypoint(Math.floor(totalWaypoints / 4))}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          25%
        </button>
        <button
          onClick={() => goToWaypoint(Math.floor(totalWaypoints / 2))}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          50%
        </button>
        <button
          onClick={() => goToWaypoint(Math.floor(3 * totalWaypoints / 4))}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          75%
        </button>
        <button
          onClick={() => goToWaypoint(totalWaypoints - 1)}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          End
        </button>
      </div>
    </motion.div>
  )
}
