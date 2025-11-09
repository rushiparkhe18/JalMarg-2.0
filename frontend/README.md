# JalMarg 2.0 Frontend

Modern maritime navigation system built with Next.js, React, and cutting-edge UI libraries.

## 🎨 Features

- **Glassmorphism Design** - Modern translucent UI with backdrop blur effects
- **Smooth Animations** - Framer Motion powered interactions
- **Interactive Maps** - Real-time route visualization with Leaflet
- **Live Charts** - Weather and statistics with Recharts
- **Responsive Layout** - Mobile-first design that works everywhere
- **Real-time Data** - Live weather and route updates

## 📦 Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## 🚀 Quick Start

### Option 1: Automated Setup

Run the Python setup scripts in order:

```bash
python setup_structure.py
python create_components_part1.py
python create_components_part2.py
python create_components_part3.py
python create_components_part4.py
```

### Option 2: Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles with glassmorphism
│   ├── layout.js            # Root layout
│   └── page.js              # Home page
├── components/
│   ├── Header.jsx           # Top navigation bar
│   ├── LoadingScreen.jsx    # Animated loading screen
│   ├── ControlPanel.jsx     # Route planning controls
│   ├── MapView.jsx          # Interactive Leaflet map
│   ├── RouteStats.jsx       # Route statistics display
│   └── WeatherDashboard.jsx # Weather information & charts
├── lib/
│   ├── utils.js             # Utility functions
│   ├── api.js               # API client
│   └── constants.js         # App constants
└── public/                  # Static assets
```

## 🎨 Component Overview

### Header
- Brand identity with animated logo
- System status indicators
- Responsive navigation

### LoadingScreen
- Animated ship icon
- Smooth fade-in transitions
- Branded loading experience

### ControlPanel
- Port selection dropdowns
- Route mode selector (Optimal, Fuel, Safe, Normal)
- Calculate route button
- Real-time validation

### MapView
- Interactive Leaflet map
- Color-coded routes by mode
- Marker popups with coordinates
- Auto-fit to route bounds

### RouteStats
- Distance, duration, fuel cost
- Safety score visualization
- Weather averages
- Warning alerts

### WeatherDashboard
- Real-time weather metrics
- 24-hour forecast chart
- Wind speed trends
- Beautiful data visualization

## 🎯 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 🎨 Styling Guide

### Glassmorphism Classes

```css
.glass             - Basic glass effect
.glass-card        - Glass card with hover effects
.glass-button      - Interactive glass button
.gradient-text     - Animated gradient text
.animated-bg       - Animated background gradient
```

### Color Palette

```
--accent-blue:   #00d4ff  (Primary actions)
--accent-purple: #b24bf3  (Secondary)
--accent-green:  #00ffa3  (Success/Fuel mode)
--accent-orange: #ff6b35  (Optimal mode)
```

### Route Mode Colors

- **Optimal**: Orange (`#ff6b35`)
- **Fuel**: Green (`#00ffa3`)
- **Safe**: Blue (`#00d4ff`)
- **Normal**: White (`#ffffff`)

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎭 Animation Patterns

### Fade In
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

### Slide In
```jsx
<motion.div
  initial={{ x: -300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
```

### Hover Scale
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

## 🐛 Troubleshooting

### Map not loading
- Check internet connection for tile loading
- Verify Leaflet CSS is imported
- Wait 5-10 seconds for initial load

### Components not rendering
- Ensure all dependencies are installed
- Check browser console for errors
- Verify backend API is running

### Styles not applying
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind configuration

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Leaflet](https://leafletjs.com/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🌟 Features Checklist

- ✅ Glassmorphism design system
- ✅ Smooth Framer Motion animations
- ✅ Interactive Leaflet map integration
- ✅ Real-time weather charts
- ✅ Multiple route modes
- ✅ Responsive mobile layout
- ✅ Dark theme optimized
- ✅ Loading states
- ✅ Error handling
- ✅ API integration

## 🎯 Next Steps

1. Run setup scripts
2. Install dependencies
3. Configure environment variables
4. Start development server
5. Open browser to localhost:3000
6. Start planning maritime routes!

---

Built with ❤️ for JalMarg 2.0
