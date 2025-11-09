# Jalmarg 2.0 - Maritime Route Planning System

## 🚢 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free tier works)
- npm or yarn package manager

### Installation Steps

#### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 2. Configure Environment

Create `.env` file in the backend folder:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/jalmarg?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### 3. Start the Application

**Option A: Use the startup scripts (Windows)**
- Double-click `START_DEMO.bat` to start both frontend and backend

**Option B: Manual startup**

Terminal 1 (Backend):
```bash
cd backend
node server.js
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📊 System Features

### Route Modes

1. **FUEL Mode** (Shortest Distance)
   - Prioritizes shortest path
   - May follow coastlines
   - Best for: Time-sensitive cargo
   - Fuel Efficiency: Variable
   - Safety: Good

2. **OPTIMAL Mode** (Balanced)
   - Balances distance, safety, and fuel efficiency
   - Moderate open water usage
   - Best for: General cargo shipping
   - Fuel Efficiency: Good
   - Safety: Very Good

3. **SAFE Mode** (Maximum Safety)
   - Prioritizes deep water and safety
   - Wide ocean arcs
   - Best for: High-value or hazardous cargo
   - Fuel Efficiency: Lower (longer route)
   - Safety: Excellent

### Route Metrics Explained

- **Distance**: Total nautical miles (km)
- **Safety %**: Overall route safety (0-100%)
  - 90-100%: Excellent (deep water, low risk)
  - 70-89%: Good (moderate conditions)
  - 50-69%: Fair (some risks)
  - <50%: Caution (higher risk areas)

- **Fuel Efficiency %**: Route fuel efficiency (0-100%)
  - 90-100%: Excellent (favorable currents/winds)
  - 70-89%: Good (normal conditions)
  - 50-69%: Fair (some resistance)
  - <50%: Poor (adverse conditions)

---

## 🗺️ Coverage Area

- **Region**: Indian Ocean
- **Latitude**: 30.58°N to -38.4°S
- **Longitude**: 22.15°E to 142.48°E
- **Grid Resolution**: 0.2° (~22km)
- **Total Cells**: ~158,000 water cells

### Supported Regions
- Arabian Sea
- Bay of Bengal
- Indian Ocean
- Red Sea entrance
- Persian Gulf
- East Africa coast
- South Asia coast
- Southeast Asia (western)

---

## ⚙️ System Architecture

### Backend (Node.js/Express)
- **Port**: 5000
- **Database**: MongoDB Atlas
- **Routing Algorithm**: A* with open water optimization
- **Weather Integration**: Real-time cyclone data

### Frontend (Next.js/React)
- **Port**: 3000
- **Maps**: Leaflet.js
- **Styling**: Tailwind CSS
- **Auth**: JWT-based (optional)

---

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify MongoDB connection string in `.env`
- Run: `npm install` in backend folder

### Frontend won't start
- Check if port 3000 is available
- Verify backend is running first
- Run: `npm install` in frontend folder

### Route calculation timeout
- Normal for long routes (2-5 minutes)
- Check backend console for progress
- Ensure stable internet connection

### "Port not found in grid" error
- Port may be outside coverage area
- Check if port coordinates are correct
- System focuses on Indian Ocean region

---

## 📝 Configuration

### Change Timeout Settings
Edit `frontend/components/ControlPanel.jsx` line 125:
```javascript
const timeout = isLongRoute ? 600000 : 300000  // 10min : 5min
```

### Change Route Weights
Edit `backend/routeFinder.js` lines 11-72:
```javascript
this.ROUTE_WEIGHTS = {
  fuel: { distance: 10.0, safety: 0.1, weather: 0.1, coastal: 0 },
  safe: { distance: 1.0, safety: 15.0, weather: 10.0, coastal: 5.0 },
  optimal: { distance: 5.0, safety: 3.0, weather: 2.0, coastal: 1.0 }
}
```

### Adjust Open Water Discount
Edit `backend/routeFinder.js` lines 413-417:
```javascript
if (mode === 'safe') cost *= 0.6;       // 40% discount
else if (mode === 'optimal') cost *= 0.8;  // 20% discount
```

---

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Update CORS settings for production URL
3. Use process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name jalmarg-backend
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy to Vercel/Netlify or serve with:
   ```bash
   npm start
   ```

---

## 📂 Project Structure

```
Jalmarg 2.0/
├── backend/
│   ├── server.js              # Main server entry
│   ├── routeFinder.js         # Core routing algorithm
│   ├── scoringEngine.js       # Safety/fuel scoring
│   ├── routes/                # API routes
│   │   ├── route.js          # Route calculation endpoints
│   │   ├── ports.js          # Port data endpoints
│   │   └── auth.js           # Authentication
│   ├── models/               # MongoDB models
│   └── package.json
├── frontend/
│   ├── pages/                # Next.js pages
│   ├── components/           # React components
│   │   ├── MapView.jsx      # Interactive map
│   │   └── ControlPanel.jsx # Route controls
│   ├── styles/              # CSS styles
│   └── package.json
├── START_DEMO.bat           # Quick start script
└── README.md               # This file
```

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all dependencies are installed

---

## 📜 License

Educational/Research Project

---

## 🎯 Version

**Jalmarg 2.0** - Maritime Route Optimization with Open Water Intelligence
- Dynamic routing with open water preference
- Mode-based route differentiation
- Real-time weather integration
- Percentage-based metrics for easy understanding
