# 🚢 Jalmarg 2.0 - Maritime Route Planning System

**Intelligent Maritime Route Optimization with Open Water Intelligence**

[![Status](https://img.shields.io/badge/status-production-green)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)]()

---

## 📋 Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Route Modes](#route-modes)
- [Understanding Metrics](#understanding-metrics)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## ✨ Features

### Core Capabilities
- **🗺️ Dynamic Route Planning**: Three optimization modes (Fuel, Optimal, Safe)
- **🌊 Open Water Intelligence**: Routes prefer deep ocean over coastal paths for safety
- **⚓ Industry-Standard Calculations**: Professional fuel consumption (cubic speed relationship) and realistic duration estimates
- **📊 Percentage-Based Metrics**: Easy-to-understand safety (0-100%) and fuel efficiency (0-100%)
- **🌪️ Real-Time Weather**: Cyclone detection and avoidance with 0-40% fuel impact
- **⛵ Smart Navigation**: Exclusion zones for dangerous straits (Palk Strait, Gulf of Mannar)
- **📱 Guest Mode**: No login required for basic features
- **💾 Route History**: Save and compare routes
- **🎯 Interactive Map**: Visualize routes with Leaflet.js

### Technical Highlights
- **A* Pathfinding** with open water cost optimization
- **157,000+ grid cells** covering Indian Ocean
- **0.2° resolution** (~22km accuracy)
- **3-10 second** route calculation for most routes
- **Maritime-Grade Formulas**: Speed³ fuel relationship, vessel specs (50,000 DWT Panamax)
- **Weather Impact Modeling**: +0-40% fuel in storms, speed adjustment in SAFE mode
- **Mode-Specific Speeds**: 12-21 knots range (slow steaming to service speed)
- **MongoDB Atlas** cloud database
- **Next.js** modern frontend

---

## 🚀 Quick Start

### 1. Install Dependencies

Run the installation script:
```bash
INSTALL.bat
```

Or manually:
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment

Copy `backend/.env.template` to `backend/.env` and add your MongoDB connection:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jalmarg
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Application

Double-click `START_DEMO.bat` or run manually:

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 4. Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 💻 System Requirements

- **Node.js**: v18 or higher
- **MongoDB**: Atlas account (free tier works)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for dependencies
- **Internet**: Required for weather data and MongoDB

---

## 🛠️ Installation

### Windows (Automatic)
1. Download/clone the project
2. Run `INSTALL.bat`
3. Configure `backend/.env`
4. Run `START_DEMO.bat`

### Windows (Manual)
```bash
# Install backend
cd backend
npm install

# Install frontend  
cd ../frontend
npm install

# Configure environment
copy backend\.env.template backend\.env
# Edit backend\.env with your MongoDB credentials

# Start backend
cd backend
node server.js

# Start frontend (new terminal)
cd frontend
npm run dev
```

### Linux/Mac
```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install

# Configure environment
cp backend/.env.template backend/.env
# Edit backend/.env with your MongoDB credentials

# Start backend
cd backend
node server.js &

# Start frontend
cd ../frontend
npm run dev
```

---

## 🎯 Route Modes

### FUEL Mode (Shortest Distance)
- **Priority**: Minimize distance and fuel consumption
- **Behavior**: Follows coastlines, shortest path
- **Use Case**: Time-sensitive cargo, short hauls
- **Typical Distance**: Baseline (~1,800 km Mumbai-Chennai)
- **Safety**: Good (70-85%)
- **Fuel Efficiency**: Variable (depends on currents)

### OPTIMAL Mode (Balanced)
- **Priority**: Balance safety, fuel, and distance
- **Behavior**: Moderate open water usage, smart routing
- **Use Case**: General cargo shipping, most versatile
- **Typical Distance**: +10-15% vs FUEL mode
- **Safety**: Very Good (80-90%)
- **Fuel Efficiency**: Good (75-85%)

### SAFE Mode (Maximum Safety)
- **Priority**: Safety above all, deep water preferred
- **Behavior**: Wide ocean arcs, avoids coastal areas
- **Use Case**: High-value/hazardous cargo, rough weather
- **Typical Distance**: +30-40% vs FUEL mode
- **Safety**: Excellent (90-100%)
- **Fuel Efficiency**: Lower (longer route compensated by safer conditions)

---

## 📊 Understanding Metrics

### Safety Percentage (0-100%)
Indicates overall route safety based on:
- **90-100%**: Excellent - Deep water, low risk zones
- **70-89%**: Good - Normal shipping conditions
- **50-69%**: Fair - Some risk factors present
- **<50%**: Caution - Higher risk areas, check weather

**Factors**:
- Distance from coastline (deeper water = safer)
- Weather conditions (wind, waves, cyclones)
- Exclusion zones (dangerous straits avoided)
- Historical incident data

### Fuel Efficiency Percentage (0-100%)
Indicates route fuel efficiency based on:
- **90-100%**: Excellent - Favorable currents/winds
- **70-89%**: Good - Normal fuel consumption
- **50-69%**: Fair - Some resistance factors
- **<50%**: Poor - Adverse conditions

**Factors**:
- Ocean currents (favorable = higher efficiency)
- Wind conditions (tailwind vs headwind)
- Wave height (calm seas = less resistance)
- Route directness (zigzag = lower efficiency)

### Distance
- Shown in **kilometers (km)** and **nautical miles (nm)**
- Total route distance including all waypoints
- Does not include port approach distances

---

## 🔧 Troubleshooting

### "Cannot connect to backend"
**Solution**:
1. Check if backend is running: `netstat -an | find "5000"`
2. Restart backend: `cd backend && node server.js`
3. Check `.env` file exists with correct MongoDB URI

### "Route calculation timeout"
**Solution**:
- Normal for long routes (takes 2-5 minutes)
- Check backend console for progress
- Frontend timeout is 10 minutes for long routes
- Ensure stable internet for MongoDB/weather data

### "Port not found in grid"
**Solution**:
- Port may be outside coverage area (Indian Ocean only)
- Verify port coordinates are correct
- System covers: 30.58°N to -38.4°S, 22.15°E to 142.48°E

### "Assignment to constant variable" error
**Solution**:
- This is fixed in the latest version
- Restart backend: `taskkill /F /IM node.exe && cd backend && node server.js`

### MongoDB connection issues
**Solution**:
1. Check MongoDB Atlas is accessible
2. Verify credentials in `.env`
3. Whitelist your IP in MongoDB Atlas
4. Check network firewall settings

---

## 📂 Project Structure

```
Jalmarg 2.0/
├── backend/                    # Node.js/Express API
│   ├── server.js              # Main server entry point
│   ├── routeFinder.js         # Core A* routing algorithm
│   ├── scoringEngine.js       # Safety/fuel efficiency scoring
│   ├── routes/                # API endpoints
│   │   ├── route.js          # Route calculation
│   │   ├── ports.js          # Port data
│   │   └── auth.js           # Authentication
│   ├── models/               # MongoDB schemas
│   │   ├── Grid.js          # Grid cell data
│   │   ├── Port.js          # Port information
│   │   └── User.js          # User accounts
│   ├── .env.template         # Environment template
│   └── package.json          # Dependencies
│
├── frontend/                  # Next.js React app
│   ├── pages/                # Next.js pages
│   │   └── index.js         # Main app page
│   ├── components/           # React components
│   │   ├── MapView.jsx      # Interactive Leaflet map
│   │   ├── ControlPanel.jsx # Route planning controls
│   │   ├── RouteStats.jsx   # Metrics display
│   │   └── RouteHistory.jsx # Saved routes
│   ├── styles/              # Tailwind CSS
│   └── package.json         # Dependencies
│
├── INSTALL.bat              # Automatic installation
├── START_DEMO.bat           # Quick start script
├── CLEANUP.bat              # Remove unnecessary files
├── README.md                # This file
└── SETUP_GUIDE.md           # Detailed setup instructions
```

---

## 🔒 Security Notes

- **MongoDB**: Use strong passwords, enable IP whitelist
- **Environment Variables**: Never commit `.env` files
- **API Keys**: Store in `.env`, not in code
- **Production**: Set `NODE_ENV=production`
- **CORS**: Configure allowed origins in production

---

## 🎓 Educational Use

This system is designed for:
- Maritime logistics research
- Route optimization studies
- Ocean navigation education
- Shipping efficiency analysis
- Weather impact assessment

---

## 📝 Version History

### v2.0 (Current)
- Open water intelligence routing
- Percentage-based metrics (0-100%)
- Dynamic route optimization
- Real-time weather integration
- Guest mode support
- Improved portability

### v1.0 (Legacy)
- Basic A* routing
- Fixed mode weights
- Coastal routing only

---

## 🤝 Support

**For Issues**:
1. Check [Troubleshooting](#troubleshooting) section
2. Review backend console logs
3. Check browser developer console
4. Verify all dependencies installed

**For Questions**:
- See `SETUP_GUIDE.md` for detailed instructions
- Check backend logs for error messages
- Verify MongoDB connection

---

## 📜 License

Educational/Research Project  
For academic and research purposes

---

## 🌟 Key Innovations

1. **Open Water Preference**: Routes intelligently choose deep ocean over coastal shortcuts
2. **Mode Differentiation**: Visual 30-40% distance variation between modes
3. **Percentage Metrics**: Easy-to-understand 0-100% scores
4. **Real-Time Weather**: Live cyclone detection and avoidance
5. **Smart Exclusion Zones**: Automatic avoidance of dangerous straits
6. **Portable Design**: Easy setup on any system with Node.js

---

**Ready to sail! ⛵**

For detailed setup instructions, see [`SETUP_GUIDE.md`](SETUP_GUIDE.md)

Complete maritime navigation system for the Indian Ocean with real-time weather, route optimization, and land avoidance.

## 📊 Features

- **667 Ports** across 51 countries in Indian Ocean region
- **Complete Grid Coverage**: Lat -38.4° to 30.58°, Lon 22.15° to 142.48°
- **100% Accurate Land Detection** using IsItWater API
- **Real-time Weather Integration** (Open-Meteo Marine API)
- **Smart Route Optimization** with A* pathfinding
- **Multiple Routing Modes**: Optimal, Fuel-efficient, Safe, Normal

## 🚀 Quick Start

Complete maritime navigation system with weather integration, route optimization, and modern UI.

## ✨ Overview

JalMarg 2.0 is a full-stack maritime navigation application featuring:

- 🗺️ **Interactive Map** - Real-time route visualization with Leaflet
- 🌤️ **Weather Integration** - Live weather data and forecasts
- 🧭 **Route Optimization** - 4 modes (Optimal, Fuel, Safe, Normal)
- 📊 **Data Visualization** - Charts and statistics
- 🎨 **Modern UI** - Glassmorphism design with smooth animations
- 📱 **Responsive** - Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
JalMarg 2.0/
├── backend/          Express.js + MongoDB + Weather APIs
├── frontend/         Next.js + React + Leaflet + Recharts
└── Integration/      Scripts and documentation
```

### Technology Stack

**Backend:**
- Express.js - Web framework
- MongoDB Atlas - Database
- Mongoose - ODM
- Axios - API client
- Node-cron - Task scheduling

**Frontend:**
- Next.js 14 - React framework
- React 18 - UI library
- Tailwind CSS - Styling
- Framer Motion - Animations
- Leaflet - Interactive maps
- Recharts - Data visualization

---

## 🚀 Quick Start

### ⚡ Fastest Way (Automated)

```bash
# Windows:
integrate_all.bat

# Mac/Linux:
python integrate_all.py
```

This will:
1. Install all dependencies
2. Configure environment
3. Create start scripts
4. Setup database connection

Then:
```bash
# Windows:
start-all.bat

# Mac/Linux:
./start-all.sh
```

### 📋 Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:5000/api | REST API |
| **Health Check** | http://localhost:5000/api/health | System status |

---

## 📊 Features

### 🗺️ Route Planning

- **4 Route Modes:**
  - 🟠 **Optimal** - Best balance of safety, fuel, and distance
  - 🟢 **Fuel Efficient** - Minimize fuel consumption
  - 🔵 **Safe** - Prioritize weather and safety
  - ⚪ **Normal** - Shortest distance

- **8 Major Ports:**
  - Mumbai, Chennai, Kolkata, Kochi
  - Vizag, Mangalore, Kandla, Tuticorin

### 🌤️ Weather Integration

- Real-time weather data
- 24-hour forecasts
- Wind speed and direction
- Wave height
- Visibility
- Temperature and humidity

### 📈 Visualization

- Interactive Leaflet map
- Color-coded routes
- Real-time charts (Recharts)
- Statistics dashboard
- Weather metrics grid

### 🎨 Modern UI

- Glassmorphism design
- Smooth Framer Motion animations
- Responsive layout
- Dark theme optimized
- Beautiful loading states

---

## 📡 API Reference

### Calculate Route

```http
POST /api/route
Content-Type: application/json

{
  "start": { "lat": 18.9388, "lon": 72.8354 },
  "end": { "lat": 13.0827, "lon": 80.2707 },
  "mode": "optimal"
}
```

**Response:**
```json
{
  "path": [
    { "lat": 18.9388, "lon": 72.8354 },
    ...
  ],
  "totalDistance": 1250.5,
  "totalTime": 480,
  "fuelCost": 85000,
  "safetyScore": 92.5,
  "avgWind": 12.3,
  "avgWaveHeight": 2.1
}
```

### Get Weather

```http
GET /api/weather/:lat/:lon
```

### Get Grid Data

```http
GET /api/grid
```

### Health Check

```http
GET /api/health
```

---

## 🎯 Usage

### Calculating a Route

1. **Start the application**
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

2. **Open browser**
   - Navigate to http://localhost:3000

3. **Select ports**
   - From: Mumbai
   - To: Chennai

4. **Choose mode**
   - Click on "Optimal" mode button

5. **Calculate**
   - Click "Calculate Route"
   - Watch the animated route appear on the map

6. **View details**
   - See statistics in the right panel
   - Check weather conditions
   - View route warnings if any

---

## 🔧 Configuration

### Backend Environment (.env)

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jalmarg

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Weather API (optional)
OPENWEATHER_API_KEY=your_api_key
MARINE_API_KEY=your_api_key
```

### Frontend Environment (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
JalMarg 2.0/
│
├── backend/
│   ├── models/               Database models
│   ├── routes/               API routes
│   │   ├── grid.js          Grid endpoints
│   │   ├── weather.js       Weather endpoints
│   │   └── route.js         Route calculation
│   ├── server.js            Express server
│   ├── routeFinder.js       A* algorithm
│   ├── scoringEngine.js     Route scoring
│   ├── weatherService.js    Weather integration
│   └── gridGenerator.js     Grid data generator
│
├── frontend/
│   ├── app/                 Next.js app directory
│   │   ├── globals.css     Global styles
│   │   ├── layout.js       Root layout
│   │   └── page.js         Main page
│   ├── components/          React components
│   │   ├── Header.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── MapView.jsx
│   │   ├── RouteStats.jsx
│   │   └── WeatherDashboard.jsx
│   └── lib/                 Utilities
│       ├── utils.js
│       ├── api.js
│       └── constants.js
│
├── integrate_all.bat/py     Integration scripts
├── start-all.bat/sh         Start scripts
└── Documentation/           Guides and docs
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Verify MongoDB URI in `.env`
- Check network connection
- Ensure IP is whitelisted in MongoDB Atlas

**Port 5000 Already in Use**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Cannot Connect to Backend**
- Ensure backend is running first
- Check `.env.local` has correct API URL
- Verify CORS settings in backend

**Map Not Loading**
- Check internet connection (for map tiles)
- Wait 10 seconds for initialization
- Refresh page (F5)

**Components Not Rendering**
- Run frontend setup: `python SETUP_ALL.py`
- Reinstall dependencies: `npm install`
- Clear cache: `rm -rf .next && npm run dev`

---

## 🧪 Testing

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Route Calculation**
   ```bash
   curl -X POST http://localhost:5000/api/route \
     -H "Content-Type: application/json" \
     -d '{
       "start": {"lat": 18.9388, "lon": 72.8354},
       "end": {"lat": 13.0827, "lon": 80.2707},
       "mode": "optimal"
     }'
   ```

3. **Frontend**
   - Open http://localhost:3000
   - Test route calculation
   - Verify map display
   - Check console for errors (F12)

### Automated Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📚 Documentation

### Quick References
- **INTEGRATION_COMPLETE.txt** - Quick integration guide
- **INTEGRATION_GUIDE.md** - Complete integration documentation
- **frontend/START_HERE.txt** - Frontend quick start

### Detailed Guides
- **backend/README.md** - Backend documentation
- **backend/API_USAGE_GUIDE.md** - API reference
- **frontend/COMPONENTS_SUMMARY.md** - Component details
- **frontend/ARCHITECTURE.md** - Technical architecture

---

## 🎯 Key Features

### ✅ Completed
- ✅ Backend API with Express.js
- ✅ MongoDB Atlas integration
- ✅ Weather data integration
- ✅ A* pathfinding algorithm
- ✅ Multi-criteria route scoring
- ✅ Next.js frontend
- ✅ Interactive Leaflet maps
- ✅ Glassmorphism UI design
- ✅ Framer Motion animations
- ✅ Real-time charts
- ✅ Responsive design
- ✅ Complete integration
- ✅ Documentation

### 🎨 Design Highlights
- Modern glassmorphism effects
- Smooth animations throughout
- Color-coded route modes
- Beautiful loading states
- Gradient backgrounds
- Glow effects

### 🚀 Performance
- Fast route calculation (1-3s)
- Optimized Next.js build
- Efficient MongoDB queries
- Cached grid data
- Lazy-loaded components

---

## 🔐 Security

- Environment variables for sensitive data
- CORS configured for frontend access
- MongoDB connection string protected
- API rate limiting (optional)
- Input validation

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "axios": "^1.6.0",
  "dotenv": "^16.3.1",
  "node-cron": "^3.0.3"
}
```

### Frontend
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "leaflet": "^1.9.4",
  "recharts": "^2.10.0",
  "framer-motion": "^10.16.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.0"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues, questions, or suggestions:
- Check documentation files
- Review INTEGRATION_GUIDE.md
- Check console logs (F12)
- Verify environment configuration

---

## 🎉 Success Criteria

Your integration is successful if:
1. ✅ Backend starts without errors
2. ✅ Frontend loads at localhost:3000
3. ✅ Health check returns "ok"
4. ✅ Route calculation works
5. ✅ Map displays route
6. ✅ Statistics update
7. ✅ Weather data loads
8. ✅ No console errors

---

## 🚀 Next Steps

After integration:
1. Configure MongoDB connection
2. Test route calculation
3. Explore different route modes
4. Check weather integration
5. Customize UI colors
6. Add more ports if needed
7. Deploy to production

---

## 🌟 Highlights

**What makes JalMarg 2.0 special:**
- 🎨 Modern glassmorphism design
- ✨ Smooth animations everywhere
- 🗺️ Interactive map integration
- 📊 Real-time data visualization
- 🌤️ Live weather integration
- 🧭 Smart route optimization
- 📱 Fully responsive
- 🚀 Production-ready
- 📚 Well-documented
- ⚡ Fast performance

---

## 🎯 Use Cases

- **Maritime Transport** - Optimize shipping routes
- **Research** - Study maritime patterns
- **Education** - Learn navigation algorithms
- **Weather Analysis** - Track maritime weather
- **Route Planning** - Plan efficient voyages

---

## 🙏 Acknowledgments

Built with modern web technologies:
- Next.js & React
- Express.js & Node.js
- MongoDB Atlas
- Leaflet
- Recharts
- Framer Motion
- Tailwind CSS

---

**Built with ❤️ for Maritime Navigation**

Version 2.0.0 - Complete Integration
🚢 JalMarg 2.0 - Navigate with Confidence ⚓🌊
