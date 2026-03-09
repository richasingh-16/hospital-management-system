/**
 * AuthContext
 *
 * HOW IT WORKS:
 * React Context is a way to share state (like "who is logged in") across the
 * entire app without passing props through every component.
 *
 * Three things live here:
 *  1. The current `user` object  (null = not logged in)
 *  2. `login(email, password)` — validates credentials, sets user in state
 *  3. `logout()`               — clears user state, redirects to login
 *
 * We also persist the user in localStorage so a page refresh doesn't log
 * you out (same thing every real app does with JWT tokens or sessions).
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  department?: string;   // e.g. "Cardiology" for doctors
  avatar: string;        // single character shown in the UI
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Mock credential store — replace this with real API calls later
//
// Pattern:  email + password  → AuthUser
// When you add a backend:
//   POST /api/auth/login  { email, password }
//   Returns: { token, user }
//   Store the JWT in localStorage instead of the user object.
// ---------------------------------------------------------------------------
const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    email: 'admin@mediflow.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    avatar: 'A',
  },
  {
    email: 'doctor@mediflow.com',
    password: 'doctor123',
    name: 'Dr. Ananya Bose',
    role: 'doctor',
    department: 'General Medicine',
    avatar: 'D',
  },
  {
    email: 'reception@mediflow.com',
    password: 'welcome123',
    name: 'Riya Kapoor',
    role: 'receptionist',
    avatar: 'R',
  },
];

const STORAGE_KEY = 'mediflow_user';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider — wrap your whole app with this
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to restore user from a previous session (localStorage)
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  /**
   * login()
   *  - Checks email+password against MOCK_USERS
   *  - If valid → stores user in state AND localStorage
   *  - Returns { ok: true } on success, { ok: false, error: '...' } on fail
   */
  const login = (email: string, password: string) => {
    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!match) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    // Strip the password before storing
    const { password: _pw, ...authUser } = match;
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return { ok: true };
  };

  /**
   * logout()
   *  - Clears user from state and localStorage
   *  - The app automatically re-renders and shows <LoginPage />
   *    because App.tsx checks `if (!user) return <LoginPage />`
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook — use this in any component
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
