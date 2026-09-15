// lib/data.js
//
// This file simulates the BuildNova database with in-memory demo data,
// shaped to match the schema in the project spec (Users, Projects,
// Blueprints, Tasks, Resources, Progress Reports, Site Photos,
// Resource Requests, Notifications).
//
// SWAP-IN POINT FOR A REAL DATABASE:
// Replace the arrays below with real queries (e.g. Postgres via
// `DATABASE_URL`, or Supabase/PlanetScale/etc.) once credentials are
// available. Every API route in app/api/** and the AI route in
// app/api/ai/chat/route.js import from this file — point those imports
// at your real data-access layer and the rest of the app keeps working.

export const users = [
  { user_id: 'u-eng-1', name: 'Asha Rao', email: 'engineer@buildnova.demo', role: 'engineer' },
  { user_id: 'u-mgr-1', name: 'Daniel Cole', email: 'manager@buildnova.demo', role: 'manager' },
  { user_id: 'u-sup-1', name: 'Miguel Torres', email: 'supervisor.a@buildnova.demo', role: 'supervisor' },
  { user_id: 'u-sup-2', name: 'Priya Nair', email: 'supervisor.b@buildnova.demo', role: 'supervisor' },
  { user_id: 'u-sup-3', name: 'Jonas Weber', email: 'supervisor.c@buildnova.demo', role: 'supervisor' },
  { user_id: 'u-sup-4', name: 'Grace Okafor', email: 'supervisor.d@buildnova.demo', role: 'supervisor' }
];

export const projects = [
  {
    project_id: 'p-1',
    project_name: 'Construction Site A',
    employer: 'Meridian Housing Trust',
    location: 'Sector 12, Riverside District',
    land_area: '4.2 acres',
    gps_location: '28.6139° N, 77.2090° E',
    project_type: 'Residential Complex',
    description: 'A 6-block residential complex with underground parking and a community center.',
    start_date: '2026-03-01',
    expected_completion: '2026-09-25',
    budget: 4200000,
    status: 'in_progress',
    overall_progress: 68,
    created_by: 'u-eng-1',
    required_workers: 85
  },
  {
    project_id: 'p-2',
    project_name: 'North Bridge Overpass',
    employer: 'City Transport Authority',
    location: 'North Ring Road',
    land_area: '1.1 acres',
    gps_location: '28.7041° N, 77.1025° E',
    project_type: 'Infrastructure - Bridge',
    description: 'Vehicular overpass connecting the north ring road to the industrial corridor.',
    start_date: '2026-01-15',
    expected_completion: '2026-11-10',
    budget: 6800000,
    status: 'delayed',
    overall_progress: 34,
    created_by: 'u-eng-1',
    required_workers: 60
  },
  {
    project_id: 'p-3',
    project_name: 'Greenfield Community Park',
    employer: 'Municipal Parks Department',
    location: 'Greenfield Sector 7',
    land_area: '2.8 acres',
    gps_location: '28.5355° N, 77.3910° E',
    project_type: 'Public Infrastructure',
    description: 'Public park with walking trails, an amphitheater, and a water feature.',
    start_date: '2026-08-01',
    expected_completion: '2027-02-15',
    budget: 1500000,
    status: 'planning',
    overall_progress: 6,
    created_by: 'u-eng-1',
    required_workers: 22
  }
];

export const blueprints = [
  {
    blueprint_id: 'b-1',
    project_id: 'p-1',
    file_name: 'site-a-structural-v3.pdf',
    uploaded_by: 'u-eng-1',
    upload_date: '2026-02-20',
    notes: 'Rev. 3 — updated foundation load specs after soil test. Column spacing 6.2m on the east wing.'
  },
  {
    blueprint_id: 'b-2',
    project_id: 'p-2',
    file_name: 'north-bridge-span-plan.pdf',
    uploaded_by: 'u-eng-1',
    upload_date: '2026-01-05',
    notes: 'Three-span steel girder design, 42m main span.'
  }
];

