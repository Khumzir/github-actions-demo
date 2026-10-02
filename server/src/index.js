import express from 'express'
import cors from 'cors'
import { pool, initDb } from './db.js'
import { signToken, authRequired } from './auth.js'
import bcrypt from 'bcryptjs'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ── Health ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }))

// ── Auth ────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body
  if (!email || !password || !name || !role)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!['shipper', 'transporter'].includes(role))
    return res.status(400).json({ error: 'Invalid role' })

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email])
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const u = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role',
      [email, hash, name, role]
    )
    const user = u.rows[0]

    let company = null
    if (req.body.companyName && req.body.country) {
      const c = await pool.query(
        'INSERT INTO companies (user_id, name, country, city) VALUES ($1,$2,$3,$4) RETURNING id, name, verified',
        [user.id, req.body.companyName, req.body.country, req.body.city || '']
      )
      company = c.rows[0]
    }

    res.json({ token: signToken(user), user, company })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })
  try {
    const u = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (!u.rows.length) return res.status(401).json({ error: 'Invalid credentials' })
    const user = u.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const c = await pool.query('SELECT * FROM companies WHERE user_id=$1', [user.id])
    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role }, company: c.rows[0] || null })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', authRequired, async (req, res) => {
  const c = await pool.query('SELECT * FROM companies WHERE user_id=$1', [req.user.id])
  res.json({ user: req.user, company: c.rows[0] || null })
})

// ── Loads (marketplace) ──────────────────────────────────
app.get('/api/loads', async (req, res) => {
  const { country, cargo, vehicle, status, q } = req.query
  const conditions = []
  const params = []
  let idx = 1
  if (status) { conditions.push(`l.status=$${idx++}`); params.push(status) }
  else { conditions.push(`l.status != $${idx++}`); params.push('cancelled') }
  if (country) { conditions.push(`($${idx++} = ANY(ARRAY[l.origin_country, l.dest_country]))`); params.push(country) }
  if (cargo) { conditions.push(`l.cargo_type ILIKE $${idx++}`); params.push(`%${cargo}%`) }
  if (vehicle) { conditions.push(`l.vehicle_type ILIKE $${idx++}`); params.push(`%${vehicle}%`) }
  if (q) { conditions.push(`(l.title ILIKE $${idx++} OR l.origin_city ILIKE $${idx++} OR l.dest_city ILIKE $${idx++})`); params.push(`%${q}%`, `%${q}%`, `%${q}%`) }

  const where = 'WHERE ' + conditions.join(' AND ')
  const sql = `
    SELECT l.*, c.name AS shipper_name, c.verified AS shipper_verified,
      (SELECT count(*) FROM quotes WHERE load_id=l.id AND status='pending') AS quote_count
    FROM loads l JOIN companies c ON c.id=l.shipper_id
    ${where} ORDER BY l.created_at DESC`
  const result = await pool.query(sql, params)
  res.json(result.rows)
})

app.get('/api/loads/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `SELECT l.*, c.name AS shipper_name, c.verified AS shipper_verified, c.rating AS shipper_rating
     FROM loads l JOIN companies c ON c.id=l.shipper_id WHERE l.id=$1`, [id]
  )
  if (!result.rows.length) return res.status(404).json({ error: 'Load not found' })
  const load = result.rows[0]

  const quotes = await pool.query(
    `SELECT q.*, c.name AS transporter_name, c.verified AS transporter_verified, c.rating AS transporter_rating
     FROM quotes q JOIN companies c ON c.id=q.transporter_id
     WHERE q.load_id=$1 ORDER BY q.amount ASC`, [id]
  )
  res.json({ ...load, quotes: quotes.rows })
})

// ── Create load (shipper) ────────────────────────────────
app.post('/api/loads', authRequired, async (req, res) => {
  const { title, origin_city, origin_country, dest_city, dest_country, cargo_type, weight_tons, vehicle_type, pickup_date, delivery_date, budget, currency, cross_border, description } = req.body

  if (!title || !origin_city || !origin_country || !dest_city || !dest_country || !cargo_type || !weight_tons || !vehicle_type || !pickup_date)
    return res.status(400).json({ error: 'Missing required fields' })

  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.status(403).json({ error: 'No company profile' })

  const result = await pool.query(
    `INSERT INTO loads (shipper_id, title, origin_city, origin_country, dest_city, dest_country, cargo_type, weight_tons, vehicle_type, pickup_date, delivery_date, budget, currency, cross_border, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [co.rows[0].id, title, origin_city, origin_country, dest_city, dest_country, cargo_type, weight_tons, vehicle_type, pickup_date, delivery_date || null, budget || null, currency || 'ZAR', cross_border || false, description || null]
  )
  res.json(result.rows[0])
})

