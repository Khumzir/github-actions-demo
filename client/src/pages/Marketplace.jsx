import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

const COUNTRIES = ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Zambia']
const VEHICLE_TYPES = ['Flatbed Truck', 'Box Truck', 'Refrigerated Truck', 'Lowbed Truck', 'Tanker']

export default function Marketplace() {
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    country: searchParams.get('country') || '',
    vehicle: '',
    q: '',
  })

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('status', 'open')
    if (filters.country) params.set('country', filters.country)
    if (filters.vehicle) params.set('vehicle', filters.vehicle)
    if (filters.q) params.set('q', filters.q)
    api(`/loads?${params}`).then(setLoads).catch(console.error).finally(() => setLoading(false))
  }, [filters])

  const statusColor = {
    open: 'badge-green',
    quoted: 'badge-gold',
    assigned: 'badge-blue',
    in_transit: 'badge-blue',
    delivered: 'badge-green',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-950">Load Marketplace</h1>
        <p className="text-brand-600 mt-1">Browse available freight across Southern Africa.</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by route, city, or title…"
          className="input flex-1"
          value={filters.q}
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
        />
        <select
          className="input sm:w-48"
          value={filters.country}
          onChange={(e) => setFilters(f => ({ ...f, country: e.target.value }))}
        >
          <option value="">All Countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="input sm:w-48"
          value={filters.vehicle}
          onChange={(e) => setFilters(f => ({ ...f, vehicle: e.target.value }))}
        >
          <option value="">All Vehicle Types</option>
          {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-brand-400">Loading marketplace…</div>
      ) : loads.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-brand-500 text-lg mb-2">No loads match your filters</p>
          <p className="text-brand-400 text-sm">Try broadening your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loads.map((load) => (
            <Link to={`/loads/${load.id}`} key={load.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-shadow group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-brand-900 group-hover:text-gold-700 transition-colors">
                    {load.title}
                  </h3>
                  {load.cross_border && <span className="badge-gold">🌍 Cross-border</span>}
                  {load.shipper_verified && <span className="badge-green">✓ Verified Shipper</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-600">
                  <span>{load.origin_city}, {load.origin_country} → {load.dest_city}, {load.dest_country}</span>
                  <span>•</span>
                  <span>{load.weight_tons}t {load.cargo_type}</span>
                  <span>•</span>
                  <span>{load.vehicle_type}</span>
                </div>
                <div className="mt-1 text-xs text-brand-400">
                  Pickup: {new Date(load.pickup_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  {load.delivery_date && ` — Delivery: ${new Date(load.delivery_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="font-display text-xl font-bold text-gold-600">
                  {load.currency} {Number(load.budget).toLocaleString()}
                </div>
                <div className={statusColor[load.status] || 'badge-gray'}>{load.status}</div>
                {load.quote_count > 0 && (
                  <div className="text-xs text-brand-500">{load.quote_count} quote{load.quote_count > 1 ? 's' : ''} received</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
