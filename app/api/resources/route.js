import { NextResponse } from 'next/server';
import { resources } from '@/lib/data';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const filtered = projectId ? resources.filter((r) => r.project_id === projectId) : resources;
  return NextResponse.json({ resources: filtered });
}

export async function POST(req) {
  const body = await req.json();
  const newResource = {
    resource_id: `r-${Date.now()}`,
    used_quantity: 0,
    allocation_date: new Date().toISOString().slice(0, 10),
    ...body
  };
  resources.push(newResource);
  return NextResponse.json({ resource: newResource }, { status: 201 });
}
