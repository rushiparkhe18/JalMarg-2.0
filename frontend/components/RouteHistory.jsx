'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, MapPin, Navigation, Calendar, TrendingUp, RefreshCw, X, User, UserX } from 'lucide-react'
import axios from 'axios'

export default function RouteHistory({ onLoadRoute, user }) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState(null)
  const [isGuest, setIsGuest] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsGuest(!token)
    fetchRoutes()
  }, [user])

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Logged-in user: fetch from database
        const response = await axios.get('http://localhost:5000/api/user/routes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRoutes(response.data.routes || [])
      } else {
        // Guest user: fetch from localStorage
        const guestRoutes = localStorage.getItem('guestRoutes')
        if (guestRoutes) {
          setRoutes(JSON.parse(guestRoutes))
        } else {
          setRoutes([])
        }
      }
      
      setError(null)
    } catch (err) {
      console.error('Failed to fetch routes:', err)
      setError('Failed to load route history')
    } finally {
      setLoading(false)
    }
  }

  const saveGuestRoute = (route) => {
    const guestRoutes = JSON.parse(localStorage.getItem('guestRoutes') || '[]')
    
    // Add new route at the beginning
    guestRoutes.unshift({
      ...route,
      calculatedAt: new Date().toISOString()
    })
    
    // Keep only last 3 routes
    const limitedRoutes = guestRoutes.slice(0, 3)
    
    localStorage.setItem('guestRoutes', JSON.stringify(limitedRoutes))
    setRoutes(limitedRoutes)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'fuel': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'safe': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'optimal': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'fuel': return '⚡'
      case 'safe': return '🛡️'
      case 'optimal': return '🎯'
      default: return '📍'
    }
  }

  const handleLoadRoute = (route) => {
    if (onLoadRoute) {
      onLoadRoute({
        from: route.from,
        to: route.to,
        mode: route.mode
      })
    }
  }

  const handleDeleteRoute = async (index) => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Logged-in user: delete from database
        await axios.delete(`http://localhost:5000/api/user/routes/${index}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Guest user: delete from localStorage
        const guestRoutes = JSON.parse(localStorage.getItem('guestRoutes') || '[]')
        guestRoutes.splice(index, 1)
        localStorage.setItem('guestRoutes', JSON.stringify(guestRoutes))
      }
      
      fetchRoutes() // Refresh the list
    } catch (err) {
      console.error('Failed to delete route:', err)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="font-bold text-white">Loading history...</h3>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white">Recent Routes</h3>
          <span className="text-xs text-gray-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
            {routes.length}/3
          </span>
          {isGuest && (
            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <UserX className="w-3 h-3" />
              Guest
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>

      {/* Routes List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {error ? (
              <div className="p-4 text-center text-red-400 text-sm">
                {error}
              </div>
            ) : routes.length === 0 ? (
              <div className="p-6 text-center">
                <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No routes calculated yet</p>
                <p className="text-gray-500 text-xs mt-1">Calculate your first route to see it here</p>
                {isGuest && (
                  <motion.a
                    href="/signup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block mt-3 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs font-semibold transition-all"
                  >
                    Sign up to sync routes
                  </motion.a>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {routes.map((route, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/30 rounded-lg p-3 hover:bg-black/50 transition-all group relative"
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRoute(index)
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>

                    {/* Route info */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400 truncate">{route.from}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400 truncate">{route.to}</span>
                        </div>
                      </div>
                      
                      {/* Mode badge */}
                      <div className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${getModeColor(route.mode)}`}>
                        <span>{getModeIcon(route.mode)}</span>
                        <span className="capitalize">{route.mode}</span>
                      </div>
                    </div>

                    {/* Distance and date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{route.distance.toFixed(0)} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(route.calculatedAt)}</span>
                      </div>
                    </div>

                    {/* Recalculate button */}
                    <button
                      onClick={() => handleLoadRoute(route)}
                      className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Calculate Again
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
