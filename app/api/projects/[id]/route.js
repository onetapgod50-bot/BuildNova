import { NextResponse } from 'next/server';
import { projects } from '@/lib/data';

export async function GET(_req, { params }) {
  const project = projects.find((p) => p.project_id === params.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(req, { params }) {
  const body = await req.json();
  const project = projects.find((p) => p.project_id === params.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  Object.assign(project, body);
  return NextResponse.json({ project });
}
