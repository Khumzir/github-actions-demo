import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth-context'
import { api } from '../api'

const STATUS_STEPS = [
  { key: 'pickup_confirmed', label: 'Pickup Confirmed', icon: '📦' },
  { key: 'in_transit', label: 'In Transit', icon: '🚛' },
  { key: 'border_customs', label: 'Border / Customs', icon: '🛂' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '📍' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
]

export default function Tracking() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api('/shipments').then(async (list) => {
      setShipments(list)
      if (list.length > 0) {
        const detail = await api(`/shipments/${list[0].id}`)
        setSelected(detail)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  const selectShipment = async (id) => {
    const detail = await api(`/shipments/${id}`)
    setSelected(detail)
  }

  const updateStatus = async (id, status) => {
    await api(`/shipments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, location: selected.current_location }),
    })
    const detail = await api(`/shipments/${id}`)
    setSelected(detail)
    // refresh list
    const list = await api('/shipments')
    setShipments(list)
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-950 mb-4">Shipment Tracking</h1>
        <p className="text-brand-500">Please sign in to track your shipments.</p>
      </div>
    )
  }

  const stepIndex = selected ? STATUS_STEPS.findIndex(s => s.key === selected.status) : -1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950 mb-8">Shipment Tracking</h1>

      {loading ? (
        <div className="text-center py-16 text-brand-400">Loading shipments…</div>
      ) : shipments.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-brand-500 text-lg">No active shipments</p>
          <p className="text-brand-400 text-sm mt-2">Shipments appear here once a quote is accepted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipment list */}
          <div className="space-y-3">
            {shipments.map(s => (
              <button
                key={s.id}
                onClick={() => selectShipment(s.id)}
                className={`w-full text-left card p-4 transition-shadow ${selected?.id === s.id ? 'ring-2 ring-gold-500 shadow-lg' : 'hover:shadow-md'}`}
              >
                <div className="font-semibold text-brand-900 text-sm">{s.title}</div>
                <div className="text-xs text-brand-500 mt-1">{s.origin_city} → {s.dest_city}</div>
                <div className="text-xs text-brand-400 mt-1">{s.transporter_name}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected && (
              <div className="card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-brand-950">{selected.title}</h2>
                    <p className="text-sm text-brand-500 mt-1">
                      {selected.origin_city}, {selected.origin_country} → {selected.dest_city}, {selected.dest_country}
                    </p>
                    <p className="text-xs text-brand-400 mt-1">
                      {selected.cargo_type} • {selected.weight_tons}t • {selected.transporter_name}
                    </p>
                  </div>
                  {selected.current_location && (
                    <div className="text-right">
                      <div className="text-xs text-brand-500">Current Location</div>
                      <div className="font-semibold text-brand-900 text-sm">{selected.current_location}</div>
                    </div>
                  )}
                </div>

                {/* Progress timeline */}
                <div className="flex items-center justify-between mb-8">
                  {STATUS_STEPS.map((step, i) => (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          i <= stepIndex ? 'bg-brand-800 text-white' : 'bg-brand-100 text-brand-300'
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`text-xs mt-2 text-center ${i <= stepIndex ? 'text-brand-900 font-medium' : 'text-brand-300'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${i < stepIndex ? 'bg-brand-700' : 'bg-brand-100'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Update status buttons */}
                {user.role === 'transporter' && selected.status !== 'delivered' && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {STATUS_STEPS.filter(s => STATUS_STEPS.findIndex(x => x.key === s.key) > stepIndex).slice(0, 1).map(s => (
                      <button key={s.key} onClick={() => updateStatus(selected.id, s.key)} className="btn-primary !py-2 !px-4 text-sm">
                        Advance to: {s.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Events */}
                <h3 className="font-semibold text-brand-900 text-sm mb-3">History</h3>
                <div className="space-y-3">
                  {selected.events?.map(e => (
                    <div key={e.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 shrink-0" />
                      <div>
                        <div className="font-medium text-brand-900">{STATUS_STEPS.find(s => s.key === e.status)?.label || e.status}</div>
                        {e.location && <div className="text-xs text-brand-500">{e.location}</div>}
                        {e.note && <div className="text-xs text-brand-400">{e.note}</div>}
                        <div className="text-xs text-brand-300 mt-0.5">
                          {new Date(e.created_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
