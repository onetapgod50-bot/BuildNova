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
  blueprints as seedBlueprints,
  tasks,
  progressReports,
  getNotificationsForUser
} from '@/lib/data';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'projects', label: 'Projects', icon: 'projects' },
  { key: 'create', label: 'Create Project', icon: 'create' },
  { key: 'blueprint', label: 'Blueprint', icon: 'blueprint' },
  { key: 'planning', label: 'Planning', icon: 'reports' },
  { key: 'progress', label: 'Project Progress', icon: 'progress' },
  { key: 'reports', label: 'Reports', icon: 'reports' },
  { key: 'ai', label: 'BuildNova AI', icon: 'ai', action: 'ai' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'profile' }
];

const EMPTY_PROJECT = {
  project_name: '',
  employer: '',
  location: '',
  land_area: '',
  gps_location: '',
  project_type: '',
  description: '',
  required_infrastructure: '',
  start_date: '',
  expected_completion: '',
  budget: '',
  required_resources: '',
  required_workers: '',
  other_requirements: ''
};

export default function EngineerDashboardPage() {
  return (
    <RequireRole role="engineer">
      <EngineerDashboard />
    </RequireRole>
  );
}

function EngineerDashboard() {
  const { user } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [myProjects, setMyProjects] = useState(() => seedProjects.filter((p) => p.created_by === user.user_id));
  const [myBlueprints, setMyBlueprints] = useState(seedBlueprints);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [files, setFiles] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState(myProjects[0]?.project_id);
  const [blueprintDraft, setBlueprintDraft] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const notifications = getNotificationsForUser(user);
  const myTasks = useMemo(
    () => tasks.filter((t) => myProjects.some((p) => p.project_id === t.project_id)),
    [myProjects]
  );

  const titles = {
    dashboard: 'Engineer Dashboard',
    projects: 'Projects',
    create: 'Create Project',
    blueprint: 'Blueprint Planning',
    planning: 'Project Status',
    progress: 'Project Progress',
    reports: 'Reports',
    notifications: 'Notifications',
    profile: 'Profile'
  };

  function handleCreate(e) {
    e.preventDefault();
    const newProject = {
      project_id: `p-${Date.now()}`,
      status: 'planning',
      overall_progress: 0,
      created_by: user.user_id,
      ...form,
      budget: Number(form.budget) || 0,
      files: files
    };
    setMyProjects((prev) => [newProject, ...prev]);
    setForm(EMPTY_PROJECT);
    setFiles({});
    setSelectedProjectId(newProject.project_id);
    setSection('projects');
  }

  const selectedProject = myProjects.find((p) => p.project_id === selectedProjectId);
  const selectedBlueprint = myBlueprints.find((b) => b.project_id === selectedProjectId);

  function handleBlueprintSave() {
    if (!selectedProjectId) return;
    setMyBlueprints((prev) => {
      const exists = prev.some((b) => b.project_id === selectedProjectId);
      if (exists) {
        return prev.map((b) =>
          b.project_id === selectedProjectId
            ? { ...b, notes: blueprintDraft || b.notes, upload_date: new Date().toISOString().slice(0, 10) }
            : b
        );
      }
      return [
        ...prev,
        {
          blueprint_id: `b-${Date.now()}`,
          project_id: selectedProjectId,
          file_name: files.blueprint || 'untitled-blueprint.pdf',
          uploaded_by: user.user_id,
          upload_date: new Date().toISOString().slice(0, 10),
          notes: blueprintDraft
        }
      ];
    });
    setSaveMsg('Planning information saved and shared with the Manager.');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  return (
    <DashboardShell
      roleLabel="Engineer"
      title={titles[section]}
      items={NAV_ITEMS}
      active={section}
      onSelect={setSection}
      notifications={notifications}
    >
      {section === 'dashboard' && (
        <DashboardSection projects={myProjects} tasks={myTasks} />
      )}

      {section === 'projects' && (
        <ProjectsSection
          projects={myProjects}
          onSelect={(id) => {
            setSelectedProjectId(id);
            setSection('blueprint');
          }}
        />
      )}

      {section === 'create' && (
        <CreateProjectSection form={form} setForm={setForm} files={files} setFiles={setFiles} onSubmit={handleCreate} />
      )}

      {section === 'blueprint' && (
        <BlueprintSection
          projects={myProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          blueprint={selectedBlueprint}
          blueprintDraft={blueprintDraft}
          setBlueprintDraft={setBlueprintDraft}
          files={files}
          setFiles={setFiles}
          onSave={handleBlueprintSave}
          saveMsg={saveMsg}
        />
      )}

      {section === 'planning' && <PlanningStatusSection projects={myProjects} tasks={myTasks} blueprints={myBlueprints} />}

      {section === 'progress' && <ProgressSection projects={myProjects} tasks={myTasks} />}

      {section === 'reports' && <ReportsSection projects={myProjects} tasks={myTasks} />}

      {section === 'notifications' && <NotificationsSection notifications={notifications} />}

      {section === 'profile' && <ProfileSection user={user} />}
    </DashboardShell>
  );
}

// --- Sections -----------------------------------------------------------

function DashboardSection({ projects, tasks }) {
  const total = projects.length;
  const active = projects.filter((p) => p.status === 'in_progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const planning = projects.filter((p) => p.status === 'planning').length;
  const avgProgress = total ? Math.round(projects.reduce((s, p) => s + p.overall_progress, 0) / total) : 0;
  const upcoming = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={total} tone="green" />
        <StatCard label="Active Projects" value={active} tone="blue" />
        <StatCard label="Completed Projects" value={completed} tone="green" />
        <StatCard label="Under Planning" value={planning} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 flex flex-col items-center justify-center lg:col-span-1">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Overall Project Progress</p>
          <DonutChart value={avgProgress} label="across all your projects" />
        </div>

        <div className="card p-5 lg:col-span-2">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Recent Projects</p>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <div key={p.project_id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900 dark:text-paper-50">{p.project_name}</p>
                  <ProgressBar value={p.overall_progress} size="sm" />
                </div>
                <span className="w-10 text-right font-mono text-xs data-figure">{p.overall_progress}%</span>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-ink-500">No projects yet — create your first one.</p>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Upcoming Deadlines</p>
        <div className="divide-y divide-paper-100 dark:divide-ink-800">
          {upcoming.map((t) => (
            <div key={t.task_id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-ink-900 dark:text-paper-50">{t.task_name}</span>
              <span className="font-mono text-xs text-ink-500">{t.deadline}</span>
              <StatusBadge status={t.status} />
            </div>
          ))}
          {upcoming.length === 0 && <p className="py-2 text-sm text-ink-500">No pending deadlines.</p>}
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ projects, onSelect }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Employer</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.project_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0">
              <td className="px-4 py-3 font-medium text-ink-900 dark:text-paper-50">{p.project_name}</td>
              <td className="px-4 py-3 text-ink-500">{p.employer}</td>
              <td className="px-4 py-3 text-ink-500">{p.location}</td>
              <td className="px-4 py-3 w-40">
                <ProgressBar value={p.overall_progress} size="sm" />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3">
                <button onClick={() => onSelect(p.project_id)} className="text-site-green hover:underline text-xs">
                  Open blueprint →
                </button>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                No projects yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

function CreateProjectSection({ form, setForm, files, setFiles, onSubmit }) {
  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }
  function setFile(key) {
    return (e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0]?.name || '' }));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project Name">
          <input required value={form.project_name} onChange={set('project_name')} className={inputCls} />
        </Field>
        <Field label="Employer / Client Name">
          <input required value={form.employer} onChange={set('employer')} className={inputCls} />
        </Field>
        <Field label="Project Location">
          <input required value={form.location} onChange={set('location')} className={inputCls} />
        </Field>
        <Field label="Land Area">
          <input value={form.land_area} onChange={set('land_area')} placeholder="e.g. 3.5 acres" className={inputCls} />
        </Field>
        <Field label="GPS Location">
          <input value={form.gps_location} onChange={set('gps_location')} placeholder="lat, long" className={inputCls} />
        </Field>
        <Field label="Project Type">
          <input value={form.project_type} onChange={set('project_type')} placeholder="e.g. Residential, Bridge" className={inputCls} />
        </Field>
      </div>

      <Field label="Project Description">
        <textarea rows={3} value={form.description} onChange={set('description')} className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Required Infrastructure">
          <input value={form.required_infrastructure} onChange={set('required_infrastructure')} className={inputCls} />
        </Field>
        <Field label="Other Requirements">
          <input value={form.other_requirements} onChange={set('other_requirements')} className={inputCls} />
        </Field>
        <Field label="Expected Start Date">
          <input type="date" value={form.start_date} onChange={set('start_date')} className={inputCls} />
        </Field>
        <Field label="Expected Completion Date">
          <input type="date" value={form.expected_completion} onChange={set('expected_completion')} className={inputCls} />
        </Field>
        <Field label="Estimated Budget (USD)">
          <input type="number" value={form.budget} onChange={set('budget')} className={inputCls} />
        </Field>
        <Field label="Number of Workers">
          <input type="number" value={form.required_workers} onChange={set('required_workers')} className={inputCls} />
        </Field>
      </div>

      <Field label="Required Resources">
        <input value={form.required_resources} onChange={set('required_resources')} placeholder="e.g. cement, steel, machinery" className={inputCls} />
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-ink-500">Upload files</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['blueprint', 'Blueprint'],
            ['site_plan', 'Site Plan'],
            ['land_documents', 'Land Documents'],
            ['project_images', 'Project Images']
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input type="file" onChange={setFile(key)} className="w-full text-xs text-ink-500" />
              {files[key] && <p className="mt-1 font-mono text-[11px] text-site-green">{files[key]}</p>}
            </Field>
          ))}
        </div>
      </div>

      <button type="submit" className="rounded-sm bg-site-green px-6 py-2.5 text-sm font-medium text-white hover:bg-site-green/90">
        Submit Project Plan
      </button>
    </form>
  );
}