// ── My loads (shipper dashboard) ─────────────────────────
app.get('/api/my-loads', authRequired, async (req, res) => {
  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.json([])
  const result = await pool.query(
    `SELECT l.*, (SELECT count(*) FROM quotes WHERE load_id=l.id AND status='pending') AS quote_count
     FROM loads l WHERE l.shipper_id=$1 ORDER BY l.created_at DESC`, [co.rows[0].id]
  )
  res.json(result.rows)
})

// ── Quotes ───────────────────────────────────────────────
app.post('/api/loads/:id/quotes', authRequired, async (req, res) => {
  const { id } = req.params
  const { amount, eta_days, message } = req.body
  if (!amount) return res.status(400).json({ error: 'Amount required' })

  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.status(403).json({ error: 'No company profile' })

  const result = await pool.query(
    'INSERT INTO quotes (load_id, transporter_id, amount, eta_days, message) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, co.rows[0].id, amount, eta_days || null, message || null]
  )

  await pool.query("UPDATE loads SET status='quoted' WHERE id=$1 AND status='open'", [id])
  res.json(result.rows[0])
})

app.post('/api/quotes/:id/accept', authRequired, async (req, res) => {
  const { id } = req.params
  const q = await pool.query('SELECT * FROM quotes WHERE id=$1', [id])
  if (!q.rows.length) return res.status(404).json({ error: 'Quote not found' })
  const quote = q.rows[0]

  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length || co.rows[0].id !== quote.load_id) {
    // verify ownership: shipper owns the load
    const load = await pool.query('SELECT shipper_id FROM loads WHERE id=$1', [quote.load_id])
    if (!load.rows.length || load.rows[0].shipper_id !== co.rows[0]?.id)
      return res.status(403).json({ error: 'Not your load' })
  }

  await pool.query("UPDATE quotes SET status='accepted' WHERE id=$1", [id])
  await pool.query("UPDATE quotes SET status='rejected' WHERE load_id=$1 AND id!=$2", [quote.load_id, id])
  await pool.query("UPDATE loads SET status='assigned' WHERE id=$1", [quote.load_id])

  // Create shipment
  const ship = await pool.query(
    'INSERT INTO shipments (load_id, transporter_id, status) VALUES ($1,$2,$3) RETURNING *',
    [quote.load_id, quote.transporter_id, 'pickup_confirmed']
  )
  await pool.query(
    'INSERT INTO shipment_events (shipment_id, status, note) VALUES ($1,$2,$3)',
    [ship.rows[0].id, 'pickup_confirmed', 'Job accepted, awaiting pickup.']
  )
  res.json({ ok: true, shipment_id: ship.rows[0].id })
})

// ── My quotes (transporter) ──────────────────────────────
app.get('/api/my-quotes', authRequired, async (req, res) => {
  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.json([])
  const result = await pool.query(
    `SELECT q.*, l.title, l.origin_city, l.origin_country, l.dest_city, l.dest_country,
            l.weight_tons, l.vehicle_type, l.status AS load_status, l.pickup_date,
            c.name AS shipper_name, c.verified AS shipper_verified
     FROM quotes q
     JOIN loads l ON l.id=q.load_id
     JOIN companies c ON c.id=l.shipper_id
     WHERE q.transporter_id=$1 ORDER BY q.created_at DESC`, [co.rows[0].id]
  )
  res.json(result.rows)
})

