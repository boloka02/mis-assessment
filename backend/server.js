// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- DB ----------
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors({ origin: 'http://localhost:3000' })); // Next.js dev
app.use(express.json());

// ---------- HELPERS ----------
const lockoutMinutes = 15;
const maxAttempts = 5;

// ---------- REGISTER ----------
app.post('/api/register', async (req, res) => {
  const { name, email, password, employee_id, role = 'USER' } = req.body;

  if (!name || !email || !password || !employee_id) {
    return res.status(400).json({ success: false, error: 'All fields required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO public.users 
         (name, email, password, employee_id, role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, employee_id, role`,
      [name, email, hashed, employee_id, role]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      const field = err.constraint.includes('email') ? 'email' : 'employee_id';
      return res.status(400).json({ success: false, error: `${field} already taken` });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ---------- LOGIN ----------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Email & password required' });

  try {
    const userRes = await pool.query(
      `SELECT * FROM public.users WHERE email = $1`,
      [email]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    // ---- Account lockout ----
    if (user.suspended) return res.status(403).json({ success: false, error: 'Account suspended' });
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({ success: false, error: `Account locked until ${user.locked_until}` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // increment attempts
      const attempts = (user.login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= maxAttempts) {
        lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      }

      await pool.query(
        `UPDATE public.users
         SET login_attempts = $1, locked_until = $2
         WHERE id = $3`,
        [attempts, lockedUntil, user.id]
      );

      return res.status(400).json({
        success: false,
        error: attempts >= maxAttempts
          ? `Too many attempts – locked for ${lockoutMinutes} min`
          : 'Invalid credentials',
      });
    }

    // ---- SUCCESS – reset attempts ----
    await pool.query(
      `UPDATE public.users
       SET login_attempts = 0, locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    // In production: issue a real JWT (jsonwebtoken)
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      employee_id: user.employee_id,
      role: user.role,
    };

    res.json({ success: true, user: payload, token: 'fake-jwt' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ---------- OPTIONAL: GET USER (protected) ----------
app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token !== 'fake-jwt') return res.status(401).json({ error: 'Unauthenticated' });

  // In real life you would decode JWT and fetch user
  // For demo we just return a static payload
  res.json({ id: 'demo-uuid', name: 'Demo User', role: 'USER' });
});

app.listen(PORT, () => console.log(`Backend → http://localhost:${PORT}`));