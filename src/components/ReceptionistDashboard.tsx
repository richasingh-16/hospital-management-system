/**
 * ReceptionistDashboard
 *
 * KPIs and widgets derived from real mockData.
 * When the backend is added, replace mock imports with API calls.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarDays, UserPlus, BedDouble,
  Clock, TrendingUp, CheckSquare, Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { LiveClock } from '@/components/LiveClock';
import { useReceptionDashboard } from '@/hooks/useReceptionDashboard';

const statusStyles: Record<string, string> = {
  'Scheduled': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

// Quick actions for receptionists
const receptionActions = [
  { label: 'Register Patient',     icon: <UserPlus className="h-4 w-4" />,     path: '/patients',     color: 'bg-blue-600 hover:bg-blue-700'    },
  { label: 'Book Appointment',     icon: <CalendarDays className="h-4 w-4" />, path: '/appointments', color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Admit / Beds',        icon: <BedDouble className="h-4 w-4" />,      path: '/ward',         color: 'bg-teal-600 hover:bg-teal-700'    },
];

// ---------------------------------------------------------------------------
// ReceptionistDashboard
// ---------------------------------------------------------------------------
export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const {
    greeting,
    kpis,
    appointmentVolume,
    recentPatients,
    todayAppts,
    apptToShow,
  } = useReceptionDashboard();

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
          <h1 className="text-xl font-bold text-slate-800">Good {greeting}, {user?.name ?? 'Receptionist'} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Hospital front desk — today's operations overview.</p>
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
        {/* Appointment volume — scheduled vs walk-in */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Appointment Volume This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={appointmentVolume} barSize={18} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="scheduled" name="Scheduled" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="walkin"    name="Walk-in"   fill="#a855f7" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Patient Registrations — from real PATIENTS data */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.34 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="h-4 w-4 text-purple-500" />
                Recent Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {recentPatients.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">No recent registrations</p>
              ) : (
                recentPatients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.admittedOn} · {p.id} · {p.status}
                      </p>
                    </div>
                    <Link
                      to={`/patients/${p.id}`}
                      className="text-[10px] font-semibold text-blue-600 hover:underline flex-shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.4 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-0">
              {receptionActions.map((action) => (
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

        {/* Today's Appointment Queue — from real APPOINTMENTS_DATA */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.44 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4 text-blue-500" />
                {todayAppts.length > 0 ? "Today's Queue" : 'Appointment Queue'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {apptToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <CheckSquare className="h-6 w-6 text-slate-400/70" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No appointments in queue</p>
                  <p className="text-xs text-slate-400 mt-1">The waiting room is clear</p>
                </div>
              ) : (
                apptToShow.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <span className="w-10 flex-shrink-0 text-[10px] font-bold tabular-nums text-blue-600">
                      {appt.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link to={`/patients/${appt.patientId}`} className="text-xs font-medium text-slate-800 hover:text-blue-600 truncate block">
                        {appt.patientName}
                      </Link>
                      <p className="text-[10px] text-slate-400 truncate">{appt.doctor} · {appt.type}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold flex-shrink-0 ${statusStyles[appt.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {appt.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
