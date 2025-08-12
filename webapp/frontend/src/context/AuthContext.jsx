import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('quickcourt_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    try {
      // Special case for verified users (coming from OTP verification)
      if (password === 'verified') {
        const userData = {
          id: Math.random(),
          email: email,
          role: role,
          name: role === 'admin' ? 'Admin User' : role === 'facility' ? 'Facility Owner' : 'Player'
        }
        setUser(userData)
        localStorage.setItem('quickcourt_user', JSON.stringify(userData))
        return { success: true, user: userData }
      }

      // Send OTP for email verification
      const response = await fetch('http://localhost:8000/api/users/send-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role
        })
      })

      const data = await response.json()

      if (data.success) {
        if (data.skip_otp) {
          // Admin login - no OTP required
          setUser(data.user)
          localStorage.setItem('quickcourt_user', JSON.stringify(data.user))
          return { success: true, user: data.user }
        } else {
          // OTP sent - need verification
          return { 
            success: true, 
            requiresOtp: true, 
            message: data.message,
            email: email,
            userData: { email, role, isSignup: false }
          }
        }
      }

      return { success: false, error: data.error || 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const signup = async (email, password, role, name) => {
    try {
      // Send OTP for email verification
      const response = await fetch('http://localhost:8000/api/users/send-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
          name: name
        })
      })

      const data = await response.json()

      if (data.success) {
        return { 
          success: true, 
          requiresOtp: true, 
          message: data.message,
          email: email,
          userData: { email, role, name, isSignup: true }
        }
      }

      return { success: false, error: data.error || 'Signup failed' }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('quickcourt_user')
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
