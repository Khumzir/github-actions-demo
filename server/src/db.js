import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://ale:ale_dev_password@localhost:5432/ale',
})

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('shipper','transporter')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  registration_number TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  jobs_completed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  type TEXT NOT NULL,
  registration TEXT,
  capacity_tons NUMERIC(8,2),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  shipper_id INT REFERENCES companies(id),
  title TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  dest_city TEXT NOT NULL,
  dest_country TEXT NOT NULL,
  cargo_type TEXT NOT NULL,
  weight_tons NUMERIC(10,2) NOT NULL,
  vehicle_type TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  delivery_date DATE,
  budget NUMERIC(12,2),
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','quoted','assigned','in_transit','delivered','cancelled')),
  cross_border BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  load_id INT REFERENCES loads(id),
  transporter_id INT REFERENCES companies(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  eta_days INT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  load_id INT REFERENCES loads(id),
  transporter_id INT REFERENCES companies(id),
  status TEXT NOT NULL DEFAULT 'pickup_confirmed' CHECK (status IN ('pickup_confirmed','in_transit','border_customs','out_for_delivery','delivered')),
  current_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipment_events (
  id SERIAL PRIMARY KEY,
  shipment_id INT REFERENCES shipments(id),
  status TEXT NOT NULL,
  location TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
`

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(SCHEMA)

    const { rows } = await client.query('SELECT count(*)::int AS n FROM users')
    if (rows[0].n > 0) return // already seeded

    const hash = await bcrypt.hash('password123', 10)

    // Users
    const users = await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES
       ($1,$3,'Thandi Mokoena','shipper'),
       ($2,$3,'Sipho Dlamini','transporter')
       RETURNING id, email`,
      ['thandi@maizeking.co.za', 'sipho@transafrik.co.za', hash]
    )
    const [shipperUser, transporterUser] = users.rows

    // Companies
    const companies = await client.query(
      `INSERT INTO companies (user_id, name, country, city, verified, registration_number, rating, jobs_completed) VALUES
       ($1,'Maize King Foods','South Africa','Johannesburg',true,'2023/123456/07',4.6,142),
       ($2,'TransAfrik Logistics','South Africa','Durban',true,'2018/654321/07',4.8,387)
       RETURNING id, name`,
      [shipperUser.id, transporterUser.id]
    )
    const [shipperCo, transporterCo] = companies.rows

    // Extra transporter companies for marketplace richness
    const extraCos = await client.query(
      `INSERT INTO companies (name, country, city, verified, registration_number, rating, jobs_completed) VALUES
       ('Savannah Freight','South Africa','Pretoria',true,'2015/789012/07',4.5,203),
       ('Zambezi Haulage','Zambia','Lusaka',true,'ZMB-2019-4455',4.3,156),
       ('Cape Route Carriers','South Africa','Cape Town',true,'2020/112233/07',4.7,98),
       ('Kalahari Transport','Botswana','Gaborone',false,'BW-2021-8899',4.1,64)
       RETURNING id, name`
    )

    // Vehicles for main transporter
    await client.query(
      `INSERT INTO vehicles (company_id, type, registration, capacity_tons, verified) VALUES
       ($1,'Flatbed Truck','GP-TRK-4821',30,true),
       ($1,'Box Truck','GP-TRK-2210',15,true),
       ($1,'Refrigerated Truck','GP-TRK-9034',20,true)`,
      [transporterCo.id]
    )

    // Loads
    const loads = await client.query(
      `INSERT INTO loads (shipper_id, title, origin_city, origin_country, dest_city, dest_country, cargo_type, weight_tons, vehicle_type, pickup_date, delivery_date, budget, currency, status, cross_border, description) VALUES
       ($1,'Maize grain - 30 tons to Lusaka','Johannesburg','South Africa','Lusaka','Zambia','Agricultural produce',30,'Flatbed Truck','2026-10-10','2026-10-14',45000,'ZAR','open',true,'Bulk maize grain in sealed bags. Loading dock available weekdays 7am-4pm.'),
       ($1,'Frozen produce JHB to Cape Town','Johannesburg','South Africa','Cape Town','South Africa','Perishables (frozen)',18,'Refrigerated Truck','2026-10-06','2026-10-08',28000,'ZAR','open',false,'Frozen vegetables, temperature must stay below -18C throughout.'),
       ($1,'Packaged food Gaborone run','Johannesburg','South Africa','Gaborone','Botswana','Packaged goods',12,'Box Truck','2026-10-08','2026-10-09',15500,'ZAR','open',true,'Palletized canned goods, 12 pallets, standard handling.'),
       ($1,'Cement bags Pretoria to Durban','Pretoria','South Africa','Durban','South Africa','Construction materials',25,'Flatbed Truck','2026-10-05','2026-10-06',19000,'ZAR','open',false,'Bagged cement, weather-sensitive — tarpaulin cover required.'),
       ($1,'Fresh produce Windhoek express','Johannesburg','South Africa','Windhoek','Namibia','Perishables (fresh)',8,'Refrigerated Truck','2026-10-12','2026-10-15',22000,'ZAR','open',true,'Fresh fruit and veg, requires customs clearance documentation.'),
       ($1,'Building supplies to Harare','Johannesburg','South Africa','Harare','Zimbabwe','Construction materials',22,'Flatbed Truck','2026-10-15','2026-10-19',38000,'ZAR','open',true,'Mixed building supplies — steel, timber, fittings. Beitbridge crossing.'),
       ($1,'Textiles Durban to Maputo','Durban','South Africa','Maputo','Mozambique','Textiles',10,'Box Truck','2026-10-07','2026-10-09',16500,'ZAR','open',true,'Baled textiles for retail distribution. Komatipoort border post.'),
       ($1,'Mining equipment Rustenburg','Johannesburg','South Africa','Rustenburg','South Africa','Machinery',15,'Lowbed Truck','2026-10-04','2026-10-04',12000,'ZAR','assigned',false,'Heavy mining equipment, crane offload at destination.')
       RETURNING id, title`,
      [shipperCo.id]
    )

    // Quotes on first few loads
    await client.query(
      `INSERT INTO quotes (load_id, transporter_id, amount, currency, eta_days, message, status) VALUES
       ($1,$2,42500,'ZAR',4,'We have flatbed capacity departing JHB on Oct 10. Full customs handling included.','pending'),
       ($1,$3,47800,'ZAR',3,'Express Zambezi route, includes Beitbridge fast-track clearance.','pending'),
       ($4,$2,27500,'ZAR',2,'Dedicated reefer, real-time temp monitoring provided.','pending'),
       ($5,$2,14800,'ZAR',1,'Gaborone corridor specialist, same-week delivery guaranteed.','pending')`,
      [loads.rows[0].id, transporterCo.id, extraCos.rows[1].id, loads.rows[1].id, loads.rows[2].id]
    )

    // Shipment for the assigned load
    const shipment = await client.query(
      `INSERT INTO shipments (load_id, transporter_id, status, current_location) VALUES
       ($1,$2,'in_transit','N1 North, approaching Bela-Bela')
       RETURNING id`,
      [loads.rows[7].id, transporterCo.id]
    )
    await client.query(
      `INSERT INTO shipment_events (shipment_id, status, location, note) VALUES
       ($1,'pickup_confirmed','Johannesburg','Cargo loaded and secured, all docs checked.'),
       ($1,'in_transit','N1 North, approaching Bela-Bela','On schedule, ETA 14:30.')`,
      [shipment.rows[0].id]
    )

    console.log('Database seeded with demo data.')
  } finally {
    client.release()
  }
}
