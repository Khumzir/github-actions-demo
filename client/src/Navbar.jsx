import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth-context'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 bg-brand-950/95 backdrop-blur-md border-b border-gold-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
              <span className="text-brand-950 font-bold text-lg">AL</span>
            </div>
            <span className="font-display text-lg font-bold text-white hidden sm:block">
              Africa Logistics Exchange
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="text-cream hover:text-gold-300 text-sm font-medium transition-colors">
              Load Marketplace
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-cream hover:text-gold-300 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="text-gold-300 hover:text-gold-200 text-sm font-medium transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-cream hover:text-gold-300 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
