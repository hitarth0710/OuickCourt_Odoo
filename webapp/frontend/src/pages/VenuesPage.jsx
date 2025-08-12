import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const VenuesPage = () => {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('All Sport')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [priceRange, setPriceRange] = useState([0, 5500])
  const [venueType, setVenueType] = useState('')
  const [selectedRatings, setSelectedRatings] = useState([])
  const [venues, setVenues] = useState([])
  const [sports, setSports] = useState(['All Sport'])
  const [cities, setCities] = useState(['All Cities'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Handle URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const sportParam = urlParams.get('sport')
    const cityParam = urlParams.get('city')
    
    if (sportParam) {
      // Find the sport with case-insensitive matching
      const matchingSport = sports.find(sport => 
        sport.toLowerCase() === sportParam.toLowerCase()
      )
      setSelectedSport(matchingSport || sportParam)
    }
    
    if (cityParam) {
      // Find the city with case-insensitive matching, or use the param as-is
      const matchingCity = cities.find(city => 
        city.toLowerCase() === cityParam.toLowerCase()
      )
      setSelectedCity(matchingCity || cityParam)
    }
  }, [location.search, sports, cities])
  
  // Fetch venues and sports from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch venues
        const venuesResponse = await fetch('http://localhost:8000/api/courts/venues/public/')
        if (!venuesResponse.ok) {
          throw new Error('Failed to fetch venues')
        }
        const venuesData = await venuesResponse.json()
        
        // Fetch sports
        const sportsResponse = await fetch('http://localhost:8000/api/courts/sports/')
        if (!sportsResponse.ok) {
          throw new Error('Failed to fetch sports')
        }
        const sportsData = await sportsResponse.json()
        
        // Fetch cities
        const citiesResponse = await fetch('http://localhost:8000/api/courts/cities/')
        if (!citiesResponse.ok) {
          throw new Error('Failed to fetch cities')
        }
        const citiesData = await citiesResponse.json()
        
        // Process venues data
        const processedVenues = venuesData.map(venue => ({
          id: venue.id,
          name: venue.venue_name,
          rating: venue.average_rating || 0,
          reviews: venue.total_reviews || 0,
          location: venue.address,
          city: venue.city,
          price: getMinPrice(venue.sports),
          sports: venue.sports.map(sport => sport.sport.name),
          type: 'Indoor', // Default type, can be enhanced later
          tags: generateTags(venue),
          image: venue.photos && venue.photos.length > 0 
            ? (venue.photos[0].image.startsWith('http') ? 
                venue.photos[0].image : 
                `http://localhost:8000${venue.photos[0].image}`
              )
            : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: venue.amenities,
          facilityOwnerName: venue.facility_owner_name,
          phoneNumber: venue.phone_number,
          rules: venue.rules,
          startDate: venue.start_date,
          endDate: venue.end_date
        }))
        
        // Debug logging for images
        console.log('Venues with photos:')
        venuesData.forEach(venue => {
          console.log(`Venue: ${venue.venue_name}, Photos: ${venue.photos?.length || 0}`)
          if (venue.photos?.length > 0) {
            venue.photos.forEach((photo, index) => {
              console.log(`  Photo ${index}: ${photo.image}`)
            })
          }
        })
        
        setVenues(processedVenues)
        
        // Process sports data
        const sportNames = ['All Sport', ...sportsData.map(sport => 
          sport.name.charAt(0).toUpperCase() + sport.name.slice(1)
        )]
        setSports(sportNames)
        
        // Process cities data
        const cityNames = ['All Cities', ...citiesData]
        setCities(cityNames)
        
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to get minimum price from sports pricing
  const getMinPrice = (sports) => {
    if (!sports || sports.length === 0) return 0
    
    let minPrice = Infinity
    sports.forEach(sport => {
      if (sport.pricing && sport.pricing.length > 0) {
        sport.pricing.forEach(pricing => {
          if (pricing.price_per_hour < minPrice) {
            minPrice = pricing.price_per_hour
          }
        })
      }
    })
    
    return minPrice === Infinity ? 0 : minPrice
  }

  // Helper function to generate tags
  const generateTags = (venue) => {
    const tags = []
    
    // Add sport tags
    if (venue.sports && venue.sports.length > 0) {
      venue.sports.forEach(sport => {
        tags.push(sport.sport.name.charAt(0).toUpperCase() + sport.sport.name.slice(1))
      })
    }
    
    // Add rating tags
    if (venue.average_rating >= 4.5) {
      tags.push('Top Rated')
    }
    
    // Add price tags based on minimum price
    const minPrice = getMinPrice(venue.sports)
    if (minPrice <= 500) {
      tags.push('Budget')
    } else if (minPrice >= 1500) {
      tags.push('Premium')
    }
    
    tags.push('Indoor') // Default, can be enhanced
    
    return tags
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSport('All Sport')
    setSelectedCity('All Cities')
    setPriceRange([0, 5500])
    setVenueType('')
    setSelectedRatings([])
  }

  const handleRatingChange = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    )
  }

  const filteredVenues = venues.filter(venue => {
    // Search filter
    if (searchTerm && !venue.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Sport filter
    if (selectedSport !== 'All Sport') {
      const venueHasSport = venue.sports.some(sport => 
        sport.toLowerCase() === selectedSport.toLowerCase()
      )
      if (!venueHasSport) return false
    }
    
    // City filter
    if (selectedCity !== 'All Cities') {
      if (!venue.city) return false
      
      // Case-insensitive partial matching to handle slight variations
      const venueCity = venue.city.toLowerCase().trim()
      const filterCity = selectedCity.toLowerCase().trim()
      
      // Check if venue city contains the filter city or exact match
      if (!venueCity.includes(filterCity) && venueCity !== filterCity) {
        return false
      }
    }
    
    // Price filter
    if (venue.price < priceRange[0] || venue.price > priceRange[1]) {
      return false
    }
    
    // Venue type filter
    if (venueType && venue.type !== venueType) {
      return false
    }
    
    // Rating filter
    if (selectedRatings.length > 0) {
      const meetsRating = selectedRatings.some(rating => venue.rating >= rating)
      if (!meetsRating) return false
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 font-body pt-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-cinematic text-gray-900 tracking-wider">
            Sports Venues{selectedCity && selectedCity !== 'All Cities' ? ` in ${selectedCity}` : ''}: Discover and Book Nearby Venues
          </h1>
          {selectedCity && selectedCity !== 'All Cities' && (
            <p className="text-gray-600 mt-2">
              Showing venues in {selectedCity} • {filteredVenues.length} venues found
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading venues...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading venues</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="font-display font-semibold text-lg text-gray-900 mb-6">Filters</h2>

                {/* Search by venue name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by venue name</label>
                  <input
                    type="text"
                    placeholder="Search for venue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Filter by city */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by city</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by sport type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by sport type</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price range (per hour)</label>
                  <div className="px-3">
                    <input
                      type="range"
                      min="0"
                      max="5500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Choose Venue Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Venue Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="venueType"
                        value="Indoor"
                        checked={venueType === 'Indoor'}
                        onChange={(e) => setVenueType(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Indoor</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="venueType"
                        value="Outdoor"
                        checked={venueType === 'Outdoor'}
                        onChange={(e) => setVenueType(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Outdoor</span>
                    </label>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rating)}
                          onChange={() => handleRatingChange(rating)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{rating} stars & up</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Right Main Content - Venue Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map(venue => (
                  <div key={venue.id} className="bg-white rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 transform">
                    {/* Image */}
                    <div className="aspect-w-16 aspect-h-10 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={venue.image} 
                        alt={venue.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.log(`Image failed to load for venue ${venue.name}:`, venue.image)
                          e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully for venue ${venue.name}:`, venue.image)
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Venue name */}
                      <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{venue.name}</h3>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(venue.rating) ? 'fill-current' : 'text-gray-300'}`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{venue.rating} ({venue.reviews})</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                        </svg>
                        <span className="text-sm">{venue.city}</span>
                      </div>

                      {/* Full Address */}
                      <div className="text-xs text-gray-500 mb-3">
                        {venue.location}
                      </div>

                      {/* Price */}
                      <div className="text-lg font-semibold text-gray-900 mb-3">
                        ₹ {venue.price} per hour
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {venue.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tag === 'Top Rated' ? 'bg-yellow-100 text-yellow-800' :
                              tag === 'Budget' ? 'bg-green-100 text-green-800' :
                              tag === 'Premium' ? 'bg-purple-100 text-purple-800' :
                              tag === 'Indoor' ? 'bg-blue-100 text-blue-800' :
                              tag === 'Outdoor' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* View Details Button */}
                      <Link 
                        to={`/venue/${venue.id}`}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 inline-block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* No results message */}
              {filteredVenues.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469.711-6.172 1.999" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No venues found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenuesPage