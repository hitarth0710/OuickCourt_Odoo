import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is a facility owner
  const isFacilityOwner = user?.role === 'facility';

  // Function to scroll to book venues section
  const scrollToBookVenues = (e) => {
    e?.preventDefault();
    console.log('Scroll to venues button clicked');
    
    const element = document.getElementById('book-venues-section');
    console.log('Found element:', element);
    
    if (element) {
      // Calculate scroll position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = scrollTop + rect.top - 100; // 100px offset from top
      
      console.log('Scrolling to position:', targetPosition);
      
      // Use window.scrollTo for reliable scrolling
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      console.log('Element not found, scrolling to estimated position');
      // Fallback: estimate position based on viewport height
      const estimatedPosition = window.innerHeight * 1.5; // About 1.5 screen heights
      window.scrollTo({
        top: estimatedPosition,
        behavior: 'smooth'
      });
    }
  };

  // Function to handle search and navigate to venues page
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      // Normalize the city name (convert to lowercase and trim)
      const normalizedCity = searchCity.trim().toLowerCase();
      // Navigate to venues page with city filter
      navigate(`/venues?city=${encodeURIComponent(normalizedCity)}`);
    } else {
      // If no city entered, just navigate to venues page
      navigate('/venues');
    }
  };

  return (
    <div className="min-h-screen font-body">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .venue-carousel {
          animation: scroll-left 40s linear infinite;
          animation-play-state: ${isHovering ? 'paused' : 'running'};
          display: flex;
          width: max-content;
        }
        
        .venue-card {
          min-width: 320px;
          width: 320px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin-right: 24px;
        }
        
        .venue-card:hover {
          transform: scale(1.08) translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          z-index: 10;
        }
        
        .venue-carousel:hover .venue-card:not(:hover) {
          transform: scale(0.95);
          opacity: 0.7;
        }
        
        .carousel-container {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

      {/* Hero Section - Full Screen with Two Halves */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-12">
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 h-full items-center">
              
              {/* Left Side - Search Section */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinematic text-white mb-4 tracking-wider">
                    QUICKCOURT
                  </h1>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-light text-white mb-6">
                    {isFacilityOwner ? (
                      <>
                        Want to Post Your Court?
                        <span className="text-primary-400 block font-elegant">Manage Your Facilities</span>
                      </>
                    ) : (
                      <>
                        Find Players & Venues
                        <span className="text-primary-400 block font-elegant">Near You</span>
                      </>
                    )}
                  </h2>
                </div>

                {/* Simplified Search Form */}
                <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20">
                  <div className="space-y-6">
                    {/* Main Search Bar */}
                    <div className="relative">
                      <label className="block text-white font-display text-sm mb-3">
                        {isFacilityOwner 
                          ? 'Manage your sports facilities' 
                          : 'Search for venues and players'
                        }
                      </label>
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                        </svg>
                        <input 
                          type="text" 
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                          placeholder={isFacilityOwner 
                            ? "Enter your facility location (e.g., Mumbai, Delhi, Bangalore)" 
                            : "Enter location (e.g., Mumbai, Delhi, Bangalore)"
                          }
                          className="w-full pl-12 pr-16 py-4 rounded-xl bg-white/90 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 font-body text-gray-900 placeholder-gray-500 text-lg"
                        />
                        {/* Search Icon Button */}
                        <button 
                          type="submit"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Search Type Toggle */}
                    <div className="flex bg-white/20 rounded-xl p-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          console.log('Button clicked');
                          scrollToBookVenues(e);
                        }}
                        className="flex-1 py-3 px-4 rounded-lg bg-primary-600 text-white font-display font-medium transition-all duration-300 hover:bg-primary-700"
                      >
                        {isFacilityOwner ? 'See Courts' : 'See Venues'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-white">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">500+</div>
                    <div className="text-sm font-body opacity-80">Venues</div>
                  </div>
                  <div className="text-white">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">10K+</div>
                    <div className="text-sm font-body opacity-80">Players</div>
                  </div>
                  <div className="text-white">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">8</div>
                    <div className="text-sm font-body opacity-80">Sports</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Image (Hidden on Mobile) */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-800/20 rounded-3xl transform rotate-3"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Sports Court"
                    className="relative rounded-3xl shadow-2xl w-full max-w-lg h-96 object-cover"
                  />
                  {/* <div className="absolute -bottom-4 -right-4 bg-primary-600 text-white p-4 rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="text-xl font-cinematic">LIVE</div>
                      <div className="text-sm font-body">Available Courts</div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-cinematic text-gray-900 mb-6 tracking-wider">
              WHY CHOOSE US?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-elegant leading-relaxed">
              We make booking sports courts as easy as booking movie tickets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">Easy Search</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                Find courts by location, sport type, availability, and price. Filter results to match your preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">Instant Booking</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                Book courts in real-time with instant confirmation. No waiting, no phone calls needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">Secure Payment</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                Safe and secure payment processing with multiple payment options. Your data is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Venues Section */}
      <section id="book-venues-section" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-cinematic text-gray-900 mb-4 tracking-wider">
              {isFacilityOwner ? 'OUR COURTS' : 'BOOK VENUES'}
            </h2>
            <p className="text-xl text-gray-600 font-display max-w-2xl mx-auto">
              {isFacilityOwner 
                ? 'Showcase your premium sports facilities' 
                : 'Discover premium sports venues near you'
              }
            </p>
          </div>

          {/* Header with See All Button */}
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <Link
              to="/venues"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-display text-sm transition-all duration-300 hover:scale-105"
            >
              {isFacilityOwner ? 'See All Courts' : 'See All Venues'}
            </Link>
          </div>

          {/* Venue Cards Container - Rolling Gallery */}
          <div className="carousel-container relative">
            <div 
              className="venue-carousel"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Venue Card 1 */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Tennis Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Available
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Green Valley Tennis Club</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.8 (124 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Bandra West, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Tennis</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Badminton</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹800</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 2 */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Basketball Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Busy
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">SportsPlex Arena</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.2 (89 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Andheri East, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Basketball</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Volleyball</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹1200</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 3 */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1593766827228-8737b4534aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Badminton Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Available
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Elite Badminton Center</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.9 (201 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Powai, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Badminton</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Squash</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹600</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 4 */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Football Field" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Full
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Champions Football Ground</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.5 (156 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Juhu, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Football</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Cricket</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹2000</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-gray-400 text-white px-4 py-2 rounded-lg font-display text-sm cursor-not-allowed">
                      Booked
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 5 */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Squash Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Available
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Premium Squash Center</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.7 (78 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Worli, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Squash</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Fitness</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹900</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 6 - Duplicate for seamless scroll */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Tennis Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Available
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Green Valley Tennis Club</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.8 (124 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Bandra West, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Tennis</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Badminton</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹800</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Duplicate Cards for Infinite Scroll */}
              {/* Venue Card 7 - Duplicate */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Basketball Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Busy
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">SportsPlex Arena</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.2 (89 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Andheri East, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Basketball</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Volleyball</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹1200</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Venue Card 8 - Duplicate */}
              <div className="venue-card bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1593766827228-8737b4534aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Badminton Court" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-display font-medium">
                    Available
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">Elite Badminton Center</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm font-body">4.9 (201 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                    </svg>
                    <span className="text-sm font-body">Powai, Mumbai</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Badminton</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-body">Squash</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-cinematic text-primary-600">₹600</span>
                      <span className="text-gray-500 text-sm font-body">/hour</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-colors duration-300">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section id="games-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-cinematic text-gray-900 mb-4 tracking-wider">
              POPULAR SPORTS
            </h2>
            <p className="text-xl text-gray-600 font-display max-w-2xl mx-auto">
              Choose from our most popular sports categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Tennis Card */}
            <Link 
              to="/venues?sport=Tennis"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Tennis" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">TENNIS</h3>
              </div>
            </Link>

            {/* Basketball Card */}
            <Link 
              to="/venues?sport=Basketball"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Basketball" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">BASKETBALL</h3>
              </div>
            </Link>

            {/* Badminton Card */}
            <Link 
              to="/venues?sport=Badminton"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1593766827228-8737b4534aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Badminton" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">BADMINTON</h3>
              </div>
            </Link>

            {/* Football Card */}
            <Link 
              to="/venues?sport=Football"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Football" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">FOOTBALL</h3>
              </div>
            </Link>

            {/* Cricket Card */}
            <Link 
              to="/venues?sport=Cricket"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Cricket" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">CRICKET</h3>
              </div>
            </Link>

            {/* Volleyball Card */}
            <Link 
              to="/venues?sport=Volleyball"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Volleyball" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">VOLLEYBALL</h3>
              </div>
            </Link>

            {/* Squash Card */}
            <Link 
              to="/venues?sport=Squash"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Squash" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">SQUASH</h3>
              </div>
            </Link>

            {/* Table Tennis Card */}
            <Link 
              to="/venues?sport=Table Tennis"
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src="https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Table Tennis" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">TABLE TENNIS</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-cinematic text-white mb-6 tracking-wider">
            READY TO PLAY?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto font-elegant leading-relaxed">
            Join thousands of players who book their courts with QuickCourt. 
            Start playing today!
          </p>
          <Link 
            to="/venues"
            className="bg-white text-primary-600 hover:bg-gray-100 font-display font-semibold py-4 px-12 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 tracking-wide"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
