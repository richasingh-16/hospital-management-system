import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, CalendarDays, BedDouble, Stethoscope,
  TrendingUp, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import DoctorDashboard from '@/components/DoctorDashboard';
import ReceptionistDashboard from '@/components/ReceptionistDashboard';
import { LiveClock } from '@/components/LiveClock';
import { APPOINTMENTS_DATA, PATIENTS, LAB_REPORTS_DATA } from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Admin-only static data
// (KPIs, charts — these would come from aggregate API calls in a real app)
// ---------------------------------------------------------------------------
const kpis = [
  {
    label: 'Patients Today',     value: 124,        context: '↑ 12 from yesterday',
    icon: <Users className="h-5 w-5" />,          color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',
  },
  {
    label: 'Appointments Today', value: APPOINTMENTS_DATA.length, context: `${APPOINTMENTS_DATA.filter(a => a.status === 'Scheduled').length} remaining`,
    icon: <CalendarDays className="h-5 w-5" />,   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
  },
  {
    label: 'Beds Available',     value: '18 / 160', context: '11% of capacity free',
    icon: <BedDouble className="h-5 w-5" />,      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
  },
  {
    label: 'Doctors On Duty',    value: 12,         context: 'Across 7 departments',
    icon: <Stethoscope className="h-5 w-5" />,    color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100',
  },
];

const weeklyData  = [
  { day: 'Mon', admissions: 32 }, { day: 'Tue', admissions: 27 },
  { day: 'Wed', admissions: 41 }, { day: 'Thu', admissions: 35 },
  { day: 'Fri', admissions: 48 }, { day: 'Sat', admissions: 22 },
  { day: 'Sun', admissions: 15 },
];
const monthlyData = [
  { day: 'W1', admissions: 182 }, { day: 'W2', admissions: 214 },
  { day: 'W3', admissions: 197 }, { day: 'W4', admissions: 220 },
];

// Ward-level bed data — in a real app this comes from the beds API
const bedCapacity = [
  { name: 'ICU',         occupied: 14, total: 20 },
  { name: 'General',     occupied: 52, total: 80 },
  { name: 'Emergency',   occupied: 10, total: 15 },
  { name: 'Maternity',   occupied: 16, total: 25 },
  { name: 'Pediatrics',  occupied: 9,  total: 20 },
  { name: 'Orthopedics', occupied: 11, total: 18 },
];

