import { motion } from 'framer-motion'
import { Ship, Waves, Activity } from 'lucide-react'

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-[80px] glass px-6"
    >
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Ship className="w-10 h-10 text-cyan-400" />
              <motion.div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">JalMarg 2.0</h1>
              <p className="text-xs text-gray-400">Maritime Navigation System</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 glass-card"
            whileHover={{ scale: 1.05 }}
          >
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">System Online</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-4 py-2 glass-card"
            whileHover={{ scale: 1.05 }}
          >
            <Waves className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Real-time Data</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
