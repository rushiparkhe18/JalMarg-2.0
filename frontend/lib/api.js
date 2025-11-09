import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const routeAPI = {
  calculate: async (start, end, mode = 'optimal') => {
    const response = await api.post('/route', { start, end, mode })
    return response.data
  },
  
  getHistory: async () => {
    const response = await api.get('/routes')
    return response.data
  },
}

export const weatherAPI = {
  getCurrent: async (lat, lon) => {
    const response = await api.get(`/weather/${lat}/${lon}`)
    return response.data
  },
  
  getForecast: async (lat, lon) => {
    const response = await api.get(`/weather/forecast/${lat}/${lon}`)
    return response.data
  },
  
  // Get weather for multiple waypoints (optimized for route display)
  getForRoute: async (waypoints, options = {}) => {
    const response = await api.post('/weather/route', { waypoints }, {
      signal: options.signal // Support abort
    })
    return response.data
  },
  
  // Get aggregate weather statistics for route
  getRouteStats: async (coordinates) => {
    const response = await api.post('/weather/route-stats', { coordinates })
    return response.data
  },
}

export const gridAPI = {
  getData: async () => {
    const response = await api.get('/grid')
    return response.data
  },
  
  getCell: async (lat, lon) => {
    const response = await api.get(`/grid/cell/${lat}/${lon}`)
    return response.data
  },
}

// Helper function for weather updates hook
export const getWeatherForRoute = async (waypoints, options = {}) => {
  return weatherAPI.getForRoute(waypoints, options);
}

export default api
