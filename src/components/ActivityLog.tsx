import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, CalendarCheck, Receipt, FlaskConical,
  BedDouble, LogOut, Stethoscope, FileText, Filter, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/services/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ActionType = 'patient' | 'appointment' | 'admission' | 'discharge' | 'billing' | 'lab' | 'doctor';

interface LogEntry {
  id: string;
  actionType: ActionType;
  message: string;
  actor: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Mock demo logs — so visitors understand the log format
// ---------------------------------------------------------------------------
const mockLogs: LogEntry[] = [
  { id: 'L-001', actionType: 'patient',     message: 'New patient Aditya Kumar (P-007) registered',           actor: 'Receptionist',    timestamp: '2026-03-06T08:12:00.000Z' },
  { id: 'L-002', actionType: 'admission',   message: 'Arjun Patel admitted to ICU, Bed ICU-03',               actor: 'Dr. Neha Singh',  timestamp: '2026-03-06T08:55:00.000Z' },
  { id: 'L-003', actionType: 'appointment', message: 'Appointment booked for Rahul Verma with Dr. Ananya Bose', actor: 'Receptionist',  timestamp: '2026-03-06T09:00:00.000Z' },
  { id: 'L-004', actionType: 'lab',         message: 'CBC ordered for Rahul Verma',                           actor: 'Dr. Ananya Bose', timestamp: '2026-03-06T09:15:00.000Z' },
  { id: 'L-005', actionType: 'appointment', message: 'Appointment for Arjun Patel marked as Completed',       actor: 'Dr. Neha Singh',  timestamp: '2026-03-06T11:10:00.000Z' },
  { id: 'L-006', actionType: 'lab',         message: 'X-Ray Chest for Priya Sharma marked as Processing',     actor: 'Lab Staff',       timestamp: '2026-03-06T11:30:00.000Z' },
  { id: 'L-007', actionType: 'billing',     message: 'Invoice generated for Aditya Kumar — ₹6,900',          actor: 'Admin',           timestamp: '2026-03-06T11:45:00.000Z' },
  { id: 'L-008', actionType: 'discharge',   message: 'Patient Kavitha Reddy (P-010) discharged',              actor: 'Dr. Ananya Bose', timestamp: '2026-03-06T12:00:00.000Z' },
  { id: 'L-009', actionType: 'billing',     message: 'Invoice marked as Paid for Priya Sharma',              actor: 'Receptionist',    timestamp: '2026-03-06T12:30:00.000Z' },
  { id: 'L-010', actionType: 'doctor',      message: 'Dr. Shivani Tandel added to Cardiology',               actor: 'Hospital Admin',  timestamp: '2026-03-06T13:00:00.000Z' },
];

const actionConfig: Record<ActionType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  patient:     { icon: <UserPlus className="h-3.5 w-3.5" />,     color: 'text-blue-600',   bg: 'bg-blue-100',   label: 'Patient'     },
  appointment: { icon: <CalendarCheck className="h-3.5 w-3.5" />, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Appointment' },
  admission:   { icon: <BedDouble className="h-3.5 w-3.5" />,    color: 'text-orange-600', bg: 'bg-orange-100', label: 'Admission'   },
  discharge:   { icon: <LogOut className="h-3.5 w-3.5" />,       color: 'text-green-600',  bg: 'bg-green-100',  label: 'Discharge'   },
  billing:     { icon: <Receipt className="h-3.5 w-3.5" />,      color: 'text-teal-600',   bg: 'bg-teal-100',   label: 'Billing'     },
  lab:         { icon: <FlaskConical className="h-3.5 w-3.5" />, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Lab'         },
  doctor:      { icon: <Stethoscope className="h-3.5 w-3.5" />,  color: 'text-slate-600',  bg: 'bg-slate-100',  label: 'Doctor'      },
};

// Default 7-day window
function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}
function defaultTo() {
  return new Date().toISOString().split('T')[0];
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function actorInitial(actor: string) {
  return actor.includes('Dr.') ? actor.split(' ')[1]?.[0] ?? 'D' : actor[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ActivityLog() {
  const [logs, setLogs]           = useState<LogEntry[]>(mockLogs);
  const [loading, setLoading]     = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [fromDate, setFromDate]   = useState(defaultFrom());
  const [toDate, setToDate]       = useState(defaultTo());

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data: LogEntry[] = await apiFetch(`/activity-log?from=${fromDate}&to=${toDate}`);
      // Show only real logs from DB
      setLogs(data);
    } catch {
      setLogs(mockLogs); // fallback when server is unreachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []); // load on mount with default 7-day window

  const filtered = filterType === 'all'
    ? logs
    : logs.filter(l => l.actionType === filterType);

  // Count per type (from full unfiltered list)
  const counts = Object.fromEntries(
    Object.keys(actionConfig).map(t => [t, logs.filter(l => l.actionType === t).length])
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
          <p className="text-sm text-slate-500">Audit trail of all hospital system actions</p>
        </div>

        {/* ── Date range + filter ── */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <span className="text-sm text-slate-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <Button size="sm" onClick={fetchLogs} disabled={loading} className="bg-blue-600 hover:bg-blue-700 h-8">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading…' : 'Apply'}
          </Button>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="discharge">Discharge</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Action type pill counts ── */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(actionConfig) as [ActionType, typeof actionConfig[ActionType]][]).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? 'all' : type)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filterType === type ? `${cfg.bg} ${cfg.color}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className={filterType === type ? cfg.color : 'text-slate-500'}>{cfg.icon}</span>
            {cfg.label} · {counts[type] ?? 0}
          </button>
        ))}
      </div>

      {/* ── Log summary strip ── */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Total Events', value: logs.length, color: 'text-slate-700' },
          { label: 'Showing',      value: filtered.length, color: 'text-blue-600' },
          { label: 'Date Range',   value: `${fromDate} → ${toDate}`, color: 'text-slate-500', small: true },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className={`font-bold ${s.small ? 'text-sm' : 'text-2xl'} ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Log timeline ── */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((log, i) => {
              const cfg = actionConfig[log.actionType] ?? actionConfig['patient'];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  {/* Action icon */}
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">{log.message}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${cfg.bg.replace('100', '500')}`}>
                        {actorInitial(log.actor)}
                      </div>
                      <span className="text-xs text-slate-400">{log.actor}</span>
                    </div>
                  </div>

                  {/* Timestamp + badge */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-slate-400">{formatTimestamp(log.timestamp)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                No activity in this date range.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
