'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const STARTER_PROMPTS = {
  engineer: ['Show my project planning status', 'What projects are under planning?'],
  manager: ['Which projects are delayed?', 'How much cement is remaining on Site A?'],
  supervisor: ['What are my pending tasks?', 'Show my resource requests']
};

export default function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm BuildNova AI. Ask me about project progress, tasks, supervisors, resources or deadlines you're authorized to see."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('open-ai-chat', onOpen);
    return () => window.removeEventListener('open-ai-chat', onOpen);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          user: user ? { user_id: user.user_id, role: user.role, name: user.name } : null
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || "I couldn't find that information in the BuildNova project database." }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'BuildNova AI is temporarily unavailable. Please try again shortly.' }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const starters = STARTER_PROMPTS[user?.role] || STARTER_PROMPTS.manager;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open BuildNova AI"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-evergreen-800 text-paper-50 shadow-lg hover:bg-evergreen-700 transition-colors"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v11H8l-4 4V4Z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-md border border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-paper-200 dark:border-ink-800 bg-evergreen-800 px-4 py-3 text-paper-50">
            <span className="h-2 w-2 rounded-full bg-site-green" />
            <p className="font-display text-sm font-semibold">BuildNova AI</p>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-paper-200/70">
              {user?.role || 'guest'}
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-evergreen-800 text-paper-50'
                    : 'bg-paper-100 dark:bg-ink-800 text-ink-900 dark:text-paper-100'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-md bg-paper-100 dark:bg-ink-800 px-3 py-2 text-sm text-ink-500">
                Checking the project database…
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-paper-200 dark:border-ink-700 px-2.5 py-1 text-[11px] text-ink-700 dark:text-paper-100 hover:border-site-green"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-paper-200 dark:border-ink-800 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a project, task or resource…"
              className="flex-1 rounded-sm border border-paper-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-site-green"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-sm bg-site-green px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
