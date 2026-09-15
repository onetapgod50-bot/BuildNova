import { NextResponse } from 'next/server';
import { notifications } from '@/lib/data';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const filtered = userId ? notifications.filter((n) => n.user_id === userId) : notifications;
  return NextResponse.json({ notifications: filtered });
}
