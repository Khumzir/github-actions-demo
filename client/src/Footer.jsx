import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-cream/80 border-t border-gold-500/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
                <span className="text-brand-950 font-bold text-sm">AL</span>
              </div>
              <span className="font-display text-lg font-bold text-white">Africa Logistics Exchange</span>
            </div>
            <p className="text-sm text-cream/60 max-w-md">
              Connecting Africa's Cargo to the Right Transport. A trusted logistics exchange
              where shippers, transporters, and logistics companies move goods efficiently across the continent.
            </p>
          </div>
          <div>
            <h4 className="text-gold-300 font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-gold-200 transition-colors">Load Marketplace</Link></li>
              <li><Link to="/register" className="hover:text-gold-200 transition-colors">Post a Load</Link></li>
              <li><Link to="/register" className="hover:text-gold-200 transition-colors">Find Loads</Link></li>
              <li><Link to="/register" className="hover:text-gold-200 transition-colors">Find Transport</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold-300 font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-gold-200 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-gold-200 cursor-pointer transition-colors">Trust & Verification</li>
              <li className="hover:text-gold-200 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gold-500/20 text-sm text-cream/40">
          © 2026 Africa Logistics Exchange. Building the future of African freight.
        </div>
      </div>
    </footer>
  )
}
