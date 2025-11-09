'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ControlPanel from '../../components/ControlPanel'
import RouteStats from '../../components/RouteStats'
import RouteNavigation from '../../components/RouteNavigation'
import WeatherDashboard from '../../components/WeatherDashboard'
import LoadingScreen from '../../components/LoadingScreen'
import Header from '../../components/Header'
import CycloneWarning from '../../components/CycloneWarning'
import DynamicRouteCharts from '../../components/DynamicRouteCharts'
import HazardMonitor from '../../components/HazardMonitor'
import RouteHistory from '../../components/RouteHistory'

const MapView = dynamic(() => import('../../components/MapView'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [gpsLocation, setGpsLocation] = useState(null)
  const [currentWaypoint, setCurrentWaypoint] = useState(null)
  const [selectedMode, setSelectedMode] = useState('optimal')
  const [showStats, setShowStats] = useState(false)
  const [user, setUser] = useState(null)

  // Suppress hydration warnings from browser extensions (bis_skin_checked, etc.)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Extra attributes from the server') ||
         args[0].includes('bis_skin_checked'))
      ) {
        return; // Suppress this specific warning
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError; // Restore original on cleanup
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in (optional - allow guest access)
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    // Allow guest users to access dashboard
    
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [router])

  const handleRouteCalculated = (data) => {
    setRouteData(data)
    setShowStats(true)
  }

  const handleReroute = (avoidAreas = []) => {
    // Trigger recalculation with avoided areas
    console.log('Rerouting to avoid:', avoidAreas)
    // This should call the calculateRoute function again with avoidance parameters
    // For now, just log - you can wire this up to ControlPanel's calculate function
  }

  const handleWeatherUpdate = (data) => {
    setWeatherData(data)
  }

  const handleLocationUpdate = (location) => {
    setGpsLocation(location)
  }

  const handleWaypointChange = (waypointIndex, weather) => {
    setCurrentWaypoint({ index: waypointIndex, weather })
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden animated-bg">
      <Header />
      
      {/* Guest User Banner */}
      {!user && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 mx-4"
        >
          <div className="backdrop-blur-md bg-orange-500/10 border border-orange-500/30 rounded-lg px-6 py-3 shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚠️
              </motion.div>
              <span className="text-sm text-orange-200">
                You're using <strong>Guest Mode</strong> - Routes saved locally only
              </span>
            </div>
            <a
              href="/signup"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 rounded text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Sign Up Free
            </a>
          </div>
        </motion.div>
      )}
      
      <div className="flex h-[calc(100vh-80px)] mt-[80px] gap-4 p-4">
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-[380px] flex-shrink-0"
        >
          <ControlPanel
            onRouteCalculated={handleRouteCalculated}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex-1 glass-card overflow-hidden"
        >
          <MapView
            routeData={routeData}
            selectedMode={selectedMode}
            onWeatherUpdate={handleWeatherUpdate}
            gpsLocation={gpsLocation}
            currentWaypointIndex={currentWaypoint?.index}
          />
        </motion.div>

        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-[380px] flex-shrink-0 space-y-4 overflow-y-auto"
        >
          {/* Route History - Show for all users (logged in or guest) */}
          {!showStats && (
            <RouteHistory 
              user={user}
              onLoadRoute={(route) => {
                // You can implement auto-loading the route here
                console.log('Load route:', route)
                // For now, just log - you'll need to pass this to ControlPanel
              }} 
            />
          )}

          {/* Cyclone Warning - Always visible */}
          <CycloneWarning 
            routeData={routeData}
            onRerouteRequest={handleReroute}
          />

          <AnimatePresence>
            {showStats && routeData && (
              <>
                <RouteStats data={routeData} mode={selectedMode} />
                
                {/* Dynamic Charts with weather data */}
                <DynamicRouteCharts routeData={routeData} />
                
                {/* Hazard Monitor */}
                <HazardMonitor 
                  routeData={routeData}
                  onRerouteRequest={handleReroute}
                />
                
                <RouteNavigation 
                  routeData={routeData} 
                  onWaypointChange={handleWaypointChange}
                />
              </>
            )}
          </AnimatePresence>
          
          <WeatherDashboard 
            data={weatherData} 
            onLocationUpdate={handleLocationUpdate}
          />
        </motion.div>
      </div>
    </div>
  )
}
