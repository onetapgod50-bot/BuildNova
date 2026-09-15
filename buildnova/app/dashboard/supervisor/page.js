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
  sitePhotos as seedPhotos,
  progressReports as seedReports,
  getNotificationsForUser,
  projectName as lookupProjectName
} from '@/lib/data';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'projects', label: 'My Projects', icon: 'projects' },
  { key: 'tasks', label: 'My Tasks', icon: 'create' },
  { key: 'progress', label: 'Update Progress', icon: 'progress' },
  { key: 'photos', label: 'Upload Site Photos', icon: 'photo' },
  { key: 'resources', label: 'My Resources', icon: 'resources' },
  { key: 'requests', label: 'Request Resources', icon: 'requests' },
  { key: 'reports', label: 'Reports', icon: 'reports' },
  { key: 'ai', label: 'BuildNova AI', icon: 'ai', action: 'ai' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'profile' }
];

const inputCls =
  'w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green';

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">{label}</label>
      {children}
    </div>
  );
}

export default function SupervisorDashboardPage() {
  return (
    <RequireRole role="supervisor">
      <SupervisorDashboard />
    </RequireRole>
  );
}

function SupervisorDashboard() {
  const { user } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [tasks, setTasks] = useState(seedTasks);
  const [photos, setPhotos] = useState(seedPhotos);
  const [requests, setRequests] = useState(seedRequests);
  const [reports, setReports] = useState(seedReports);
  const [toast, setToast] = useState('');

  const myTasks = useMemo(() => tasks.filter((t) => t.supervisor_id === user.user_id), [tasks, user.user_id]);
  const myProjectIds = useMemo(() => new Set(myTasks.map((t) => t.project_id)), [myTasks]);
  const myProjects = seedProjects.filter((p) => myProjectIds.has(p.project_id));
  const myResources = seedResources.filter((r) => r.supervisor_id === user.user_id);
  const myRequests = requests.filter((r) => r.supervisor_id === user.user_id);
  const myPhotos = photos.filter((p) => p.supervisor_id === user.user_id);
  const notifications = getNotificationsForUser(user);

  const titles = {
    dashboard: 'Supervisor Dashboard',
    projects: 'My Projects',
    tasks: 'My Tasks',
    progress: 'Update Progress',
    photos: 'Upload Site Photos',
    resources: 'My Resources',
    requests: 'Request Resources',
    reports: 'Reports',
    notifications: 'Notifications',
    profile: 'Profile'
  };

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function submitProgress({ taskId, percent, workCompleted, workRemaining, issues, completionDescription, remarks }) {
    const isComplete = percent >= 100;
    setTasks((prev) =>
      prev.map((t) =>
        t.task_id === taskId
          ? { ...t, progress: percent, status: isComplete ? 'pending_verification' : 'in_progress' }
          : t
      )
    );
    setReports((prev) => [
      {
        report_id: `pr-${Date.now()}`,
        project_id: tasks.find((t) => t.task_id === taskId)?.project_id,
        task_id: taskId,
        supervisor_id: user.user_id,
        progress: percent,
        description: isComplete ? completionDescription : `${workCompleted || ''} ${issues ? '— Issue: ' + issues : ''}`.trim(),
        submitted_date: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);
    flash(isComplete ? 'Completion report sent to Manager for verification.' : 'Progress update sent to Manager.');
  }

  function uploadPhoto({ projectId, taskId, description }) {
    setPhotos((prev) => [
      {
        photo_id: `ph-${Date.now()}`,
        project_id: projectId,
        task_id: taskId,
        supervisor_id: user.user_id,
        description,
        uploaded_date: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);
    flash('Photo uploaded to the Site Progress Gallery.');
  }

  function requestResource(req) {
    setRequests((prev) => [
      { request_id: `rq-${Date.now()}`, status: 'pending', date: new Date().toISOString().slice(0, 10), supervisor_id: user.user_id, ...req },
      ...prev
    ]);
    flash('Resource request sent to Manager.');
  }

  return (
    <DashboardShell
      roleLabel="Supervisor"
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
        <DashboardSection projects={myProjects} tasks={myTasks} resources={myResources} requests={myRequests} />
      )}
      {section === 'projects' && <ProjectsSection projects={myProjects} tasks={myTasks} />}
      {section === 'tasks' && <TasksSection tasks={myTasks} />}
      {section === 'progress' && <ProgressUpdateSection tasks={myTasks} onSubmit={submitProgress} />}
      {section === 'photos' && <PhotosSection projects={myProjects} tasks={myTasks} photos={myPhotos} onUpload={uploadPhoto} />}
      {section === 'resources' && <ResourcesSection resources={myResources} />}
      {section === 'requests' && <RequestsSection projects={myProjects} tasks={myTasks} requests={myRequests} onRequest={requestResource} />}
      {section === 'reports' && <ReportsSection reports={reports.filter((r) => r.supervisor_id === user.user_id)} tasks={myTasks} />}
      {section === 'notifications' && <NotificationsSection notifications={notifications} />}
      {section === 'profile' && <ProfileSection user={user} />}
    </DashboardShell>
  );
}

// --- Sections -----------------------------------------------------------

function DashboardSection({ projects, tasks, resources, requests }) {
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'not_started' || t.status === 'on_hold').length;
  const current = tasks.find((t) => t.status === 'in_progress');
  const avgProgress = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Projects" value={projects.length} tone="green" />
        <StatCard label="Assigned Tasks" value={tasks.length} tone="blue" />
        <StatCard label="Completed Tasks" value={completed} tone="green" />
        <StatCard label="Pending Tasks" value={pending} tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Overall Progress</p>
          <DonutChart value={avgProgress} label="across your tasks" />
        </div>
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Current Task</p>
            {current ? (
              <div className="mt-2">
                <p className="text-sm font-medium text-ink-900 dark:text-paper-50">{current.task_name}</p>
                <p className="text-xs text-ink-500">{lookupProjectName(current.project_id)} · deadline {current.deadline}</p>
                <div className="mt-2"><ProgressBar value={current.progress} size="sm" /></div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-500">No task currently in progress.</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Available Resources</p>
            <p className="mt-1 font-mono text-sm">{resources.length} resource line items</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Pending Resource Requests</p>
            <p className="mt-1 font-mono text-sm">{pendingRequests}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ projects, tasks }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => {
        const myTasksOnProject = tasks.filter((t) => t.project_id === p.project_id);
        return (
          <div key={p.project_id} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-900 dark:text-paper-50">{p.project_name}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-1 text-sm text-ink-500">{p.location}</p>
            <p className="mt-3 text-xs text-ink-500">Your tasks on this project: {myTasksOnProject.map((t) => t.task_name).join(', ')}</p>
          </div>
        );
      })}
      {projects.length === 0 && <p className="text-sm text-ink-500">No projects assigned yet.</p>}
    </div>
  );
}

