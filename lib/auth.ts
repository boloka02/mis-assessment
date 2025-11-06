// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'adon-auth';

/* ---------- JWT ---------- */
export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as any;
  } catch {
    return null;
  }
}

/* ---------- Cookie helpers (must be called inside a server context) ---------- */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();          // <-- await!
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();          // <-- await!
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();          // <-- await!
  cookieStore.delete(COOKIE_NAME);
}

/* ---------- Helper to return a response with the cookie set ---------- */
export function responseWithCookie(data: any, token?: string) {
  const res = NextResponse.json(data);
  if (token) {
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }
  return res;
} 