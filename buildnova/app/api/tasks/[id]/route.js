import { NextResponse } from 'next/server';
import { tasks } from '@/lib/data';

export async function PUT(req, { params }) {
  const body = await req.json();
  const task = tasks.find((t) => t.task_id === params.id);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  Object.assign(task, body);
  return NextResponse.json({ task });
}
