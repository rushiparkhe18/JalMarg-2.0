# 🌊 JALMARG 2.0 - Weather-Based Dynamic Route Recalculation Demo

## 📋 Overview

This standalone demonstration showcases how maritime routes **dynamically recalculate** in real-time based on fluctuating weather conditions. The system intelligently switches between different routing strategies (OPTIMAL, FUEL, SAFE) as weather conditions change.

## 🎯 What This Demonstrates

### Real-Time Weather Simulation
- **Temperature**: Affects engine efficiency and fuel consumption
- **Wind Speed**: Impacts vessel speed and fuel efficiency
- **Visibility**: Critical for navigation safety
- **Rainfall**: Indicates storm conditions and route safety
- **Wave Height**: Determines vessel stability and comfort

### Dynamic Route Strategies

1. **OPTIMAL Route** (Green 🟢)
   - Used in: **Favorable conditions**
   - Characteristics: Direct route, minimal deviation
   - Speed: Normal (22 knots)
   - Fuel Efficiency: 85-95%

2. **FUEL Route** (Yellow 🟡)
   - Used in: **Inefficient conditions** (high wind/waves)
   - Characteristics: Follows currents and wind patterns
   - Speed: Slightly reduced (5% slower)
   - Fuel Efficiency: Optimized (70-85%)

3. **SAFE Route** (Red 🔴)
   - Used in: **Dangerous conditions** (storms, poor visibility)
   - Characteristics: Avoids hazards, deep ocean route
   - Speed: Significantly reduced (15-25% slower)
   - Safety Score: Maximum priority

## 🚀 How to Run

### Simple Execution
```bash
# Navigate to project directory
cd "c:\Users\hp\Desktop\Jalmarg 2.0"

# Run the demo
node WEATHER_ROUTE_DEMO.js
```

### What Happens:
1. ✅ Weather conditions simulate in real-time (updates every 3 seconds)
2. ✅ Route recalculates based on current weather
3. ✅ Display shows:
   - Current weather conditions with warnings
   - Recommended route with metrics
   - Visual ASCII route representation
   - Route change history
4. ✅ Demo runs for 30 seconds then generates a summary report
5. ✅ Creates `WEATHER_ROUTE_DEMO_LOG.json` with detailed logs

### Stop Manually:
Press `Ctrl+C` at any time to stop and see the summary.

## 📊 Sample Output

```
================================================================================
   JALMARG 2.0 - DYNAMIC WEATHER-BASED ROUTE DEMONSTRATION
================================================================================

🚢 Route: Mumbai → Chennai
⏱️  Demo Duration: 30s | Update Interval: 3s

📍 Update #5 | Elapsed: 12.3s

┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 CURRENT WEATHER CONDITIONS                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Scenario:      Storm                ⛈️ ⛈️                            │
│ Temperature:   19.8    °C                                            │
│ Wind Speed:    32.5     knots  ⚠️  HIGH                              │
│ Visibility:    1.2      km     ⚠️  LOW                               │
│ Rainfall:      68.3     mm/hr  ⚠️  HEAVY                             │
│ Wave Height:   5.1      m      ⚠️  HIGH                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🧭 RECOMMENDED ROUTE ✨ ROUTE CHANGED!                              │
├─────────────────────────────────────────────────────────────────────┤
│ Mode:          🔴 SAFE            HIGH       deviation              │
│ Reason:        Critical weather conditions detected                 │
│                                                                     │
│ 📊 ROUTE METRICS:                                                   │
│   Safety Score:       42.5    % ⚠️                                   │
│   Fuel Efficiency:    58.3    % ⚠️                                   │
│   Distance:           1485.2  km                                    │
│   Duration:           47.8    hours                                 │
│   Avg Speed:          16.5    knots                                 │
│   Fuel Required:      108.5   tons                                  │
│   Estimated Cost:     ₹53.8    Lakhs                                │
└─────────────────────────────────────────────────────────────────────┘

      Mumbai                    Chennai
         ●━━━┓                  ●
             ┃                  ┃
             ┗━━━━━━━━━━━━━━━━━━┛
        (Deep Ocean Route)

┌─────────────────────────────────────────────────────────────────────┐
│ 📜 ROUTE CHANGE HISTORY                                             │
├─────────────────────────────────────────────────────────────────────┤
│ 1. 10:23:15 | INITIAL → OPTIMAL                                     │
│    Reason: Favorable conditions                                     │
│ 2. 10:23:18 | OPTIMAL → FUEL                                        │
│    Reason: Inefficient conditions, optimize fuel                    │
│ 3. 10:23:24 | FUEL → SAFE                                           │
│    Reason: Poor weather conditions                                  │
│ 4. 10:23:27 | SAFE → SAFE                                           │
│    Reason: Critical weather conditions detected                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔍 How It Works

### 1. Weather Simulation Engine
```javascript
// Simulates 4 weather scenarios
- Clear:    Good conditions, minimal impact
- Moderate: Some wind/rain, route adjustments needed
- Rough:    High winds/waves, safety concerns
- Storm:    Critical conditions, emergency routing
```

### 2. Route Strategy Decision Logic

**Decision Tree:**
```
IF wind > 30 knots OR visibility < 1km OR waves > 4.2m
  → SAFE Route (Critical conditions)
  
