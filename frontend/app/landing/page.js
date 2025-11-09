'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ship, Navigation, MapPin, TrendingUp, Shield, Zap, Globe, ChevronRight, Waves, Wind, Anchor, Users, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'
import WorldMap from '../../components/ui/world-map'

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Zap,
      title: "Fuel Efficiency",
      description: "AI-powered routes that minimize fuel consumption by up to 30%",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Safe Navigation",
      description: "Real-time hazard detection with cyclone warnings and weather monitoring",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Optimal Routes",
      description: "Balanced routing that considers fuel, safety, and time efficiency",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Waves,
      title: "Weather Integration",
      description: "Live weather data from Open-Meteo API with wave and wind analysis",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: Globe,
      title: "Indian Ocean Coverage",
      description: "157,950+ grid cells covering entire Indian Ocean region",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Route Analytics",
      description: "Comprehensive insights with fuel consumption and safety scores",
      color: "from-red-400 to-rose-500"
    }
  ]

  const stats = [
    { value: "157K+", label: "Ocean Cells", icon: MapPin },
    { value: "3", label: "Route Modes", icon: Navigation },
    { value: "Real-time", label: "Weather Data", icon: Wind },
    { value: "24/7", label: "Monitoring", icon: Clock }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/ocean-waves.mp4" type="video/mp4" />
        </video>
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/20 border-b border-cyan-500/20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Ship className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            JALMARG 2.0
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/login">
            <button className="px-6 py-2 rounded-lg border border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/50">
              Get Started
            </button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm"
          >
            <Anchor className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm text-cyan-300">AI-Powered Maritime Navigation</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            Navigate the
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Smartest Route
            </span>
            to Your Destination
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Real-time weather monitoring, cyclone detection, and intelligent route optimization
            for maritime vessels in the Indian Ocean region
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/50 flex items-center gap-2"
              >
                <span className="text-lg font-semibold">Start Free Trial</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border-2 border-cyan-500/50 hover:bg-cyan-500/10 backdrop-blur-sm transition-all duration-300"
              >
                <span className="text-lg font-semibold">Try Demo</span>
              </motion.button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 rounded-xl backdrop-blur-md bg-white/5 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center"
          >
            <motion.div className="w-1 h-3 bg-cyan-400 rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive World Map Section */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Global Coverage
              </span>
            </h2>
            <p className="text-xl text-gray-400">Monitor worldwide shipping routes across all major oceans in real-time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-cyan-500/20 p-8"
          >
            <div className="aspect-video relative">
              <WorldMap
                dots={[
                  // Indian Ocean Routes
                  {
                    start: { lat: 18.94, lng: 72.83, name: "Mumbai, India" },
                    end: { lat: 13.08, lng: 80.27, name: "Chennai, India" },
                  },
                  {
                    start: { lat: 1.29, lng: 103.85, name: "Singapore" },
                    end: { lat: 11.66, lng: 92.73, name: "Port Blair, India" },
                  },
                  // Trans-Pacific Routes
                  {
                    start: { lat: 1.29, lng: 103.85, name: "Singapore" },
                    end: { lat: 34.69, lng: 135.19, name: "Osaka, Japan" },
                  },
                  {
                    start: { lat: 37.77, lng: -122.41, name: "San Francisco, USA" },
                    end: { lat: 35.68, lng: 139.76, name: "Tokyo, Japan" },
                  },
                  // Trans-Atlantic Routes
                  {
                    start: { lat: 40.71, lng: -74.00, name: "New York, USA" },
                    end: { lat: 51.50, lng: -0.12, name: "London, UK" },
                  },
                  {
                    start: { lat: 51.50, lng: -0.12, name: "London, UK" },
                    end: { lat: 52.37, lng: 4.89, name: "Amsterdam, Netherlands" },
                  },
                  // Europe to Asia (Suez Canal Route)
                  {
                    start: { lat: 52.37, lng: 4.89, name: "Amsterdam, Netherlands" },
                    end: { lat: 25.28, lng: 55.31, name: "Dubai, UAE" },
                  },
                  {
                    start: { lat: 25.28, lng: 55.31, name: "Dubai, UAE" },
                    end: { lat: 1.29, lng: 103.85, name: "Singapore" },
                  },
                  // South America to Africa
                  {
                    start: { lat: -23.55, lng: -46.63, name: "São Paulo, Brazil" },
                    end: { lat: -33.92, lng: 18.42, name: "Cape Town, South Africa" },
                  },
                  // Australia Routes
                  {
                    start: { lat: -33.86, lng: 151.20, name: "Sydney, Australia" },
                    end: { lat: 1.29, lng: 103.85, name: "Singapore" },
                  },
                  // Mediterranean Route
                  {
                    start: { lat: 43.73, lng: 7.41, name: "Monaco" },
                    end: { lat: 30.04, lng: 31.23, name: "Cairo, Egypt" },
                  },
                  // North Sea Route
                  {
                    start: { lat: 55.75, lng: 37.61, name: "Moscow, Russia" },
                    end: { lat: 59.91, lng: 10.75, name: "Oslo, Norway" },
                  },
                ]}
                lineColor="#06b6d4"
              />
              
              {/* Port Labels */}
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { name: 'Mumbai', lat: 18.94, lng: 72.83 },
                  { name: 'Chennai', lat: 13.08, lng: 80.27 },
                  { name: 'Kochi', lat: 9.97, lng: 76.28 },
                  { name: 'Kollam', lat: 8.50, lng: 76.90 },
                  { name: 'Port Blair', lat: 11.66, lng: 92.73 },
                  { name: 'Kolkata', lat: 22.57, lng: 88.36 },
                  { name: 'Vizag', lat: 17.68, lng: 83.21 },
                ].map((port, i) => {
                  const x = ((port.lng + 180) / 360) * 100;
                  const y = ((90 - port.lat) / 180) * 100;
                  return (
                    <motion.div
                      key={port.name}
                      className="absolute text-xs text-cyan-300 bg-black/70 px-2 py-1 rounded backdrop-blur-sm"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -150%)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 + 1 }}
                    >
                      {port.name}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Coverage Stats */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-around z-10">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl font-bold text-cyan-400">8</div>
                <div className="text-sm text-gray-400">Major Routes</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-3xl font-bold text-cyan-400">24/7</div>
                <div className="text-sm text-gray-400">Monitoring</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-3xl font-bold text-cyan-400">Real-time</div>
                <div className="text-sm text-gray-400">Weather Data</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need for smart maritime navigation</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative p-8 rounded-2xl backdrop-blur-md bg-white/5 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <feature.icon className={`w-12 h-12 mb-4 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Animated arrow */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                  animate={{ x: activeFeature === index ? [0, 5, 0] : 0 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <ChevronRight className="w-6 h-6 text-cyan-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-8 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-400">Get started in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sign Up", description: "Create your account and access the dashboard", icon: Users },
              { step: "02", title: "Plan Route", description: "Enter origin and destination ports", icon: MapPin },
              { step: "03", title: "Navigate", description: "Get real-time weather updates and safe routing", icon: Navigation }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6">
                  <item.icon className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="text-6xl font-bold text-cyan-500/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>

                {/* Connecting line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-md"
        >
          <h2 className="text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of maritime operators using JALMARG 2.0 for smarter navigation
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/50 text-xl font-bold"
            >
              Get Started Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 backdrop-blur-md bg-black/40 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Ship className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold">JALMARG 2.0</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 JALMARG. All rights reserved. | Powered by AI & Real-time Weather Data
          </div>
        </div>
      </footer>

      {/* Add gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
