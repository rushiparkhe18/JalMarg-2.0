import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const StrictOceanRouting = () => {
  const [ports, setPorts] = useState([
    { name: 'Mumbai', lat: 18.94, lon: 72.83 },
    { name: 'Singapore', lat: 1.29, lon: 103.85 }
  ]);
  const [strictness, setStrictness] = useState('strict');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const predefinedPorts = {
    'Mumbai': { lat: 18.94, lon: 72.83 },
    'Colombo': { lat: 6.93, lon: 79.85 },
    'Port Klang': { lat: 3.00, lon: 101.39 },
    'Singapore': { lat: 1.29, lon: 103.85 },
    'Chennai': { lat: 13.08, lon: 80.27 },
    'Dubai': { lat: 25.27, lon: 55.30 },
    'Jakarta': { lat: -6.21, lon: 106.85 },
    'Bangkok': { lat: 13.75, lon: 100.50 },
    'Karachi': { lat: 24.85, lon: 67.01 },
    'Chittagong': { lat: 22.33, lon: 91.82 }
  };

  const handleAddPort = (portName) => {
    if (predefinedPorts[portName]) {
      setPorts([...ports, { name: portName, ...predefinedPorts[portName] }]);
    }
  };

  const handleRemovePort = (index) => {
    setPorts(ports.filter((_, i) => i !== index));
  };

  const handleCalculateRoute = async () => {
    if (ports.length < 2) {
      setError('Please select at least 2 ports');
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);
    setSummary(null);

    try {
      const response = await axios.post('http://localhost:5000/api/route/strict-ocean-route', {
        ports,
        strictness
      });

      if (response.data.success) {
        setRoutes(response.data.routes);
        setSummary(response.data.summary);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getColorForSegment = (index) => {
    const colors = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#8b5cf6', '#0891b2'];
    return colors[index % colors.length];
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>🌊 Strict Ocean Routing</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Guaranteed routes that avoid land and maintain safe distance from coastlines
      </p>

      {/* Control Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        {/* Port Selection */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ marginTop: 0 }}>Select Ports</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Add Port:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddPort(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">-- Select a port --</option>
              {Object.keys(predefinedPorts).map(port => (
                <option key={port} value={port}>{port}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Selected Ports ({ports.length}):
            </label>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {ports.map((port, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    marginBottom: '5px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <span>
                    {index + 1}. {port.name}
                    <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '8px' }}>
                      ({port.lat.toFixed(2)}, {port.lon.toFixed(2)})
                    </span>
                  </span>
                  <button
                    onClick={() => handleRemovePort(index)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings & Action */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ marginTop: 0 }}>Routing Settings</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Strictness Level:
            </label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="moderate">Moderate (10km buffer)</option>
              <option value="strict">Strict (20km buffer) - Recommended</option>
              <option value="very-strict">Very Strict (30km buffer)</option>
            </select>
          </div>

          <div style={{ 
            padding: '12px', 
            backgroundColor: '#eff6ff', 
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <strong>ℹ️ Info:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Routes check 50+ points per segment</li>
              <li>Maintains {strictness === 'moderate' ? '10' : strictness === 'strict' ? '20' : '30'}km from coastlines</li>
              <li>Guaranteed no land crossings</li>
            </ul>
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={loading || ports.length < 2}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Calculating...' : '🚢 Calculate Safe Route'}
          </button>

          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#991b1b'
            }}>
              ❌ {error}
            </div>
          )}

          {summary && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px',
              color: '#065f46'
            }}>
              <strong>✅ Route Summary:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Distance: {summary.totalDistance} km</li>
                <li>Waypoints: {summary.totalWaypoints}</li>
                <li>Min clearance: {summary.minClearance} km</li>
                <li>Segments: {summary.segments}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: '600px'
      }}>
        <MapContainer
          center={[10, 80]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Port Markers */}
          {ports.map((port, index) => (
            <Marker key={index} position={[port.lat, port.lon]}>
              <Popup>
                <strong>{index + 1}. {port.name}</strong><br />
                Lat: {port.lat.toFixed(4)}<br />
                Lon: {port.lon.toFixed(4)}
              </Popup>
            </Marker>
          ))}

          {/* Route Lines */}
          {routes.map((route, index) => (
            <React.Fragment key={index}>
              <Polyline
                positions={route.path.map(p => [p.lat, p.lon])}
                color={getColorForSegment(index)}
                weight={4}
                opacity={0.8}
              >
                <Popup>
                  <strong>{route.from} → {route.to}</strong><br />
                  Distance: {route.distance.toFixed(2)} km<br />
                  Waypoints: {route.waypoints}<br />
                  Min clearance: {route.minDistanceFromLand.toFixed(2)} km
                </Popup>
              </Polyline>

              {/* Show some waypoints */}
              {route.path.filter((_, i) => i % 10 === 0).map((point, wpIndex) => (
                <CircleMarker
                  key={`${index}-${wpIndex}`}
                  center={[point.lat, point.lon]}
                  radius={3}
                  color={getColorForSegment(index)}
                  fillColor={getColorForSegment(index)}
                  fillOpacity={0.6}
                />
              ))}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Route Details Table */}
      {routes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📋 Detailed Route Information</h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb'
          }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>#</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>From</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>To</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Distance (km)</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Waypoints</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Min Clearance (km)</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                    {route.from}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                    {route.to}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                    {route.distance.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {route.waypoints}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                    {route.minDistanceFromLand.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StrictOceanRouting;
