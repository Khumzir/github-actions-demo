import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth-context'

export default function ShipperDashboard() {
  const { user, company } = useAuth()
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/my-loads').then(setLoads).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: loads.length,
    open: loads.filter(l => l.status === 'open' || l.status === 'quoted').length,
    active: loads.filter(l => l.status === 'assigned' || l.status === 'in_transit').length,
    delivered: loads.filter(l => l.status === 'delivered').length,
  }

  const statusBadge = (s) => ({
    open: 'badge-green', quoted: 'badge-gold', assigned: 'badge-blue',
    in_transit: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red',
  }[s] || 'badge-gray')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950">Shipper Dashboard</h1>
          <p className="text-brand-600 mt-1">
            Welcome back, {user?.name} {company && `— ${company.name}`}
            {company?.verified && <span className="badge-green ml-2">✓ Verified</span>}
          </p>
        </div>
        <Link to="/post-load" className="btn-primary">Post a Load</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Loads', value: stats.total, color: 'text-brand-900' },
          { label: 'Open / Quoted', value: stats.open, color: 'text-gold-600' },
          { label: 'Active', value: stats.active, color: 'text-blue-600' },
          { label: 'Delivered', value: stats.delivered, color: 'text-brand-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-brand-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Load list */}
      <h2 className="font-display text-lg font-bold text-brand-950 mb-4">Your Loads</h2>
      {loading ? (
        <div className="text-center py-8 text-brand-400">Loading…</div>
      ) : loads.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-brand-500 text-lg mb-4">No loads posted yet</p>
          <Link to="/post-load" className="btn-primary">Post Your First Load</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loads.map((load) => (
            <Link to={`/loads/${load.id}`} key={load.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow">
              <div>
                <div className="font-semibold text-brand-900">{load.title}</div>
                <div className="text-sm text-brand-500 mt-0.5">
                  {load.origin_city} → {load.dest_city} • {load.weight_tons}t • Pickup {new Date(load.pickup_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {load.quote_count > 0 && <span className="badge-gold">{load.quote_count} quotes</span>}
                <span className={statusBadge(load.status)}>{load.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Track shipments link */}
      <div className="mt-8">
        <Link to="/tracking" className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="text-3xl">📍</div>
          <div>
            <h3 className="font-semibold text-brand-900">Track Shipments</h3>
            <p className="text-sm text-brand-500">View real-time status of all your shipments.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