// ── Company profile (transporter) ────────────────────────
app.get('/api/company', authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT c.*, u.email FROM companies c JOIN users u ON u.id=c.user_id WHERE c.user_id=$1`,
    [req.user.id]
  )
  if (!result.rows.length) return res.json(null)
  const co = result.rows[0]
  const vehicles = await pool.query('SELECT * FROM vehicles WHERE company_id=$1', [co.id])
  res.json({ ...co, vehicles: vehicles.rows })
})

app.post('/api/company/vehicles', authRequired, async (req, res) => {
  const { type, registration, capacity_tons } = req.body
  if (!type) return res.status(400).json({ error: 'Vehicle type required' })
  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.status(403).json({ error: 'No company profile' })
  const result = await pool.query(
    'INSERT INTO vehicles (company_id, type, registration, capacity_tons) VALUES ($1,$2,$3,$4) RETURNING *',
    [co.rows[0].id, type, registration || null, capacity_tons || null]
  )
  res.json(result.rows[0])
})

// ── Shipments ────────────────────────────────────────────
app.get('/api/shipments', authRequired, async (req, res) => {
  const co = await pool.query('SELECT id FROM companies WHERE user_id=$1', [req.user.id])
  if (!co.rows.length) return res.json([])
  const companyId = co.rows[0].id

  const result = await pool.query(
    `SELECT s.*, l.title, l.origin_city, l.origin_country, l.dest_city, l.dest_country,
            ts.name AS transporter_name, sp.name AS shipper_name
     FROM shipments s
     JOIN loads l ON l.id=s.load_id
     JOIN companies ts ON ts.id=s.transporter_id
     JOIN companies sp ON sp.id=l.shipper_id
     WHERE sp.id=$1 OR ts.id=$1
     ORDER BY s.updated_at DESC`, [companyId]
  )
  res.json(result.rows)
})

app.get('/api/shipments/:id', async (req, res) => {
  const { id } = req.params
  const s = await pool.query(
    `SELECT s.*, l.title, l.origin_city, l.origin_country, l.dest_city, l.dest_country,
            l.cargo_type, l.weight_tons, l.cross_border,
            ts.name AS transporter_name, sp.name AS shipper_name
     FROM shipments s
     JOIN loads l ON l.id=s.load_id
     JOIN companies ts ON ts.id=s.transporter_id
     JOIN companies sp ON sp.id=l.shipper_id
     WHERE s.id=$1`, [id]
  )
  if (!s.rows.length) return res.status(404).json({ error: 'Shipment not found' })
  const events = await pool.query('SELECT * FROM shipment_events WHERE shipment_id=$1 ORDER BY created_at DESC', [id])
  res.json({ ...s.rows[0], events: events.rows })
})

app.post('/api/shipments/:id/status', authRequired, async (req, res) => {
  const { id } = req.params
  const { status, location, note } = req.body
  const valid = ['pickup_confirmed','in_transit','border_customs','out_for_delivery','delivered']
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  await pool.query('UPDATE shipments SET status=$1, current_location=$2, updated_at=now() WHERE id=$3', [status, location || null, id])
  await pool.query('INSERT INTO shipment_events (shipment_id, status, location, note) VALUES ($1,$2,$3,$4)', [id, status, location || null, note || null])

  if (status === 'delivered') {
    const s = await pool.query('SELECT load_id FROM shipments WHERE id=$1', [id])
    if (s.rows.length) await pool.query("UPDATE loads SET status='delivered' WHERE id=$1", [s.rows[0].load_id])
  }
  res.json({ ok: true })
})

// ── Transporters (marketplace listing) ──────────────────
app.get('/api/transporters', async (req, res) => {
  const result = await pool.query(
    `SELECT c.*, (SELECT count(*) FROM vehicles WHERE company_id=c.id) AS vehicle_count
     FROM companies c WHERE c.verified IS NOT NULL ORDER BY c.verified DESC, c.rating DESC`
  )
  res.json(result.rows)
})

const PORT = process.env.PORT || 8000
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`API running on :${PORT}`))
})
