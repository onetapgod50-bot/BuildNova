import { NextResponse } from 'next/server';
import {
  getProjectsForUser,
  getTasksForUser,
  getResourcesForUser,
  getResourceRequestsForUser,
  projectName,
  supervisorName
} from '@/lib/data';

// ---------------------------------------------------------------------
// SECURITY NOTE
// The AI provider key is read from an environment variable and is never
// sent to, or embedded in, client-side code. Set it in your deployment
// environment (Vercel → Project Settings → Environment Variables):
//
//   AI_API_KEY   — required. Your provider's secret API key.
//   AI_API_URL   — optional. Defaults to Anthropic's Messages API.
//   AI_MODEL     — optional. Defaults to "claude-sonnet-4-5".
//
// This route is the ONLY place that should ever reference AI_API_KEY.
// ---------------------------------------------------------------------

const AI_API_URL = process.env.AI_API_URL || 'https://api.anthropic.com/v1/messages';
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5';

const NOT_FOUND_REPLY = "I couldn't find that information in the BuildNova project database.";
const OFF_TOPIC_REPLY =
  'I can only assist with BuildNova-related information such as project progress, tasks, resources, supervisors, deadlines and construction data.';

function buildScopedContext(user) {
  if (!user) return null;

  const projects = getProjectsForUser(user);
  const tasks = getTasksForUser(user);
  const resources = getResourcesForUser(user);
  const requests = getResourceRequestsForUser(user);

  return {
    role: user.role,
    name: user.name,
    projects: projects.map((p) => ({
      project_id: p.project_id,
      name: p.project_name,
      status: p.status,
      overall_progress: p.overall_progress,
      location: p.location,
      expected_completion: p.expected_completion,
      budget: p.budget
    })),
    tasks: tasks
      .filter((t) => projects.some((p) => p.project_id === t.project_id))
      .map((t) => ({
        task_id: t.task_id,
        project: projectName(t.project_id),
        task_name: t.task_name,
        supervisor: supervisorName(t.supervisor_id),
        status: t.status,
        progress: t.progress,
        deadline: t.deadline,
        priority: t.priority
      })),
    resources: resources
      .filter((r) => projects.some((p) => p.project_id === r.project_id))
      .map((r) => ({
        project: projectName(r.project_id),
        task: r.task_id,
        resource_name: r.resource_name,
        allocated: r.allocated_quantity,
        used: r.used_quantity,
        remaining: r.remaining_quantity
      })),
    resource_requests: requests
      .filter((r) => projects.some((p) => p.project_id === r.project_id))
      .map((r) => ({
        project: projectName(r.project_id),
        resource: r.resource,
        requested_quantity: r.requested_quantity,
        status: r.status,
        reason: r.reason
      }))
  };
}

function buildSystemPrompt(context) {
  return `You are BuildNova AI, the in-app assistant for the BuildNova construction and infrastructure management platform.

RULES (follow strictly):
1. Only answer questions about BuildNova: project planning, tasks, resources, supervisors, deadlines, progress and construction data.
2. If asked about anything unrelated to BuildNova (weather, general trivia, other software, etc.), reply with exactly: "${OFF_TOPIC_REPLY}"
3. Only use the JSON data provided below as your source of truth. Never invent projects, tasks, numbers or names that are not present in it.
4. If the answer isn't in the provided data, reply with exactly: "${NOT_FOUND_REPLY}"
5. The data below is already scoped to what this user (role: ${context ? context.role : 'unauthenticated'}) is authorized to see. Never claim knowledge of other users' or other projects' data beyond what is given.
6. Be concise and specific — cite percentages, dates and names from the data when relevant, similar to: "Construction Site A is currently 68% complete. Foundation work is completed, structural work is 75% complete."

AUTHORIZED PROJECT DATA (JSON):
${context ? JSON.stringify(context) : '{"note": "No authenticated user — no project data is available."}'}`;
}

export async function POST(req) {
  try {
    const { messages, user } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: OFF_TOPIC_REPLY });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = process.env.AI_API_KEY;

    if (!geminiKey && !apiKey) {
      return NextResponse.json({
        reply:
          "BuildNova AI isn't fully configured yet — an administrator needs to configure GEMINI_API_KEY or AI_API_KEY in the deployment settings."
      });
    }

    const context = buildScopedContext(user);
    const systemPrompt = buildSystemPrompt(context);

    // If GEMINI_API_KEY is available, use Google Gemini
    if (geminiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));

      const upstream = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents
        })
      });

      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => '');
        console.error('BuildNova AI Gemini upstream error:', upstream.status, errText);
        return NextResponse.json({
          reply: 'BuildNova AI is temporarily unavailable. Please try again shortly.'
        });
      }

      const data = await upstream.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') ||
        NOT_FOUND_REPLY;

      return NextResponse.json({ reply });
    }

    // Otherwise use configured Anthropic/custom upstream
    const upstream = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      console.error('BuildNova AI upstream error:', upstream.status, errText);
      return NextResponse.json({
        reply: 'BuildNova AI is temporarily unavailable. Please try again shortly.'
      });
    }

    const data = await upstream.json();
    const reply =
      data?.content?.map((block) => block.text).filter(Boolean).join('\n') ||
      NOT_FOUND_REPLY;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('BuildNova AI route error:', err);
    return NextResponse.json(
      { reply: 'Something went wrong while talking to BuildNova AI. Please try again.' },
      { status: 200 }
    );
  }
}
