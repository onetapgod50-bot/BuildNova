import Link from 'next/link';
import LandingHeader from '@/components/LandingHeader';
import ContactForm from '@/components/ContactForm';

const FEATURES = [
  {
    title: 'Project Planning',
    desc: 'Capture employer requirements, land details, budget and timelines before a single crew arrives on site.',
    icon: 'M4 19V6l8-3 8 3v13M9 22V12h6v10'
  },
  {
    title: 'Blueprint Management',
    desc: 'Upload structural drawings, add measurement notes, and keep every revision in one place engineers control.',
    icon: 'M4 4h16v16H4zM4 10h16M10 10v10'
  },
  {
    title: 'Task Allocation',
    desc: 'Break a project into work items — foundation, electrical, plumbing — and assign each to a supervisor.',
    icon: 'M5 6h14M5 12h9M5 18h6'
  },
  {
    title: 'Resource Management',
    desc: 'Track cement, steel, machinery and workers against what was allocated, used and still required.',
    icon: 'M3 7l9-4 9 4-9 4-9-4ZM3 7v10l9 4 9-4V7'
  },
  {
    title: 'Construction Progress Tracking',
    desc: 'Supervisors report completion percentage per task; managers see it roll up into overall project progress.',
    icon: 'M4 20V10M11 20V4M18 20v-7'
  },
  {
    title: 'Site Photo Updates',
    desc: 'A dated, task-linked photo gallery so managers can see the site without leaving the office.',
    icon: 'M4 7h4l2-3h4l2 3h4v13H4ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
  },
  {
    title: 'AI Assistant',
    desc: 'BuildNova AI answers project questions from your own data — progress, delays, resources — nothing else.',
    icon: 'M4 4h16v11H8l-4 4V4Z'
  },
  {
    title: 'Project Analytics',
    desc: 'Completion rates, resource consumption and deadline performance, broken down per project and supervisor.',
    icon: 'M4 19h16M7 19V9M12 19V5M17 19v-7'
  },
  {
    title: 'Deadline Monitoring',
    desc: 'Automatic flags when a task or project drifts behind its expected completion date.',
    icon: 'M12 8v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'
  },
  {
    title: 'Reports',
    desc: 'Completion reports, resource logs and progress history, ready to export for employers and audits.',
    icon: 'M6 3h9l3 3v15H6zM14 3v4h4M8 13h8M8 17h8'
  }
];

export default function LandingPage() {
  return (
    <div>
      <LandingHeader />

      {/* HERO */}
      <section id="home" className="relative overflow-hidden bg-evergreen-950 text-paper-50">
        <div className="absolute inset-0 bg-blueprint bg-grid opacity-40" />
        <div className="absolute -right-24 top-1/2 hidden -translate-y-1/2 md:block">
          <BlueprintIllustration />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-wide text-site-green">
              Infrastructure & construction management
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Build Smarter. Manage Better. BuildNova.
            </h1>
            <p className="mt-5 max-w-md text-paper-100/75">
              An intelligent infrastructure management platform connecting engineers, managers and supervisors
              through one centralized system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-sm bg-site-green px-6 py-3 text-sm font-medium text-white hover:bg-site-green/90 transition-colors"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="rounded-sm border border-paper-100/25 px-6 py-3 text-sm font-medium text-paper-50 hover:border-site-green transition-colors"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-site-green">About BuildNova</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink-900 dark:text-paper-50">
              One system, from the first survey to the final inspection
            </h2>
            <p className="mt-4 text-ink-700 dark:text-paper-100/80">
              BuildNova is an intelligent infrastructure management platform designed to coordinate construction
              planning, resource allocation, workforce management and site progress monitoring. Engineers plan,
              managers allocate and verify, supervisors execute and report — all through one shared record of
              the project, so nothing gets lost between a site visit and a status meeting.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {[
              ['3', 'connected roles'],
              ['10', 'workflow stages'],
              ['24/7', 'progress visibility'],
              ['1', 'source of truth']
            ].map(([value, label]) => (
              <div key={label} className="card p-5">
                <dt className="font-display text-3xl font-semibold text-site-green data-figure">{value}</dt>
                <dd className="mt-1 text-sm text-ink-500 dark:text-ink-300">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-paper-100 dark:bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-mono text-xs uppercase tracking-wide text-site-green">Features</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-ink-900 dark:text-paper-50">
            Everything a project needs between planning and handover
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="text-site-green"
                >
                  <path d={f.icon} />
                </svg>
                <h3 className="mt-3 font-display text-base font-semibold text-ink-900 dark:text-paper-50">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-site-green">Contact</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink-900 dark:text-paper-50">
              Talk to the BuildNova team
            </h2>
            <p className="mt-4 text-ink-500 dark:text-ink-300">
              Questions about rolling BuildNova out on your projects? Send a message and we&apos;ll get back to you.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-paper-200 dark:border-ink-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-ink-500 dark:text-ink-300 sm:flex-row">
          <p>© {new Date().getFullYear()} BuildNova. All rights reserved.</p>
          <p className="font-mono text-xs">Built for engineers, managers and supervisors.</p>
        </div>
      </footer>
    </div>
  );
}

function BlueprintIllustration() {
  return (
    <svg width="420" height="420" viewBox="0 0 420 420" fill="none" className="text-paper-100/25">
      <rect x="60" y="140" width="220" height="220" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="190" x2="280" y2="190" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="240" x2="280" y2="240" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="290" x2="280" y2="290" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="340" x2="280" y2="340" stroke="currentColor" strokeWidth="1" />
      <line x1="120" y1="140" x2="120" y2="360" stroke="currentColor" strokeWidth="1" />
      <line x1="180" y1="140" x2="180" y2="360" stroke="currentColor" strokeWidth="1" />
      <line x1="240" y1="140" x2="240" y2="360" stroke="currentColor" strokeWidth="1" />

      {/* crane */}
      <line x1="320" y1="360" x2="320" y2="80" stroke="#3FA65B" strokeWidth="2" />
      <line x1="320" y1="90" x2="200" y2="110" stroke="#3FA65B" strokeWidth="2" />
      <line x1="320" y1="90" x2="360" y2="105" stroke="#3FA65B" strokeWidth="2" />
      <line x1="240" y1="105" x2="240" y2="150" stroke="#3FA65B" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="320" cy="360" r="6" fill="#3FA65B" />

      {/* dimension line */}
      <line x1="60" y1="380" x2="280" y2="380" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="374" x2="60" y2="386" stroke="currentColor" strokeWidth="1" />
      <line x1="280" y1="374" x2="280" y2="386" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
