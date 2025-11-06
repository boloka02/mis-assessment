// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, responseWithCookie } from '@/lib/auth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  const pool = await getPool();

  try {
    const { rows } = await pool.query(`SELECT * FROM public.users WHERE email = $1`, [email]);
    const user = rows[0];
    if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 400 });

    // ---- lockout / suspended ----
    if (user.suspended) return Response.json({ error: 'Account suspended' }, { status: 403 });
    if (user.locked_until && new Date(user.locked_until) > new Date())
      return Response.json({ error: `Locked until ${user.locked_until}` }, { status: 403 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const attempts = (user.login_attempts || 0) + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      await pool.query(
        `UPDATE public.users SET login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [attempts, lockedUntil, user.id]
      );

      return Response.json(
        {
          error: attempts >= MAX_ATTEMPTS
            ? `Too many attempts – locked for ${LOCKOUT_MINUTES} min`
            : 'Invalid credentials',
        },
        { status: 400 }
      );
    }

    // ---- success – reset attempts ----
    await pool.query(
      `UPDATE public.users SET login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [user.id]
    );

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      employee_id: user.employee_id,
      role: user.role,
    };

    const token = await signToken(payload);
    return responseWithCookie({ success: true, user: payload }, token);
  } catch (err: any) {
    console.error('Login error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}