import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const CourtBookingPage = () => {
  const { venueId } = useParams()
  const navigate = useNavigate()
  
  // State for form fields
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [selectedCourts, setSelectedCourts] = useState([])
  const [selectedCourtDropdown, setSelectedCourtDropdown] = useState('')
  
  // Contact form fields
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  // Venue data
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // New state for creative date/time picker
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  
  // Payment states
  const [showPayment, setShowPayment] = useState(false)
  const [upiPin, setUpiPin] = useState(['', '', '', '', '', ''])
  const [paymentStep, setPaymentStep] = useState('form') // 'form', 'payment', 'success'
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch venue data from backend
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        console.log('Fetching venue with ID:', venueId)
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:8000/api/courts/venues/${venueId}/`)
        console.log('API Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', errorText)
          throw new Error(`Failed to fetch venue details (${response.status}): ${errorText}`)
        }
        
        const venueData = await response.json()
        console.log('Venue data received:', venueData)
        setVenue(venueData)
        
        // Set default sport if available
        if (venueData.sports && venueData.sports.length > 0) {
          setSelectedSport(venueData.sports[0].sport.name)
          console.log('Default sport set:', venueData.sports[0].sport.name)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching venue:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchVenue()
    } else {
      console.error('No venue ID provided')
      setError('No venue ID provided')
      setLoading(false)
    }
  }, [venueId])

  // Generate date options for the next 30 days
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        slots.push({ value: time, display: displayTime, hour, minute })
      }
    }
    return slots
  }

  const dateOptions = generateDateOptions()
  const timeSlots = generateTimeSlots()

  const formatSelectedDate = (dateString) => {
    if (!dateString) return 'Select Date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSelectedTime = (timeString) => {
    if (!timeString) return 'Select Time'
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate pricing based on venue data
  const getPricePerHour = () => {
    if (!venue || !venue.sports) return 600 // Default price
    
    const sport = venue.sports.find(s => s.sport.name.toLowerCase() === selectedSport.toLowerCase())
    if (sport && sport.pricing && sport.pricing.length > 0) {
      // Use average of all time slots for simplicity
      const total = sport.pricing.reduce((sum, p) => sum + parseFloat(p.price_per_hour), 0)
      return Math.round(total / sport.pricing.length)
    }
    return 600 // Default price
  }
  
  const pricePerHour = getPricePerHour()
  const totalPrice = duration * pricePerHour

  const handleDurationChange = (change) => {
    const newDuration = duration + change
    if (newDuration >= 1 && newDuration <= 8) {
      setDuration(newDuration)
    }
  }

  const addCourt = () => {
    if (selectedCourtDropdown && !selectedCourts.includes(selectedCourtDropdown)) {
      setSelectedCourts([...selectedCourts, selectedCourtDropdown])
      setSelectedCourtDropdown('')
    }
  }

  const removeCourt = (courtToRemove) => {
    setSelectedCourts(selectedCourts.filter(court => court !== courtToRemove))
  }

  // Payment functions
  const handleContinueToPayment = () => {
    if (!selectedDate || !startTime || selectedCourts.length === 0) {
      alert('Please fill in all required booking fields')
      return
    }
    
    // Validate contact form
    if (!contactForm.name || !contactForm.phone || !contactForm.email) {
      alert('Please fill in all contact details')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactForm.email)) {
      alert('Please enter a valid email address')
      return
    }
    
    // Basic phone validation
    if (contactForm.phone.length < 10) {
      alert('Please enter a valid phone number')
      return
    }
    
    setPaymentStep('payment')
  }

  const handleUpiPinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...upiPin]
      newPin[index] = value
      setUpiPin(newPin)
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`upi-pin-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  const handleUpiPinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !upiPin[index] && index > 0) {
      const prevInput = document.getElementById(`upi-pin-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
        const newPin = [...upiPin]
        newPin[index - 1] = ''
        setUpiPin(newPin)
      }
    }
  }

  const handleConfirmPayment = async () => {
    const pinString = upiPin.join('')
    if (pinString.length !== 6) {
      alert('Please enter complete UPI PIN')
      return
    }

    // Validate contact form
    if (!contactForm.name || !contactForm.phone || !contactForm.email) {
      alert('Please fill in all contact details')
      return
    }

    setIsProcessing(true)
    
    try {
      // Find the venue sport for the selected sport
      const venueSport = venue.sports.find(s => s.sport.name.toLowerCase() === selectedSport.toLowerCase())
      if (!venueSport) {
        throw new Error('Selected sport not available at this venue')
      }

      // Calculate end time
      const endTime = addHoursToTime(startTime, duration)
      
      // Create booking data
      const bookingData = {
        venue: venue.id,
        venue_sport: venueSport.id,
        booking_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
        court_numbers: selectedCourts,
        contact_name: contactForm.name,
        contact_phone: contactForm.phone,
        contact_email: contactForm.email,
        total_amount: totalPrice,
        special_instructions: ''
      }

      // Submit booking to backend
      console.log('Submitting booking data:', bookingData)
      
      const response = await fetch('http://localhost:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Failed to create booking'
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.detail || 'Failed to create booking'
        } else {
          // If response is HTML (like a Django error page), get text
          const errorText = await response.text()
          console.error('HTML Error Response:', errorText)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const booking = await response.json()
      console.log('Booking created successfully:', booking)
      
      setIsProcessing(false)
      setPaymentStep('success')
      
      // Redirect to profile after 2 seconds with a timestamp to force refresh
      setTimeout(() => {
        navigate('/profile?refresh=' + Date.now())
      }, 2000)
      
    } catch (error) {
      console.error('Booking error:', error)
      setIsProcessing(false)
      alert(`Booking failed: ${error.message}`)
    }
  }

  const addHoursToTime = (timeString, hours) => {
    const [hour, minute] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hour + hours, minute)
    return date.toTimeString().slice(0, 5)
  }

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.date-picker-container') && !event.target.closest('.time-picker-container')) {
        setShowDatePicker(false)
        setShowTimePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-12">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Court Booking</h1>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venue details...</p>
            <p className="text-sm text-gray-500 mt-2">Venue ID: {venueId}</p>
            <p className="text-sm text-gray-500">API URL: http://localhost:8000/api/courts/venues/{venueId}/</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl mx-auto text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Venue</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Try Again
              </button>
              <Link 
                to="/venues"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-block"
              >
                Back to Venues
              </Link>
            </div>
          </div>
        )}

        {/* Main Form - Only show when venue is loaded */}
        {!loading && !error && venue && paymentStep === 'form' && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl mx-auto">
            {/* Venue Info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{venue.venue_name}</h2>
              <div className="flex items-center space-x-3 text-gray-600 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>{venue.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {renderStars(venue.average_rating || 0)}
                  </div>
                  <span className="font-medium">{venue.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500">({venue.total_reviews || 0})</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
            
            {/* Sport Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <label className="text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/3">Sport</label>
              <div className="sm:w-2/3">
                <div className="relative">
                  <select 
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                  >
                    {venue.sports && venue.sports.map(sport => (
                      <option key={sport.id} value={sport.sport.name}>
                        {sport.sport.icon} {sport.sport.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Date Picker */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <label className="text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/3">Date</label>
              <div className="sm:w-2/3 relative date-picker-container">
                <button
                  onClick={() => {
                    setShowDatePicker(!showDatePicker)
                    setShowTimePicker(false)
                  }}
                  className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 hover:border-green-300 rounded-lg px-3 py-3 flex items-center justify-between transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Select Date</div>
                      <div className="text-sm font-semibold text-gray-900">{formatSelectedDate(selectedDate)}</div>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Date Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3">
                    <div className="grid grid-cols-7 gap-1 mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
                      {dateOptions.map((date, index) => {
                        const isSelected = selectedDate === date.toISOString().split('T')[0]
                        const isToday = date.toDateString() === new Date().toDateString()
                        const dayOfWeek = date.getDay()
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedDate(date.toISOString().split('T')[0])
                              setShowDatePicker(false)
                            }}
                            className={`
                              h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-110
                              ${isSelected 
                                ? 'bg-green-600 text-white shadow-lg' 
                                : isToday 
                                  ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                                  : 'hover:bg-green-50 text-gray-700'
                              }
                              ${dayOfWeek === 0 || dayOfWeek === 6 ? 'text-red-500' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Creative Time Picker */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <label className="text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/3">Start Time</label>
              <div className="sm:w-2/3 relative time-picker-container">
                <button
                  onClick={() => {
                    setShowTimePicker(!showTimePicker)
                    setShowDatePicker(false)
                  }}
                  className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 rounded-lg px-3 py-3 flex items-center justify-between transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Choose Time</div>
                      <div className="text-sm font-semibold text-gray-900">{formatSelectedTime(startTime)}</div>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Time Picker Dropdown */}
                {showTimePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Times</h4>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { time: '08:00', label: 'Morning', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                          { time: '12:00', label: 'Noon', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                          { time: '16:00', label: 'Evening', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                          { time: '19:00', label: 'Night', color: 'bg-purple-100 text-purple-700 border-purple-200' }
                        ].map(slot => (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setStartTime(slot.time)
                              setShowTimePicker(false)
                            }}
                            className={`p-2 rounded-lg border text-xs font-medium transition-all hover:scale-105 ${slot.color}`}
                          >
                            <div>{slot.label}</div>
                            <div className="font-bold">{new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">All Available Times</h4>
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {timeSlots.map((slot, index) => {
                          const isSelected = startTime === slot.value
                          const isPeakHour = slot.hour >= 18 && slot.hour <= 21
                          const isMorning = slot.hour >= 6 && slot.hour < 12
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setStartTime(slot.value)
                                setShowTimePicker(false)
                              }}
                              className={`
                                p-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 border
                                ${isSelected 
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg' 
                                  : isPeakHour 
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                                    : isMorning 
                                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }
                              `}
                            >
                              <div className="font-bold">{slot.display}</div>
                              {isPeakHour && <div className="text-xs opacity-75">Peak</div>}
                              {isMorning && <div className="text-xs opacity-75">Best</div>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Duration Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <label className="text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/3">Duration</label>
              <div className="sm:w-2/3">
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      onClick={() => handleDurationChange(-1)}
                      disabled={duration <= 1}
                      className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    >
                      −
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{duration}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {duration === 1 ? 'Hour' : 'Hours'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ₹{(duration * pricePerHour).toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDurationChange(1)}
                      disabled={duration >= 8}
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Duration Options */}
                  <div className="mt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(hours => (
                        <button
                          key={hours}
                          onClick={() => setDuration(hours)}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
                            ${duration === hours 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                            }
                          `}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Duration Bar Visualization */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div
                          key={i}
                          className={`
                            h-2 flex-1 rounded-full transition-all duration-300
                            ${i < duration 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                              : 'bg-gray-200'
                            }
                          `}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1h</span>
                      <span>8h max</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Court Selector */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <label className="text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/3">Court</label>
              <div className="sm:w-2/3">
                <div className="space-y-3">
                  {/* Dropdown */}
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <select 
                        value={selectedCourtDropdown}
                        onChange={(e) => setSelectedCourtDropdown(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                      >
                        <option value="">--Select Court--</option>
                        {venue.sports?.map(venueSport => {
                          // Create court options for each sport based on number_of_courts
                          return Array.from({ length: venueSport.number_of_courts }, (_, index) => {
                            const courtName = `${venueSport.sport.name} Court ${index + 1}`;
                            return (
                              <option key={`${venueSport.sport.id}-${index + 1}`} value={courtName}>
                                {courtName}
                              </option>
                            );
                          });
                        }).flat().filter(option => !selectedCourts.includes(option.props.value))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={addCourt}
                      disabled={!selectedCourtDropdown}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Selected Courts Tags */}
                  {selectedCourts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCourts.map(court => (
                        <div key={court} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          <span>{court}</span>
                          <button
                            onClick={() => removeCourt(court)}
                            className="ml-2 text-green-600 hover:text-green-800 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

            {/* Continue Button */}
            <div className="mt-6">
              <button 
                onClick={handleContinueToPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors duration-200"
              >
                Continue to Payment – ₹{totalPrice.toLocaleString()}.00
              </button>
            </div>
          </div>
        )}

        {/* Payment Interface */}
        {paymentStep === 'payment' && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">UPI Payment</h2>
              <p className="text-gray-600">Enter your 6-digit UPI PIN</p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{venue.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{formatSelectedDate(selectedDate)}, {formatSelectedTime(startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courts:</span>
                  <span>{selectedCourts.join(', ')}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* UPI PIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter UPI PIN</label>
              <div className="flex justify-center space-x-3">
                {upiPin.map((digit, index) => (
                  <input
                    key={index}
                    id={`upi-pin-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleUpiPinChange(index, e.target.value)}
                    onKeyDown={(e) => handleUpiPinKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmPayment}
                disabled={upiPin.join('').length !== 6 || isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Confirm Payment ₹${totalPrice.toLocaleString()}`
                )}
              </button>
              
              <button
                onClick={() => setPaymentStep('form')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Back to Booking
              </button>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {paymentStep === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your court has been booked successfully.</p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">Booking Confirmed</h3>
              <div className="space-y-1 text-sm text-green-700">
                <div>{venue.name}</div>
                <div>{formatSelectedDate(selectedDate)} at {formatSelectedTime(startTime)}</div>
                <div>{duration} hour{duration > 1 ? 's' : ''} - {selectedCourts.join(', ')}</div>
                <div className="font-semibold">Amount Paid: ₹{totalPrice.toLocaleString()}</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
            
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourtBookingPage
