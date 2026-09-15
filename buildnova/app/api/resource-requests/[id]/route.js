import { NextResponse } from 'next/server';
import { resourceRequests } from '@/lib/data';

export async function PUT(req, { params }) {
  const body = await req.json();
  const request = resourceRequests.find((r) => r.request_id === params.id);
  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  Object.assign(request, body);
  return NextResponse.json({ request });
}
