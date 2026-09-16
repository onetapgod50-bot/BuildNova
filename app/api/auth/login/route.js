import { NextResponse } from 'next/server';
import { findUserByEmailAndRole } from '@/lib/data';

// DEMO STUB — the frontend currently authenticates client-side via
// lib/auth-context.js. This endpoint shows the intended REST contract
// for when real authentication (hashed passwords, JWT/session cookies,
// a users table) is wired up.

export async function POST(req) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password and role are required' }, { status: 400 });
  }

  const user = findUserByEmailAndRole(email, role);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials or role' }, { status: 401 });
  }

  // NOTE: password is intentionally not checked in this demo stub.
  return NextResponse.json({
    user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
  });
}