function BlueprintSection({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  blueprint,
  blueprintDraft,
  setBlueprintDraft,
  files,
  setFiles,
  onSave,
  saveMsg
}) {
  return (
    <div className="card space-y-5 p-6">
      <Field label="Project">
        <select
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className={inputCls}
        >
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Blueprint file">
          <input
            type="file"
            onChange={(e) => setFiles((f) => ({ ...f, blueprint: e.target.files?.[0]?.name || '' }))}
            className="w-full text-xs text-ink-500"
          />
          <p className="mt-1 font-mono text-[11px] text-ink-500">
            Current: {files.blueprint || blueprint?.file_name || 'no file uploaded yet'}
          </p>
        </Field>
        <Field label="Last updated">
          <p className="pt-2 font-mono text-sm text-ink-500">{blueprint?.upload_date || '—'}</p>
        </Field>
      </div>

      <Field label="Notes & important measurements">
        <textarea
          rows={5}
          value={blueprintDraft || blueprint?.notes || ''}
          onChange={(e) => setBlueprintDraft(e.target.value)}
          placeholder="e.g. Column spacing 6.2m on the east wing, footing depth 1.8m…"
          className={inputCls}
        />
      </Field>

      <div className="flex items-center gap-3">
        <button onClick={onSave} className="rounded-sm bg-site-green px-6 py-2.5 text-sm font-medium text-white hover:bg-site-green/90">
          Save Final Planning Information
        </button>
        {saveMsg && <p className="text-sm text-site-green">{saveMsg}</p>}
      </div>
      <p className="text-xs text-ink-500">Saved planning information becomes visible to the Manager immediately.</p>
    </div>
  );
}