export const tasks = [
  { task_id: 't-1', project_id: 'p-1', task_name: 'Land Preparation', description: 'Clearing, grading and leveling the site.', supervisor_id: 'u-sup-1', start_date: '2026-03-01', deadline: '2026-03-15', progress: 100, status: 'completed', priority: 'high' },
  { task_id: 't-2', project_id: 'p-1', task_name: 'Foundation', description: 'Footings and foundation walls for all 6 blocks.', supervisor_id: 'u-sup-1', start_date: '2026-03-16', deadline: '2026-04-20', progress: 100, status: 'completed', priority: 'high' },
  { task_id: 't-3', project_id: 'p-1', task_name: 'Structural Work', description: 'Column and slab casting, block A–F.', supervisor_id: 'u-sup-1', start_date: '2026-04-21', deadline: '2026-07-01', progress: 75, status: 'in_progress', priority: 'high' },
  { task_id: 't-4', project_id: 'p-1', task_name: 'Electrical Work', description: 'Conduit laying and wiring, blocks A–C.', supervisor_id: 'u-sup-2', start_date: '2026-06-01', deadline: '2026-08-15', progress: 40, status: 'in_progress', priority: 'medium' },
  { task_id: 't-5', project_id: 'p-1', task_name: 'Plumbing', description: 'Water supply and drainage lines, blocks A–C.', supervisor_id: 'u-sup-3', start_date: '2026-06-10', deadline: '2026-08-20', progress: 20, status: 'in_progress', priority: 'medium' },
  { task_id: 't-6', project_id: 'p-1', task_name: 'Roofing', description: 'Roof slab waterproofing, all blocks.', supervisor_id: 'u-sup-3', start_date: '2026-08-01', deadline: '2026-08-25', progress: 0, status: 'not_started', priority: 'medium' },
  { task_id: 't-7', project_id: 'p-1', task_name: 'Flooring', description: 'Tiling and floor finishing, blocks A–C.', supervisor_id: 'u-sup-4', start_date: '2026-08-10', deadline: '2026-09-05', progress: 0, status: 'not_started', priority: 'low' },
  { task_id: 't-8', project_id: 'p-1', task_name: 'Painting', description: 'Interior and exterior painting.', supervisor_id: 'u-sup-4', start_date: '2026-09-01', deadline: '2026-09-20', progress: 0, status: 'not_started', priority: 'low' },
  { task_id: 't-9', project_id: 'p-1', task_name: 'Final Inspection', description: 'Compliance and quality inspection.', supervisor_id: 'u-sup-1', start_date: '2026-09-21', deadline: '2026-09-25', progress: 0, status: 'not_started', priority: 'high' },

  { task_id: 't-10', project_id: 'p-2', task_name: 'Pier Foundation', description: 'Pile driving and pier casting, piers 1–4.', supervisor_id: 'u-sup-2', start_date: '2026-01-15', deadline: '2026-03-01', progress: 100, status: 'completed', priority: 'high' },
  { task_id: 't-11', project_id: 'p-2', task_name: 'Girder Erection', description: 'Steel girder placement across spans 1–3.', supervisor_id: 'u-sup-2', start_date: '2026-03-02', deadline: '2026-06-01', progress: 45, status: 'delayed', priority: 'high' },
  { task_id: 't-12', project_id: 'p-2', task_name: 'Deck Slab Casting', description: 'Reinforced concrete deck slab.', supervisor_id: 'u-sup-3', start_date: '2026-06-02', deadline: '2026-08-15', progress: 0, status: 'on_hold', priority: 'high' },

  { task_id: 't-13', project_id: 'p-3', task_name: 'Site Survey', description: 'Topographic survey and soil testing.', supervisor_id: 'u-sup-4', start_date: '2026-08-01', deadline: '2026-08-20', progress: 30, status: 'in_progress', priority: 'medium' }
];

export const resources = [
  { resource_id: 'r-1', project_id: 'p-1', task_id: 't-3', supervisor_id: 'u-sup-1', resource_name: 'Cement (bags)', allocated_quantity: 800, used_quantity: 620, remaining_quantity: 180, required_quantity: 800, allocation_date: '2026-04-21' },
  { resource_id: 'r-2', project_id: 'p-1', task_id: 't-3', supervisor_id: 'u-sup-1', resource_name: 'Steel (tons)', allocated_quantity: 45, used_quantity: 34, remaining_quantity: 11, required_quantity: 45, allocation_date: '2026-04-21' },
  { resource_id: 'r-3', project_id: 'p-1', task_id: 't-4', supervisor_id: 'u-sup-2', resource_name: 'Electrical Conduit (m)', allocated_quantity: 1200, used_quantity: 480, remaining_quantity: 720, required_quantity: 1200, allocation_date: '2026-06-01' },
  { resource_id: 'r-4', project_id: 'p-1', task_id: 't-5', supervisor_id: 'u-sup-3', resource_name: 'PVC Pipes (units)', allocated_quantity: 300, used_quantity: 60, remaining_quantity: 240, required_quantity: 300, allocation_date: '2026-06-10' },
  { resource_id: 'r-5', project_id: 'p-1', task_id: 't-2', supervisor_id: 'u-sup-1', resource_name: 'Bricks (units)', allocated_quantity: 50000, used_quantity: 50000, remaining_quantity: 0, required_quantity: 50000, allocation_date: '2026-03-16' },
  { resource_id: 'r-6', project_id: 'p-2', task_id: 't-11', supervisor_id: 'u-sup-2', resource_name: 'Steel Girders (units)', allocated_quantity: 18, used_quantity: 9, remaining_quantity: 9, required_quantity: 18, allocation_date: '2026-03-02' }
];

