import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Hospital, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useHospital } from '@/contexts/HospitalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Demo accounts — shown as quick-login chips so you can test roles easily
// ---------------------------------------------------------------------------
const DEMO_ACCOUNTS = [
  { label: 'Admin',        role: 'admin',          employeeId: 'ADM-001', password: 'admin123',  color: 'bg-violet-600 hover:bg-violet-700'  },
  { label: 'Doctor',       role: 'doctor',         employeeId: 'DOC-001', password: 'doc123',    color: 'bg-blue-600 hover:bg-blue-700'     },
  { label: 'Receptionist', role: 'receptionist',   employeeId: 'REC-001', password: 'rec123',    color: 'bg-teal-600 hover:bg-teal-700'     },
  { label: 'Lab Tech',     role: 'lab_technician', employeeId: 'LAB-001', password: 'lab123',    color: 'bg-amber-600 hover:bg-amber-700'   },
];

const ROLE_FEATURES: Record<UserRole, string[]> = {
  admin:          ['Full system access', 'All modules visible', 'User & role management'],
  doctor:         ['My patients & appointments', 'My lab reports', 'No billing access'],
  receptionist:   ['Patients & appointments', 'Admissions & billing', 'No doctor management'],
  lab_technician: ['Upload lab results', 'Update test status', 'View pending tests'],
};

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const { login } = useAuth();
  const { hospitalInfo } = useHospital();
  const [employeeId, setEmployeeId] = useState('ADM-001');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(employeeId.trim(), password);
      
      if (!result.ok) {
        setError(result.error || 'Login failed.');
      }
      // If result.ok is true, AuthContext sets the user and app redirects automatically
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
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
        className="flex flex-1 flex-col px-8 py-8 lg:py-12 relative z-10
                   bg-white/10 backdrop-blur-3xl border-l border-white/20 shadow-2xl overflow-y-auto"
      >
        {/* Mobile logo (hidden on large screens) */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow shadow-blue-600/30">
            <Hospital className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold text-white tracking-wide">{hospitalInfo.name}</p>
        </div>

        <div className="w-full max-w-sm m-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sign in</h2>
          <p className="text-sm text-slate-400">Enter your credentials to access the dashboard</p>

          {/* Quick login chips */}
          <div className="mt-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Quick demo login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`rounded-xl p-3 text-left transition-all border ${
                    acc.color
                  } ${
                    employeeId === acc.employeeId
                      ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white/50 border-transparent shadow-lg scale-[1.02]'
                      : 'border-white/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <p className="text-[11px] font-bold text-white/90 uppercase tracking-wide">{acc.label}</p>
                  <p className="text-[10px] text-white/60 mt-0.5 font-mono">{acc.employeeId}</p>
                  <p className="text-[10px] text-white/50 font-mono">{acc.password}</p>
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
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
                  onClick={() => setShowPw((p: boolean) => !p)}
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
            <div className="pt-4">
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
            </div>
          </form>

          {/* Role info */}
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {DEMO_ACCOUNTS.find(a => a.employeeId === employeeId)?.label ?? 'Selected'} access includes
            </p>
            <ul className="space-y-2">
              {(ROLE_FEATURES[
                (DEMO_ACCOUNTS.find(a => a.employeeId === employeeId)?.role as UserRole) ?? 'admin'
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
