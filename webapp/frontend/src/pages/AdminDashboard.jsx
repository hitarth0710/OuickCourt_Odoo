import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [pendingFacilities, setPendingFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilities: 0,
    pendingApprovals: 0,
    totalBookings: 0
  })

  useEffect(() => {
    // Check if user is logged in and is admin
    const savedUser = localStorage.getItem('quickcourt_user')
    const token = localStorage.getItem('token')
    
    console.log('Dashboard check - savedUser:', savedUser)
    console.log('Dashboard check - token exists:', !!token)
    
    if (!savedUser || !token) {
      console.log('No user or token found, redirecting to admin login')
      navigate('/admin/login')
      return
    }
    
    try {
      const userData = JSON.parse(savedUser)
      console.log('Parsed user data:', userData)
      
      if (userData.role !== 'admin') {
        console.log('User is not admin, redirecting to home')
        navigate('/')
        return
      }
      
      // If we reach here, user is authenticated admin
      fetchDashboardData()
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/admin/login')
    }
  }, [navigate])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchUsers(),
        fetchPendingFacilities()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found for fetchUsers')
        navigate('/admin/login')
        return
      }
      
      const response = await fetch('http://localhost:8000/api/users/admin/users/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      
      if (response.status === 403) {
        console.log('403 Forbidden - redirecting to login')
        alert('Session expired. Please login again.')
        localStorage.removeItem('token')
        navigate('/admin/login')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
        // Also fetch dashboard stats
        await fetchDashboardStats()
      } else {
        console.error('API Error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/admin/dashboard-stats/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const fetchPendingFacilities = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/admin/login')
        return
      }
      
      const response = await fetch('http://localhost:8000/api/users/admin/facilities/pending/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      
      if (response.status === 403) {
        console.log('403 Forbidden - redirecting to login')
        localStorage.removeItem('token')
        navigate('/admin/login')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setPendingFacilities(data.venues)
      }
    } catch (error) {
      console.error('Error fetching pending facilities:', error)
    }
  }

  const updateStats = (usersData) => {
    const totalUsers = usersData.length
    const totalFacilities = usersData.filter(user => user.role === 'facility').length
    const pendingApprovals = usersData.filter(user => !user.is_approved).length
    
    setStats({
      totalUsers,
      totalFacilities,
      pendingApprovals,
      totalBookings: 0 // You can implement this later
    })
  }

  const handleViewUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSelectedUser(data.user)
        setShowUserModal(true)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      alert('Error fetching user details')
    }
  }

  const handleApproveUser = async (userId, approve = true) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approve })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchUsers() // Refresh the users list
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Error processing request')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/delete/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        })
        
        const data = await response.json()
        if (data.success) {
          alert(data.message)
          fetchUsers() // Refresh the users list
        } else {
          alert(data.error)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error deleting user')
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4m6 0a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4a1 1 0 011 1v1a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4" />
              </svg>
            ), 
            color: 'from-blue-500 to-blue-600', 
            bgColor: 'bg-blue-50' 
          },
          { 
            title: 'Facilities', 
            value: stats.totalFacilities, 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ), 
            color: 'from-green-500 to-green-600', 
            bgColor: 'bg-green-50' 
          },
          { 
            title: 'Pending Approvals', 
            value: stats.pendingApprovals, 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ), 
            color: 'from-yellow-500 to-orange-500', 
            bgColor: 'bg-yellow-50' 
          },
          { 
            title: 'Total Bookings', 
            value: stats.totalBookings, 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ), 
            color: 'from-purple-500 to-purple-600', 
            bgColor: 'bg-purple-50' 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <div className={`bg-gradient-to-r ${stat.color} text-white p-2 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setActiveTab('users')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4m6 0a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4a1 1 0 011 1v1a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Regular Users</h3>
              <p className="text-gray-600 mt-1">Manage player accounts and permissions</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('facilities')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:shadow-md hover:border-green-200 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Facility Owners</h3>
              <p className="text-gray-600 mt-1">Review and approve facility registrations</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderUsers = () => {
    const regularUsers = users.filter(user => user.role === 'player')
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4m6 0a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4a1 1 0 011 1v1a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Regular Users</h2>
              <p className="text-gray-600 text-sm">Players are automatically approved upon registration</p>
            </div>
          </div>
        </div>
        
        {regularUsers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4m6 0a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4a1 1 0 011 1v1a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">No regular users have signed up yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {regularUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-10 w-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.is_approved 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {user.is_approved ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUserDetails(user.id)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                        >
                          View Details
                        </button>
                        {user.is_approved ? (
                          <button
                            onClick={() => handleApproveUser(user.id, false)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                          >
                            Ban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveUser(user.id, true)}
                            className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderFacilities = () => {
    const facilityOwners = users.filter(user => user.role === 'facility')
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Facility Owners</h2>
              <p className="text-gray-600 text-sm">Review and approve facility owner registrations</p>
            </div>
          </div>
        </div>
        
        {facilityOwners.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No facility owners found</h3>
            <p className="mt-1 text-sm text-gray-500">No facility owners have registered yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {facilityOwners.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-10 w-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.is_approved 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {user.is_approved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUserDetails(user.id)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                        >
                          View Details
                        </button>
                        {!user.is_approved ? (
                          <>
                            <button
                              onClick={() => handleApproveUser(user.id, true)}
                              className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleApproveUser(user.id, false)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
                          >
                            Ban Owner
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const UserDetailModal = () => {
    if (!selectedUser || !showUserModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 w-12 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <p className="text-gray-600">Complete user information and management</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">User Type</label>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.role === 'facility' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.role === 'facility' ? 'Facility Owner' : 'Player'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Account Status</label>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900 font-medium">{selectedUser.created_at}</p>
                </div>
              </div>
            </div>

            {/* Facility Information */}
            {selectedUser.role === 'facility' && selectedUser.venues && selectedUser.venues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Owned Venues ({selectedUser.venues.length})</span>
                </h3>
                <div className="space-y-4">
                  {selectedUser.venues.map((venue) => (
                    <div key={venue.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900">{venue.venue_name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm">{venue.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-sm">{venue.phone_number}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">{venue.opening_time} - {venue.closing_time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="text-sm font-semibold">₹{venue.price_per_hour}/hour</span>
                            </div>
                          </div>
                        </div>
                        {venue.photos && venue.photos.length > 0 && (
                          <div className="ml-6 flex-shrink-0">
                            <img 
                              src={`http://localhost:8000${venue.photos[0]}`} 
                              alt={venue.venue_name}
                              className="w-24 h-24 object-cover rounded-xl shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              {selectedUser.role !== 'admin' && (
                <>
                  {selectedUser.is_approved ? (
                    <button
                      onClick={() => {
                        handleApproveUser(selectedUser.id, false)
                        setShowUserModal(false)
                      }}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
                    >
                      Ban User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleApproveUser(selectedUser.id, true)
                        setShowUserModal(false)
                      }}
                      className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
                    >
                      Approve User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id)
                      setShowUserModal(false)
                    }}
                    className="bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
                  >
                    Delete User
                  </button>
                </>
              )}
              <button
                onClick={() => setShowUserModal(false)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your QuickCourt platform</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="p-2">
            <nav className="flex space-x-2" aria-label="Tabs">
              {[
                { 
                  id: 'overview', 
                  name: 'Overview',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                { 
                  id: 'users', 
                  name: 'Regular Users',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4m6 0a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4a1 1 0 011 1v1a1 1 0 01-1 1v1a1 1 0 001 1v-1a1 1 0 011-1 1-1 1-1-1 1V9a3 3 0 00-6 0v4" />
                    </svg>
                  )
                },
                { 
                  id: 'facilities', 
                  name: 'Facility Owners',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'facilities' && renderFacilities()}
        </div>

        {/* User Detail Modal */}
        <UserDetailModal />
      </div>
    </div>
  )
}

export default AdminDashboard