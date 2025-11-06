// app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });

  return Response.json({ user: payload });
}