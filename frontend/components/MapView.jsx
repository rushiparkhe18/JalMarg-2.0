import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import GPSMarker from './GPSMarker'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Default route colors (fallback if backend doesn't provide style)
const ROUTE_COLORS = {
  optimal: '#3b82f6',     // Blue
  fuel: '#10b981',        // Green
  fuel_efficient: '#10b981',
  safe: '#f59e0b',        // Amber/Orange
  weather: '#8b5cf6',     // Purple
  normal: '#6b7280',      // Gray
  ulcv: '#ef4444'         // Red
}

// Custom icon for current waypoint
const currentWaypointIcon = L.divIcon({
  html: `<div style="background: #00d4ff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,212,255,0.8);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

function RouteLayer({ routeData, selectedMode, currentWaypointIndex }) {
  const map = useMap()

  useEffect(() => {
    if (routeData && routeData.path) {
      console.log('🗺️ MapView received route with', routeData.path.length, 'points')
      console.log('📍 First 5 points:', routeData.path.slice(0, 5))
      const bounds = L.latLngBounds(
        routeData.path.map(p => [p.lat, p.lon])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [routeData, map])

  // Pan to current waypoint when it changes
  useEffect(() => {
    if (routeData?.path && currentWaypointIndex !== null && currentWaypointIndex >= 0) {
      const waypoint = routeData.path[currentWaypointIndex]
      if (waypoint) {
        map.panTo([waypoint.lat, waypoint.lon], { animate: true, duration: 0.5 })
      }
    }
  }, [currentWaypointIndex, routeData, map])

  if (!routeData || !routeData.path) return null

  const positions = routeData.path.map(p => [p.lat, p.lon])
  
  // Use style from backend if available, otherwise fall back to defaults
  const routeStyle = routeData.style || {}
  const color = routeStyle.color || ROUTE_COLORS[selectedMode] || '#3b82f6'
  const weight = routeStyle.strokeWidth || 6
  const opacity = routeStyle.opacity || 0.8
  const dashArray = routeStyle.dashArray || null
  
  console.log('🎨 Drawing polyline with', positions.length, 'positions')
  console.log('🎨 Route style:', { color, weight, opacity, dashArray, mode: selectedMode })
  console.log('📍 Positions array:', JSON.stringify(positions.slice(0, 5), null, 2))

  return (
    <>
      <Polyline
        key={`route-${routeData.pointsCount}-${selectedMode}`}
        positions={positions}
        pathOptions={{
          color: color,
          weight: weight,
          opacity: opacity,
          dashArray: dashArray,
          lineJoin: 'round',
          lineCap: 'round'
        }}
      />
      <Marker position={positions[0]}>
        <Popup>
          <div className="text-black">
            <strong>🚢 Start Point</strong>
            <br />
            Lat: {routeData.path[0].lat.toFixed(4)}°
            <br />
            Lon: {routeData.path[0].lon.toFixed(4)}°
          </div>
        </Popup>
      </Marker>
      <Marker position={positions[positions.length - 1]}>
        <Popup>
          <div className="text-black">
            <strong>🎯 End Point</strong>
            <br />
            Lat: {routeData.path[routeData.path.length - 1].lat.toFixed(4)}°
            <br />
            Lon: {routeData.path[routeData.path.length - 1].lon.toFixed(4)}°
          </div>
        </Popup>
      </Marker>
      {currentWaypointIndex !== null && currentWaypointIndex >= 0 && routeData.path[currentWaypointIndex] && (
        <Marker 
          position={[routeData.path[currentWaypointIndex].lat, routeData.path[currentWaypointIndex].lon]}
          icon={currentWaypointIcon}
        >
          <Popup>
            <div className="text-black">
              <strong>📍 Current Waypoint {currentWaypointIndex + 1}</strong>
              <br />
              Lat: {routeData.path[currentWaypointIndex].lat.toFixed(4)}°
              <br />
              Lon: {routeData.path[currentWaypointIndex].lon.toFixed(4)}°
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

export default function MapView({ routeData, selectedMode, onWeatherUpdate, gpsLocation, currentWaypointIndex }) {
  return (
    <MapContainer
      center={[15.0, 75.0]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RouteLayer 
        routeData={routeData} 
        selectedMode={selectedMode} 
        currentWaypointIndex={currentWaypointIndex}
      />
      {gpsLocation && (
        <Marker 
          position={[gpsLocation.lat, gpsLocation.lon]}
          icon={L.divIcon({
            className: 'custom-gps-icon',
            html: `
              <div style="position: relative; width: 40px; height: 60px;">
                <!-- Pulsing circle -->
                <div style="
                  position: absolute;
                  width: 50px;
                  height: 50px;
                  left: 50%;
                  top: 12px;
                  transform: translateX(-50%);
                  background: rgba(239, 68, 68, 0.3);
                  border-radius: 50%;
                  animation: pulse 2s infinite;
                "></div>
                
                <!-- Red Lollipop Pin -->
                <div style="position: absolute; left: 50%; transform: translateX(-50%);">
                  <!-- Pin Head -->
                  <div style="
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: bounce 2s infinite;
                  ">
                    <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
                  </div>
                  
                  <!-- Pin Stick -->
                  <div style="
                    width: 3px;
                    height: 20px;
                    background: linear-gradient(to bottom, #dc2626, #b91c1c);
                    margin: 0 auto;
                    box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                  "></div>
                  
                  <!-- Pin Point -->
                  <div style="
                    width: 0;
                    height: 0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-top: 8px solid #b91c1c;
                    margin: 0 auto;
                    margin-left: -2px;
                  "></div>
                </div>
              </div>
              <style>
                @keyframes pulse {
                  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
                  50% { transform: translateX(-50%) scale(1.3); opacity: 0; }
                }
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-5px); }
                }
              </style>
            `,
            iconSize: [40, 60],
            iconAnchor: [20, 60],
            popupAnchor: [0, -60]
          })}
        >
          <Popup>
            <div className="text-black">
              <strong className="text-red-600">📍 Your Location</strong>
              <br />
              <span className="text-sm">
                Lat: {gpsLocation.lat.toFixed(4)}°
                <br />
                Lon: {gpsLocation.lon.toFixed(4)}°
              </span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
