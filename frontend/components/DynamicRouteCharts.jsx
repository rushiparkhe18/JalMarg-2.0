import { useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Wind, Fuel, Waves } from 'lucide-react'

export default function DynamicRouteCharts({ routeData, mode }) {
  // Generate chart data from route waypoints with real weather
  const chartData = useMemo(() => {
    if (!routeData || !routeData.path || routeData.path.length === 0) {
      return []
    }

    const data = []
    let cumulativeDistance = 0

    for (let i = 0; i < routeData.path.length; i++) {
      const waypoint = routeData.path[i]
      const weather = waypoint.weather || {}

      // Calculate distance from previous waypoint
      if (i > 0) {
        const prev = routeData.path[i - 1]
        const R = 6371
        const dLat = (waypoint.lat - prev.lat) * Math.PI / 180
        const dLon = (waypoint.lon - prev.lon) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(prev.lat * Math.PI / 180) * Math.cos(waypoint.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        cumulativeDistance += R * c
      }

      // Calculate fuel consumption based on weather conditions
      const windSpeed = weather.windSpeed || 10
      const waveHeight = weather.waveHeight || 2
      const baseFuelRate = 55 // liters per km
      const windFactor = 1 + (windSpeed / 100)
      const waveFactor = 1 + (waveHeight / 20)
      const fuelRate = baseFuelRate * windFactor * waveFactor

      data.push({
        distance: Math.round(cumulativeDistance),
        distanceNM: Math.round(cumulativeDistance * 0.539957),
        windSpeed: Math.round(windSpeed * 10) / 10,
        waveHeight: Math.round(waveHeight * 10) / 10,
        fuelRate: Math.round(fuelRate * 10) / 10,
        cumulativeFuel: Math.round(cumulativeDistance * fuelRate / 100) * 100,
        waypoint: i,
        lat: waypoint.lat.toFixed(2),
        lon: waypoint.lon.toFixed(2),
        // Safety score
        safety: Math.max(0, 100 - (windSpeed > 25 ? 30 : windSpeed > 15 ? 15 : 0) - (waveHeight > 4 ? 30 : waveHeight > 2.5 ? 15 : 0))
      })
    }

    return data
  }, [routeData])

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const avgWind = chartData.reduce((sum, d) => sum + d.windSpeed, 0) / chartData.length
    const maxWind = Math.max(...chartData.map(d => d.windSpeed))
    const avgWave = chartData.reduce((sum, d) => sum + d.waveHeight, 0) / chartData.length
    const maxWave = Math.max(...chartData.map(d => d.waveHeight))
    const avgFuelRate = chartData.reduce((sum, d) => sum + d.fuelRate, 0) / chartData.length
    const totalFuel = chartData[chartData.length - 1]?.cumulativeFuel || 0
    const avgSafety = chartData.reduce((sum, d) => sum + d.safety, 0) / chartData.length

    return { avgWind, maxWind, avgWave, maxWave, avgFuelRate, totalFuel, avgSafety }
  }, [chartData])

  if (!routeData || chartData.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-gray-400">
        <p>No route data available for charts</p>
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-card p-3 border border-cyan-500/30">
          <p className="text-xs text-gray-400 mb-1">Waypoint {data.waypoint}</p>
          <p className="text-xs text-cyan-400">Distance: {data.distance} km ({data.distanceNM} nm)</p>
          <p className="text-xs text-gray-300">Location: ({data.lat}°, {data.lon}°)</p>
          <div className="border-t border-gray-700 mt-2 pt-2 space-y-1">
            {payload.map((entry, i) => (
              <p key={i} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value} {entry.unit || ''}
              </p>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Dynamic Route Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-lg bg-cyan-500/10">
              <div className="text-xs text-gray-400">Avg Wind</div>
              <div className="text-lg font-bold text-cyan-400">{stats.avgWind.toFixed(1)} kts</div>
              <div className="text-xs text-gray-500">Max: {stats.maxWind.toFixed(1)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10">
              <div className="text-xs text-gray-400">Avg Waves</div>
              <div className="text-lg font-bold text-blue-400">{stats.avgWave.toFixed(1)} m</div>
              <div className="text-xs text-gray-500">Max: {stats.maxWave.toFixed(1)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <div className="text-xs text-gray-400">Avg Fuel Rate</div>
              <div className="text-lg font-bold text-green-400">{stats.avgFuelRate.toFixed(1)} L/km</div>
              <div className="text-xs text-gray-500">Total: {(stats.totalFuel/1000).toFixed(1)}K L</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-500/10">
              <div className="text-xs text-gray-400">Avg Safety</div>
              <div className="text-lg font-bold text-orange-400">{stats.avgSafety.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Wind & Wave Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h4 className="text-md font-bold mb-4 flex items-center gap-2">
          <Wind className="w-5 h-5 text-cyan-400" />
          Weather Conditions Along Route
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="distance" 
              stroke="#64748b"
              label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748b"
              label={{ value: 'Wind Speed (kts)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              label={{ value: 'Wave Height (m)', angle: 90, position: 'insideRight', fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="windSpeed" 
              stroke="#06b6d4" 
              name="Wind Speed"
              unit=" kts"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="waveHeight" 
              stroke="#3b82f6" 
              name="Wave Height"
              unit=" m"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fuel Consumption Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h4 className="text-md font-bold mb-4 flex items-center gap-2">
          <Fuel className="w-5 h-5 text-green-400" />
          Dynamic Fuel Consumption
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="distance" 
              stroke="#64748b"
              label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748b"
              label={{ value: 'Fuel Rate (L/km)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              label={{ value: 'Cumulative (Liters)', angle: 90, position: 'insideRight', fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="fuelRate" 
              stroke="#10b981" 
              name="Fuel Rate"
              unit=" L/km"
              strokeWidth={2}
              dot={false}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="cumulativeFuel" 
              stroke="#059669" 
              fill="url(#fuelGradient)"
              name="Cumulative Fuel"
              unit=" L"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Safety Score Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h4 className="text-md font-bold mb-4 flex items-center gap-2">
          <Waves className="w-5 h-5 text-orange-400" />
          Safety Score Along Route
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="safetyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="distance" 
              stroke="#64748b"
              label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
            />
            <YAxis 
              stroke="#64748b"
              domain={[0, 100]}
              label={{ value: 'Safety Score (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="safety" 
              stroke="#f59e0b" 
              fill="url(#safetyGradient)"
              name="Safety Score"
              unit="%"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
