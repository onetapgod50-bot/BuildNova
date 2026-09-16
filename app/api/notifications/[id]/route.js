import { NextResponse } from 'next/server';
import { notifications } from '@/lib/data';

export async function PUT(req, { params }) {
  const body = await req.json();
  const notification = notifications.find((n) => n.notification_id === params.id);
  if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  Object.assign(notification, body);
  return NextResponse.json({ notification });
}
