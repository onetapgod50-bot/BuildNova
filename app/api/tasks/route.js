import { NextResponse } from 'next/server';
import { tasks } from '@/lib/data';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const filtered = projectId ? tasks.filter((t) => t.project_id === projectId) : tasks;
  return NextResponse.json({ tasks: filtered });
}

export async function POST(req) {
  const body = await req.json();
  const newTask = {
    task_id: `t-${Date.now()}`,
    progress: 0,
    status: 'not_started',
    ...body
  };
  tasks.push(newTask);
  return NextResponse.json({ task: newTask }, { status: 201 });
}
