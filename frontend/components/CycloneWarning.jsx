import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Wind, Waves, Navigation, RefreshCw, MapPin, X } from 'lucide-react'
import axios from 'axios'

export default function CycloneWarning({ routeData, onRerouteRequest }) {
  const [cyclones, setCyclones] = useState([])
  const [intersection, setIntersection] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch cyclone data from REAL-TIME API
  const fetchCyclones = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/route/live-cyclones')
      if (response.data.success) {
        setCyclones(response.data.cyclones)
        
        // Only show data if cyclones actually exist
        if (response.data.cyclones.length === 0) {
          console.log('✅ No active cyclones detected in Indian Ocean region')
        } else {
          console.log(`⚠️ ${response.data.cyclones.length} active weather system(s) detected`)
        }
        
        // If we have route data, check for intersections
        if (routeData && routeData.path) {
          checkIntersection(response.data.cyclones)
        }
      }
    } catch (error) {
      console.error('Error fetching cyclones:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if route intersects with cyclones
  const checkIntersection = async (cyclonesData = cyclones) => {
    if (!routeData || !routeData.path) return

    try {
      const response = await axios.post('http://localhost:5000/api/route/check-cyclone-intersection', {
        path: routeData.path
      })

      if (response.data.success && response.data.intersects) {
        setIntersection(response.data)
        if (response.data.requiresReroute) {
          setShowWarning(true)
        }
      } else {
        setIntersection(null)
      }
    } catch (error) {
      console.error('Error checking intersection:', error)
    }
  }

  // Auto-fetch on mount and when route changes
  useEffect(() => {
    fetchCyclones()
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchCyclones()
    }, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [routeData])

  const handleReroute = () => {
    setShowWarning(false)
    if (onRerouteRequest && intersection) {
      // Pass cyclone locations to avoid
      const avoidAreas = intersection.intersections.map(i => i.location)
      onRerouteRequest(avoidAreas)
    }
  }

  return (
    <>
      {/* Cyclone Status Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Wind className={`w-5 h-5 ${cyclones.some(c => c.status === 'ACTIVE') ? 'text-red-400 animate-spin' : 'text-yellow-400'}`} />
              {cyclones.some(c => c.status === 'ACTIVE') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <h3 className="text-sm font-bold">Cyclone Monitor</h3>
          </div>
          <button
            onClick={fetchCyclones}
            disabled={loading}
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            title="Refresh cyclone data"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Active Cyclones List */}
        <div className="space-y-2">
          {cyclones.map((cyclone, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border-2 ${
                cyclone.status === 'ACTIVE' 
                  ? 'bg-red-500/10 border-red-500/50 animate-pulse' 
                  : 'bg-yellow-500/10 border-yellow-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className={`font-bold text-sm ${
                    cyclone.status === 'ACTIVE' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    🌀 {cyclone.name}
                  </div>
                  <div className="text-xs text-gray-400">{cyclone.category}</div>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                  cyclone.status === 'ACTIVE' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-yellow-500 text-black'
                }`}>
                  {cyclone.status}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center p-1 rounded bg-black/30">
                  <Wind className="w-3 h-3 mx-auto mb-0.5 text-red-300" />
                  <div className="text-xs text-red-300">{cyclone.conditions.maxWindSpeed} kts</div>
                </div>
                <div className="text-center p-1 rounded bg-black/30">
                  <Waves className="w-3 h-3 mx-auto mb-0.5 text-blue-300" />
                  <div className="text-xs text-blue-300">{cyclone.conditions.maxWaveHeight} m</div>
                </div>
                <div className="text-center p-1 rounded bg-black/30">
                  <MapPin className="w-3 h-3 mx-auto mb-0.5 text-gray-300" />
                  <div className="text-xs text-gray-300">{cyclone.radius} km</div>
                </div>
              </div>

              <div className="text-xs text-gray-300">
                📍 {cyclone.location.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {cyclone.conditions.movement}
              </div>
            </div>
          ))}

          {cyclones.length === 0 && !loading && (
            <div className="text-center text-green-400 text-sm py-2">
              ✅ All clear - No active cyclones in region
            </div>
          )}
        </div>

        {/* Route Intersection Warning - ONLY SHOW IF REAL CYCLONE EXISTS */}
        {intersection && intersection.intersects && cyclones.length > 0 && (
          <div className="mt-3 p-3 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
              <span className="text-sm font-bold text-red-400">
                ROUTE AFFECTED BY CYCLONE!
              </span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              {intersection.intersections.slice(0, 3).map((int, i) => (
                <div key={i}>
                  • {int.warning}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWarning(true)}
              className="w-full mt-2 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              ⚠️ View Full Warning
            </button>
          </div>
        )}
      </motion.div>

      {/* Full Warning Pop-up */}
      <AnimatePresence>
        {showWarning && intersection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 5 }}
              className="bg-gradient-to-br from-red-900 to-orange-900 p-6 rounded-2xl border-4 border-red-500 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Wind className="w-12 h-12 text-red-300 animate-spin" />
                    <span className="absolute inset-0 animate-ping">
                      <Wind className="w-12 h-12 text-red-500" />
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      🌀 CYCLONE WARNING
                    </h2>
                    <p className="text-red-200">Immediate Action Required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarning(false)}
                  className="p-2 hover:bg-red-700/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-red-200" />
                </button>
              </div>

              {/* Critical Message */}
              <div className="bg-red-500/30 border-2 border-red-400 rounded-xl p-4 mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {intersection.recommendation}
                </h3>
                <p className="text-red-100 text-sm">
                  Your current route passes through or near active cyclone activity. 
                  Navigation through these areas is extremely dangerous.
                </p>
              </div>

              {/* Affected Cyclones */}
              <div className="space-y-3 mb-4">
                {cyclones.filter(c => 
                  intersection.intersections.some(i => i.cycloneName === c.name)
                ).map((cyclone, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-4 border-2 border-red-500/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">
                        {cyclone.name}
                      </h4>
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                        {cyclone.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-red-500/20">
                        <Wind className="w-6 h-6 text-red-300 mx-auto mb-1" />
                        <div className="text-sm text-red-200">{cyclone.conditions.maxWindSpeed}</div>
                        <div className="text-xs text-gray-400">knots</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-500/20">
                        <Waves className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                        <div className="text-sm text-blue-200">{cyclone.conditions.maxWaveHeight}</div>
                        <div className="text-xs text-gray-400">meters</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-yellow-500/20">
                        <MapPin className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                        <div className="text-sm text-yellow-200">{cyclone.radius}</div>
                        <div className="text-xs text-gray-400">km radius</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-gray-500/20">
                        <Navigation className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <div className="text-sm text-gray-200">{cyclone.conditions.pressure}</div>
                        <div className="text-xs text-gray-400">hPa</div>
                      </div>
                    </div>

                    {/* Warnings */}
                    <div className="bg-red-500/10 rounded-lg p-3 mb-2">
                      {cyclone.warnings.map((warning, j) => (
                        <div key={j} className="text-sm text-red-200 mb-1">
                          {warning}
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-yellow-300">
                      <strong>Forecast:</strong> {cyclone.forecast}
                    </div>
                  </div>
                ))}
              </div>

              {/* Intersection Details */}
              <div className="bg-orange-500/20 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-white mb-2">Route Impact Analysis:</h4>
                <div className="space-y-1 text-sm text-orange-100">
                  {intersection.intersections.slice(0, 5).map((int, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{int.warning}</span>
                    </div>
                  ))}
                  {intersection.intersections.length > 5 && (
                    <div className="text-gray-400 text-center">
                      + {intersection.intersections.length - 5} more affected waypoints
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReroute}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <RefreshCw className="w-6 h-6" />
                  Recalculate Safe Route
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Safety Notice */}
              <div className="mt-4 p-4 bg-orange-600 rounded-xl border-2 border-white/30">
                <p className="text-white text-center font-bold">
                  ⚠️ WEATHER ADVISORY
                </p>
                <p className="text-orange-100 text-center text-sm mt-1">
                  Real-time weather data from Open-Meteo API.
                  For critical decisions, consult official meteorological authorities.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
