/**
 * AuthContext
 *
 * HOW IT WORKS:
 * React Context is a way to share state (like "who is logged in") across the
 * entire app without passing props through every component.
 *
 * Three things live here:
 *  1. The current `user` object  (null = not logged in)
 *  2. `login(employeeId, password)` — validates credentials with backend, sets user in state, saves JWT token
 *  3. `logout()`               — clears user state and token, redirects to login
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'lab_technician';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  department?: string;   // e.g. "Cardiology" for doctors
  avatar: string;        // single character shown in the UI
}

interface AuthContextType {
  user: AuthUser | null;
  login: (employeeId: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setLoggedInUser: (userData: AuthUser) => void;
}

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
      const stored = localStorage.getItem('mediflow_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  /**
   * login()
   *  - Authenticates via backend
   *  - Stores the JWT token securely
   */
  const login = async (employeeId: string, password: string) => {
    try {
      // NOTE: We don't use apiFetch here since apiFetch automatically appends token from localStorage
      // which we don't need for login. Using the standard fetch.
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employeeId.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Invalid credentials' };
      }

      // Save the generated JWT token to localStorage so apiFetch uses it
      localStorage.setItem("hospital_token", data.token);

      // Create the AuthUser
      const authUser: AuthUser = {
        name: data.user.name,
        email: data.user.employeeId, // we map standard frontend email -> employeeId
        role: data.user.role.toLowerCase() as UserRole,
        avatar: data.user.name.charAt(0)
      };

      setUser(authUser);
      localStorage.setItem('mediflow_user', JSON.stringify(authUser));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: 'Network error connecting to the server' };
    }
  };

  /**
   * logout()
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediflow_user');
    localStorage.removeItem('hospital_token');
  };

  const setLoggedInUser = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('mediflow_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setLoggedInUser }}>
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
