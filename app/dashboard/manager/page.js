'use client';

import { useMemo, useState } from 'react';
import RequireRole from '@/components/RequireRole';
import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import DonutChart from '@/components/DonutChart';
import { useAuth } from '@/lib/auth-context';
import {
  projects as seedProjects,
  tasks as seedTasks,
  resources as seedResources,
  resourceRequests as seedRequests,
  sitePhotos,
  progressReports,
  users,
  getNotificationsForUser,
  projectName as lookupProjectName
} from '@/lib/data';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'projects', label: 'Projects', icon: 'projects' },
  { key: 'tasks', label: 'Tasks', icon: 'create' },
  { key: 'supervisors', label: 'Supervisors', icon: 'supervisors' },
  { key: 'resources', label: 'Resources', icon: 'resources' },
  { key: 'requests', label: 'Resource Requests', icon: 'requests' },
  { key: 'progress', label: 'Progress Monitoring', icon: 'progress' },
  { key: 'reports', label: 'Reports', icon: 'reports' },
  { key: 'ai', label: 'BuildNova AI', icon: 'ai', action: 'ai' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'profile' }
];

const supervisorUsers = users.filter((u) => u.role === 'supervisor');

export default function ManagerDashboardPage() {
  return (
    <RequireRole role="manager">
      <ManagerDashboard />
    </RequireRole>
  );
}

function ManagerDashboard() {
  const { user } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [projects, setProjects] = useState(seedProjects);
  const [tasks, setTasks] = useState(seedTasks);
  const [resources, setResources] = useState(seedResources);
  const [requests, setRequests] = useState(seedRequests);
  const [toast, setToast] = useState('');

  const notifications = getNotificationsForUser(user);

  const titles = {
    dashboard: 'Manager Dashboard',
    projects: 'Projects',
    tasks: 'Tasks & Allocation',
    supervisors: 'Supervisors',
    resources: 'Resource Allocation',
    requests: 'Resource Requests',
    progress: 'Progress Monitoring',
    reports: 'Reports & Analytics',
    notifications: 'Notifications',
    profile: 'Profile'
  };

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function updateTask(taskId, patch) {
    setTasks((prev) => prev.map((t) => (t.task_id === taskId ? { ...t, ...patch } : t)));
  }

  function verifyTask(taskId) {
    updateTask(taskId, { status: 'completed', progress: 100 });
    flash('Task verified and marked completed.');
  }

  function assignNextTask(projectId, currentTaskId) {
    const projectTasks = tasks
      .filter((t) => t.project_id === projectId)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    const currentIndex = projectTasks.findIndex((t) => t.task_id === currentTaskId);
    const next = projectTasks[currentIndex + 1];
    if (next && next.status === 'not_started') {
      updateTask(next.task_id, { status: 'in_progress' });
      flash(`${next.task_name} assigned and started.`);
    } else {
      flash('No further tasks to assign for this project.');
    }
  }

  function respondToRequest(requestId, status, modifiedQty) {
    setRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId
          ? { ...r, status, requested_quantity: modifiedQty ?? r.requested_quantity }
          : r
      )
    );
    if (status === 'approved') {
      const req = requests.find((r) => r.request_id === requestId);
      if (req) {
        setResources((prev) =>
          prev.map((res) =>
            res.project_id === req.project_id && res.resource_name === req.resource
              ? {
                  ...res,
                  allocated_quantity: res.allocated_quantity + (modifiedQty ?? req.requested_quantity),
                  remaining_quantity: res.remaining_quantity + (modifiedQty ?? req.requested_quantity)
                }
              : res
          )
        );
      }
    }
    flash(`Request ${status}.`);
  }

  function createTask(newTask) {
    setTasks((prev) => [
      ...prev,
      { task_id: `t-${Date.now()}`, progress: 0, status: 'not_started', ...newTask }
    ]);
    flash('Task created and assigned.');
  }

  function allocateResource(newResource) {
    setResources((prev) => [
      ...prev,
      {
        resource_id: `r-${Date.now()}`,
        used_quantity: 0,
        allocation_date: new Date().toISOString().slice(0, 10),
        ...newResource,
        remaining_quantity: newResource.allocated_quantity
      }
    ]);
    flash('Resource allocated.');
  }

  const pendingVerification = tasks.filter((t) => t.status === 'pending_verification');

  return (
    <DashboardShell
      roleLabel="Manager"
      title={titles[section]}
      items={NAV_ITEMS}
      active={section}
      onSelect={setSection}
      notifications={notifications}
    >
      {toast && (
        <div className="mb-4 rounded-sm border border-site-green/40 bg-site-green/10 px-4 py-2 text-sm text-site-green">
          {toast}
        </div>
      )}

      {section === 'dashboard' && (
        <DashboardSection projects={projects} tasks={tasks} resources={resources} requests={requests} />
      )}
      {section === 'projects' && <ProjectsSection projects={projects} tasks={tasks} />}
      {section === 'tasks' && (
        <TasksSection
          projects={projects}
          tasks={tasks}
          onUpdate={updateTask}
          onVerify={verifyTask}
          onAssignNext={assignNextTask}
          onCreate={createTask}
          pendingVerification={pendingVerification}
        />
      )}
      {section === 'supervisors' && <SupervisorsSection tasks={tasks} />}
      {section === 'resources' && (
        <ResourcesSection projects={projects} tasks={tasks} resources={resources} onAllocate={allocateResource} />
      )}
      {section === 'requests' && <RequestsSection requests={requests} onRespond={respondToRequest} />}
      {section === 'progress' && (
        <ProgressMonitoringSection
          tasks={tasks}
          pendingVerification={pendingVerification}
          onVerify={verifyTask}
          onAssignNext={assignNextTask}
        />
      )}
      {section === 'reports' && <ReportsSection projects={projects} tasks={tasks} resources={resources} />}
      {section === 'notifications' && <NotificationsSection notifications={notifications} />}
      {section === 'profile' && <ProfileSection user={user} />}
    </DashboardShell>
  );
}

