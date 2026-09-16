'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#features', label: 'Features' },
  { href: '#contact', label: 'Contact' }
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-100/10 bg-evergreen-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-4">
        <a href="#home" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-site-green font-display font-bold text-ink-950">
            B
          </span>
          <span className="font-display text-lg font-semibold text-paper-50">BuildNova</span>
        </a>

        <nav className="ml-6 hidden gap-6 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-paper-100/80 hover:text-paper-50 transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-paper-100/80 hover:text-paper-50">
            Login
          </Link>
          <Link
            href="/login"
            className="rounded-sm bg-site-green px-4 py-2 text-sm font-medium text-white hover:bg-site-green/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-sm border border-paper-100/20 text-paper-50 md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-paper-100/10 bg-evergreen-950 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm text-paper-100/80">
                {n.label}
              </a>
            ))}
            <Link href="/login" className="text-sm text-paper-100/80">
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-sm bg-site-green px-4 py-2 text-center text-sm font-medium text-white"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
