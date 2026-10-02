import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth-context'

export default function TransporterDashboard() {
  const { user, company } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ type: '', registration: '', capacity_tons: '' })

  useEffect(() => {
    Promise.all([
      api('/my-quotes').then(setQuotes).catch(console.error),
      api('/company').then(setProfile).catch(console.error),
    ]).finally(() => setLoading(false))
  }, [])

  const addVehicle = async (e) => {
    e.preventDefault()
    try {
      const v = await api('/company/vehicles', {
        method: 'POST',
        body: JSON.stringify({ ...newVehicle, capacity_tons: Number(newVehicle.capacity_tons) || null }),
      })
      setProfile(p => ({ ...p, vehicles: [...(p?.vehicles || []), v] }))
      setNewVehicle({ type: '', registration: '', capacity_tons: '' })
      setShowAddVehicle(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const stats = {
    pending: quotes.filter(q => q.status === 'pending').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    completed: quotes.filter(q => q.status === 'accepted' && q.load_status === 'delivered').length,
  }

  if (loading) return <div className="text-center py-20 text-brand-400">Loading…</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950">Transporter Dashboard</h1>
          <p className="text-brand-600 mt-1">
            Welcome back, {user?.name} {company && `— ${company.name}`}
            {company?.verified && <span className="badge-green ml-2">✓ Verified</span>}
            {!company?.verified && <span className="badge-gold ml-2">Verification Pending</span>}
          </p>
        </div>
        <Link to="/marketplace" className="btn-primary">Browse Loads</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Quotes Pending', value: stats.pending, color: 'text-gold-600' },
          { label: 'Jobs Accepted', value: stats.accepted, color: 'text-blue-600' },
          { label: 'Jobs Completed', value: company?.jobs_completed || 0, color: 'text-brand-600' },
          { label: 'Rating', value: company?.rating ? `★ ${company.rating}` : '—', color: 'text-gold-500' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-brand-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Vehicles */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-lg font-bold text-brand-950">Your Vehicles</h2>
          <button onClick={() => setShowAddVehicle(!showAddVehicle)} className="btn-secondary !py-1.5 !px-4 text-sm">
            {showAddVehicle ? 'Cancel' : '+ Add Vehicle'}
          </button>
        </div>
        {showAddVehicle && (
          <form onSubmit={addVehicle} className="mb-4 p-4 bg-brand-50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input" placeholder="Vehicle type" value={newVehicle.type} onChange={e => setNewVehicle(v => ({...v, type: e.target.value}))} required />
            <input className="input" placeholder="Registration" value={newVehicle.registration} onChange={e => setNewVehicle(v => ({...v, registration: e.target.value}))} />
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Capacity (tons)" type="number" value={newVehicle.capacity_tons} onChange={e => setNewVehicle(v => ({...v, capacity_tons: e.target.value}))} />
              <button type="submit" className="btn-primary !py-2 !px-4 text-sm">Add</button>
            </div>
          </form>
        )}
        {profile?.vehicles?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profile.vehicles.map(v => (
              <div key={v.id} className="bg-brand-50 rounded-lg p-3 flex items-center gap-3">
                <div className="text-2xl">🚛</div>
                <div>
                  <div className="font-semibold text-brand-900 text-sm">{v.type}</div>
                  <div className="text-xs text-brand-500">
                    {v.registration} • {v.capacity_tons}t
                    {v.verified && <span className="text-brand-600 ml-1">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-brand-400 text-sm">No vehicles added yet.</p>
        )}
      </div>

      {/* Quotes */}
      <h2 className="font-display text-lg font-bold text-brand-950 mb-4">Your Quotes</h2>
      {quotes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-brand-500 text-lg mb-4">No quotes submitted yet</p>
          <Link to="/marketplace" className="btn-primary">Browse the Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Link to={`/loads/${q.load_id}`} key={q.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow">
              <div>
                <div className="font-semibold text-brand-900">{q.title}</div>
                <div className="text-sm text-brand-500 mt-0.5">
                  {q.origin_city} → {q.dest_city} • {q.weight_tons}t • {q.shipper_name}
                  {q.shipper_verified && <span className="text-brand-600 ml-1">✓</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-gold-600">{q.currency} {Number(q.amount).toLocaleString()}</span>
                <span className={`badge ${q.status === 'pending' ? 'badge-gold' : q.status === 'accepted' ? 'badge-green' : 'badge-gray'}`}>
                  {q.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Track link */}
      <div className="mt-8">
        <Link to="/tracking" className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="text-3xl">📍</div>
          <div>
            <h3 className="font-semibold text-brand-900">Track Active Shipments</h3>
            <p className="text-sm text-brand-500">Monitor deliveries in progress.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
