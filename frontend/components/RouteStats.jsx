import { motion } from 'framer-motion'
import { Navigation, Clock, Fuel, TrendingUp, Wind, Waves, Shield, Droplets } from 'lucide-react'
import { useMemo } from 'react'

export default function RouteStats({ data, mode }) {
  if (!data) return null

  const getModeColor = () => {
    const colors = {
      optimal: 'orange',
      fuel: 'green',
      safe: 'blue'
    }
    return colors[mode] || 'cyan'
  }

  const color = getModeColor()

  // Use backend-calculated dynamic metrics (preferred) or fallback to frontend calculation
  const dynamicStats = useMemo(() => {
    // If backend provides dynamic metrics, use them directly
    if (data.metrics && data.modeSpecific?.isDynamic) {
      return {
        totalDistance: data.totalDistance || 0,
        estimatedTime: data.totalTime || 0,
        fuelCost: data.fuelCost || 0,
        avgWind: data.avgWind || 0,
        avgWaves: data.avgWaveHeight || 0,
        maxWind: data.maxWind || 0,
        maxWaves: data.maxWave || 0,
        routeEfficiency: data.metrics.efficiency || 0,
        safetyScore: data.metrics.safety || 0,
        fuelPerKm: data.metrics.fuelPerKm || 0,
        weatherScore: data.metrics.weatherScore || 0,
        isDynamic: true
      }
    }

    // Fallback: Calculate from path data if backend doesn't provide metrics
    if (!data.path || data.path.length === 0) {
      return {
        totalDistance: 0,
        estimatedTime: 0,
        fuelCost: 0,
        avgWind: 0,
        avgWaves: 0,
        maxWind: 0,
        maxWaves: 0,
        routeEfficiency: 0,
        safetyScore: 0,
        isDynamic: false
      }
    }

    // Calculate total distance from waypoints
    let totalDistance = 0
    for (let i = 0; i < data.path.length - 1; i++) {
      const p1 = data.path[i]
      const p2 = data.path[i + 1]
      const R = 6371 // Earth radius in km
      const dLat = (p2.lat - p1.lat) * Math.PI / 180
      const dLon = (p2.lon - p1.lon) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      totalDistance += R * c
    }

    // Calculate straight-line distance for efficiency
    const start = data.path[0]
    const end = data.path[data.path.length - 1]
    const R = 6371
    const dLat = (end.lat - start.lat) * Math.PI / 180
    const dLon = (end.lon - start.lon) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const straightDistance = R * c

    // Calculate route efficiency (closer to 100% = more direct)
    const routeEfficiency = (straightDistance / totalDistance) * 100

    // PERFORMANCE: Use pre-calculated weather stats from backend if available
    let avgWind, avgWaves, maxWind, maxWaves;
    
    if (data.weather_stats) {
      // Backend provided pre-calculated stats - USE THESE (faster!)
      avgWind = data.weather_stats.avg_wind_speed || 12;
      avgWaves = data.weather_stats.avg_wave_height || 2;
      maxWind = data.weather_stats.max_wind_speed || 15;
      maxWaves = data.weather_stats.max_wave_height || 3;
    } else {
      // Fallback: Calculate from waypoint data
      let totalWind = 0;
      let totalWaves = 0;
      maxWind = 0;
      maxWaves = 0;
      let weatherCount = 0;

      data.path.forEach(waypoint => {
        const weather = waypoint.weather || waypoint.weatherData;
        if (weather) {
          totalWind += weather.windSpeed || 0;
          totalWaves += weather.waveHeight || 0;
          maxWind = Math.max(maxWind, weather.windSpeed || 0);
          maxWaves = Math.max(maxWaves, weather.waveHeight || 0);
          weatherCount++;
        }
      });

      avgWind = weatherCount > 0 ? totalWind / weatherCount : 12;
      avgWaves = weatherCount > 0 ? totalWaves / weatherCount : 2;
    }

    // Calculate estimated time (average cargo ship speed: 20-25 knots = 37-46 km/h)
    // Use 22 knots (40.7 km/h) as average
    const avgSpeed = 40.7 // km/h
    const estimatedTime = totalDistance / avgSpeed

    // Calculate fuel cost (rough estimate: 50-70 liters per km for cargo ships)
    // Use ₹80 per liter diesel price
    const fuelPerKm = mode === 'fuel' ? 50 : mode === 'safe' ? 65 : 58 // liters/km
    const fuelPrice = 80 // ₹/liter
    const fuelCost = totalDistance * fuelPerKm * fuelPrice

    // Calculate safety score based on weather
    let safetyScore = 100
    if (avgWind > 15) safetyScore -= (avgWind - 15) * 2
    if (avgWaves > 3) safetyScore -= (avgWaves - 3) * 5
    if (maxWind > 25) safetyScore -= 10
    if (maxWaves > 5) safetyScore -= 10
    safetyScore = Math.max(0, Math.min(100, safetyScore))

    return {
      totalDistance,
      estimatedTime,
      fuelCost,
      avgWind,
      avgWaves,
      maxWind,
      maxWaves,
      routeEfficiency,
      safetyScore,
      isDynamic: false
    }
  }, [data, mode])

  // Get mode-specific efficiency metric with dynamic backend data
  const getEfficiencyMetric = () => {
    if (data.modeSpecific?.isDynamic && data.metrics?.efficiency) {
      // Use backend's dynamic efficiency calculation
      return {
        label: mode === 'fuel' ? 'Fuel Efficiency' : mode === 'safe' ? 'Safety Score' : 'Route Efficiency',
        value: `${data.metrics.efficiency.toFixed(1)}%`,
        color: color,
        isDynamic: true
      }
    }

    // Fallback to frontend calculation
    switch(mode) {
      case 'fuel':
        return {
          label: 'Fuel Efficiency',
          value: `${((100 - dynamicStats.fuelCost / 1000000) * 100).toFixed(1)}%`,
          color: 'green',
          isDynamic: false
        }
      case 'safe':
        return {
          label: 'Safety Score',
          value: `${dynamicStats.safetyScore.toFixed(1)}%`,
          color: 'blue',
          isDynamic: false
        }
      default:
        return {
          label: 'Route Efficiency',
          value: `${dynamicStats.routeEfficiency.toFixed(1)}%`,
          color: 'orange',
          isDynamic: false
        }
    }
  }

  const efficiencyMetric = getEfficiencyMetric()

  const stats = [
    {
      icon: Navigation,
      label: 'Total Distance',
      value: data.total_distance_km 
        ? `${data.total_distance_km.toFixed(1)} km`
        : `${dynamicStats.totalDistance.toFixed(1)} km`,
      color: 'cyan',
      subtext: data.total_distance_nm 
        ? `${data.total_distance_nm.toFixed(1)} nm`
        : `${(dynamicStats.totalDistance * 0.539957).toFixed(1)} nm`
    },
    {
      icon: Clock,
      label: 'Est. Duration',
      value: data.duration?.days 
        ? `${data.duration.days.toFixed(1)} days`
        : dynamicStats.estimatedTime >= 24 
          ? `${(dynamicStats.estimatedTime / 24).toFixed(1)} days`
          : `${dynamicStats.estimatedTime.toFixed(1)} hrs`,
      color: 'purple',
      subtext: data.duration?.hours 
        ? `${data.duration.hours.toFixed(1)} hrs @ ${data.duration.avg_speed_knots?.toFixed(1) || '22'} knots`
        : `@ 22 knots avg`
    },
    {
      icon: Fuel,
      label: 'Fuel Consumption',
      value: data.fuel_consumption?.total_tons 
        ? `${data.fuel_consumption.total_tons.toFixed(1)} tons`
        : `₹${(dynamicStats.fuelCost / 100000).toFixed(1)}L`,
      color: 'green',
      subtext: data.fuel_consumption?.total_cost_usd && data.vessel_specs?.fuel_price_usd_per_ton
        ? `$${(data.fuel_consumption.total_cost_usd / 1000).toFixed(1)}K (@ $${data.vessel_specs.fuel_price_usd_per_ton}/ton)`
        : data.fuel_consumption?.total_cost_usd
        ? `₹${((data.fuel_consumption.total_cost_usd * 83) / 100000).toFixed(1)}L`
        : `@ ₹80/L diesel`
    },
    {
      icon: TrendingUp,
      label: efficiencyMetric.label,
      value: efficiencyMetric.value,
      color: efficiencyMetric.color,
      subtext: mode === 'optimal' ? 'vs straight line' : mode === 'fuel' ? 'fuel optimized' : 'max safety'
    },
    {
      icon: Wind,
      label: 'Wind Conditions',
      value: `${dynamicStats.avgWind.toFixed(1)} kts`,
      color: 'yellow',
      subtext: `max ${dynamicStats.maxWind.toFixed(1)} kts`
    },
    {
      icon: Waves,
      label: 'Wave Conditions',
      value: `${dynamicStats.avgWaves.toFixed(1)} m`,
      color: 'teal',
      subtext: `max ${dynamicStats.maxWaves.toFixed(1)} m`
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Shield className={`w-8 h-8 text-${color}-400`} />
        <div>
          <h3 className="text-lg font-bold">Route Statistics</h3>
          <p className="text-xs text-gray-400 capitalize">{mode} mode</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-4 rounded-xl"
            >
              <Icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
              <div className="text-xs text-gray-400">{stat.label}</div>
              <div className="text-lg font-bold">{stat.value}</div>
              {stat.subtext && (
                <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Industry-Standard Fuel Breakdown */}
      {data.fuel_consumption && data.fuel_consumption.breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-green-400" />
            <h4 className="text-sm font-bold text-gray-200">Fuel Consumption Analysis</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <div className="text-gray-400">Main Engine</div>
              <div className="text-lg font-bold text-blue-400">
                {data.fuel_consumption?.main_engine_tons?.toFixed(1) || '0.0'} tons
              </div>
              <div className="text-gray-500 text-xs">Propulsion fuel</div>
            </div>
            
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <div className="text-gray-400">Auxiliary</div>
              <div className="text-lg font-bold text-purple-400">
                {data.fuel_consumption?.auxiliary_tons?.toFixed(1) || '0.0'} tons
              </div>
              <div className="text-gray-500 text-xs">Ship systems</div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400">Efficiency Factors:</div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Speed Factor (cubic):</span>
              <span className="text-xs font-mono text-cyan-400">
                {data.fuel_consumption.breakdown.speed_factor.toFixed(3)}x
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Weather Impact:</span>
              <span className={`text-xs font-mono ${
                data.fuel_consumption.breakdown.weather_factor > 1.2 ? 'text-red-400' :
                data.fuel_consumption.breakdown.weather_factor > 1.05 ? 'text-orange-400' :
                'text-green-400'
              }`}>
                {((data.fuel_consumption.breakdown.weather_factor - 1) * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Engine Load:</span>
              <span className="text-xs font-mono text-blue-400">
                {(data.fuel_consumption.breakdown.load_factor * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {data.conditions && (
            <div className="pt-2 border-t border-gray-700 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Route Conditions:</span>
                <span className={`font-semibold capitalize ${
                  data.conditions.weather_description === 'favorable' ? 'text-green-400' :
                  data.conditions.weather_description === 'moderate' ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  {data.conditions.weather_description}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500">Open Water:</span>
                <span className="text-cyan-400 font-mono">
                  {data.conditions.open_water_percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
          
          {/* Cost Summary */}
          {data.fuel_consumption?.total_cost_usd && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Total Fuel Cost:</div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-yellow-400">
                  ₹{((data.fuel_consumption.total_cost_usd * 83) / 100000).toFixed(1)}L
                </span>
                <span className="text-xs text-gray-500">
                  (${(data.fuel_consumption.total_cost_usd / 1000).toFixed(1)}K USD)
                </span>
              </div>
              {data.vessel_specs?.fuel_price_inr_per_ton && (
                <div className="text-xs text-gray-500 mt-1">
                  @ ₹{(data.vessel_specs.fuel_price_inr_per_ton / 1000).toFixed(1)}K/ton (HFO)
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Dynamic Weather Alerts System */}
      {data.alerts && (data.alerts.hasCritical || data.alerts.hasHigh || data.alerts.moderate?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {/* Critical Alerts */}
          {data.alerts.critical?.map((alert, i) => (
            <div
              key={`critical-${i}`}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-pulse"
            >
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-red-400">
                    🚨 CRITICAL ALERT
                  </div>
                  <div className="text-xs text-red-300 mt-1">
                    {alert.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Location: ({alert.location.lat.toFixed(2)}°, {alert.location.lon.toFixed(2)}°)
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* High Priority Alerts */}
          {data.alerts.high?.slice(0, 2).map((alert, i) => (
            <div
              key={`high-${i}`}
              className="p-3 bg-orange-500/15 border border-orange-500/40 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Wind className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-orange-400">
                    ⚠️ HIGH ALERT
                  </div>
                  <div className="text-xs text-orange-300 mt-0.5">
                    {alert.message}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Alert Summary if more exist */}
          {data.alerts.totalCount > 5 && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
              <div className="text-xs text-yellow-400">
                + {data.alerts.totalCount - 5} more alerts along the route
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Legacy Warnings (if no dynamic alerts available) */}
      {!data.alerts && data.warnings && data.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-yellow-400 mb-1">
                Weather Warnings
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                {data.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Freshness Indicator */}
      {dynamicStats.isDynamic && (
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time calculations
            </span>
            {data.calculatedAt && (
              <span className="text-gray-500">
                {new Date(data.calculatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
