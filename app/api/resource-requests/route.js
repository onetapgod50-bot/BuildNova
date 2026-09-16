import { NextResponse } from 'next/server';
import { resourceRequests } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ requests: resourceRequests });
}

export async function POST(req) {
  const body = await req.json();
  const newRequest = {
    request_id: `rq-${Date.now()}`,
    status: 'pending',
    date: new Date().toISOString().slice(0, 10),
    ...body
  };
  resourceRequests.push(newRequest);
  return NextResponse.json({ request: newRequest }, { status: 201 });
}
