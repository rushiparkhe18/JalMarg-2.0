import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation, Anchor, MapPin, Gauge, Shield, Fuel, Zap, Search } from 'lucide-react'
import axios from 'axios'

// Fallback ports if API fails
const FALLBACK_PORTS = [
  // India - West Coast
  { name: 'Mumbai (Nhava Sheva)', country: 'India', lat: 18.9388, lon: 72.8354 },
  { name: 'Kandla', country: 'India', lat: 23.0333, lon: 70.2167 },
  { name: 'Mundra', country: 'India', lat: 22.8333, lon: 69.7167 },
  { name: 'Kochi (Cochin)', country: 'India', lat: 9.9312, lon: 76.2673 },
  { name: 'New Mangalore', country: 'India', lat: 12.9141, lon: 74.8560 },
  
  // India - East Coast
  { name: 'Chennai (Madras)', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Visakhapatnam', country: 'India', lat: 17.6869, lon: 83.2185 },
  { name: 'Kolkata (Haldia)', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Tuticorin', country: 'India', lat: 8.7642, lon: 78.1348 },
  
  // Other Major Ports
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { name: 'Singapore', country: 'Singapore', lat: 1.2644, lon: 103.8220 },
  { name: 'Dubai (Jebel Ali)', country: 'UAE', lat: 24.9857, lon: 55.0272 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Chittagong', country: 'Bangladesh', lat: 22.3569, lon: 91.7832 },
]

const MODES = [
  { id: 'optimal', name: 'Optimal', icon: Zap, color: 'orange', description: 'Balanced: Safety & Fuel' },
  { id: 'fuel', name: 'Fuel Efficient', icon: Fuel, color: 'green', description: 'Maximum fuel savings' },
  { id: 'safe', name: 'Safe', icon: Shield, color: 'blue', description: 'Maximum safety, far from coast' },
]

export default function ControlPanel({ onRouteCalculated, selectedMode, setSelectedMode }) {
  const [ports, setPorts] = useState([])
  const [filteredFromPorts, setFilteredFromPorts] = useState([])
  const [filteredToPorts, setFilteredToPorts] = useState([])
  const [fromPort, setFromPort] = useState('')
  const [toPort, setToPort] = useState('')
  const [fromSearch, setFromSearch] = useState('')
  const [toSearch, setToSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPorts, setLoadingPorts] = useState(true)

  // Fetch all ports on component mount
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ports')
        if (response.data && response.data.ports && response.data.ports.length > 0) {
          setPorts(response.data.ports)
          setFilteredFromPorts(response.data.ports)
          setFilteredToPorts(response.data.ports)
          console.log(`✅ Loaded ${response.data.ports.length} ports from API`)
        } else {
          // Use fallback ports
          setPorts(FALLBACK_PORTS)
          setFilteredFromPorts(FALLBACK_PORTS)
          setFilteredToPorts(FALLBACK_PORTS)
          console.log('⚠️ Using fallback ports')
        }
      } catch (error) {
        console.error('Failed to fetch ports, using fallback:', error.message)
        // Use fallback ports on error
        setPorts(FALLBACK_PORTS)
        setFilteredFromPorts(FALLBACK_PORTS)
        setFilteredToPorts(FALLBACK_PORTS)
      } finally {
        setLoadingPorts(false)
      }
    }
    fetchPorts()
  }, [])

  // Filter ports based on search
  useEffect(() => {
    if (fromSearch) {
      const filtered = ports.filter(port =>
        port.name?.toLowerCase().includes(fromSearch.toLowerCase()) ||
        port.country?.toLowerCase().includes(fromSearch.toLowerCase()) ||
        port.region?.toLowerCase().includes(fromSearch.toLowerCase())
      )
      setFilteredFromPorts(filtered)
    } else {
      setFilteredFromPorts(ports)
    }
  }, [fromSearch, ports])

  useEffect(() => {
    if (toSearch) {
      const filtered = ports.filter(port =>
        port.name?.toLowerCase().includes(toSearch.toLowerCase()) ||
        port.country?.toLowerCase().includes(toSearch.toLowerCase()) ||
        port.region?.toLowerCase().includes(toSearch.toLowerCase())
      )
      setFilteredToPorts(filtered)
    } else {
      setFilteredToPorts(ports)
    }
  }, [toSearch, ports])

  const calculateRoute = async () => {
    if (!fromPort || !toPort) return

    setLoading(true)
    const startTime = Date.now()
    
    try {
      const from = ports.find(p => p.name === fromPort)
      const to = ports.find(p => p.name === toPort)

      if (!from || !to) {
        console.error('Port not found')
        return
      }

      console.log(`🚢 Calculating route: ${fromPort} → ${toPort} (${selectedMode} mode)`)
      
      // Calculate route distance to estimate timeout needed
      const distance = Math.sqrt(
        Math.pow(to.lat - from.lat, 2) + Math.pow(to.lon - from.lon, 2)
      )
      const isLongRoute = distance > 20 // ~2000km+
      const timeout = isLongRoute ? 900000 : 600000 // 15min for long routes, 10min for short - includes open water analysis time
      
      if (isLongRoute) {
        console.log(`⚠️ Long route detected - may take 5-10 minutes with open water analysis and weather data`)
      }
      
      const response = await axios.post('http://localhost:5000/api/route/strict-ocean-route', {
        ports: [
          { name: fromPort, lat: from.lat, lon: from.lon },
          { name: toPort, lat: to.lat, lon: to.lon }
        ],
        mode: selectedMode
      }, {
        timeout: timeout
      })

      const calcTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ Route calculated in ${calcTime}s`)
      
      // Debug: Log raw response
      console.log('🔍 Raw backend response:', JSON.stringify({
        success: response.data.success,
        hasRoutes: !!response.data.routes,
        routesLength: response.data.routes?.length,
        firstRoute: response.data.routes?.[0] ? {
          hasPath: !!response.data.routes[0].path,
          pathLength: response.data.routes[0].path?.length,
          distance: response.data.routes[0].distance,
          keys: Object.keys(response.data.routes[0])
        } : null
      }, null, 2))
      
      // Transform backend response to match MapView expectations
      // Backend returns: { routes: [{path: [...]}], summary: {...} }
      // MapView expects: { path: [...], distance: ..., ... }
      let transformedData = null
      
      if (response.data.routes && response.data.routes.length > 0 && response.data.routes[0].path) {
        // Multi-port route format
        transformedData = {
          ...response.data.routes[0], // Take first route's path, distance, etc.
          summary: response.data.summary,
          mode: response.data.mode
        }
      } else if (response.data.path) {
        // Single route format (old format)
        transformedData = response.data
      } else {
        // No valid route found
        console.error('❌ No valid route in response')
        alert('No route found. The route may cross land or be out of grid coverage.')
        return
      }
      
      console.log('📍 Path points:', transformedData.path?.length)
      console.log('🗺️ Transformed route data:', {
        hasPath: !!transformedData.path,
        pathLength: transformedData.path?.length,
        distance: transformedData.distance
      })

      onRouteCalculated(transformedData)

      // Save route to history (database for logged-in users, localStorage for guests)
      const token = localStorage.getItem('token')
      if (response.data) {
        // Debug: Log response structure
        console.log('📦 Route response:', {
          hasSummary: !!response.data.summary,
          success: response.data.success,
          summary: response.data.summary
        })
        
        // Extract distance and duration from response
        let distance = 0
        let duration = 0
        
        // Try to get distance - prefer numeric version
        if (response.data.summary?.totalDistanceKm) {
          distance = response.data.summary.totalDistanceKm
          console.log('📏 Using numeric distance:', distance, 'km')
        } else if (response.data.summary?.totalDistance) {
          // Fallback: parse from string format "1250 km"
          const distanceStr = response.data.summary.totalDistance.toString()
          distance = parseFloat(distanceStr.replace(/[^\d.]/g, '')) || 0
          console.log('📏 Parsed distance from string:', distance, 'km')
        } else {
          console.warn('⚠️ No distance found in response')
        }
        
        // Get duration (hours) - calculate if not provided
        if (response.data.summary?.totalTime) {
          duration = response.data.summary.totalTime
        } else if (response.data.routes && response.data.routes.length > 0) {
          // Sum up duration from all route segments
          duration = response.data.routes.reduce((sum, route) => sum + (route.duration || 0), 0)
        }
        console.log('⏱️ Duration:', duration, 'hours')
        
        if (token) {
          // Logged-in user: save to database
          try {
            await axios.post('http://localhost:5000/api/user/routes', {
              from: fromPort,
              to: toPort,
              mode: selectedMode,
              distance: distance,
              duration: duration
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
            console.log('✅ Route saved to database')
          } catch (saveError) {
            console.error('Failed to save route to database:', saveError)
            console.error('Route data sent:', { from: fromPort, to: toPort, mode: selectedMode, distance, duration })
          }
        } else {
          // Guest user: save to localStorage
          try {
            const guestRoutes = JSON.parse(localStorage.getItem('guestRoutes') || '[]')
            guestRoutes.unshift({
              from: fromPort,
              to: toPort,
              mode: selectedMode,
              distance: distance,
              duration: duration,
              calculatedAt: new Date().toISOString()
            })
            // Keep only last 3 routes
            const limitedRoutes = guestRoutes.slice(0, 3)
            localStorage.setItem('guestRoutes', JSON.stringify(limitedRoutes))
            console.log('✅ Route saved to localStorage (guest mode)')
          } catch (saveError) {
            console.error('Failed to save guest route:', saveError)
          }
        }
      }
    } catch (error) {
      console.error('Route calculation failed:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
      alert(`Failed to calculate route: ${errorMsg}\n\nPlease ensure the backend is running on port 5000.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full glass-card p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-xl font-bold">Route Planner</h2>
          <p className="text-xs text-gray-400">Calculate optimal maritime routes</p>
        </div>
      </div>

      {/* From Port */}
      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <MapPin className="w-4 h-4 text-green-400" />
          From Port
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={fromSearch}
            onChange={(e) => setFromSearch(e.target.value)}
            placeholder="Search ports..."
            className="w-full pl-10 pr-4 py-2 glass-card border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:outline-none transition-all text-sm"
          />
        </div>
        <select
          value={fromPort}
          onChange={(e) => setFromPort(e.target.value)}
          disabled={loadingPorts}
          className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:outline-none transition-all text-white"
        >
          <option value="" className="bg-gray-900">
            {loadingPorts ? 'Loading ports...' : `Select departure port (${filteredFromPorts.length} available)`}
          </option>
          {filteredFromPorts.map((port, idx) => (
            <option key={`${port.name}-${idx}`} value={port.name} className="bg-gray-900">
              {port.name} ({port.country})
            </option>
          ))}
        </select>
      </motion.div>

      {/* To Port */}
      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Anchor className="w-4 h-4 text-red-400" />
          To Port
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={toSearch}
            onChange={(e) => setToSearch(e.target.value)}
            placeholder="Search ports..."
            className="w-full pl-10 pr-4 py-2 glass-card border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:outline-none transition-all text-sm"
          />
        </div>
        <select
          value={toPort}
          onChange={(e) => setToPort(e.target.value)}
          disabled={loadingPorts}
          className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:outline-none transition-all text-white"
        >
          <option value="" className="bg-gray-900">
            {loadingPorts ? 'Loading ports...' : `Select destination port (${filteredToPorts.length} available)`}
          </option>
          {filteredToPorts.map((port, idx) => (
            <option key={`${port.name}-${idx}`} value={port.name} className="bg-gray-900">
              {port.name} ({port.country})
            </option>
          ))}
        </select>
      </motion.div>

      {/* Route Modes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Route Mode</label>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map(mode => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id
            return (
              <motion.button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 glass-card rounded-xl transition-all ${
                  isSelected ? `glow-${mode.color} border-2 border-${mode.color}-400` : ''
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 mx-auto text-${mode.color}-400`} />
                <div className="text-sm font-medium">{mode.name}</div>
                <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Calculate Button */}
      <motion.button
        onClick={calculateRoute}
        disabled={!fromPort || !toPort || loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full glass-button py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Calculating route...</span>
            <span className="text-xs text-cyan-300">This may take 5-10 minutes for long routes</span>
          </div>
        ) : (
          'Calculate Route'
        )}
      </motion.button>
    </div>
  )
}
