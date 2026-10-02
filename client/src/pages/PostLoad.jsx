import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const COUNTRIES = ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Zambia']
const CARGO_TYPES = ['Agricultural produce', 'Perishables (fresh)', 'Perishables (frozen)', 'Packaged goods', 'Construction materials', 'Textiles', 'Machinery', 'Electronics', 'Chemicals', 'Other']
const VEHICLE_TYPES = ['Flatbed Truck', 'Box Truck', 'Refrigerated Truck', 'Lowbed Truck', 'Tanker']

export default function PostLoad() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', origin_city: '', origin_country: 'South Africa',
    dest_city: '', dest_country: 'South Africa',
    cargo_type: CARGO_TYPES[0], weight_tons: '', vehicle_type: VEHICLE_TYPES[0],
    pickup_date: '', delivery_date: '', budget: '', currency: 'ZAR',
    cross_border: false, description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
  }

  // Auto-detect cross-border
  const isCrossBorder = form.origin_country !== form.dest_country
  const actualCrossBorder = isCrossBorder || form.cross_border

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const load = await api('/loads', {
        method: 'POST',
        body: JSON.stringify({ ...form, cross_border: actualCrossBorder, weight_tons: Number(form.weight_tons), budget: form.budget ? Number(form.budget) : null }),
      })
      navigate(`/loads/${load.id}`)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950 mb-2">Post a Load</h1>
      <p className="text-brand-600 mb-8">Describe your shipment and receive competitive quotes from verified transporters.</p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        <div>
          <label className="label">Load Title</label>
          <input className="input" placeholder='e.g. "Maize grain — 30 tons to Lusaka"' value={form.title} onChange={set('title')} required />
        </div>

        {/* Route */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Origin City</label>
            <input className="input" placeholder="Johannesburg" value={form.origin_city} onChange={set('origin_city')} required />
          </div>
          <div>
            <label className="label">Origin Country</label>
            <select className="input" value={form.origin_country} onChange={set('origin_country')}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Destination City</label>
            <input className="input" placeholder="Lusaka" value={form.dest_city} onChange={set('dest_city')} required />
          </div>
          <div>
            <label className="label">Destination Country</label>
            <select className="input" value={form.dest_country} onChange={set('dest_country')}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {actualCrossBorder && (
          <div className="p-4 bg-gold-50 border border-gold-200 rounded-lg">
            <p className="text-sm text-gold-800 font-medium">🌍 This is a cross-border shipment</p>
            <p className="text-xs text-gold-700 mt-1">Customs documentation will be required at the border post.</p>
          </div>
        )}

        {/* Cargo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Cargo Type</label>
            <select className="input" value={form.cargo_type} onChange={set('cargo_type')}>
              {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Weight (tonnes)</label>
            <input type="number" step="0.1" className="input" placeholder="30" value={form.weight_tons} onChange={set('weight_tons')} required />
          </div>
        </div>

        <div>
          <label className="label">Vehicle Type Required</label>
          <select className="input" value={form.vehicle_type} onChange={set('vehicle_type')}>
            {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Pickup Date</label>
            <input type="date" className="input" value={form.pickup_date} onChange={set('pickup_date')} required />
          </div>
          <div>
            <label className="label">Delivery Date (optional)</label>
            <input type="date" className="input" value={form.delivery_date} onChange={set('delivery_date')} />
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget (ZAR)</label>
            <input type="number" className="input" placeholder="45000" value={form.budget} onChange={set('budget')} />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={set('currency')}>
              <option value="ZAR">ZAR — Rand</option>
              <option value="USD">USD — Dollar</option>
              <option value="BWP">BWP — Pula</option>
              <option value="ZMW">ZMW — Kwacha</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Additional Details</label>
          <textarea className="input" rows={3} placeholder="Special handling, loading dock hours, packaging details…" value={form.description} onChange={set('description')} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full !py-3" disabled={loading}>
          {loading ? 'Posting Load…' : 'Post Load to Marketplace'}
        </button>
      </form>
    </div>
  )
}
