# Maritime Navigation System - Backend

Backend API for maritime navigation with weather integration and route calculation using A* algorithm.

## Features

- **Grid Generation**: Create and manage navigation grids with customizable resolution
- **Weather Integration**: Fetch real-time weather data using OpenWeather API
- **Route Calculation**: A* pathfinding algorithm for optimal route planning
- **MongoDB Atlas**: Cloud database for storing grid data
- **RESTful API**: Clean API endpoints for frontend integration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- OpenWeather API key

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
copy .env.example .env
```

3. Configure `.env` with your credentials:
   - MongoDB Atlas connection string
   - OpenWeather API key
   - PORT and CORS settings

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Grid Management
- `POST /api/grid/generate` - Generate navigation grid
- `GET /api/grid` - Get all grids
- `GET /api/grid/:id` - Get specific grid
- `PUT /api/grid/:id` - Update grid
- `DELETE /api/grid/:id` - Delete grid

### Weather Data
- `GET /api/weather/current?lat={lat}&lon={lon}` - Current weather
- `GET /api/weather/forecast?lat={lat}&lon={lon}` - Weather forecast
- `GET /api/weather/marine?lat={lat}&lon={lon}` - Marine weather

### Route Calculation
- `POST /api/route/calculate` - Calculate optimal route

## Project Structure

```
backend/
├── models/
│   └── Grid.js
├── routes/
│   ├── grid.js
│   ├── weather.js
│   └── route.js
├── server.js
├── package.json
└── .env.example
```

## Next Steps

1. Get MongoDB Atlas URI from https://cloud.mongodb.com
2. Get OpenWeather API key from https://openweathermap.org/api
3. Update `.env` file
4. Run `npm install`
5. Run `npm run dev`
