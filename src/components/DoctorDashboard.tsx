/**
 * DoctorDashboard
 *
 * All KPIs and widgets are derived from real mockData filtered by
 * the logged-in doctor's name (user.name). When the backend is added,
 * replace the mock imports with API calls filtered by doctor ID.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, CalendarDays, FlaskConical, CheckCircle2,
  AlertTriangle, Clock, Stethoscope, FilePlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { LiveClock } from '@/components/LiveClock';
import { PATIENTS, APPOINTMENTS_DATA, LAB_REPORTS_DATA } from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Static chart data (doesn't depend on individual patient)
// ---------------------------------------------------------------------------
const myConsultationsWeek = [
  { day: 'Mon', count: 7 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 9 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 8 },
  { day: 'Sat', count: 3 },
  { day: 'Sun', count: 2 },
];

const DIAGNOSIS_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#22c55e', '#ef4444'];

// Quick actions for doctors
const doctorActions = [
  { label: 'My Patients',      icon: <Users className="h-4 w-4" />,       path: '/patients',      color: 'bg-blue-600 hover:bg-blue-700'    },
  { label: 'My Appointments',  icon: <CalendarDays className="h-4 w-4" />, path: '/appointments',  color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Lab Reports',      icon: <FlaskConical className="h-4 w-4" />, path: '/reports',       color: 'bg-orange-600 hover:bg-orange-700' },
  { label: 'Add Note / Rx',    icon: <FilePlus className="h-4 w-4" />,     path: '/patients',      color: 'bg-teal-600 hover:bg-teal-700'    },
];

// ---------------------------------------------------------------------------
// DoctorDashboard
// ---------------------------------------------------------------------------
export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorName = user?.name ?? '';

  // ── Derived from real mock data ──────────────────────────────────────────
  // Patients whose primary doctor is me
  const myPatients = PATIENTS.filter((p) => p.doctor === doctorName);

  // All my appointments
  const myAppointments = APPOINTMENTS_DATA.filter((a) => a.doctor === doctorName);

  // Today's date string in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  // Today's appointments (if none match today's date we show all to avoid empty state)
  const todayAppts = myAppointments.filter((a) => a.date === today);
  const scheduleToShow = todayAppts.length > 0 ? todayAppts : myAppointments;

  // Completed today
  const completedToday = todayAppts.filter((a) => a.status === 'Completed').length;

  // My lab reports
  const myLabReports = LAB_REPORTS_DATA.filter((l) => l.orderedBy === doctorName);
  const pendingReports = myLabReports.filter((l) => l.status === 'Pending' || l.status === 'Processing');

  // Diagnosis breakdown from my patients (1 condition per patient)
  const diagMap: Record<string, number> = {};
  myPatients.forEach((p) => {
    const key = p.condition.split(' ')[0]; // first word e.g. "Hypertension"
    diagMap[key] = (diagMap[key] ?? 0) + 1;
  });
  const diagnosisData = Object.entries(diagMap).map(([name, value]) => ({ name, value }));

  // Urgent cases — admitted patients with critical conditions
  const urgentPatients = myPatients.filter(
    (p) => p.status === 'Admitted' &&
      ['Cardiac Arrest', 'ICU', 'Emergency'].some((kw) =>
        p.condition.toLowerCase().includes(kw.toLowerCase()) || p.ward.toLowerCase().includes(kw.toLowerCase())
      )
  );
  // Also flag patients with pending/processing critical lab results
  const criticalLabs = myLabReports.filter(
    (l) => l.status !== 'Ready' && ['ECG', 'Lipid', 'LFT', 'CBC'].some((kw) => l.testType.includes(kw))
  );

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: 'My Patients',
      value: myPatients.length,
      context: `${myPatients.filter((p) => p.status === 'Admitted').length} admitted · ${myPatients.filter((p) => p.status === 'OPD').length} OPD`,
      icon: <Users className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    },
    {
      label: 'Appointments Today',
      value: todayAppts.length || myAppointments.length,
      context: todayAppts.length
        ? `${completedToday} completed · ${todayAppts.length - completedToday} remaining`
        : `${myAppointments.filter((a) => a.status === 'Completed').length} completed overall`,
      icon: <CalendarDays className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    },
    {
      label: 'Pending Lab Reports',
      value: pendingReports.length,
      context: pendingReports.length === 0 ? 'All reports ready' : `${pendingReports.filter((l) => l.status === 'Pending').length} pending · ${pendingReports.filter((l) => l.status === 'Processing').length} processing`,
      icon: <FlaskConical className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    },
    {
      label: 'Consultations Done',
      value: myAppointments.filter((a) => a.status === 'Completed').length,
      context: `Out of ${myAppointments.length} total`,
      icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    },
  ];

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
          <h1 className="text-xl font-bold text-slate-800">Good {greeting}, {user?.name ?? 'Doctor'} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {user?.department ?? 'General Medicine'} · Here's your clinical summary for today.
          </p>
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
        {/* Consultations this week */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                My Consultations This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={myConsultationsWeek} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" name="Consultations" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnosis breakdown — live from my patients */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.34 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">My Patient Diagnosis Mix</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {diagnosisData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <Users className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No patients assigned</p>
                  <p className="text-xs text-slate-400 mt-1">Diagnosis data will appear here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={diagnosisData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {diagnosisData.map((_, i) => (
                        <Cell key={i} fill={DIAGNOSIS_COLORS[i % DIAGNOSIS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Urgent Cases — live from my patients */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.4 }}
        >
          <Card className="shadow-sm border-red-100 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {urgentPatients.map((p) => (
                <div key={p.id} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                  <div>
                    <Link to={`/patients/${p.id}`} className="text-xs font-semibold text-blue-600 hover:underline">{p.name}</Link>
                    <p className="text-[10px] text-slate-400 leading-snug">{p.condition} · {p.ward} Ward</p>
                  </div>
                </div>
              ))}
              {criticalLabs.map((l) => (
                <div key={l.id} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{l.patientName}</p>
                    <p className="text-[10px] text-slate-400 leading-snug">{l.testType} · {l.status}</p>
                  </div>
                </div>
              ))}
              {urgentPatients.length === 0 && criticalLabs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No urgent cases</p>
                  <p className="text-xs text-slate-400 mt-1">All patients stable</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.44 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {doctorActions.map((action) => (
                <Link to={action.path} key={action.label} className="block">
                  <Button className={`flex h-10 w-full items-center justify-start gap-2.5 px-3 text-xs text-white ${action.color} shadow-none overflow-hidden`}>
                    <span className="flex-shrink-0">{action.icon}</span>
                    <span className="truncate">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Schedule — live from my appointments */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.48 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4 text-purple-500" />
                {todayAppts.length > 0 ? "Today's Schedule" : 'My Appointments'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {scheduleToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <CalendarDays className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No appointments</p>
                  <p className="text-xs text-slate-400 mt-1">Your schedule is clear</p>
                </div>
              ) : (
                scheduleToShow.map((appt) => {
                  const done = appt.status === 'Completed';
                  return (
                    <div
                      key={appt.id}
                      className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${done ? 'opacity-50' : 'hover:bg-slate-50'}`}
                    >
                      <span className={`w-12 flex-shrink-0 text-[10px] font-bold tabular-nums ${done ? 'text-slate-400' : 'text-purple-600'}`}>
                        {appt.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link to={`/patients/${appt.patientId}`} className={`text-xs font-medium ${done ? 'line-through text-slate-400' : 'text-slate-800 hover:text-blue-600'}`}>
                          {appt.patientName}
                        </Link>
                        <p className="text-[10px] text-slate-400">{appt.type} · {appt.department}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {appt.status}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
