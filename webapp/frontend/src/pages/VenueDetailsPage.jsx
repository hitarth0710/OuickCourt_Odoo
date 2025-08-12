import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

const VenueDetailsPage = () => {
  const { id } = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedSport, setSelectedSport] = useState(null)
  const [venue, setVenue] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Fetch venue details and reviews
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true)
        
        // Fetch venue details
        const venueResponse = await fetch(`http://localhost:8000/api/courts/venues/${id}/`)
        if (!venueResponse.ok) {
          throw new Error('Failed to fetch venue details')
        }
        const venueData = await venueResponse.json()
        setVenue(venueData)
        console.log('Venue photos loaded:', venueData.photos?.length || 0, venueData.photos)
        
        // Fetch venue reviews
        const reviewsResponse = await fetch(`http://localhost:8000/api/courts/venues/${id}/reviews/`)
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json()
          console.log('Fetched reviews for venue:', id, reviewsData)
          setReviews(reviewsData)
        } else {
          console.error('Failed to fetch reviews:', reviewsResponse.status)
        }
        
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVenueData()
      
      // Set up auto-refresh for reviews every 30 seconds
      const reviewRefreshInterval = setInterval(() => {
        refreshReviews()
      }, 30000) // 30 seconds
      
      // Cleanup interval on unmount
      return () => clearInterval(reviewRefreshInterval)
    }
  }, [id])

  // Function to refresh reviews only
  const refreshReviews = async () => {
    if (!id) return
    
    try {
      setReviewsLoading(true)
      console.log('Refreshing reviews for venue:', id)
      
      const reviewsResponse = await fetch(`http://localhost:8000/api/courts/venues/${id}/reviews/`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        console.log('Updated reviews:', reviewsData)
        setReviews(reviewsData)
        
        // Also update venue's total reviews and average rating
        if (venue) {
          const venueResponse = await fetch(`http://localhost:8000/api/courts/venues/${id}/`)
          if (venueResponse.ok) {
            const updatedVenue = await venueResponse.json()
            console.log('Updated venue data:', updatedVenue)
            setVenue(updatedVenue)
          }
        }
        
        if (reviewsData.length === 0) {
          console.log('No reviews found for this venue')
        }
      } else {
        console.error('Failed to refresh reviews:', reviewsResponse.status, reviewsResponse.statusText)
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get pricing data from venue sports
  const getPricingForSport = (sportName) => {
    if (!venue?.sports) return {}
    
    const sport = venue.sports.find(s => 
      s.sport.name.toLowerCase() === sportName.toLowerCase()
    )
    
    if (!sport?.pricing) return {}
    
    const pricing = {}
    sport.pricing.forEach(p => {
      const timeSlotMap = {
        'morning': 'Morning (6:00 AM - 12:00 PM)',
        'evening': 'Evening (12:00 PM - 6:00 PM)', 
        'night': 'Night (6:00 PM - 11:00 PM)'
      }
      const displayTimeSlot = timeSlotMap[p.time_slot] || p.time_slot
      pricing[displayTimeSlot] = `₹${p.price_per_hour}/hour`
    })
    
    return pricing
  }

  const handleSportClick = (sport) => {
    setSelectedSport(sport)
    setShowPricingModal(true)
  }

  const closePricingModal = () => {
    setShowPricingModal(false)
    setSelectedSport(null)
  }

  // Close modal when clicking outside
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closePricingModal()
    }
  }

  // Open Google Maps with venue address
  const openGoogleMaps = () => {
    if (venue?.address) {
      const encodedAddress = encodeURIComponent(venue.address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  // Keyboard navigation for image carousel
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (venue?.photos?.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          prevImage()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          nextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [venue?.photos?.length, currentImageIndex])

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (venue?.photos?.length > 1) {
      if (isLeftSwipe) {
        nextImage()
      }
      if (isRightSwipe) {
        prevImage()
      }
    }
  }

  const nextImage = () => {
    if (venue?.photos?.length > 0) {
      const newIndex = (currentImageIndex + 1) % venue.photos.length
      console.log('Next image:', currentImageIndex, '->', newIndex, 'Total photos:', venue.photos.length)
      setCurrentImageIndex(newIndex)
    }
  }

  const prevImage = () => {
    if (venue?.photos?.length > 0) {
      const newIndex = (currentImageIndex - 1 + venue.photos.length) % venue.photos.length
      console.log('Prev image:', currentImageIndex, '->', newIndex, 'Total photos:', venue.photos.length)
      setCurrentImageIndex(newIndex)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Venue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/venues" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Venues
          </Link>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏟️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist.</p>
          <Link to="/venues" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Venues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Details (70% width on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Venue Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{venue.venue_name}</h1>
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-2 lg:space-y-0 text-gray-600">
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="font-medium text-blue-600">{venue.city}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {venue.address}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {renderStars(Math.floor(venue.average_rating || 0))}
                  </div>
                  <span className="font-medium">{venue.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500">({venue.total_reviews || 0})</span>
                </div>
              </div>
            </div>

            {/* Image Carousel */}
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="relative h-96"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {venue.photos && venue.photos.length > 0 ? (
                  <>
                    <img 
                      src={venue.photos[currentImageIndex]?.image ? 
                        (venue.photos[currentImageIndex].image.startsWith('http') ? 
                          venue.photos[currentImageIndex].image : 
                          `http://localhost:8000${venue.photos[currentImageIndex].image}`
                        ) : 
                        venue.photos[currentImageIndex]
                      } 
                      alt={`${venue.venue_name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log(`Image failed to load:`, e.target.src)
                        e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }}
                      onLoad={(e) => {
                        console.log(`Image loaded successfully:`, e.target.src)
                      }}
                    />
                    
                    {/* Photo Counter */}
                    {venue.photos.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {venue.photos.length}
                      </div>
                    )}
                    
                    {/* Navigation Arrows - only show if there are multiple images */}
                    {venue.photos.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Previous button clicked')
                            prevImage()
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                          style={{ zIndex: 10 }}
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Next button clicked')
                            nextImage()
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                          style={{ zIndex: 10 }}
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image Indicator Dots */}
                    {venue.photos.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                        {venue.photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log('Dot clicked:', index)
                              setCurrentImageIndex(index)
                            }}
                            className={`w-3 h-3 rounded-full transition-all hover:scale-125 ${
                              index === currentImageIndex 
                                ? 'bg-white scale-125 ring-2 ring-white/50' 
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No images available</p>
                    </div>
                  </div>
                )}

                {/* Removed the overlay that was covering the buttons */}
              </div>
            </div>

            {/* Sports Available */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Sports Available</h2>
                <p className="text-gray-600">Click on sports to view price chart</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {venue.sports && venue.sports.length > 0 ? (
                  venue.sports.map((sport) => (
                    <div 
                      key={sport.id}
                      onClick={() => handleSportClick(sport)}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 text-center cursor-pointer transition-colors transform hover:scale-105 border-2 border-transparent hover:border-green-200"
                    >
                      <div className="text-4xl mb-2">{sport.sport?.icon || '🏃'}</div>
                      <div className="font-medium text-gray-900">
                        {sport.sport?.name?.charAt(0).toUpperCase() + sport.sport?.name?.slice(1) || 'Sport'}
                      </div>
                      <div className="text-sm text-gray-500">{sport.number_of_courts} courts available</div>
                      <div className="text-xs text-gray-500 mt-1">Click for pricing</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">🏃</div>
                    <p>No sports information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">{typeof amenity === 'object' ? amenity.name : amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏢</div>
                  <p>No amenities information available</p>
                </div>
              )}
            </div>

            {/* About Venue */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About Venue</h2>
              
              {venue.rules ? (
                <div className="text-gray-700 leading-relaxed">
                  <p>{venue.rules}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No description available</p>
                </div>
              )}
            </div>

            {/* Player Reviews & Ratings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Player Reviews & Ratings</h2>
                <button
                  onClick={refreshReviews}
                  disabled={reviewsLoading}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 mr-2 ${reviewsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {reviewsLoading ? 'Loading...' : 'Refresh Reviews'}
                </button>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                          {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.user_name || 'Anonymous User'}</h4>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Be the first to review this venue!</p>
                </div>
              )}
              
              {reviews.length > 5 && (
                <div className="mt-6 text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Load more reviews
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar (30% width on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Book This Venue Button */}
              <Link 
                to={`/book/${venue.id}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors inline-block text-center"
              >
                Book This Venue
              </Link>

              {/* Operating Hours */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-medium text-gray-900">Operating Hours</h3>
                </div>
                <p className="text-gray-700 text-lg">9:00 AM - 11:00 PM</p>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-3 mb-3">
                  <svg className="w-5 h-5 text-red-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                    <p className="text-blue-600 font-medium text-lg mb-1">{venue.city}</p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{venue.address}</p>
                    {venue.address && (
                      <button
                        onClick={openGoogleMaps}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>See on Google Maps</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Map */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="font-medium">Location Map</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && selectedSport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{selectedSport.sport?.icon || '🏃'}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSport.sport?.name || 'Sport'}</h3>
                  <p className="text-sm text-gray-600">Pricing Chart</p>
                </div>
              </div>
              <button
                onClick={closePricingModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Hourly Rates</h4>
                <p className="text-sm text-gray-600">Prices vary based on time slots</p>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-3">
                {Object.entries(getPricingForSport(selectedSport.sport?.name || selectedSport.name) || {}).map(([timeSlot, price], index) => {
                  const isPopular = timeSlot.includes('Evening')
                  const isBestValue = timeSlot.includes('Morning')
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        ${isPopular 
                          ? 'border-orange-200 bg-orange-50' 
                          : isBestValue 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }
                      `}
                    >
                      {/* Badge */}
                      {(isPopular || isBestValue) && (
                        <div className={`
                          absolute -top-2 left-4 px-2 py-1 rounded-full text-xs font-medium
                          ${isPopular 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-green-500 text-white'
                          }
                        `}>
                          {isPopular ? 'Most Popular' : 'Best Value'}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`
                            font-medium
                            ${isPopular 
                              ? 'text-orange-900' 
                              : isBestValue 
                                ? 'text-green-900' 
                                : 'text-gray-900'
                            }
                          `}>
                            {timeSlot.split(' (')[0]}
                          </div>
                          <div className={`
                            text-sm
                            ${isPopular 
                              ? 'text-orange-700' 
                              : isBestValue 
                                ? 'text-green-700' 
                                : 'text-gray-600'
                            }
                          `}>
                            {timeSlot.split(' (')[1]?.replace(')', '')}
                          </div>
                        </div>
                        <div className={`
                          text-xl font-bold
                          ${isPopular 
                            ? 'text-orange-600' 
                            : isBestValue 
                              ? 'text-green-600' 
                              : 'text-gray-900'
                          }
                        `}>
                          {price}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <div className="font-medium mb-1">Additional Information:</div>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Minimum booking: 1 hour</li>
                      <li>• Equipment rental available</li>
                      <li>• Group discounts for 4+ players</li>
                      <li>• Advance booking recommended</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <div className="mt-6">
                <Link
                  to={`/book/${venue.id}`}
                  onClick={closePricingModal}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 inline-block text-center"
                >
                  Book {selectedSport.sport?.name || 'Sport'} Court
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenueDetailsPage
