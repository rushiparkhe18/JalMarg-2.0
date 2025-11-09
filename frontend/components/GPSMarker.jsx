import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export default function GPSMarker({ position, onMap = false }) {
  if (!position) return null

  if (onMap) {
    // Marker for the map - Red Lollipop Pin Style
    return (
      <motion.div
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        className="absolute z-50"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="relative">
          {/* Pulsing circle */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute w-16 h-16 bg-red-500 rounded-full -translate-x-1/2"
            style={{ left: '50%', top: '12px' }}
          />
          
          {/* Red Lollipop Pin */}
          <div className="relative flex flex-col items-center">
            {/* Pin Head (Circle) */}
            <motion.div 
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center"
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </motion.div>
            
            {/* Pin Stick */}
            <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-700 shadow-md"></div>
            
            {/* Pin Point */}
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-700"></div>
          </div>
        </div>
        
        {/* Label */}
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-2xl border border-red-400">
            <div className="font-semibold">📍 Your Location</div>
            <div className="text-[10px] opacity-90 mt-0.5">
              {position.lat.toFixed(4)}°, {position.lon.toFixed(4)}°
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Info display (not on map) - Red Pin Style
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
    >
      <div className="relative flex flex-col items-center w-5 h-5">
        {/* Mini Red Pin */}
        <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 border-2 border-white rounded-full shadow-md flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div className="w-0.5 h-2 bg-red-600"></div>
        <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[3px] border-t-red-700"></div>
      </div>
      <div className="text-xs">
        <div className="text-red-400 font-semibold">Current Location</div>
        <div className="text-gray-300">
          {position.lat.toFixed(4)}°N, {position.lon.toFixed(4)}°E
        </div>
      </div>
    </motion.div>
  )
}
