import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import VenuesPage from './pages/VenuesPage'
import VenueDetailsPage from './pages/VenueDetailsPage'
import CourtBookingPage from './pages/CourtBookingPage'
import ProfilePage from './pages/ProfilePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import FacilityDashboard from './pages/FacilityDashboard'
import AddCourtPage from './pages/AddCourtPage'

function AppContent() {
  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/signup', '/verify-email', '/admin/login'] // Routes where we don't want to show the main navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen">
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/venue/:id" element={<VenueDetailsPage />} />
        <Route path="/book/:venueId" element={<CourtBookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/facility/dashboard" element={<FacilityDashboard />} />
        <Route path="/add-court" element={<AddCourtPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
