import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth-context'

export default function LoadDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [load, setLoad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteEta, setQuoteEta] = useState('')
  const [quoteMsg, setQuoteMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api(`/loads/${id}`).then(setLoad).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleQuote = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api(`/loads/${id}/quotes`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(quoteAmount), eta_days: Number(quoteEta) || null, message: quoteMsg || null }),
      })
      setSubmitted(true)
      // Reload
      const updated = await api(`/loads/${id}`)
      setLoad(updated)
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  const acceptQuote = async (quoteId) => {
    try {
      await api(`/quotes/${quoteId}/accept`, { method: 'POST' })
      const updated = await api(`/loads/${id}`)
      setLoad(updated)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center py-20 text-brand-400">Loading…</div>
  if (!load) return <div className="text-center py-20 text-brand-500">Load not found</div>

  const isOwner = user && load.shipper_name && companyBelongsTo(user)
  function companyBelongsTo() { return false /* simplified */ }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/marketplace" className="text-sm text-brand-500 hover:text-gold-600 mb-4 inline-block">
        ← Back to Marketplace
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950">{load.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {load.cross_border && <span className="badge-gold">🌍 Cross-border</span>}
              {load.shipper_verified && <span className="badge-green">✓ Verified Shipper</span>}
              <span className={load.status === 'open' ? 'badge-green' : 'badge-blue'}>{load.status}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-gold-600">{load.currency} {Number(load.budget).toLocaleString()}</div>
            <div className="text-sm text-brand-500">Budget</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-brand-50 rounded-lg p-3">
            <div className="text-xs text-brand-500">Route</div>
            <div className="font-semibold text-brand-900 text-sm mt-1">
              {load.origin_city} → {load.dest_city}
            </div>
            <div className="text-xs text-brand-400 mt-0.5">{load.origin_country} → {load.dest_country}</div>
          </div>
          <div className="bg-brand-50 rounded-lg p-3">
            <div className="text-xs text-brand-500">Cargo</div>
            <div className="font-semibold text-brand-900 text-sm mt-1">{load.cargo_type}</div>
            <div className="text-xs text-brand-400 mt-0.5">{load.weight_tons} tonnes</div>
          </div>
          <div className="bg-brand-50 rounded-lg p-3">
            <div className="text-xs text-brand-500">Vehicle Required</div>
            <div className="font-semibold text-brand-900 text-sm mt-1">{load.vehicle_type}</div>
          </div>
          <div className="bg-brand-50 rounded-lg p-3">
            <div className="text-xs text-brand-500">Pickup</div>
            <div className="font-semibold text-brand-900 text-sm mt-1">
              {new Date(load.pickup_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {load.delivery_date && (
              <div className="text-xs text-brand-400 mt-0.5">
                Deliver by {new Date(load.delivery_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>

        {load.description && (
          <div className="mt-6 p-4 bg-cream rounded-lg">
            <h3 className="text-sm font-semibold text-brand-700 mb-1">Details</h3>
            <p className="text-brand-600 text-sm">{load.description}</p>
          </div>
        )}

        {load.cross_border && (
          <div className="mt-4 p-4 bg-gold-50 border border-gold-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gold-800 mb-1">🌍 Cross-Border Requirements</h3>
            <ul className="text-sm text-gold-700 list-disc list-inside space-y-1">
              <li>Commercial invoice & packing list</li>
              <li>Cross-border permit for transporter</li>
              <li>Customs clearance at border post</li>
              <li>SAD 500 customs declaration</li>
            </ul>
          </div>
        )}
      </div>

      {/* Quotes section */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-brand-950 mb-4">
          Quotes ({load.quotes?.length || 0})
        </h2>
        {load.quotes && load.quotes.length > 0 ? (
          <div className="space-y-3">
            {load.quotes.map((q) => (
              <div key={q.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-900">{q.transporter_name}</span>
                    {q.transporter_verified && <span className="badge-green text-xs">✓ Verified</span>}
                    <span className="text-xs text-brand-400">★ {q.transporter_rating}</span>
                  </div>
                  {q.message && <p className="text-sm text-brand-600 mt-1">{q.message}</p>}
                  {q.eta_days && <p className="text-xs text-brand-500 mt-1">ETA: {q.eta_days} days</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl font-bold text-gold-600">
                    {q.currency} {Number(q.amount).toLocaleString()}
                  </span>
                  {q.status === 'pending' && (
                    <button onClick={() => acceptQuote(q.id)} className="btn-primary !py-1.5 !px-4 text-sm">
                      Accept
                    </button>
                  )}
                  {q.status !== 'pending' && (
                    <span className={`badge ${q.status === 'accepted' ? 'badge-green' : 'badge-gray'}`}>{q.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-brand-400 text-sm">No quotes yet.</p>
        )}
      </div>

      {/* Submit quote (for transporters) */}
      {user && user.role === 'transporter' && load.status === 'open' && !submitted && (
        <div className="mt-8 card p-6">
          <h3 className="font-display text-lg font-bold text-brand-950 mb-4">Submit Your Quote</h3>
          <form onSubmit={handleQuote} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (ZAR)</label>
                <input type="number" className="input" placeholder="e.g. 42000" value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} required />
              </div>
              <div>
                <label className="label">ETA (days)</label>
                <input type="number" className="input" placeholder="e.g. 3" value={quoteEta} onChange={e => setQuoteEta(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Message (optional)</label>
              <textarea className="input" rows={2} placeholder="Describe your offer…" value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)} />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Quote'}
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="mt-8 card p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="font-semibold text-brand-900">Quote Submitted</h3>
          <p className="text-brand-500 text-sm mt-1">The shipper will review your quote.</p>
        </div>
      )}
    </div>
  )
}
