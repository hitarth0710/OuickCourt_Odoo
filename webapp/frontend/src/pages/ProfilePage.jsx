import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.displayName || user?.name || 'User',
    phone: user?.phone || '',
    email: user?.email || '',
    profilePhoto: null
  })
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null)
  const [errors, setErrors] = useState({})
  
  // Update editForm when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.displayName || user.name || 'User',
        phone: user.phone || '',
        email: user.email || '',
        profilePhoto: null
      })
      setPhotoPreview(user.profilePhoto || null)
    }
  }, [user])

  // Review functionality states
  const [activeReviewBooking, setActiveReviewBooking] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submitingReview, setSubmittingReview] = useState(false)

  // Bookings state - now dynamic
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings()
  }, [])

  // Also refresh when URL changes (when redirected from booking page)
  useEffect(() => {
    if (searchParams.get('refresh')) {
      fetchBookings()
    }
  }, [searchParams])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Try to get bookings from backend (anonymous access)
      try {
        const response = await fetch('http://localhost:8000/api/bookings/', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const backendData = await response.json()
          console.log('Backend response:', backendData)
          
          // Check if the response is an array or has results property
          const bookingsArray = Array.isArray(backendData) ? backendData : (backendData.results || [])
          
          if (bookingsArray.length > 0) {
            // Transform backend data to frontend format
            const transformedBookings = bookingsArray.map(booking => ({
              id: booking.id,
              venueName: booking.venue_name || 'Unknown Venue',
              sport: booking.sport_name || 'Unknown Sport',
              date: booking.booking_date,
              time: `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
              location: booking.venue_address || 'Unknown Location',
              status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown',
              canCancel: booking.can_cancel || false,
              canReview: booking.can_review || false,
              amount: `₹${booking.total_amount || 0}`,
              courts: Array.isArray(booking.court_numbers) ? booking.court_numbers.join(', ') : 'N/A',
              contactName: booking.contact_name || 'N/A',
              contactPhone: booking.contact_phone || 'N/A',
              contactEmail: booking.contact_email || 'N/A'
            }))
            setBookings(transformedBookings)
            console.log('Transformed bookings:', transformedBookings)
          } else {
            console.log('No bookings found in backend response')
            setBookings([])
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (backendError) {
        console.log('Backend not available, using localStorage:', backendError)
        // Fall back to localStorage if backend fails
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]')
        setBookings(localBookings)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      // Fall back to localStorage on error
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]')
      setBookings(localBookings)
      setError('Failed to load bookings from server, showing local data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
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

      setEditForm(prev => ({
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

  const handleSaveProfile = () => {
    // Basic validation
    const newErrors = {}
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Update user profile using AuthContext
    const updatedData = {
      displayName: editForm.name,
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email
    }

    // Include profile photo if changed
    if (photoPreview !== user?.profilePhoto) {
      updatedData.profilePhoto = photoPreview
    }

    updateUserProfile(updatedData)
    
    setIsEditing(false)
    setErrors({})
    
    // Show success message
    alert('Profile updated successfully!')
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.displayName || user?.name || 'User',
      phone: user?.phone || '',
      email: user?.email || '',
      profilePhoto: null
    })
    setPhotoPreview(user?.profilePhoto || null)
    setIsEditing(false)
    setErrors({})
  }

  // Handle cancel booking
  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'Cancelled', canCancel: false, canReview: false }
            : booking
        )
      )
      // Close any open review if it's for this booking
      if (activeReviewBooking === bookingId) {
        setActiveReviewBooking(null)
        setReviewText('')
        setReviewRating(5)
      }
    }
  }

  // Handle write review toggle
  const handleWriteReview = (bookingId) => {
    // Check if review has already been submitted
    const booking = bookings.find(b => b.id === bookingId)
    if (booking?.hasReviewed) {
      return // Don't allow opening review if already submitted
    }

    if (activeReviewBooking === bookingId) {
      // Close review if it's already open
      setActiveReviewBooking(null)
      setReviewText('')
      setReviewRating(5)
    } else {
      // Open review for this booking
      setActiveReviewBooking(bookingId)
      setReviewText('')
      setReviewRating(5)
    }
  }

  // Handle submit review
  const handleSubmitReview = async (bookingId) => {
    if (!reviewText.trim()) {
      alert('Please write a review before submitting.')
      return
    }

    if (submitingReview) {
      return // Prevent double submission
    }

    try {
      setSubmittingReview(true)
      
      // Find the booking to get venue information
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) {
        alert('Booking not found')
        return
      }

      console.log('Submitting review for booking:', booking)

      // Get venue ID by fetching venues and matching by name
      let venueId = null
      try {
        const venuesResponse = await fetch('http://localhost:8000/api/courts/venues/public/')
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json()
          const matchingVenue = venuesData.find(v => v.venue_name === booking.venueName)
          if (matchingVenue) {
            venueId = matchingVenue.id
            console.log('Found venue ID:', venueId, 'for venue:', booking.venueName)
          }
        }
      } catch (err) {
        console.error('Error fetching venues:', err)
      }

      if (!venueId) {
        alert('Could not determine venue for review. Please try again.')
        return
      }

      // Submit review to backend
      const reviewData = {
        venue: venueId,
        rating: reviewRating,
        comment: reviewText.trim()
      }

      console.log('Submitting review data:', reviewData)

      const response = await fetch('http://localhost:8000/api/courts/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        const reviewResult = await response.json()
        console.log('Review submitted successfully:', reviewResult)
        
        // Update booking to mark review as submitted
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, canReview: false, hasReviewed: true }
              : booking
          )
        )

        // Close the review form
        setActiveReviewBooking(null)
        setReviewText('')
        setReviewRating(5)
        
        alert(`Review submitted successfully! Visit the venue page to see your review.\nVenue: ${booking.venueName}`)
        
        // Optional: Auto-open venue page to see the review
        if (window.confirm('Would you like to view the venue page to see your review?')) {
          window.open(`/venue/${venueId}`, '_blank')
        }
      } else {
        const errorData = await response.json()
        console.error('Error submitting review:', errorData)
        alert(`Failed to submit review: ${errorData.detail || 'Please try again'}`)
      }

    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please check your connection and try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Mock booking data
  const filteredBookings = activeTab === 'all' 
    ? bookings.filter(booking => booking.status !== 'Cancelled')
    : bookings.filter(booking => booking.status === 'Cancelled')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Profile Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {!isEditing ? (
                <>
                  {/* Profile Image and Info */}
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-gray-200">
                          <span className="text-white text-xl font-semibold">
                            {(user?.displayName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.displayName || user?.name || 'User'}
                    </h3>
                    <p className="text-gray-600 text-sm">{user?.phone || 'Phone not provided'}</p>
                    <p className="text-gray-600 text-sm">{user?.email || 'Email not provided'}</p>
                  </div>

                  {/* Menu Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button className="w-full flex items-center px-4 py-3 text-left text-white bg-green-600 rounded-lg">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Bookings
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Profile Form */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                    
                    {/* Profile Photo */}
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto mb-4">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="editProfilePhoto"
                      />
                      <label
                        htmlFor="editProfilePhoto"
                        className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Change Photo
                      </label>
                      {errors.profilePhoto && (
                        <p className="mt-1 text-xs text-red-600">{errors.profilePhoto}</p>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Content Area - Tabs & Bookings */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'all'
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'cancelled'
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={fetchBookings}
                  disabled={loading}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Booking Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bookings</h3>
                  <p className="text-gray-600">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' ? 'You have no active bookings.' : 'You have no cancelled bookings.'}
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        {/* Venue Name & Sport */}
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.venueName}
                          </h3>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {booking.sport}
                          </span>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Date */}
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{formatDate(booking.date)}</span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{booking.time}</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span className="text-sm">{booking.location}</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center mb-4">
                          {booking.status === 'Confirmed' ? (
                            <div className="flex items-center text-green-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                              <span className="text-sm font-medium">Confirmed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                              <span className="text-sm font-medium">Cancelled</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                        {booking.status === 'Confirmed' && (
                          <>
                            <button 
                              onClick={() => handleWriteReview(booking.id)}
                              disabled={booking.hasReviewed}
                              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                booking.hasReviewed 
                                  ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              {booking.hasReviewed ? 'Review Submitted' : 'Write Review'}
                            </button>
                            <button 
                              onClick={async () => {
                                // Get venue ID and navigate to venue page
                                try {
                                  const venuesResponse = await fetch('http://localhost:8000/api/courts/venues/public/')
                                  if (venuesResponse.ok) {
                                    const venuesData = await venuesResponse.json()
                                    const matchingVenue = venuesData.find(v => v.venue_name === booking.venueName)
                                    if (matchingVenue) {
                                      window.open(`/venue/${matchingVenue.id}`, '_blank')
                                    } else {
                                      alert('Venue not found')
                                    }
                                  }
                                } catch (err) {
                                  console.error('Error finding venue:', err)
                                  alert('Failed to open venue page')
                                }
                              }}
                              className="px-4 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              View Venue
                            </button>
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review Dropdown */}
                    {activeReviewBooking === booking.id && !booking.hasReviewed && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Write a Review</h4>
                        
                        {/* Star Rating */}
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-700 mr-2">Rating:</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className={`text-xl ${
                                  star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Text */}
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience about this venue..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="4"
                        />

                        {/* Review Actions */}
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => handleWriteReview(booking.id)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReview(booking.id)}
                            disabled={submitingReview}
                            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                              submitingReview 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {submitingReview ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </div>
                            ) : (
                              'Submit Review'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