function TasksSection({ tasks }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Project</th>
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
              <td className="px-4 py-3 font-mono text-xs text-ink-500">{t.deadline}</td>
              <td className="px-4 py-3 w-32"><ProgressBar value={t.progress} size="sm" /></td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-500">No tasks assigned yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProgressUpdateSection({ tasks, onSubmit }) {
  const [taskId, setTaskId] = useState(tasks[0]?.task_id || '');
  const [percent, setPercent] = useState(tasks[0]?.progress || 0);
  const [workCompleted, setWorkCompleted] = useState('');
  const [workRemaining, setWorkRemaining] = useState('');
  const [issues, setIssues] = useState('');
  const [completionDescription, setCompletionDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photoFile, setPhotoFile] = useState('');
  const [error, setError] = useState('');

  const isComplete = Number(percent) >= 100;

  function submit(e) {
    e.preventDefault();
    if (!taskId) return;
    if (isComplete && (!completionDescription || !photoFile)) {
      setError('Marking a task complete requires a completion description and a site photograph.');
      return;
    }
    setError('');
    onSubmit({ taskId, percent: Number(percent), workCompleted, workRemaining, issues, completionDescription, remarks });
    setWorkCompleted('');
    setWorkRemaining('');
    setIssues('');
    setCompletionDescription('');
    setRemarks('');
    setPhotoFile('');
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-ink-500">You have no assigned tasks to update yet.</p>;
  }

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-5 p-6">
      <Field label="Task">
        <select
          className={inputCls}
          value={taskId}
          onChange={(e) => {
            setTaskId(e.target.value);
            setPercent(tasks.find((t) => t.task_id === e.target.value)?.progress || 0);
          }}
        >
          {tasks.map((t) => (
            <option key={t.task_id} value={t.task_id}>{t.task_name} — {lookupProjectName(t.project_id)}</option>
          ))}
        </select>
      </Field>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-ink-500">
          <span>Current Progress</span>
          <span className="font-mono text-site-green">{percent}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="w-full accent-site-green"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Work Completed">
          <textarea rows={2} className={inputCls} value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} />
        </Field>
        <Field label="Work Remaining">
          <textarea rows={2} className={inputCls} value={workRemaining} onChange={(e) => setWorkRemaining(e.target.value)} />
        </Field>
      </div>

      <Field label="Issues / Problems (optional)">
        <input className={inputCls} value={issues} onChange={(e) => setIssues(e.target.value)} />
      </Field>

      {isComplete && (
        <div className="space-y-4 rounded-sm border border-site-amber/40 bg-site-amber/5 p-4">
          <p className="text-xs uppercase tracking-wide text-site-amber">Completion report (required at 100%)</p>
          <Field label="Completion description">
            <textarea rows={2} className={inputCls} value={completionDescription} onChange={(e) => setCompletionDescription(e.target.value)} />
          </Field>
          <Field label="Construction photograph">
            <input type="file" className="w-full text-xs text-ink-500" onChange={(e) => setPhotoFile(e.target.files?.[0]?.name || '')} />
            {photoFile && <p className="mt-1 font-mono text-[11px] text-site-green">{photoFile}</p>}
          </Field>
          <Field label="Remarks (optional)">
            <input className={inputCls} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Field>
        </div>
      )}

      {error && <p className="text-sm text-site-red">{error}</p>}

      <button type="submit" className="rounded-sm bg-site-green px-6 py-2.5 text-sm font-medium text-white hover:bg-site-green/90">
        {isComplete ? 'Mark Task as Completed' : 'Submit Progress Update'}
      </button>
    </form>
  );
}