function getCapacityColor(pct: number) {
  if (pct >= 90) return { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700'       };
  if (pct >= 65) return { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' };
  return              { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700'   };
}

/**
 * Auto-generate critical alerts from real data conditions.
 *
 * Source rules (in priority order):
 *  1. Any ward at ≥ 90% capacity  → HIGH
 *  2. Patients admitted to ICU    → HIGH
 *  3. Lab reports stuck Pending/Processing → MEDIUM
 *
 * In a real app: a backend job posts to an /alerts endpoint when these
 * thresholds are crossed; the admin frontend reads from that endpoint.
 * No manual "add alert" button needed — alerts are system-generated.
 */
function generateAlerts() {
  const alerts: { text: string; level: 'high' | 'medium' }[] = [];

  // Rule 1 — over-capacity wards
  bedCapacity.forEach((ward) => {
    const pct = Math.round((ward.occupied / ward.total) * 100);
    if (pct >= 90) {
      alerts.push({ text: `${ward.name} ward at ${pct}% capacity (${ward.occupied}/${ward.total} beds)`, level: 'high' });
    }
  });

  // Rule 2 — ICU patients (critical by definition)
  PATIENTS.filter((p) => p.ward === 'ICU' && p.status === 'Admitted').forEach((p) => {
    alerts.push({ text: `${p.name} — admitted to ICU · ${p.condition}`, level: 'high' });
  });

  // Rule 3 — lab reports delayed (not yet Ready)
  LAB_REPORTS_DATA.filter((l) => l.status === 'Pending' || l.status === 'Processing').forEach((l) => {
    alerts.push({ text: `${l.id} — ${l.testType} for ${l.patientName} · ${l.status}`, level: 'medium' });
  });

  return alerts.slice(0, 6); // cap at 6 to avoid overflow
}



const recentActivity = [
  { text: 'Arjun Patel admitted to ICU',             time: '2 min ago',  color: 'bg-green-500'  },
  { text: 'Appointment #APT-004 marked complete',    time: '8 min ago',  color: 'bg-blue-500'   },
  { text: 'Lab report LAB-003 ready for review',     time: '15 min ago', color: 'bg-orange-400' },
  { text: 'Vikram Desai discharged from Ortho',      time: '31 min ago', color: 'bg-slate-400'  },
  { text: 'Invoice INV-007 generated — Aditya Kumar',time: '45 min ago', color: 'bg-purple-500' },
];


// ---------------------------------------------------------------------------
// Admin dashboard (the original full view)
// ---------------------------------------------------------------------------
function AdminDashboard() {
  const { user } = useAuth();
  const [chartRange, setChartRange] = useState<'7' | '30'>('7');
  const chartData = chartRange === '7' ? weeklyData : monthlyData;

  // Derive critical alerts from real data conditions
  const criticalAlerts = generateAlerts();

  // Today's schedule from real appointments (fallback to all if no today match)
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = APPOINTMENTS_DATA.filter((a) => a.date === today);
  const todaysSchedule = todayAppts.length > 0 ? todayAppts : APPOINTMENTS_DATA;
  
  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  return (
    <div className="space-y-5">
      {/* Welcome strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Good {greeting}, {user?.name ?? 'Admin'} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening at the hospital today.</p>
        </div>
        <LiveClock />
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <Card className={`shadow-sm hover:shadow-md transition-shadow border ${kpi.border}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
                    <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
                    <p className="text-xs text-slate-400">{kpi.context}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${kpi.bg}`}>
                    <span className={kpi.color}>{kpi.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-5">
        <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28 }}>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Admissions Overview
                </CardTitle>
                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  {(['7', '30'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${chartRange === r ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {r === '7' ? 'Last 7 days' : 'Last 30 days'}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={chartRange === '7' ? 28 : 48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="admissions" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.34 }}>
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BedDouble className="h-4 w-4 text-blue-500" /> Bed Capacity Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {bedCapacity.map((ward) => {
                const pct  = Math.round((ward.occupied / ward.total) * 100);
                const cols = getCapacityColor(pct);
                return (
                  <div key={ward.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{ward.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{ward.occupied}/{ward.total}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cols.badge}`}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all ${cols.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.4 }}>
          <Card className="shadow-sm border-red-100 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <AlertTriangle className="h-4 w-4" /> Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {criticalAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No critical alerts</p>
                  <p className="text-xs text-slate-400 mt-1">Hospital operations normal</p>
                </div>
              ) : (
                criticalAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${alert.level === 'high' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                    <p className="text-xs leading-snug text-slate-700">{alert.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.48 }}>
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4 text-blue-500" /> Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {todaysSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <CalendarDays className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No appointments</p>
                  <p className="text-xs text-slate-400 mt-1">Your schedule is clear today</p>
                </div>
              ) : (
                todaysSchedule.map((appt) => {
                  const done = appt.status === 'Completed';
                  return (
                    <div key={appt.id} className={`flex items-start gap-2.5 rounded-lg p-2 transition-colors ${done ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                      <span className={`mt-0.5 text-[10px] font-bold tabular-nums ${done ? 'text-slate-400' : 'text-blue-600'}`}>{appt.time}</span>
                      <div className="min-w-0">
                        <Link to={`/patients/${appt.patientId}`} className={`text-xs font-medium leading-tight ${done ? 'line-through text-slate-400' : 'text-slate-800 hover:text-blue-600'}`}>
                          {appt.patientName}
                        </Link>
                        <p className="text-[10px] text-slate-400 truncate">{appt.doctor} · {appt.type}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold flex-shrink-0 ${
                        done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{appt.status}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.52 }}>
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <TrendingUp className="h-4 w-4 text-blue-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-xs leading-snug text-slate-700">{item.text}</p>
                    <p className="text-[10px] text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard — role router
// Doctors and receptionists get their own tailored views.
// Admins keep the full hospital analytics dashboard.
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'doctor')       return <DoctorDashboard />;
  if (user?.role === 'receptionist') return <ReceptionistDashboard />;
  return <AdminDashboard />;
}
