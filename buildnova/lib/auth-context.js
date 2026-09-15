'use client';

// lib/auth-context.js
//
// DEMO AUTH ONLY. There is no password hashing, no server-side session,
// and no token verification here — it exists so the three dashboards are
// fully navigable and role-gated in the UI while a real database/auth
// provider is wired up. Before production use, replace this with real
// authentication (e.g. hashed passwords + JWT/session cookies validated
// in middleware.js and in every app/api/** route).

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { findUserByEmailAndRole } from './data';

const AuthContext = createContext(null);
const STORAGE_KEY = 'buildnova_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
    setReady(true);
  }, []);

  const login = useCallback((email, role) => {
    const found = findUserByEmailAndRole(email, role);
    const sessionUser = found || {
      user_id: `guest-${role}`,
      name: email.split('@')[0] || 'Guest',
      email,
      role
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