export const progressReports = [
  { report_id: 'pr-1', project_id: 'p-1', task_id: 't-3', supervisor_id: 'u-sup-1', progress: 75, description: 'Column casting complete on blocks A–D, formwork underway on E–F.', submitted_date: '2026-09-10' },
  { report_id: 'pr-2', project_id: 'p-1', task_id: 't-4', supervisor_id: 'u-sup-2', progress: 40, description: 'Conduit laid through block B, starting block C this week.', submitted_date: '2026-09-11' },
  { report_id: 'pr-3', project_id: 'p-1', task_id: 't-5', supervisor_id: 'u-sup-3', progress: 20, description: 'Main drainage trench dug, pipe-laying starting.', submitted_date: '2026-09-09' },
  { report_id: 'pr-4', project_id: 'p-2', task_id: 't-11', supervisor_id: 'u-sup-2', progress: 45, description: 'Span 2 girders delayed by crane availability.', submitted_date: '2026-09-08' }
];

export const sitePhotos = [
  { photo_id: 'ph-1', project_id: 'p-1', task_id: 't-3', supervisor_id: 'u-sup-1', description: 'Column formwork, Block D', uploaded_date: '2026-09-10' },
  { photo_id: 'ph-2', project_id: 'p-1', task_id: 't-4', supervisor_id: 'u-sup-2', description: 'Conduit routing, Block B corridor', uploaded_date: '2026-09-11' },
  { photo_id: 'ph-3', project_id: 'p-1', task_id: 't-2', supervisor_id: 'u-sup-1', description: 'Completed foundation, Block A', uploaded_date: '2026-04-18' }
];

export const resourceRequests = [
  { request_id: 'rq-1', project_id: 'p-1', task_id: 't-3', supervisor_id: 'u-sup-1', resource: 'Cement (bags)', current_quantity: 180, requested_quantity: 200, reason: 'Remaining stock will not cover blocks E–F column casting.', date: '2026-09-12', status: 'pending' },
  { request_id: 'rq-2', project_id: 'p-1', task_id: 't-5', supervisor_id: 'u-sup-3', resource: 'PVC Pipes (units)', current_quantity: 240, requested_quantity: 100, reason: 'Additional branch lines added per revised plumbing layout.', date: '2026-09-08', status: 'approved' },
  { request_id: 'rq-3', project_id: 'p-2', task_id: 't-11', supervisor_id: 'u-sup-2', resource: 'Steel Girders (units)', current_quantity: 9, requested_quantity: 6, reason: 'Crane rental extended, want girders on-site ahead of schedule.', date: '2026-09-05', status: 'rejected' }
];

export const notifications = [
  { notification_id: 'n-1', user_id: 'u-mgr-1', message: 'Miguel Torres submitted a progress update for Structural Work (75%).', type: 'progress_update', read_status: false, created_at: '2026-09-10T09:20:00Z' },
  { notification_id: 'n-2', user_id: 'u-mgr-1', message: 'Resource request: Miguel Torres needs 200 additional bags of cement.', type: 'resource_request', read_status: false, created_at: '2026-09-12T14:05:00Z' },
  { notification_id: 'n-3', user_id: 'u-mgr-1', message: 'North Bridge Overpass — Girder Erection is behind schedule.', type: 'delay_alert', read_status: true, created_at: '2026-09-08T08:00:00Z' },
  { notification_id: 'n-4', user_id: 'u-sup-3', message: 'Your resource request for PVC pipes was approved.', type: 'request_response', read_status: false, created_at: '2026-09-08T16:40:00Z' },
  { notification_id: 'n-5', user_id: 'u-eng-1', message: 'Construction Site A crossed 68% overall completion.', type: 'milestone', read_status: false, created_at: '2026-09-10T09:25:00Z' }
];

// --- Helper accessors -------------------------------------------------

export function getProjectsForUser(user) {
  if (!user) return [];
  if (user.role === 'engineer') return projects.filter((p) => p.created_by === user.user_id);
  if (user.role === 'manager') return projects; // demo: manager oversees all projects
  if (user.role === 'supervisor') {
    const projectIds = new Set(tasks.filter((t) => t.supervisor_id === user.user_id).map((t) => t.project_id));
    return projects.filter((p) => projectIds.has(p.project_id));
  }
  return [];
}

export function getTasksForUser(user) {
  if (!user) return [];
  if (user.role === 'supervisor') return tasks.filter((t) => t.supervisor_id === user.user_id);
  return tasks;
}

export function getResourcesForUser(user) {
  if (!user) return [];
  if (user.role === 'supervisor') return resources.filter((r) => r.supervisor_id === user.user_id);
  return resources;
}

export function getResourceRequestsForUser(user) {
  if (!user) return [];
  if (user.role === 'supervisor') return resourceRequests.filter((r) => r.supervisor_id === user.user_id);
  return resourceRequests;
}

export function getNotificationsForUser(user) {
  if (!user) return [];
  return notifications.filter((n) => n.user_id === user.user_id);
}

export function findUserByEmailAndRole(email, role) {
  return users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.role === role
  );
}

export function taskName(taskId) {
  return tasks.find((t) => t.task_id === taskId)?.task_name ?? 'Unknown task';
}

export function projectName(projectId) {
  return projects.find((p) => p.project_id === projectId)?.project_name ?? 'Unknown project';
}

export function supervisorName(userId) {
  return users.find((u) => u.user_id === userId)?.name ?? 'Unassigned';
}
