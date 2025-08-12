import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'player',
    profilePhoto: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const { signup } = useAuth()
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'Profile photo must be less than 1MB'
        }))
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'Please select an image file'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)

      // Clear errors
      setErrors(prev => ({
        ...prev,
        profilePhoto: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name) {
      newErrors.name = 'Name is required'
    }
    
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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    // Store profile photo as base64 for frontend use (in real app, you'd upload to server)
    let profilePhotoData = null
    if (formData.profilePhoto) {
      const reader = new FileReader()
      profilePhotoData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(formData.profilePhoto)
      })
    }
    
    const result = await signup(formData.email, formData.password, formData.role, formData.name)
    
    if (result.success) {
      if (result.requiresOtp) {
        // Store profile photo data in the userData for after OTP verification
        const userData = {
          ...result.userData,
          profilePhoto: profilePhotoData
        }
        
        // Redirect to OTP verification page
        navigate('/verify-email', { 
          state: { 
            email: result.email, 
            userData: userData 
          } 
        })
      } else {
        // Direct signup completion (shouldn't happen with OTP flow)
        switch (result.user.role) {
          case 'facility':
            navigate('/')  // Facility users go to landing page
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
      {/* Left Side - Background Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 z-10"></div>
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")'
          }}
        ></div>
        <div className="relative z-20 flex items-center justify-center w-full">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Join QuickCourt</h1>
            <p className="text-xl opacity-90">Start your sports journey today</p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 relative">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 to-primary-800/95 z-10"></div>
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")'
            }}
          ></div>
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

            {/* Signup Form */}
            <div className="bg-white lg:bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Create Account</h2>
              
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

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="profilePhoto"
                      />
                      <label
                        htmlFor="profilePhoto"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Photo
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max size: 1MB</p>
                    </div>
                  </div>
                  {errors.profilePhoto && (
                    <p className="mt-1 text-sm text-red-600">{errors.profilePhoto}</p>
                  )}
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    required
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
