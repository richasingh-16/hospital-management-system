import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, CalendarCheck, Receipt, FlaskConical,
  BedDouble, LogOut, Stethoscope, FileText, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Mock activity log data
// ---------------------------------------------------------------------------
type ActionType = 'patient' | 'appointment' | 'admission' | 'discharge' | 'billing' | 'lab' | 'doctor';

interface LogEntry {
  id: string;
  actionType: ActionType;
  message: string;
  actor: string;
  timestamp: string;
}

const initialLogs: LogEntry[] = [
  { id: 'L-001', actionType: 'patient',     message: 'New patient Aditya Kumar (P-007) registered',           actor: 'Receptionist',    timestamp: '2026-03-06 08:12' },
  { id: 'L-002', actionType: 'admission',   message: 'Arjun Patel admitted to ICU, Bed ICU-03',               actor: 'Dr. Neha Singh',  timestamp: '2026-03-06 08:55' },
  { id: 'L-003', actionType: 'appointment', message: 'Appointment APT-001 booked for Rahul Verma at 09:00',   actor: 'Receptionist',    timestamp: '2026-03-06 09:00' },
  { id: 'L-004', actionType: 'lab',         message: 'Lab test CBC ordered for Rahul Verma',                  actor: 'Dr. Ananya Bose', timestamp: '2026-03-06 09:15' },
  { id: 'L-005', actionType: 'appointment', message: 'Appointment APT-003 marked as Completed',               actor: 'Dr. Neha Singh',  timestamp: '2026-03-06 11:10' },
  { id: 'L-006', actionType: 'lab',         message: 'Lab report LAB-003 (X-Ray) marked as Processing',      actor: 'Lab Staff',       timestamp: '2026-03-06 11:30' },
  { id: 'L-007', actionType: 'billing',     message: 'Invoice INV-007 generated for Aditya Kumar — ₹6,900',  actor: 'Admin',           timestamp: '2026-03-06 11:45' },
  { id: 'L-008', actionType: 'patient',     message: 'Patient Kavitha Reddy (P-010) discharged',             actor: 'Dr. Ananya Bose', timestamp: '2026-03-06 12:00' },
  { id: 'L-009', actionType: 'billing',     message: 'Invoice INV-002 marked as Paid — ₹10,600',             actor: 'Receptionist',    timestamp: '2026-03-06 12:30' },
  { id: 'L-010', actionType: 'doctor',      message: 'Dr. Arun Sharma availability updated to On Leave',     actor: 'Admin',           timestamp: '2026-03-06 13:00' },
  { id: 'L-011', actionType: 'admission',   message: 'Meera Nair assigned to General Ward, Bed G-20',       actor: 'Receptionist',    timestamp: '2026-03-06 13:15' },
  { id: 'L-012', actionType: 'lab',         message: 'Lab report LAB-001 (CBC) result: Normal',              actor: 'Lab Staff',       timestamp: '2026-03-06 13:45' },
  { id: 'L-013', actionType: 'patient',     message: 'Patient details updated for Arjun Patel (P-003)',      actor: 'Dr. Neha Singh',  timestamp: '2026-03-06 14:00' },
  { id: 'L-014', actionType: 'appointment', message: 'New appointment booked for Priya Sharma at 10:30',     actor: 'Receptionist',    timestamp: '2026-03-06 14:20' },
  { id: 'L-015', actionType: 'discharge',   message: 'Vikram Desai discharged from Orthopedics Ward',        actor: 'Dr. Rohan Mehta', timestamp: '2026-03-06 15:30' },
  { id: 'L-016', actionType: 'billing',     message: 'Invoice INV-005 overdue flag set for Meera Nair',      actor: 'System',          timestamp: '2026-03-06 16:00' },
  { id: 'L-017', actionType: 'lab',         message: 'Lab report LAB-008 (MRI Brain) created — Pending',    actor: 'Dr. Neha Singh',  timestamp: '2026-03-06 16:30' },
  { id: 'L-018', actionType: 'patient',     message: 'New patient Sanjay Gupta (P-009) registered & admitted', actor: 'Receptionist', timestamp: '2026-03-06 17:00' },
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

// ---------------------------------------------------------------------------
// ActivityLog Component
// ---------------------------------------------------------------------------
export default function ActivityLog() {
  const [filterType, setFilterType] = useState<string>('all');
  const logs = initialLogs;

  const filtered = filterType === 'all' ? logs : logs.filter((l) => l.actionType === filterType);

  const actorInitial = (actor: string) => actor.includes('Dr.') ? actor.split(' ')[1][0] : actor[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
          <p className="text-sm text-slate-500">Audit trail of all hospital system actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
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

      {/* Summary pill counts */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(actionConfig).map(([type, cfg]) => {
          const count = logs.filter((l) => l.actionType === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filterType === type ? `${cfg.bg} ${cfg.color}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={filterType === type ? cfg.color : 'text-slate-500'}>{cfg.icon}</span>
              {cfg.label} · {count}
            </button>
          );
        })}
      </div>

      {/* Log timeline */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((log, i) => {
              const cfg = actionConfig[log.actionType];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.025 }}
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
                    <span className="text-xs text-slate-400">{log.timestamp}</span>
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
                No activity logs for this filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
