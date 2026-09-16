# BuildNova

AI-powered infrastructure management and construction progress platform, with three
connected role-based dashboards (Engineer, Manager, Supervisor) and an in-app assistant,
**BuildNova AI**.

Built with Next.js (App Router) so it deploys directly to Vercel, using Next.js Route
Handlers as the Node.js/REST backend described in the brief.

## What's included vs. what's a starting point

This is a fully navigable, functional build of the UI and workflow described in the
brief, running on realistic demo data. To keep it honest about what's production-ready:

**Fully working right now**
- Landing page, role-based login, and three distinct dashboards
- Sidebar navigation matching each role's spec (Projects, Task Allocation, Resource
  Allocation, Resource Requests, Progress Updates, Site Photo uploads, Reports, etc.)
- Client-side interactive workflows: create a project, upload/annotate a blueprint,
  create and reassign tasks, allocate resources, approve/reject resource requests,
  submit progress updates and completion reports, verify completion and assign the
  next task, notifications, dark/light mode
- `BuildNova AI` chat widget, wired to a real server-side API route with role-scoped
  data access and a domain-restriction system prompt
- REST endpoints under `app/api/**` matching the structure in the brief

**Intentionally stubbed — replace before going to production**
- **Data persistence**: `lib/data.js` is an in-memory array standing in for the
  database described in the brief (Users, Projects, Blueprints, Tasks, Resources,
  Progress Reports, Site Photos, Resource Requests, Notifications). It resets on
  every server cold start. Swap its exports for real queries (Postgres, Supabase,
  PlanetScale, etc.) once `DATABASE_URL` is available — every API route and the AI
  route already import from this one file, so that's the only place to change.
- **Authentication**: `lib/auth-context.js` is a demo, client-only session (no
  password check, no server-verified session/JWT). `app/api/auth/login` and
  `.../register` are stubs showing the intended contract. Replace with real hashed
  passwords and a verified session/JWT checked in every API route before shipping.
- **File uploads**: blueprint/site-plan/photo inputs capture a filename for the demo;
  wire them to real object storage (S3, Vercel Blob, etc.) when ready.

## Environment variables

Set these in Vercel → Project Settings → Environment Variables (never commit them):

| Variable       | Required | Purpose                                                        |
|----------------|----------|------------------------------------------------------------------|
| `AI_API_KEY`   | Yes      | Secret key for BuildNova AI's model provider. Server-side only. |
| `AI_API_URL`   | No       | Defaults to Anthropic's Messages API endpoint.                  |
| `AI_MODEL`     | No       | Defaults to `claude-sonnet-4-5`.                                 |
| `DATABASE_URL` | Not yet used | Reserved for when `lib/data.js` is swapped for a real database. |

`AI_API_KEY` is read only inside `app/api/ai/chat/route.js`, a server-side Route
Handler — it's never sent to or bundled into client-side code. If you're using a
provider other than Anthropic's Messages API, adjust the `fetch` call in that file
to match your provider's request/response shape.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in AI_API_KEY
npm run dev
```

## Deploying to Vercel

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket).
2. Import it in Vercel — it will be auto-detected as a Next.js app.
3. In Project Settings → Environment Variables, add `AI_API_KEY` (and optionally
   `AI_API_URL` / `AI_MODEL`).
4. Deploy.

## Demo accounts

No real passwords are required in this demo — any password works once you pick a
role and one of these emails (or use the "Use demo account" button on the login
screen):

- Engineer — `engineer@buildnova.demo`
- Manager — `manager@buildnova.demo`
- Supervisor — `supervisor.a@buildnova.demo` (also `.b`, `.c`, `.d`)

## Project structure

```
app/
  page.js                 Landing page
  login/page.js            Role-based login
  dashboard/engineer/       Engineer dashboard (planning, blueprints, status)
  dashboard/manager/        Manager dashboard (tasks, resources, verification)
  dashboard/supervisor/     Supervisor dashboard (execution, progress, requests)
  api/ai/chat/route.js      BuildNova AI — role-scoped, domain-restricted
  api/**                    REST endpoints for projects/tasks/resources/etc.
components/                 Shared UI (sidebar, topbar, cards, charts, AI widget)
lib/data.js                 Demo "database" — swap for real queries later
lib/auth-context.js         Demo client-side session — swap for real auth later
```
