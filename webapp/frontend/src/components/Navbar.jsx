import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Check if user is a facility owner
  const isFacilityOwner = user?.role === 'facility';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const scrollToGamesSection = () => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const gamesSection = document.getElementById('games-section')
        if (gamesSection) {
          const navbarHeight = 48 // Height of the navbar (h-12 = 48px)
          const elementPosition = gamesSection.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - navbarHeight
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    } else {
      const gamesSection = document.getElementById('games-section')
      if (gamesSection) {
        const navbarHeight = 48 // Height of the navbar (h-12 = 48px)
        const elementPosition = gamesSection.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - navbarHeight
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    setIsMenuOpen(false)
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo and Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-cinematic text-lg">Q</span>
              </div>
              <span className="text-xl font-cinematic text-white tracking-wider">QUICKCOURT</span>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isFacilityOwner ? (
              <Link 
                to="/add-court" 
                className="bg-primary-600 hover:bg-primary-700 text-white font-display font-medium px-4 py-1.5 rounded-lg transition-all duration-300 text-sm"
              >
                Add a Court
              </Link>
            ) : (
              <>
                <Link 
                  to="/venues" 
                  className="text-white/90 hover:text-white font-display font-medium px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/10 text-sm"
                >
                  Venues
                </Link>
                <button
                  onClick={scrollToGamesSection}
                  className="text-white/90 hover:text-white font-display font-medium px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/10 text-sm"
                >
                  Games
                </button>
              </>
            )}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-display font-medium px-3 py-1.5 rounded-lg transition-all duration-300 text-sm"
                  >
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {user.profilePhoto ? (
                        <img 
                          src={user.profilePhoto} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {(user.displayName || user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs truncate max-w-20">
                      {user.displayName || user.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'facility' && (
                        <Link
                          to="/add-court"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Venue
                        </Link>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          logout()
                          setIsProfileOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white/80 hover:text-white px-3 py-1.5 text-xs font-display transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 font-display font-medium px-4 py-1.5 rounded-lg transition-all duration-300 text-xs"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-1.5 rounded-md text-white hover:text-primary-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-5 w-5`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-5 w-5`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90 backdrop-blur-lg border-t border-white/20">
          {/* Navigation Links for Mobile */}
          <div className="space-y-1 mb-3">
            {isFacilityOwner ? (
              <Link
                to="/add-court"
                className="block bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-display font-medium transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Add a Court
              </Link>
            ) : (
              <>
                <Link
                  to="/venues"
                  className="block text-white/90 hover:text-white px-3 py-2 rounded-lg font-display font-medium transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Venues
                </Link>
                <button
                  onClick={scrollToGamesSection}
                  className="block text-white/90 hover:text-white px-3 py-2 rounded-lg font-display font-medium transition-colors w-full text-left text-sm"
                >
                  Games
                </button>
              </>
            )}
          </div>
          
          {/* Book Now Button for Mobile */}
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-display font-semibold px-4 py-2 rounded-lg transition-all duration-300 mb-3 text-sm">
            Book Now
          </button>
          
          <div className="border-t border-white/20 pt-3">
            <div className="flex flex-col space-y-2 px-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {user.profilePhoto ? (
                        <img 
                          src={user.profilePhoto} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {(user.displayName || user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-display text-sm">
                        {user.displayName || user.name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-white/60 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="text-white/80 hover:text-white block text-sm font-display py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="text-white/80 hover:text-white block text-sm font-display py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'facility' && (
                    <Link
                      to="/add-court"
                      className="text-white/80 hover:text-white block text-sm font-display py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Venue
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="text-white/80 hover:text-white block text-sm font-display w-full text-left py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white/80 hover:text-white block text-sm font-display py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 font-display font-medium px-4 py-2 rounded-lg transition-all duration-300 text-center block text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
