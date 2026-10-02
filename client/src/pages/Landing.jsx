import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '12,400+', label: 'Loads Posted' },
  { value: '3,800+', label: 'Verified Transporters' },
  { value: '14', label: 'African Countries' },
  { value: '98.2%', label: 'On-Time Delivery' },
]

const benefits = [
  {
    title: 'Post & Match in Minutes',
    desc: 'Describe your load once — qualified transporters near your route respond with competitive quotes.',
    icon: '📦',
  },
  {
    title: 'Verified & Trusted',
    desc: 'Every transporter is verified against business records, vehicle inspections, and job history.',
    icon: '✅',
  },
  {
    title: 'Cross-Border Ready',
    desc: 'Built-in customs checklists, route planning, and border documentation for seamless continental trade.',
    icon: '🌍',
  },
  {
    title: 'Track Every Shipment',
    desc: 'Real-time status updates from pickup confirmation through border crossing to final delivery.',
    icon: '📍',
  },
]

const countries = [
  'South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique',
  'Zambia', 'Tanzania', 'Kenya', 'Nigeria', 'Ghana',
  'DRC', 'Angola', 'Malawi', 'Lesotho', 'Eswatini',
]

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 600" className="w-full h-full" fill="none">
            <path d="M400 50 L550 200 L650 150 L750 300 L600 400 L700 550 L500 500 L350 580 L200 480 L80 520 L50 350 L150 250 L100 100 Z" stroke="currentColor" strokeWidth="1" className="text-gold-500" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Connecting Africa's Cargo to the{' '}
            <span className="text-gold-400">Right Transport</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-cream/70 max-w-2xl mx-auto">
            The trusted logistics exchange where shippers find verified transporters
            and transporters find profitable loads — across Southern Africa and beyond.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg !px-8">
              Post a Load
            </Link>
            <Link to="/marketplace" className="btn-secondary text-lg !px-8">
              Find Loads
            </Link>
            <Link to="/register" className="btn-outline !text-gold-300 !border-gold-500 hover:!bg-gold-500 hover:!text-brand-950 text-lg !px-8">
              Find Transport
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-900 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-gold-400">{s.value}</div>
                <div className="text-sm text-cream/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 text-center mb-4">
            Why Africa Logistics Exchange
          </h2>
          <p className="text-center text-brand-600 mb-12 max-w-2xl mx-auto">
            Purpose-built for African freight — from the N1 corridor to cross-border trade across the continent.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-semibold text-brand-900 text-lg mb-2">{b.title}</h3>
                <p className="text-brand-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="bg-brand-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-900 mb-2">Serving Southern Africa & Beyond</h3>
          <p className="text-brand-600 mb-8">Starting with South Africa, expanding across the continent.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {countries.map((c) => (
              <span key={c} className="badge-green !px-3 !py-1.5 text-sm">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-900 to-brand-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to Move Cargo Across Africa?
          </h2>
          <p className="text-cream/60 mb-8">
            Join thousands of businesses and transporters already trading on the exchange.
          </p>
          <Link to="/register" className="btn-primary text-lg !px-10">
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </>
  )
}
