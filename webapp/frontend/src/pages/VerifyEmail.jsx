import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { verifyOtp, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from navigation state
  const email = location.state?.email || ''
  const userData = location.state?.userData || {}

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' })
      return
    }

    setLoading(true)
    
    try {
      const result = await verifyOtp(email, otpCode)

      if (result.success) {
        // Update user profile with profile photo if available
        if (userData.profilePhoto) {
          updateUserProfile({
            profilePhoto: userData.profilePhoto,
            displayName: userData.name || result.user.name
          })
        }

        // Show appropriate message based on approval status
        if (result.approval_required) {
          alert(`${result.message}\n\nYour facility owner account is pending admin approval. You will receive an email notification once approved.`)
        }

        // Redirect based on role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'facility':
            // All facility users go to landing page
            // They can browse but won't be able to add venues if not approved
            navigate('/')
            break
          default:
            navigate('/')  // Redirect regular users to landing page
        }
      } else {
        setErrors({ otp: result.error || 'Invalid OTP. Please try again.' })
      }
    } catch (error) {
      setErrors({ otp: 'Something went wrong. Please try again.' })
    }
    
    setLoading(false)
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/users/resend-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      })

      const data = await response.json()

      if (data.success) {
        setCountdown(60) // 60 second countdown
        setOtp(['', '', '', '', '', '']) // Clear current OTP
        setErrors({})
      } else {
        setErrors({ general: data.error || 'Failed to resend OTP' })
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
    }
    
    setResendLoading(false)
  }

  return (
    <div className="min-h-screen flex">
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
            <h1 className="text-4xl font-bold mb-4">Almost There!</h1>
            <p className="text-xl opacity-90">Verify your email to complete registration</p>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
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

            {/* OTP Form */}
            <div className="bg-white lg:bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We've sent a 6-digit code to<br />
                <span className="font-medium">{email}</span>
              </p>
              
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-12 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.otp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              {/* Resend and Edit Options */}
              <div className="mt-6 space-y-3">
                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Didn't receive code?{' '}
                    {countdown > 0 ? (
                      <span className="text-gray-500">
                        Resend in {countdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                        className="text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
                      >
                        {resendLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </p>
                </div>

                {/* Edit Email */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Wrong email?{' '}
                    <Link
                      to={userData.isSignup ? "/signup" : "/login"}
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Edit email
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
