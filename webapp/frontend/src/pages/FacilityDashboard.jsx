import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const FacilityDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userStatus, setUserStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check user approval status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch('http://localhost:8000/api/users/status/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUserStatus(data.user)
          
          if (data.user.role !== 'facility') {
            alert('Access denied. Facility owners only.')
            navigate('/')
            return
          }
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserStatus()
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show approval pending message
  if (userStatus && !userStatus.is_approved) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Facility Dashboard</h1>
                <p className="text-gray-600">Welcome, {userStatus.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Approval Pending Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Approval Pending</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your facility owner account is currently under review by our administrators. 
              You'll be able to access the full dashboard and add venues once approved.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-800">What's Next?</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li>• Admin review (usually within 24-48 hours)</li>
                  <li>• Email notification upon approval</li>
                  <li>• Access to add venues and courts</li>
                  <li>• Full dashboard functionality</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-800">Need Help?</h3>
                </div>
                <p className="text-sm text-green-700 text-left">
                  If you have questions about the approval process or need to update your information, please contact our support team.
                </p>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Check Status Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facility Dashboard</h1>
              <p className="text-gray-600">Manage your sports facilities</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Facility Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { title: 'My Courts', value: '5', color: 'bg-blue-500' },
            { title: 'Today\'s Bookings', value: '12', color: 'bg-green-500' },
            { title: 'This Month Revenue', value: '$2,456', color: 'bg-yellow-500' },
            { title: 'Average Rating', value: '4.8', color: 'bg-purple-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold">{stat.value.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Facility Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Court Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Management</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Add New Court
              </button>
              <button className="w-full btn-secondary">
                Manage Courts
              </button>
            </div>
          </div>

          {/* Booking Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                View All Bookings
              </button>
              <button className="w-full btn-secondary">
                Booking Calendar
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Revenue Reports
              </button>
              <button className="w-full btn-secondary">
                Usage Statistics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilityDashboard
