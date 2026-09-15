'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ROLES = [
  { key: 'engineer', label: 'Engineer', demoEmail: 'engineer@buildnova.demo' },
  { key: 'manager', label: 'Manager', demoEmail: 'manager@buildnova.demo' },
  { key: 'supervisor', label: 'Supervisor', demoEmail: 'supervisor.a@buildnova.demo' }
];

export default function LoginPage() {
  const [role, setRole] = useState('engineer');
  const [mode, setMode] = useState('login'); // 'login' | 'create'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const activeRole = ROLES.find((r) => r.key === role);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password || (mode === 'create' && !name)) {
      setError('Please fill in all required fields.');
      return;
    }
    // Demo auth: any password is accepted for a role once an email is provided.
    login(email, role);
    router.push(`/dashboard/${role}`);
  }

  function fillDemo() {
    setEmail(activeRole.demoEmail);
    setPassword('demo-password');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-50 dark:bg-ink-950 px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-site-green font-display font-bold text-ink-950">
            B
          </span>
          <span className="font-display text-lg font-semibold text-ink-900 dark:text-paper-50">BuildNova</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-50">
            {mode === 'login' ? 'Log in to BuildNova' : 'Create your BuildNova account'}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {mode === 'login'
              ? 'Select your role, then sign in to your dashboard.'
              : 'Set up an account for your role on the project.'}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                  role === r.key
                    ? 'border-site-green bg-site-green/10 text-site-green'
                    : 'border-paper-200 dark:border-ink-700 text-ink-700 dark:text-paper-100 hover:border-site-green'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'create' && (
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
                placeholder={activeRole.demoEmail}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-site-red">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-sm bg-site-green py-2.5 text-sm font-medium text-white hover:bg-site-green/90 transition-colors"
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={fillDemo}
              className="w-full rounded-sm border border-paper-200 dark:border-ink-700 py-2.5 text-sm text-ink-700 dark:text-paper-100 hover:border-site-green transition-colors"
            >
              Use demo {activeRole.label.toLowerCase()} account
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button onClick={() => setForgotOpen((o) => !o)} className="text-ink-500 hover:text-site-green">
              Forgot password?
            </button>
            <button
              onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
              className="text-site-green hover:underline"
            >
              {mode === 'login' ? 'Create account' : 'Have an account? Log in'}
            </button>
          </div>

          {forgotOpen && (
            <p className="mt-3 rounded-sm border border-paper-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-800 p-3 text-xs text-ink-500 dark:text-ink-300">
              Password resets are sent by your BuildNova administrator once email delivery is configured for this
              deployment. In this demo, use the &quot;demo account&quot; button above instead.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-500 dark:text-ink-300">
          Demo data only — no real credentials are required. This screen is a starting point for real
          authentication and role-based access control.
        </p>
      </div>
    </div>
  );
}