function currentStage(projectTasks) {
  const next = projectTasks.find((t) => t.status !== 'completed');
  return next ? next.task_name : 'Completed';
}

function PlanningStatusSection({ projects, tasks, blueprints }) {
  return (
    <div className="space-y-4">
      {projects.map((p) => {
        const projectTasks = tasks.filter((t) => t.project_id === p.project_id);
        const delays = projectTasks.filter((t) => t.status === 'delayed');
        const hasBlueprint = blueprints.some((b) => b.project_id === p.project_id);
        return (
          <div key={p.project_id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-ink-900 dark:text-paper-50">{p.project_name}</h3>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">Planning status</p>
                <p className="mt-1">{hasBlueprint ? 'Submitted' : 'In progress'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">Manager assignment</p>
                <p className="mt-1">{projectTasks.length > 0 ? 'Assigned' : 'Awaiting assignment'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">Construction status</p>
                <p className="mt-1 capitalize">{p.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">Current stage</p>
                <p className="mt-1">{currentStage(projectTasks)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
                <span>Overall completion</span>
                <span className="font-mono">{p.overall_progress}%</span>
              </div>
              <ProgressBar value={p.overall_progress} />
            </div>
            {delays.length > 0 && (
              <p className="mt-3 text-xs text-site-red">
                Delayed: {delays.map((d) => d.task_name).join(', ')}
              </p>
            )}
          </div>
        );
      })}
      {projects.length === 0 && <p className="text-sm text-ink-500">No projects to show yet.</p>}
    </div>
  );
}

function ProgressSection({ projects, tasks }) {
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.project_id} className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink-900 dark:text-paper-50">{p.project_name}</h3>
            <span className="font-mono text-sm text-site-green">{p.overall_progress}%</span>
          </div>
          <div className="mt-3 space-y-3">
            {tasks
              .filter((t) => t.project_id === p.project_id)
              .map((t) => (
                <div key={t.task_id} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-ink-900 dark:text-paper-50">{t.task_name}</span>
                  <ProgressBar value={t.progress} size="sm" />
                  <span className="w-10 text-right font-mono text-xs">{t.progress}%</span>
                  <StatusBadge status={t.status} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsSection({ projects, tasks }) {
  const relevantReports = progressReports.filter((r) => projects.some((p) => p.project_id === r.project_id));
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-paper-200 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {relevantReports.map((r) => {
            const project = projects.find((p) => p.project_id === r.project_id);
            const task = tasks.find((t) => t.task_id === r.task_id);
            return (
              <tr key={r.report_id} className="border-b border-paper-100 dark:border-ink-800 last:border-0">
                <td className="px-4 py-3">{project?.project_name}</td>
                <td className="px-4 py-3">{task?.task_name}</td>
                <td className="px-4 py-3 font-mono">{r.progress}%</td>
                <td className="px-4 py-3 text-ink-500">{r.description}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{r.submitted_date}</td>
              </tr>
            );
          })}
          {relevantReports.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-ink-500">
                No reports yet.
              </td>
            </tr>
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
        <p>
          <span className="text-ink-500">Email: </span>
          {user.email}
        </p>
        <p>
          <span className="text-ink-500">User ID: </span>
          <span className="font-mono">{user.user_id}</span>
        </p>
      </div>
    </div>
  );
}
