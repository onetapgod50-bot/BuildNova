'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-lg font-semibold text-site-green">Message received</p>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
          Thanks for reaching out — the BuildNova team will follow up by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Name</label>
          <input
            required
            className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Email</label>
          <input
            required
            type="email"
            className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Message</label>
        <textarea
          required
          rows={4}
          className="w-full rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
        />
      </div>
      <button
        type="submit"
        className="justify-self-start rounded-sm bg-site-green px-5 py-2.5 text-sm font-medium text-white hover:bg-site-green/90"
      >
        Send message
      </button>
    </form>
  );
}
