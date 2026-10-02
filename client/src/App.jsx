import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth-context'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Landing from './pages/Landing'
import Marketplace from './pages/Marketplace'
import LoadDetail from './pages/LoadDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ShipperDashboard from './pages/ShipperDashboard'
import TransporterDashboard from './pages/TransporterDashboard'
import PostLoad from './pages/PostLoad'
import Tracking from './pages/Tracking'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center py-20 text-brand-400">Loading…</div>
  if (!user) return <Navigate to="/login" />
  return children
}

function Dashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  return user.role === 'shipper' ? <ShipperDashboard /> : <TransporterDashboard />
}

function AppRoutes() {
  const { fetchMe } = useAuth()
  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/loads/:id" element={<LoadDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-load" element={<ProtectedRoute><PostLoad /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
