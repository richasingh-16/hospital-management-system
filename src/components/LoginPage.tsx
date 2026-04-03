import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Hospital, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useHospital } from '@/contexts/HospitalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// NOTE: using relative/absolute import based on standard resolution
import { apiFetch } from '@/services/api';

// ---------------------------------------------------------------------------
// Demo accounts — shown as quick-login chips so you can test roles easily
// ---------------------------------------------------------------------------
const DEMO_ACCOUNTS = [
  { label: 'Admin',        employeeId: 'ADM001',     password: 'admin123',   color: 'bg-blue-600 hover:bg-blue-700'    },
  { label: 'Doctor',       employeeId: 'DOC001',    password: 'doctor123',  color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Receptionist', employeeId: 'REC001', password: 'welcome123', color: 'bg-teal-600 hover:bg-teal-700'    },
];

const ROLE_FEATURES: Record<UserRole, string[]> = {
  admin:        ['Full system access', 'All modules visible', 'User & role management'],
  doctor:       ['Patient records', 'Appointments & lab reports', 'No billing access'],
  receptionist: ['Patients & appointments', 'Admissions & billing', 'No doctor management'],
};

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const { login, setLoggedInUser } = useAuth();
  const { hospitalInfo } = useHospital();
  const [employeeId, setEmployeeId] = useState('ADM001');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ employeeId: employeeId.trim(), password }),
      });

      // Save token and role
      localStorage.setItem("hospital_token", data.token);

      // Instruct application that we successfully logged in using API user data
      setLoggedInUser({
        name: data.user.name,
        email: data.user.employeeId,
        role: data.user.role.toLowerCase() as UserRole,
        avatar: data.user.name.charAt(0)
      });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
    setLoading(false);
  };

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmployeeId(acc.employeeId);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 relative">
      {/* ── Left panel: branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:flex lg:w-[55%] flex-col justify-center p-16 relative z-10"
      >
        <div className="max-w-3xl">
          <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tight uppercase">
            {hospitalInfo.name.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h1>
          <p className="mt-8 text-xl font-medium text-blue-200/80 tracking-wide max-w-lg leading-relaxed">
            World-class facilities, excellent doctors, and an integrated platform to manage it all.
          </p>
        </div>
      </motion.div>

      {/* ── Right panel: glass login form ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col items-center justify-center px-8 py-12 relative z-10
                   bg-white/10 backdrop-blur-3xl border-l border-white/20 shadow-2xl"
      >
        {/* Mobile logo (hidden on large screens) */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow shadow-blue-600/30">
            <Hospital className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold text-white tracking-wide">{hospitalInfo.name}</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sign in</h2>
          <p className="text-sm text-slate-400">Enter your credentials to access the dashboard</p>

          {/* Quick login chips */}
          <div className="mt-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Quick demo login
            </p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all border ${
                    acc.color
                  } ${employeeId === acc.employeeId ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500 border-transparent shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">or enter manually</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Employee ID</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={employeeId}
                  onChange={(e) => { setEmployeeId(e.target.value); setError(''); }}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 hover:bg-white/10 transition-colors h-11"
                  placeholder="ADM001"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 hover:bg-white/10 transition-colors h-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowPw((p) => !p)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-medium"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 shadow-lg shadow-blue-900/20 border border-blue-500/50"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Role info */}
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {employeeId.includes('DOC') ? 'Doctor' : employeeId.includes('REC') ? 'Receptionist' : 'Admin'} access includes
            </p>
            <ul className="space-y-2">
              {(ROLE_FEATURES[
                employeeId.includes('DOC') ? 'doctor' : employeeId.includes('REC') ? 'receptionist' : 'admin'
              ]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