function PhotosSection({ projects, tasks, photos, onUpload }) {
  const [projectId, setProjectId] = useState(projects[0]?.project_id || '');
  const [taskId, setTaskId] = useState(tasks[0]?.task_id || '');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!fileName || !description) return;
    onUpload({ projectId, taskId, description });
    setDescription('');
    setFileName('');
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Project">
          <select className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
          </select>
        </Field>
        <Field label="Task">
          <select className={inputCls} value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            {tasks.map((t) => <option key={t.task_id} value={t.task_id}>{t.task_name}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <input required className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Column formwork, Block D" />
          </Field>
        </div>
        <Field label="Photo">
          <input type="file" className="w-full text-xs text-ink-500" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
        </Field>
        <button type="submit" className="self-end rounded-sm bg-site-green px-4 py-2.5 text-sm font-medium text-white">
          Upload Photo
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => (
          <div key={p.photo_id} className="card overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-paper-100 dark:bg-ink-800 text-ink-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h4l2-3h4l2 3h4v13H4ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              </svg>
            </div>
            <div className="p-3">
              <p className="text-sm text-ink-900 dark:text-paper-50">{p.description}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-500">{p.uploaded_date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesSection({ resources }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resources.map((r) => {
        const pct = r.allocated_quantity ? Math.round((r.used_quantity / r.allocated_quantity) * 100) : 0;
        return (
          <div key={r.resource_id} className="card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink-900 dark:text-paper-50">{r.resource_name}</span>
              <span className="text-xs text-ink-500">{lookupProjectName(r.project_id)}</span>
            </div>
            <div className="mt-2"><ProgressBar value={pct} tone={pct > 90 ? 'red' : pct > 70 ? 'amber' : 'green'} size="sm" /></div>
            <div className="mt-2 flex justify-between font-mono text-xs text-ink-500">
              <span>Used {r.used_quantity}</span>
              <span>Remaining {r.remaining_quantity}</span>
            </div>
          </div>
        );
      })}
      {resources.length === 0 && <p className="text-sm text-ink-500">No resources allocated to you yet.</p>}
    </div>
  );
}

function RequestsSection({ projects, tasks, requests, onRequest }) {
  const [projectId, setProjectId] = useState(projects[0]?.project_id || '');
  const [taskId, setTaskId] = useState(tasks[0]?.task_id || '');
  const [resource, setResource] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  const [requestedQty, setRequestedQty] = useState('');
  const [reason, setReason] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!resource || !requestedQty) return;
    onRequest({
      project_id: projectId,
      task_id: taskId,
      resource,
      current_quantity: Number(currentQty) || 0,
      requested_quantity: Number(requestedQty),
      reason
    });
    setResource('');
    setCurrentQty('');
    setRequestedQty('');
    setReason('');
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Project">
          <select className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
          </select>
        </Field>
        <Field label="Task">
          <select className={inputCls} value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            {tasks.map((t) => <option key={t.task_id} value={t.task_id}>{t.task_name}</option>)}
          </select>
        </Field>
        <Field label="Resource">
          <input required className={inputCls} value={resource} onChange={(e) => setResource(e.target.value)} placeholder="e.g. Cement (bags)" />
        </Field>
        <Field label="Current Quantity on Site">
          <input type="number" className={inputCls} value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} />
        </Field>
        <Field label="Requested Quantity">
          <input required type="number" className={inputCls} value={requestedQty} onChange={(e) => setRequestedQty(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Reason">
            <textarea rows={2} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
        <button type="submit" className="sm:col-span-2 rounded-sm bg-site-green px-4 py-2.5 text-sm font-medium text-white justify-self-start">
          Send Request
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.request_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0">
                <td className="px-4 py-3">{r.resource}</td>
                <td className="px-4 py-3 font-mono">{r.requested_quantity}</td>
                <td className="px-4 py-3 text-ink-500 max-w-xs">{r.reason}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{r.date}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-500">No resource requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsSection({ reports, tasks }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const task = tasks.find((t) => t.task_id === r.task_id);
            return (
              <tr key={r.report_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0">
                <td className="px-4 py-3">{task?.task_name || r.task_id}</td>
                <td className="px-4 py-3 font-mono">{r.progress}%</td>
                <td className="px-4 py-3 text-ink-500">{r.description}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{r.submitted_date}</td>
              </tr>
            );
          })}
          {reports.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-500">No reports submitted yet.</td></tr>
          )}
        </tbody>
      </table>
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