// --- Sections -----------------------------------------------------------

function DashboardSection({ projects, tasks, resources, requests }) {
  const total = projects.length;
  const active = projects.filter((p) => p.status === 'in_progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const delayed = projects.filter((p) => p.status === 'delayed' || tasks.some((t) => t.project_id === p.project_id && t.status === 'delayed')).length;
  const avgProgress = total ? Math.round(projects.reduce((s, p) => s + p.overall_progress, 0) / total) : 0;
  const pendingReports = tasks.filter((t) => t.status === 'pending_verification').length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const avgResourceUsage = resources.length
    ? Math.round((resources.reduce((s, r) => s + r.used_quantity / (r.allocated_quantity || 1), 0) / resources.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Projects" value={total} tone="green" />
        <StatCard label="Active Projects" value={active} tone="blue" />
        <StatCard label="Completed Projects" value={completed} tone="green" />
        <StatCard label="Delayed Projects" value={delayed} tone="red" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Overall Progress</p>
          <DonutChart value={avgProgress} label="across all projects" />
        </div>
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Resource Usage</p>
          <DonutChart value={avgResourceUsage} label="allocated resources used" tone="#3E7CB1" />
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Pending Supervisor Reports</p>
            <p className="mt-1 font-display text-2xl font-semibold data-figure">{pendingReports}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Open Resource Requests</p>
            <p className="mt-1 font-display text-2xl font-semibold data-figure">{pendingRequests}</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">All Projects</p>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.project_id} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-ink-900 dark:text-paper-50">{p.project_name}</span>
              <div className="w-40">
                <ProgressBar value={p.overall_progress} size="sm" />
              </div>
              <span className="w-10 text-right font-mono text-xs">{p.overall_progress}%</span>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ projects, tasks }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {projects.map((p) => {
        const projectTasks = tasks.filter((t) => t.project_id === p.project_id);
        const done = projectTasks.filter((t) => t.status === 'completed').length;
        return (
          <div key={p.project_id} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-900 dark:text-paper-50">{p.project_name}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-1 text-sm text-ink-500">{p.employer} · {p.location}</p>
            <div className="mt-3">
              <ProgressBar value={p.overall_progress} />
              <p className="mt-1 font-mono text-xs text-ink-500">{p.overall_progress}% overall · {done}/{projectTasks.length} tasks complete</p>
            </div>
            <p className="mt-3 text-xs text-ink-500">Expected completion: <span className="font-mono">{p.expected_completion}</span></p>
          </div>
        );
      })}
    </div>
  );
}

function TasksSection({ projects, tasks, onUpdate, onVerify, onAssignNext, onCreate, pendingVerification }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    project_id: projects[0]?.project_id || '',
    task_name: '',
    description: '',
    supervisor_id: supervisorUsers[0]?.user_id || '',
    start_date: '',
    deadline: '',
    priority: 'medium'
  });

  function submit(e) {
    e.preventDefault();
    if (!form.task_name || !form.project_id) return;
    onCreate(form);
    setForm({ ...form, task_name: '', description: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      {pendingVerification.length > 0 && (
        <div className="card border-site-amber/40 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-site-amber">Awaiting your verification</p>
          {pendingVerification.map((t) => (
            <div key={t.task_id} className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm">
              <span>{t.task_name} — {lookupProjectName(t.project_id)}</span>
              <div className="flex gap-2">
                <button onClick={() => onVerify(t.task_id)} className="rounded-sm bg-site-green px-3 py-1 text-xs text-white">
                  Verify & Approve
                </button>
                <button onClick={() => onAssignNext(t.project_id, t.task_id)} className="rounded-sm border border-paper-200 dark:border-ink-700 px-3 py-1 text-xs">
                  Assign Next Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="rounded-sm bg-site-green px-4 py-2 text-sm font-medium text-white">
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Project">
            <select className={inputCls} value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Task Name">
            <input required className={inputCls} value={form.task_name} onChange={(e) => setForm({ ...form, task_name: e.target.value })} />
          </Field>
          <Field label="Assigned Supervisor">
            <select className={inputCls} value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}>
              {supervisorUsers.map((s) => (
                <option key={s.user_id} value={s.user_id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field label="Start Date">
            <input type="date" className={inputCls} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="Expected Completion">
            <input type="date" className={inputCls} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <button type="submit" className="sm:col-span-2 rounded-sm bg-site-green px-4 py-2 text-sm font-medium text-white justify-self-start">
            Create Task
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Supervisor</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.task_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0">
                <td className="px-4 py-3 font-medium text-ink-900 dark:text-paper-50">{t.task_name}</td>
                <td className="px-4 py-3 text-ink-500">{lookupProjectName(t.project_id)}</td>
                <td className="px-4 py-3">
                  <select
                    value={t.supervisor_id}
                    onChange={(e) => onUpdate(t.task_id, { supervisor_id: e.target.value })}
                    className="rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-2 py-1 text-xs"
                  >
                    {supervisorUsers.map((s) => (
                      <option key={s.user_id} value={s.user_id}>{s.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{t.deadline}</td>
                <td className="px-4 py-3 w-32">
                  <ProgressBar value={t.progress} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupervisorsSection({ tasks }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {supervisorUsers.map((s) => {
        const assigned = tasks.filter((t) => t.supervisor_id === s.user_id);
        const active = assigned.filter((t) => t.status === 'in_progress').length;
        const completed = assigned.filter((t) => t.status === 'completed').length;
        return (
          <div key={s.user_id} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-evergreen-800 text-sm font-medium text-paper-50">
                {s.name[0]}
              </span>
              <div>
                <p className="font-medium text-ink-900 dark:text-paper-50">{s.name}</p>
                <p className="text-xs text-ink-500">{s.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-mono text-lg font-semibold">{assigned.length}</p>
                <p className="text-[11px] text-ink-500">Assigned</p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-site-blue">{active}</p>
                <p className="text-[11px] text-ink-500">Active</p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-site-green">{completed}</p>
                <p className="text-[11px] text-ink-500">Completed</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-xs text-ink-500">
              {assigned.slice(0, 3).map((t) => (
                <li key={t.task_id}>• {t.task_name} ({lookupProjectName(t.project_id)})</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ResourcesSection({ projects, tasks, resources, onAllocate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    project_id: projects[0]?.project_id || '',
    task_id: '',
    supervisor_id: supervisorUsers[0]?.user_id || '',
    resource_name: '',
    allocated_quantity: ''
  });

  function submit(e) {
    e.preventDefault();
    if (!form.resource_name || !form.allocated_quantity) return;
    onAllocate({ ...form, allocated_quantity: Number(form.allocated_quantity) });
    setForm({ ...form, resource_name: '', allocated_quantity: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="rounded-sm bg-site-green px-4 py-2 text-sm font-medium text-white">
          {showForm ? 'Cancel' : '+ Allocate Resource'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Project">
            <select className={inputCls} value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Supervisor">
            <select className={inputCls} value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}>
              {supervisorUsers.map((s) => (
                <option key={s.user_id} value={s.user_id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Resource Name">
            <input required className={inputCls} value={form.resource_name} onChange={(e) => setForm({ ...form, resource_name: e.target.value })} placeholder="e.g. Cement (bags)" />
          </Field>
          <Field label="Allocated Quantity">
            <input required type="number" className={inputCls} value={form.allocated_quantity} onChange={(e) => setForm({ ...form, allocated_quantity: e.target.value })} />
          </Field>
          <button type="submit" className="sm:col-span-2 rounded-sm bg-site-green px-4 py-2 text-sm font-medium text-white justify-self-start">
            Allocate
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => {
          const pct = r.allocated_quantity ? Math.round((r.used_quantity / r.allocated_quantity) * 100) : 0;
          return (
            <div key={r.resource_id} className="card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-900 dark:text-paper-50">{r.resource_name}</span>
                <span className="text-xs text-ink-500">{lookupProjectName(r.project_id)}</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={pct} tone={pct > 90 ? 'red' : pct > 70 ? 'amber' : 'green'} size="sm" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-xs text-ink-500">
                <span>Used {r.used_quantity}</span>
                <span>Remaining {r.remaining_quantity}</span>
                <span>Allocated {r.allocated_quantity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequestsSection({ requests, onRespond }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Resource</th>
            <th className="px-4 py-3">Requested</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.request_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0 align-top">
              <td className="px-4 py-3">{lookupProjectName(r.project_id)}</td>
              <td className="px-4 py-3">{r.resource}</td>
              <td className="px-4 py-3 font-mono">{r.requested_quantity}</td>
              <td className="px-4 py-3 text-ink-500 max-w-xs">{r.reason}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3">
                {r.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => onRespond(r.request_id, 'approved')} className="rounded-sm bg-site-green px-2.5 py-1 text-xs text-white">
                      Approve
                    </button>
                    <button onClick={() => onRespond(r.request_id, 'rejected')} className="rounded-sm border border-site-red text-site-red px-2.5 py-1 text-xs">
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-ink-500">Resolved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressMonitoringSection({ tasks, pendingVerification, onVerify, onAssignNext }) {
  return (
    <div className="space-y-6">
      {pendingVerification.length > 0 && (
        <div className="card border-site-amber/40 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-site-amber">Completion reports awaiting verification</p>
          {pendingVerification.map((t) => (
            <div key={t.task_id} className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm">
              <span>{t.task_name} — {lookupProjectName(t.project_id)}</span>
              <div className="flex gap-2">
                <button onClick={() => onVerify(t.task_id)} className="rounded-sm bg-site-green px-3 py-1 text-xs text-white">Verify</button>
                <button onClick={() => onAssignNext(t.project_id, t.task_id)} className="rounded-sm border border-paper-200 dark:border-ink-700 px-3 py-1 text-xs">Assign Next</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Site Progress Gallery</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sitePhotos.map((photo) => (
            <div key={photo.photo_id} className="card overflow-hidden">
              <div className="flex h-36 items-center justify-center bg-paper-100 dark:bg-ink-800 text-ink-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 7h4l2-3h4l2 3h4v13H4ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                </svg>
              </div>
              <div className="p-3">
                <p className="text-sm text-ink-900 dark:text-paper-50">{photo.description}</p>
                <p className="mt-1 font-mono text-[11px] text-ink-500">
                  {lookupProjectName(photo.project_id)} · {photo.uploaded_date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Recent Progress Reports</p>
        <div className="card divide-y divide-paper-100 dark:divide-ink-800">
          {progressReports.map((r) => (
            <div key={r.report_id} className="px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 dark:text-paper-50">
                  {lookupProjectName(r.project_id)}
                </span>
                <span className="font-mono text-xs text-ink-500">{r.submitted_date}</span>
              </div>
              <p className="mt-1 text-ink-500">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsSection({ projects, tasks, resources }) {
  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
    : 0;
  const delayedTasks = tasks.filter((t) => t.status === 'delayed');
  const consumption = resources.length
    ? Math.round((resources.reduce((s, r) => s + r.used_quantity, 0) / resources.reduce((s, r) => s + r.allocated_quantity, 0)) * 100)
    : 0;

  const supervisorPerf = supervisorUsers.map((s) => {
    const assigned = tasks.filter((t) => t.supervisor_id === s.user_id);
    const completed = assigned.filter((t) => t.status === 'completed').length;
    return { name: s.name, rate: assigned.length ? Math.round((completed / assigned.length) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 flex flex-col items-center"><DonutChart value={completionRate} label="Task completion" /></div>
        <div className="card p-5 flex flex-col items-center"><DonutChart value={consumption} label="Resource consumption" tone="#3E7CB1" /></div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink-500">Delayed Tasks</p>
          <p className="mt-1 font-display text-3xl font-semibold text-site-red data-figure">{delayedTasks.length}</p>
          <ul className="mt-2 space-y-1 text-xs text-ink-500">
            {delayedTasks.map((t) => (
              <li key={t.task_id}>• {t.task_name} ({lookupProjectName(t.project_id)})</li>
            ))}
            {delayedTasks.length === 0 && <li>No delayed tasks.</li>}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Supervisor Performance</p>
        <div className="space-y-3">
          {supervisorPerf.map((s) => (
            <div key={s.name} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0">{s.name}</span>
              <ProgressBar value={s.rate} size="sm" />
              <span className="w-10 text-right font-mono text-xs">{s.rate}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Project Timeline</p>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.project_id} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate">{p.project_name}</span>
              <span className="font-mono text-xs text-ink-500 w-24">{p.start_date}</span>
              <ProgressBar value={p.overall_progress} size="sm" />
              <span className="font-mono text-xs text-ink-500 w-24 text-right">{p.expected_completion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }) {
  return (
    <div className="card divide-y divide-paper-100 dark:divide-ink-800">
      {notifications.map((n) => (
        <div key={n.notification_id} className="px-4 py-3 text-sm">
          <p className="text-ink-900 dark:text-paper-50">{n.message}</p>
          <p className="mt-1 font-mono text-[11px] text-ink-500">{new Date(n.created_at).toLocaleString()}</p>
        </div>
      ))}
      {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">No notifications.</p>}
    </div>
  );
}

function ProfileSection({ user }) {
  return (
    <div className="card max-w-md p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-evergreen-800 text-lg font-medium text-paper-50">
          {user.name[0]}
        </span>
        <div>
          <p className="font-display text-base font-semibold text-ink-900 dark:text-paper-50">{user.name}</p>
          <p className="text-sm text-ink-500 capitalize">{user.role}</p>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <p><span className="text-ink-500">Email: </span>{user.email}</p>
        <p><span className="text-ink-500">User ID: </span><span className="font-mono">{user.user_id}</span></p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green';
