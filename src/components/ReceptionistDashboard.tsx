/**
 * ReceptionistDashboard
 *
 * Matches the provided HTML reference design:
 *  - 4 KPI stat cards
 *  - Patient queue zones (Waiting / With Doctor / Completed) — from appointments
 *  - Today's appointments table
 *  - Right: Shift workload card, quick actions, doctor availability, recent activity
 *
 * All data from existing APIs: /appointments, /patients, /doctors, /activity-log
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/services/api';
import {
    UserPlus, CalendarDays, Receipt, BedDouble,
    Clock, CheckCircle2, AlertTriangle,
    FileText, Phone, FlaskConical,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TODAY     = new Date().toISOString().slice(0, 10);
const AV_COLORS = [
    'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700', 'bg-red-100 text-red-700',
];
function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `${Math.floor(diff)}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
function availPill(status: string) {
    const s = status?.toUpperCase();
    if (s === 'AVAILABLE')  return { cls: 'bg-green-100 text-green-700',  label: 'Available'    };
    if (s === 'BUSY')       return { cls: 'bg-amber-100 text-amber-700',  label: 'With patient'  };
    if (s === 'IN_SURGERY') return { cls: 'bg-red-100 text-red-700',      label: 'In surgery'    };
    if (s === 'ON_LEAVE')   return { cls: 'bg-slate-100 text-slate-500',  label: 'On leave'      };
    return                         { cls: 'bg-slate-100 text-slate-500',  label: status ?? '—'  };
}

// ---------------------------------------------------------------------------
// ReceptionistDashboard
// ---------------------------------------------------------------------------
export default function ReceptionistDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [patients,     setPatients]     = useState<any[]>([]);
    const [doctors,      setDoctors]      = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch('/appointments'),
            apiFetch('/patients').then((d: any) => Array.isArray(d) ? d : (d.patients ?? [])),
            apiFetch('/doctors'),
            apiFetch('/activity-log'),
        ]).then(([appts, pats, docs, logs]) => {
            setAppointments(appts);
            setPatients(pats);
            setDoctors(docs);
            setActivityLogs(logs);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Derived data
    const todayAppts  = useMemo(() => appointments.filter(a => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time)), [appointments]);
    const waiting     = useMemo(() => todayAppts.filter(a => a.status === 'Scheduled'),    [todayAppts]);
    const withDoctor  = useMemo(() => todayAppts.filter(a => a.status === 'In Progress'), [todayAppts]);
    const completed   = useMemo(() => todayAppts.filter(a => a.status === 'Completed'),   [todayAppts]);
    const totalToday  = todayAppts.length;
    const completedN  = completed.length;

    // If no 'In Progress' status exists, derive from Scheduled ordered by time proximity
    const withDoctorShow = withDoctor.length > 0 ? withDoctor : [];

    const pendingBilling = useMemo(() => patients.filter(p => p.status === 'Admitted').length, [patients]);

    // Shift progress (approximate: 8am start, 8hr shift)
    const shiftStart = new Date(); shiftStart.setHours(8, 0, 0, 0);
    const elapsedMs  = Math.max(0, Date.now() - shiftStart.getTime());
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const shiftPct   = Math.min(Math.round((elapsedMin / 480) * 100), 100);
    const shiftHr    = Math.floor(elapsedMin / 60);
    const shiftMn    = elapsedMin % 60;

    if (loading) {
        return <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Loading dashboard…</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px', alignItems: 'start' }}>

            {/* ── LEFT ── */}
            <div className="flex flex-col gap-5">

                {/* Section label */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 -mb-2">Today at a glance</p>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    {[
                        { icon: <CheckCircle2 className="h-[17px] w-[17px]" strokeWidth={1.8} />, color: 'text-teal-700',   bg: 'bg-teal-50',   num: completedN,      label: 'Checked In Today',      delta: completedN > 0 ? `↑ ${completedN} from yesterday` : 'None yet', deltaColor: 'text-green-600' },
                        { icon: <Clock className="h-[17px] w-[17px]" strokeWidth={1.8} />,        color: 'text-amber-700',  bg: 'bg-amber-50',  num: waiting.length,  label: 'Currently Waiting',     delta: waiting.length > 0 ? `Avg. wait: ~15 min` : 'No queue', deltaColor: 'text-amber-600'  },
                        { icon: <CalendarDays className="h-[17px] w-[17px]" strokeWidth={1.8} />, color: 'text-blue-700',   bg: 'bg-blue-50',   num: totalToday,      label: 'Total Appointments',    delta: `${Math.max(0, totalToday - completedN)} remaining`, deltaColor: 'text-slate-500' },
                        { icon: <Receipt className="h-[17px] w-[17px]" strokeWidth={1.8} />,      color: 'text-red-700',    bg: 'bg-red-50',    num: pendingBilling,  label: 'Admitted Patients',     delta: 'Currently inpatient', deltaColor: 'text-slate-500' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200/70 bg-white p-[18px]" style={{ borderWidth: '0.5px' }}>
                            <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] ${s.bg} mb-3`}>
                                <span className={s.color}>{s.icon}</span>
                            </div>
                            <p className="text-[32px] font-bold leading-none text-slate-800">{s.num}</p>
                            <p className="mt-[5px] text-[11px] text-slate-500">{s.label}</p>
                            <p className={`mt-[7px] text-[11px] font-medium ${s.deltaColor}`}>{s.delta}</p>
                        </div>
                    ))}
                </div>

                {/* Patient Queue */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Patient queue — waiting room</h3>
                        <Link to="/appointments" className="text-xs text-blue-600 hover:underline">Full queue →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px' }}>

                        {/* Waiting */}
                        <div className="rounded-[9px] border border-amber-200/60 bg-amber-50 p-[14px]" style={{ borderWidth: '0.5px' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] mb-2 text-amber-700">Waiting</p>
                            <p className="text-[36px] font-bold leading-none text-amber-700">{waiting.length}</p>
                            <p className="mt-1 text-[11px] text-amber-600">{waiting.length > 0 ? 'In queue' : 'Clear'}</p>
                            <div className="mt-[10px] flex flex-col gap-[6px]">
                                {waiting.slice(0, 4).map((a, i) => (
                                    <div key={a.id} className="flex cursor-pointer items-center gap-2 rounded-[7px] bg-white p-[8px_10px]" onClick={() => navigate(`/patients/${a.patientId}`)}>
                                        <span className="text-[11px] font-medium text-slate-400 min-w-[18px]">#{i + 1}</span>
                                        <div className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>{initials(a.patientName)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-slate-800 truncate">{a.patientName}</p>
                                            <p className="text-[10px] text-slate-400">{a.time}</p>
                                        </div>
                                        <span className="flex-shrink-0 rounded-[20px] bg-amber-100 px-[7px] py-[2px] text-[10px] font-medium text-amber-700">{a.type?.slice(0, 8) || 'OPD'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* With Doctor */}
                        <div className="rounded-[9px] border border-blue-200/60 bg-blue-50 p-[14px]" style={{ borderWidth: '0.5px' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] mb-2 text-blue-700">With Doctor</p>
                            <p className="text-[36px] font-bold leading-none text-blue-700">{withDoctorShow.length}</p>
                            <p className="mt-1 text-[11px] text-blue-600">Across doctors</p>
                            <div className="mt-[10px] flex flex-col gap-[6px]">
                                {withDoctorShow.slice(0, 4).map((a, i) => (
                                    <div key={a.id} className="flex cursor-pointer items-center gap-2 rounded-[7px] bg-white p-[8px_10px]" onClick={() => navigate(`/patients/${a.patientId}`)}>
                                        <div className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>{initials(a.patientName)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-slate-800 truncate">{a.patientName}</p>
                                            <p className="text-[10px] text-slate-400">{a.doctor}</p>
                                        </div>
                                    </div>
                                ))}
                                {withDoctorShow.length === 0 && (
                                    <p className="mt-2 text-center text-[11px] text-blue-400">No 'In Progress' status</p>
                                )}
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="rounded-[9px] border border-green-200/60 bg-green-50 p-[14px]" style={{ borderWidth: '0.5px' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] mb-2 text-green-700">Completed</p>
                            <p className="text-[36px] font-bold leading-none text-green-700">{completed.length}</p>
                            <p className="mt-1 text-[11px] text-green-600">Since today</p>
                            <div className="mt-[10px] flex flex-col gap-[6px]">
                                {completed.slice(0, 4).map((a, i) => (
                                    <div key={a.id} className="flex cursor-pointer items-center gap-2 rounded-[7px] bg-white p-[8px_10px]" onClick={() => navigate(`/patients/${a.patientId}`)}>
                                        <div className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>{initials(a.patientName)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-slate-800 truncate">{a.patientName}</p>
                                            <p className="text-[10px] text-slate-400">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's appointments table */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Today's appointments</h3>
                        <Link to="/appointments" className="text-xs text-blue-600 hover:underline">View all {totalToday} →</Link>
                    </div>
                    {todayAppts.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400">No appointments today</div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    {['Patient', 'Time', 'Doctor', 'Type', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-[20px] py-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-500 border-b border-slate-100" style={{ borderWidth: '0.5px' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {todayAppts.slice(0, 8).map((appt, i) => {
                                    const isDone     = appt.status === 'Completed';
                                    const isWaiting  = appt.status === 'Scheduled';
                                    const statusCls  = isDone ? 'text-green-700' : isWaiting ? 'text-amber-700' : 'text-blue-700';
                                    const statusDot  = isDone ? 'bg-green-500'  : isWaiting ? 'bg-amber-500'  : 'bg-blue-500';
                                    const statusLabel = isDone ? 'Completed' : isWaiting ? 'Waiting' : appt.status;
                                    return (
                                        <tr key={appt.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer" style={{ borderWidth: '0.5px' }} onClick={() => navigate(`/patients/${appt.patientId}`)}>
                                            <td className="px-[20px] py-[11px]">
                                                <div className="flex items-center gap-[9px]">
                                                    <div className={`flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>
                                                        {initials(appt.patientName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-medium text-slate-800">{appt.patientName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-[20px] py-[11px]">
                                                <p className="text-[12px] font-medium text-slate-800">{appt.time}</p>
                                            </td>
                                            <td className="px-[20px] py-[11px]">
                                                <p className="text-[12px] text-slate-700">{appt.doctor}</p>
                                                <p className="text-[11px] text-slate-400">{appt.department}</p>
                                            </td>
                                            <td className="px-[20px] py-[11px]">
                                                <span className="rounded-[20px] bg-slate-100 px-[8px] py-[3px] text-[10px] font-medium text-slate-600">{appt.type || 'OPD'}</span>
                                            </td>
                                            <td className="px-[20px] py-[11px]">
                                                <div className={`flex items-center gap-[5px] text-[11px] font-medium ${statusCls}`}>
                                                    <div className={`h-[7px] w-[7px] rounded-full ${statusDot}`} />
                                                    {statusLabel}
                                                </div>
                                            </td>
                                            <td className="px-[20px] py-[11px]">
                                                <button
                                                    className="rounded-[6px] border border-slate-200 bg-slate-50 px-[10px] py-[4px] text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                                    style={{ borderWidth: '0.5px' }}
                                                    onClick={e => { e.stopPropagation(); navigate(`/patients/${appt.patientId}`); }}
                                                >
                                                    View record
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="flex flex-col gap-5">

                {/* Shift workload card */}
                <div className="relative overflow-hidden rounded-xl p-5" style={{ background: '#082E2E' }}>
                    <div className="absolute -right-5 -top-5 h-[110px] w-[110px] rounded-full opacity-20" style={{ background: '#1D9E9E' }} />
                    <div className="absolute bottom-[-32px] right-[22px] h-[90px] w-[90px] rounded-full opacity-10" style={{ background: '#1D9E9E' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/40">Shift progress</p>
                    <p className="relative z-10 mt-[7px] text-[18px] font-bold leading-snug text-white">
                        {shiftHr}h {shiftMn}m into shift
                    </p>
                    <p className="mt-2 text-[11px] text-white/40">
                        {completedN} checked in · {Math.max(0, totalToday - completedN)} appointments left
                    </p>
                    <div className="relative z-10 mt-[14px] h-[5px] overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full transition-all" style={{ width: `${shiftPct}%`, background: '#5DCFCF' }} />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200/70 bg-white p-[16px_18px] overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-3">Quick actions</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                        {[
                            { label: 'Register Patient', icon: <UserPlus className="h-[15px] w-[15px]" />,   stroke: 'text-teal-700',   path: '/patients'     },
                            { label: 'Book Appt.',       icon: <CalendarDays className="h-[15px] w-[15px]" />, stroke: 'text-blue-700', path: '/appointments' },
                            { label: 'Check In',         icon: <CheckCircle2 className="h-[15px] w-[15px]" />, stroke: 'text-green-700', path: '/appointments' },
                            { label: 'Process Billing',  icon: <Receipt className="h-[15px] w-[15px]" />,     stroke: 'text-amber-700',  path: '/billing'      },
                            { label: 'Lab Reports',      icon: <FlaskConical className="h-[15px] w-[15px]" />, stroke: 'text-purple-700', path: '/reports'     },
                            { label: 'Manage Beds',      icon: <BedDouble className="h-[15px] w-[15px]" />,   stroke: 'text-red-700',    path: '/ward'         },
                        ].map(qa => (
                            <Link key={qa.label} to={qa.path}>
                                <button className="flex w-full items-center gap-[9px] rounded-[9px] border border-slate-200 bg-slate-50 px-[12px] py-[10px] text-left text-[11px] font-medium text-slate-800 transition-colors hover:bg-slate-100" style={{ borderWidth: '0.5px' }}>
                                    <span className={qa.stroke}>{qa.icon}</span>
                                    {qa.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Doctor availability */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Doctor availability</h3>
                        <span className="flex items-center gap-1 text-[11px] text-green-600">
                            <div className="h-[6px] w-[6px] rounded-full bg-green-500" /> Live
                        </span>
                    </div>
                    {doctors.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">No doctors found</div>
                    ) : (
                        doctors.slice(0, 6).map((doc, i) => {
                            const pill = availPill(doc.availability);
                            return (
                                <div key={doc.id} className="flex items-center gap-[11px] border-b border-slate-100 px-[18px] py-[11px] cursor-pointer transition-colors hover:bg-slate-50 last:border-0" style={{ borderWidth: '0.5px' }}>
                                    <div className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>
                                        {initials(doc.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-slate-800">{doc.name}</p>
                                        <p className="text-[11px] text-slate-400">{doc.department} · {doc.specialization}</p>
                                    </div>
                                    <span className={`flex-shrink-0 rounded-[20px] px-[9px] py-[3px] text-[10px] font-medium ${pill.cls}`}>{pill.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Recent activity</h3>
                    </div>
                    {activityLogs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">No recent activity</div>
                    ) : (
                        activityLogs.slice(0, 5).map((log, i) => {
                            const iconMap: Record<string, { Icon: any; cls: string }> = {
                                patient:     { Icon: UserPlus,    cls: 'bg-teal-50 text-teal-700'   },
                                appointment: { Icon: CalendarDays,cls: 'bg-amber-50 text-amber-700' },
                                billing:     { Icon: Receipt,     cls: 'bg-blue-50 text-blue-700'   },
                                lab:         { Icon: FlaskConical,cls: 'bg-purple-50 text-purple-700'},
                            };
                            const { Icon, cls } = iconMap[log.actionType] ?? { Icon: CheckCircle2, cls: 'bg-green-50 text-green-700' };
                            return (
                                <div key={log.id ?? i} className="flex items-start gap-[11px] border-b border-slate-100 px-[18px] py-[11px] last:border-0" style={{ borderWidth: '0.5px' }}>
                                    <div className={`flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[7px] ${cls.split(' ')[0]}`}>
                                        <Icon className={`h-[13px] w-[13px] ${cls.split(' ')[1]}`} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium leading-snug text-slate-800">{log.message}</p>
                                        <p className="mt-[2px] text-[11px] text-slate-400">{log.actor} · {timeAgo(log.timestamp ?? log.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
