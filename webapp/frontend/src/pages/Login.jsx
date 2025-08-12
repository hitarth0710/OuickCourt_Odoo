import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'player'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    const result = await login(formData.email, formData.password, formData.role)
    
    if (result.success) {
      if (result.requiresOtp) {
        // Redirect to OTP verification page
        navigate('/verify-email', { 
          state: { 
            email: result.email, 
            userData: result.userData 
          } 
        })
      } else {
        // Direct login (admin)
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'facility':
            navigate('/facility/dashboard')
            break
          default:
            navigate('/')  // Redirect regular users to landing page
        }
      }
    } else {
      setErrors({ general: result.error })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex pt-12">
      {/* Left Side - Video (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 z-10"></div>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/sports-video.mp4" type="video/mp4" />
          {/* Fallback gradient if video doesn't load */}
        </video>
        <div className="relative z-20 flex items-center justify-center w-full">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to QuickCourt</h1>
            <p className="text-xl opacity-90">Book sports courts instantly, play without limits</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 relative">
        {/* Mobile Background Video */}
        <div className="lg:hidden absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 to-primary-800/95 z-10"></div>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/sports-video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">Q</span>
                </div>
                <span className="text-2xl font-bold text-white lg:text-gray-900">QuickCourt</span>
              </Link>
            </div>

            {/* Login Form */}
            <div className="bg-white lg:bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In</h2>
              
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="player">Player</option>
                    <option value="facility">Facility Owner</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Admin Login Hint */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Admin access: Use admin credentials to access admin panel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
