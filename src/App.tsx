import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth, type UserRole } from '@/contexts/AuthContext';
import { HospitalProvider } from '@/contexts/HospitalContext';

import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import Dashboard from '@/components/Dashboard';
import Patients from '@/components/Patients';
import PatientProfile from '@/components/PatientProfile';
import Doctors from '@/components/Doctors';
import AppointmentSystem from '@/components/Appointment';
import WardManagement from '@/components/WardManagement';
import Billing from '@/components/Billing';
import LabReports from '@/components/Report';
import ActivityLog from '@/components/ActivityLog';
import Settings from '@/components/Settings';

// Fade-in wrapper applied to every page on route change
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RoleGuard — Only renders children if the current user has one of the
 * allowed roles. Otherwise shows an Access Denied screen.
 *
 * Usage:
 *   <RoleGuard allowed={['admin']}>
 *     <Settings />
 *   </RoleGuard>
 *
 * When you add a real backend, replace this with a JWT-claims check.
 */
function RoleGuard({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400 py-24">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
        <p className="text-sm">
          You need <span className="font-semibold text-slate-600">{allowed.join(' or ')} </span>
          access to view this page.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }
  return <>{children}</>;
}

/**
 * AppShell — The protected layout.
 *
 * HOW PROTECTED ROUTING WORKS HERE:
 *  - useAuth() reads the current user from AuthContext.
 *  - If user === null  →  show <LoginPage /> (no sidebar, no routes).
 *  - If user !== null  →  show the full HMS layout with all routes.
 *
 * This is the simplest pattern for a frontend-only app.
 * With a backend you'd also verify the JWT token here before rendering.
 */
function AppShell() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/"               element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/patients"       element={<PageWrapper><Patients /></PageWrapper>} />
                <Route path="/patients/:id"   element={<PageWrapper><PatientProfile /></PageWrapper>} />

                {/* Admin only */}
                <Route path="/doctors" element={
                  <PageWrapper>
                    <RoleGuard allowed={['admin']}>
                      <Doctors />
                    </RoleGuard>
                  </PageWrapper>
                } />

                <Route path="/appointments"   element={<PageWrapper><AppointmentSystem /></PageWrapper>} />

                {/* Admin + Receptionist */}
                <Route path="/ward" element={
                  <PageWrapper>
                    <RoleGuard allowed={['admin', 'receptionist']}>
                      <WardManagement />
                    </RoleGuard>
                  </PageWrapper>
                } />
                {/* Backwards-compatible redirects from old separate URLs */}
                <Route path="/admissions" element={<Navigate to="/ward" replace />} />
                <Route path="/beds"       element={<Navigate to="/ward" replace />} />
                <Route path="/billing" element={
                  <PageWrapper>
                    <RoleGuard allowed={['admin', 'receptionist']}>
                      <Billing />
                    </RoleGuard>
                  </PageWrapper>
                } />

                {/* Admin + Doctor */}
                <Route path="/reports" element={
                  <PageWrapper>
                    <RoleGuard allowed={['admin', 'doctor']}>
                      <LabReports />
                    </RoleGuard>
                  </PageWrapper>
                } />

                <Route path="/activity"       element={<PageWrapper><ActivityLog /></PageWrapper>} />

                {/* Admin only */}
                <Route path="/settings"       element={
                  <PageWrapper>
                    <RoleGuard allowed={['admin']}>
                      <Settings />
                    </RoleGuard>
                  </PageWrapper>
                } />
                <Route path="*"              element={<PageWrapper><Dashboard /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {/*
       * AuthProvider must wrap Router so that components like TopHeader
       * and Sidebar can call useAuth() AND use navigation hooks.
       */}
      <AuthProvider>
        <HospitalProvider>
          <Router>
            <AppShell />
            <Toaster richColors position="top-right" />
          </Router>
        </HospitalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

