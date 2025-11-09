'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400">Redirecting to login...</p>
        </motion.div>
      </div>
    )
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
          >
            <Ship className="w-20 h-20 text-cyan-400 mb-6" />
            <h1 className="text-5xl font-bold mb-4">JALMARG 2.0</h1>
            <p className="text-xl text-gray-300 mb-8">Smart Maritime Navigation</p>
            <div className="space-y-4">
              {[
                'Real-time Weather Monitoring',
                'Cyclone Detection & Alerts',
                'Fuel-Efficient Routing',
                'AI-Powered Path Optimization'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>{feature}</span>
                </motion.div>
              ))}
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
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Start navigating smarter routes today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none transition-all text-white placeholder-gray-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
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

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization (Optional)
                </label>
                <div className="relative">
                  <Ship className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none transition-all text-white placeholder-gray-500"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none transition-all text-white placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Login here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
