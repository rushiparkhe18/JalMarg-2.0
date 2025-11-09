'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Ship className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-gray-300 mb-8">Continue your maritime journey</p>
            <div className="max-w-md space-y-3 text-left">
              <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 font-semibold mb-1">Your Last Routes</p>
                <p className="text-sm text-gray-400">View and continue from your previous 3 routes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 font-semibold mb-1">Personalized Dashboard</p>
                <p className="text-sm text-gray-400">Access your saved preferences and settings</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 font-semibold mb-1">Route History</p>
                <p className="text-sm text-gray-400">Track all your past maritime navigation data</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/landing">
            <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Ship className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
              <p className="text-gray-400">Access your navigation dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none transition-all text-white placeholder-gray-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none transition-all text-white placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-cyan-500/30 bg-white/5" />
                  Remember me
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign up here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
