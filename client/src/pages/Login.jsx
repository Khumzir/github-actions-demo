import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth-context'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-brand-950 text-center">Welcome Back</h1>
        <p className="text-center text-brand-500 text-sm mt-2 mb-6">Sign in to your Africa Logistics Exchange account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-brand-500 mt-4">
          Don't have an account? <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium">Register</Link>
        </p>
        <div className="mt-6 pt-4 border-t border-brand-100 text-center">
          <p className="text-xs text-brand-400 mb-2">Demo accounts:</p>
          <div className="flex justify-center gap-4 text-xs">
            <button onClick={() => { setEmail('thandi@maizeking.co.za'); setPassword('password123') }} className="text-gold-600 hover:underline">
              Shipper Demo
            </button>
            <button onClick={() => { setEmail('sipho@transafrik.co.za'); setPassword('password123') }} className="text-gold-600 hover:underline">
              Transporter Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
