import { NextResponse } from 'next/server';
import { projects } from '@/lib/data';

// SWAP-IN POINT: replace with real DB reads/writes once DATABASE_URL is configured.
// This in-memory array resets on every cold start — it exists to demonstrate
// the REST contract the frontend expects.

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(req) {
  const body = await req.json();
  const newProject = {
    project_id: `p-${Date.now()}`,
    status: 'planning',
    overall_progress: 0,
    ...body
  };
  projects.push(newProject);
  return NextResponse.json({ project: newProject }, { status: 201 });
}
