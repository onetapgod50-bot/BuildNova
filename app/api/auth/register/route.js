import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

// DEMO STUB — replace with real password hashing (e.g. bcrypt) and a
// persistent users table before production use.

export async function POST(req) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'name, email, password and role are required' }, { status: 400 });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const newUser = { user_id: `u-${Date.now()}`, name, email, role };
  users.push(newUser);
  return NextResponse.json({ user: newUser }, { status: 201 });
}
