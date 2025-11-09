import { motion } from 'framer-motion'
import { Ship, Waves } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="w-screen h-screen flex items-center justify-center animated-bg">
      <div className="text-center">
        <motion.div
          className="relative mb-8"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Ship className="w-24 h-24 mx-auto text-cyan-400" />
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Waves className="w-16 h-16 text-blue-400" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-3xl font-bold gradient-text mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          JalMarg 2.0
        </motion.h2>

        <motion.div
          className="flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className="mt-4 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Loading Maritime Navigation System...
        </motion.p>
      </div>
    </div>
  )
}