ELSE IF safety_score < 60
  → SAFE Route (Poor conditions)
  
ELSE IF fuel_efficiency < 70
  → FUEL Route (Optimize for efficiency)
  
ELSE
  → OPTIMAL Route (Normal conditions)
```

### 3. Metrics Calculation

**Safety Score (0-100):**
```javascript
Safety = (
  (1 - wind_factor) × 35% +      // Wind impact
  visibility_factor × 25% +       // Visibility impact
  (1 - rain_factor) × 20% +      // Rain impact
  (1 - wave_factor) × 20%        // Wave impact
) × 100
```

**Fuel Efficiency (0-100):**
```javascript
Efficiency = (
  (1 - wind_penalty) × 40% +     // Wind resistance
  (1 - wave_penalty) × 35% +     // Wave resistance
  (1 - temp_penalty) × 25%       // Temperature effect
) × 100
```

## 📈 Key Features

### ✅ Real-Time Weather Updates
- Weather changes every 3 seconds
- Smooth transitions between scenarios
- Realistic weather parameter ranges

### ✅ Intelligent Route Selection
- Automatic mode switching based on conditions
- Safety-first approach in critical weather
- Fuel optimization when safe to do so

### ✅ Comprehensive Metrics
- Safety score with threshold warnings
- Fuel efficiency calculations
- Distance, duration, speed adjustments
- Cost estimates in INR (Lakhs)

### ✅ Visual Feedback
- Color-coded route indicators (🟢🟡🔴)
- ASCII art route visualization
- Warning symbols for dangerous conditions
- Route change history tracking

### ✅ Data Logging
- Saves complete demo log to JSON
- Tracks all route changes with timestamps
- Records weather conditions at each update
- Final summary statistics

## 🎓 Educational Value

This demo illustrates:

1. **Why routes change**: Weather directly impacts safety and efficiency
2. **When routes change**: Critical thresholds trigger strategy switches
3. **How routes change**: Different modes take different paths
4. **Impact measurement**: Quantifiable effects on time, fuel, and cost

## 🔧 Customization

Edit `DEMO_CONFIG` at the top of the file:

```javascript
const DEMO_CONFIG = {
  // Change route endpoints
  startPort: { name: 'Mumbai', lat: 18.96, lon: 72.82 },
  endPort: { name: 'Chennai', lat: 13.08, lon: 80.27 },
  
  // Adjust timing
  weatherUpdateInterval: 3000,  // Update every 3s
  totalDuration: 30000,         // Run for 30s
  
  // Modify thresholds
  thresholds: {
    maxSafeWindSpeed: 25,       // knots
    minSafeVisibility: 2,       // km
    maxSafeRainfall: 50,        // mm/hr
    maxSafeWaveHeight: 3.5,     // meters
    optimalTemp: 25,            // celsius
  }
};
```

## 📝 Output Files

**WEATHER_ROUTE_DEMO_LOG.json**
```json
{
  "timestamp": "2025-11-09T...",
  "route": "Mumbai → Chennai",
  "totalUpdates": 10,
  "routeChanges": [
    {
      "from": "OPTIMAL",
      "to": "SAFE",
      "timestamp": "...",
      "reason": "Critical weather conditions detected"
    }
  ],
  "finalRoute": { ... }
}
```

## 🎯 Use Cases

1. **Training Tool**: Teach operators about weather-based routing
2. **System Demo**: Showcase dynamic routing capabilities to stakeholders
3. **Testing**: Validate route selection algorithms
4. **Presentation**: Visual demonstration of maritime route intelligence

## 🚫 No Impact on Current Project

✅ **Completely standalone** - doesn't modify any existing files
✅ **No dependencies** - uses only Node.js built-ins
✅ **Safe to run** - doesn't connect to database or APIs
✅ **Independent** - can be deleted without affecting main project

## 💡 Tips

- **Run multiple times**: Weather is randomized each run
- **Watch for patterns**: Notice how weather affects decisions
- **Check the log**: Review detailed history after demo
- **Modify thresholds**: Test different safety parameters

---

**Created for Jalmarg 2.0 - Maritime Route Intelligence System**
