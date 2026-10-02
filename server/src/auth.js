import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me'

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET, {
    expiresIn: '7d',
  })
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
