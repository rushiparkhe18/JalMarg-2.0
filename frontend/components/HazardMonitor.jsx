import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Wind, Waves, Eye, X, RefreshCw, MapPin } from 'lucide-react'
import axios from 'axios'

export default function HazardMonitor({ routeData, currentPosition, onRerouteRequest }) {
  const [hazards, setHazards] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastCheck, setLastCheck] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [criticalHazard, setCriticalHazard] = useState(null)

  const THRESHOLDS = {
    wind: { moderate: 15, high: 25, severe: 35 },
    wave: { moderate: 2.5, high: 4, severe: 6 },
    visibility: { low: 5, poor: 2 }
  }

  // Check for hazards along the route
  const checkHazards = useCallback(async () => {
    if (!routeData || !routeData.path || routeData.path.length === 0) {
      return
    }

    setIsMonitoring(true)

    try {
      const response = await axios.post('http://localhost:5000/api/route/check-hazards', {
        path: routeData.path,
        currentPosition,
        thresholds: THRESHOLDS
      })

      if (response.data.success) {
        setHazards(response.data.hazards)
        setLastCheck(new Date())

        // Show alert if critical hazards found
        const critical = response.data.hazards.find(h => h.level === 'CRITICAL')
        if (critical) {
          setCriticalHazard(critical)
          setShowAlert(true)
          
          // Auto-play alert sound (optional)
          if (typeof Audio !== 'undefined') {
            const audio = new Audio('/alert-sound.mp3')
            audio.play().catch(() => {}) // Ignore if no sound file
          }
        }
      }
    } catch (error) {
      console.error('Error checking hazards:', error)
    } finally {
      setIsMonitoring(false)
    }
  }, [routeData, currentPosition])

  // Auto-check every 5 minutes
  useEffect(() => {
    if (!routeData) return

    // Initial check
    checkHazards()

    // Set up interval for continuous monitoring
    const interval = setInterval(() => {
      checkHazards()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [routeData, checkHazards])

  const handleReroute = () => {
    setShowAlert(false)
    if (onRerouteRequest) {
      onRerouteRequest(hazards.filter(h => h.level === 'CRITICAL'))
    }
  }

  const getHazardColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'red'
      case 'HIGH': return 'orange'
      case 'MODERATE': return 'yellow'
      default: return 'gray'
    }
  }

  const getHazardIcon = (hazard) => {
    const conditions = hazard.conditions
    if (parseFloat(conditions.windSpeed) > THRESHOLDS.wind.high) {
      return <Wind className="w-6 h-6" />
    }
    if (parseFloat(conditions.waveHeight) > THRESHOLDS.wave.high) {
      return <Waves className="w-6 h-6" />
    }
    if (parseFloat(conditions.visibility) < THRESHOLDS.visibility.low) {
      return <Eye className="w-6 h-6" />
    }
    return <AlertTriangle className="w-6 h-6" />
  }

  return (
    <>
      {/* Hazard Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${hazards.length > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
            <h3 className="text-sm font-bold">Hazard Monitor</h3>
          </div>
          <button
            onClick={checkHazards}
            disabled={isMonitoring}
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            title="Refresh hazard check"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isMonitoring ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Hazard Count */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="text-xl font-bold text-red-400">
              {hazards.filter(h => h.level === 'CRITICAL').length}
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="text-xl font-bold text-orange-400">
              {hazards.filter(h => h.level === 'HIGH').length}
            </div>
            <div className="text-xs text-gray-400">High</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-xl font-bold text-yellow-400">
              {hazards.filter(h => h.level === 'MODERATE').length}
            </div>
            <div className="text-xs text-gray-400">Moderate</div>
          </div>
        </div>

        {/* Last Check Time */}
        {lastCheck && (
          <div className="text-xs text-gray-500 text-center">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}

        {/* Hazard List */}
        {hazards.length > 0 && (
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {hazards.slice(0, 5).map((hazard, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border-2 ${
                  hazard.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/50' :
                  hazard.level === 'HIGH' ? 'bg-orange-500/10 border-orange-500/50' :
                  'bg-yellow-500/10 border-yellow-500/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`text-${getHazardColor(hazard.level)}-400`}>
                    {getHazardIcon(hazard)}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-gray-200">
                      {hazard.message}
                    </div>
                    <div className="text-gray-400 mt-0.5">
                      Location: ({hazard.location.lat.toFixed(2)}°, {hazard.location.lon.toFixed(2)}°)
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {hazards.length > 5 && (
              <div className="text-xs text-center text-gray-500">
                + {hazards.length - 5} more hazards
              </div>
            )}
          </div>
        )}

        {hazards.length === 0 && lastCheck && (
          <div className="text-center text-green-400 text-sm mt-2">
            ✓ No hazards detected
          </div>
        )}
      </motion.div>

      {/* Critical Hazard Pop-up Alert */}
      <AnimatePresence>
        {showAlert && criticalHazard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-red-900/90 to-red-800/90 p-6 rounded-2xl border-4 border-red-500 shadow-2xl max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alert Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-red-300 animate-pulse" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      CRITICAL HAZARD
                    </h2>
                    <p className="text-red-200 text-sm">Immediate Action Required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="p-2 hover:bg-red-700/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-red-200" />
                </button>
              </div>

              {/* Hazard Details */}
              <div className="bg-black/30 p-4 rounded-xl mb-4">
                <div className="text-white text-lg font-semibold mb-2">
                  {criticalHazard.message}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-red-500/20 rounded-lg">
                    <Wind className="w-5 h-5 text-red-300 mx-auto mb-1" />
                    <div className="text-sm text-red-200">{criticalHazard.conditions.windSpeed} kts</div>
                  </div>
                  <div className="text-center p-2 bg-red-500/20 rounded-lg">
                    <Waves className="w-5 h-5 text-red-300 mx-auto mb-1" />
                    <div className="text-sm text-red-200">{criticalHazard.conditions.waveHeight} m</div>
                  </div>
                  <div className="text-center p-2 bg-red-500/20 rounded-lg">
                    <Eye className="w-5 h-5 text-red-300 mx-auto mb-1" />
                    <div className="text-sm text-red-200">{criticalHazard.conditions.visibility} km</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-red-200 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Location: ({criticalHazard.location.lat.toFixed(2)}°, {criticalHazard.location.lon.toFixed(2)}°)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReroute}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Recalculate Route
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {/* Warning Footer */}
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-200 text-xs text-center">
                  ⚠️ DO NOT proceed through hazardous area. Consider immediate route change.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
