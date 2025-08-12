import React, { useState } from 'react'

const LandingPage = () => {
  const [searchType, setSearchType] = useState('venues'); // Add state for search toggle

  return (
    <div className="min-h-screen font-body bg-gray-50">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-cinematic text-primary-600 tracking-wider">QUICKCOURT</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600 font-display transition-colors">Features</a>
            <a href="#venues" className="text-gray-700 hover:text-primary-600 font-display transition-colors">Venues</a>
            <a href="#sports" className="text-gray-700 hover:text-primary-600 font-display transition-colors">Sports</a>
            <a href="#cta" className="text-gray-700 hover:text-primary-600 font-display transition-colors">Get Started</a>
          </nav>
          <button className="md:hidden">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section - Enhanced with parallax-like background */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558365849-6ebd6b3f89d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 animate-subtle-zoom"></div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 h-full items-center">
              
              {/* Left Side - Search Section */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinematic text-white mb-4 tracking-wider">
                    QUICKCOURT
                  </h1>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-light text-white mb-6">
                    Find Players & Venues
                    <span className="text-primary-400 block font-elegant">Near You</span>
                  </h2>
                </div>

                {/* Enhanced Search Form with State */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="space-y-6">
                    {/* Main Search Bar */}
                    <div className="relative">
                      <label className="block text-white font-display text-sm mb-3">Search for {searchType === 'venues' ? 'venues' : 'players'}</label>
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                        </svg>
                        <input 
                          type="text" 
                          placeholder={`Enter location (e.g., Mumbai, Delhi, Bangalore) for ${searchType}`}
                          className="w-full pl-12 pr-16 py-4 rounded-xl bg-white/90 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 font-body text-gray-900 placeholder-gray-500 text-lg transition-all duration-300"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-lg transition-all duration-300 hover:scale-105">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Search Type Toggle with State */}
                    <div className="flex bg-white/20 rounded-xl p-1">
                      <button 
                        onClick={() => setSearchType('venues')}
                        className={`flex-1 py-3 px-4 rounded-lg font-display font-medium transition-all duration-300 ${searchType === 'venues' ? 'bg-primary-600 text-white' : 'text-white hover:bg-white/10'}`}
                      >
                        Find Venues
                      </button>
                      <button 
                        onClick={() => setSearchType('players')}
                        className={`flex-1 py-3 px-4 rounded-lg font-display font-medium transition-all duration-300 ${searchType === 'players' ? 'bg-primary-600 text-white' : 'text-white hover:bg-white/10'}`}
                      >
                        Find Players
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats with Animation */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-white animate-count-up">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">500+</div>
                    <div className="text-sm font-body opacity-80">Venues</div>
                  </div>
                  <div className="text-white animate-count-up delay-150">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">10K+</div>
                    <div className="text-sm font-body opacity-80">Players</div>
                  </div>
                  <div className="text-white animate-count-up delay-300">
                    <div className="text-2xl md:text-3xl font-cinematic text-primary-400">8</div>
                    <div className="text-sm font-body opacity-80">Sports</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Enhanced Image with Overlay */}
              <div className="hidden lg:flex items-center justify-center animate-fade-in-right">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 to-primary-800/30 rounded-3xl transform -rotate-3 blur-md"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Sports Court"
                    className="relative rounded-3xl shadow-2xl w-full max-w-lg h-96 object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-4 rounded-xl shadow-lg transform rotate-6">
                    <div className="text-center">
                      <div className="text-xl font-cinematic">LIVE</div>
                      <div className="text-sm font-body">Available Courts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Cards */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-cinematic text-gray-900 mb-6 tracking-wider">
              WHY CHOOSE US?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-elegant leading-relaxed">
              We make booking sports courts as easy as booking movie tickets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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

      {/* Book Venues Section - Enhanced with Animated Carousel */}
      <section id="venues" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-cinematic text-gray-900 mb-4 tracking-wider">
              BOOK VENUES
            </h2>
            <p className="text-xl text-gray-600 font-display max-w-2xl mx-auto">
              Discover premium sports venues near you
            </p>
          </div>

          {/* Venue Cards Container - Infinite Sliding Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex animate-infinite-scroll space-x-8">
              {/* Duplicate the cards for seamless looping */}
              {[...Array(2)].map((_, index) => (
                <React.Fragment key={index}>
                  {/* Venue Card 1 */}
                  <div className="flex-none w-80 bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Tennis Court" 
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-display">
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
                        <span className="ml-2 text-gray-600 text-sm font-body">4.8 (124)</span>
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
                        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-display text-sm transition-all duration-300">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add more venue cards similarly... (omitted for brevity, repeat the pattern from original) */}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Sports Section - Enhanced with Hover Effects */}
      <section id="sports" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-cinematic text-gray-900 mb-4 tracking-wider">
              POPULAR SPORTS
            </h2>
            <p className="text-xl text-gray-600 font-display max-w-2xl mx-auto">
              Choose from our most popular sports categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Tennis Card */}
            <div className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Tennis" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-cinematic text-white tracking-wider">TENNIS</h3>
                <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Book now</p>
              </div>
            </div>

            {/* Repeat for other sports with similar enhancements */}
            {/* ... (omitted for brevity) */}
          </div>
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-cinematic text-gray-900 mb-4 tracking-wider">
              WHAT OUR USERS SAY
            </h2>
            <p className="text-xl text-gray-600 font-display max-w-2xl mx-auto">
              Hear from our happy players and venue owners
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <p className="text-gray-600 mb-4">"QuickCourt made finding a tennis partner so easy! Highly recommend."</p>
              <div className="flex items-center">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <h4 className="font-display font-semibold">Sarah J.</h4>
                  <p className="text-sm text-gray-500">Tennis Enthusiast</p>
                </div>
              </div>
            </div>
            {/* Add more testimonials */}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section id="cta" className="py-24 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-cinematic text-white mb-6 tracking-wider animate-fade-in-up">
            READY TO PLAY?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto font-elegant leading-relaxed animate-fade-in-up delay-150">
            Join thousands of players who book their courts with QuickCourt. 
            Start playing today!
          </p>
          <button className="bg-white text-primary-600 hover:bg-gray-100 font-display font-semibold py-4 px-12 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 tracking-wide animate-fade-in-up delay-300">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-cinematic mb-4">QUICKCOURT</h3>
              <p className="text-sm opacity-80">Your go-to platform for sports bookings.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
            {/* Add more footer sections */}
          </div>
          <div className="mt-8 text-center text-sm opacity-60">
            © 2025 QuickCourt. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }

        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-count-up { animation: count-up 1s ease-out forwards; }

        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-subtle-zoom { animation: subtle-zoom 20s infinite ease-in-out; }

        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
          width: calc(80rem * 2); /* Adjust based on number of cards */
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export default LandingPage