import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth-context'

const COUNTRIES = ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Zambia', 'Tanzania', 'Kenya', 'Nigeria', 'Ghana']

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'shipper',
    companyName: '', country: 'South Africa', city: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="card p-8 w-full max-w-lg">
        <h1 className="font-display text-2xl font-bold text-brand-950 text-center">Join the Exchange</h1>
        <p className="text-center text-brand-500 text-sm mt-2 mb-6">Create your Africa Logistics Exchange account</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, role: 'shipper' }))}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              form.role === 'shipper' ? 'border-gold-500 bg-gold-50' : 'border-brand-200 hover:border-brand-300'
            }`}
          >
            <div className="text-2xl mb-1">📦</div>
            <div className="font-semibold text-brand-900">I Ship Goods</div>
            <div className="text-xs text-brand-500">Post loads & get quotes</div>
          </button>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, role: 'transporter' }))}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              form.role === 'transporter' ? 'border-gold-500 bg-gold-50' : 'border-brand-200 hover:border-brand-300'
            }`}
          >
            <div className="text-2xl mb-1">🚛</div>
            <div className="font-semibold text-brand-900">I Transport</div>
            <div className="text-xs text-brand-500">Find loads & quote</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div>
            <label className="label">Company Name</label>
            <input className="input" value={form.companyName} onChange={set('companyName')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Country</label>
              <select className="input" value={form.country} onChange={set('country')}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city} onChange={set('city')} required />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-brand-500 mt-4">
          Already have an account? <Link to="/login" className="text-gold-600 hover:text-gold-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
