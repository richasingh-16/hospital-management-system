/**
 * DoctorDashboard — uses the provided HTML design components
 * Data sourced from existing APIs: /appointments, /admissions, /lab-reports, /activity-log
 * Filtered client-side by the logged-in doctor's name.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/services/api';
import {
    FilePlus, Users, FlaskConical, CalendarDays,
    AlertTriangle, CheckCircle2, MessageSquare,
    ClipboardList, Stethoscope, Calendar,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `${Math.floor(diff)}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function today() { return new Date().toISOString().slice(0, 10); }

function getApptColor(status: string, type: string) {
    if (status === 'Completed') return { card: 'bg-slate-50 border-l-slate-300', dot: 'bg-slate-400', tag: 'bg-slate-100 text-slate-500', tagLabel: 'Done' };
    if (type?.toLowerCase().includes('urgent') || type?.toLowerCase().includes('emergency'))
        return { card: 'bg-amber-50 border-l-amber-400', dot: 'bg-amber-400', tag: 'bg-red-100 text-red-600', tagLabel: 'Urgent' };
    if (status === 'Scheduled' && type?.toLowerCase().includes('follow'))
        return { card: 'bg-green-50 border-l-green-500', dot: 'bg-green-500', tag: 'bg-green-100 text-green-700', tagLabel: 'Follow-up' };
    return { card: 'bg-blue-50 border-l-blue-500', dot: 'bg-blue-500', tag: 'bg-blue-100 text-blue-700', tagLabel: 'Scheduled' };
}

// Avatar colours cycling
const AV_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-red-100 text-red-700',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DoctorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [admissions,   setAdmissions]   = useState<any[]>([]);
    const [labReports,   setLabReports]   = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch('/appointments'),
            apiFetch('/admissions'),
            apiFetch('/lab-reports'),
            apiFetch('/activity-log'),
        ]).then(([appts, adms, labs, logs]) => {
            setAppointments(appts);
            setAdmissions(adms);
            setLabReports(labs);
            setActivityLogs(logs);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const doctorName = user?.name ?? '';

    // Filter by this doctor
    const myAppointments  = useMemo(() => appointments.filter(a => a.doctor === doctorName), [appointments, doctorName]);
    const myAdmissions    = useMemo(() => admissions.filter(a => a.doctor === doctorName),   [admissions,   doctorName]);
    const myLabs          = useMemo(() => labReports.filter(l => l.orderedBy === doctorName), [labReports,  doctorName]);

    // Today's schedule
    const todayAppts = useMemo(() =>
        myAppointments.filter(a => a.date === today()).sort((a, b) => a.time.localeCompare(b.time)),
        [myAppointments]);

    // KPIs
    const completedToday  = todayAppts.filter(a => a.status === 'Completed').length;
    const totalToday      = todayAppts.length;
    const pendingLabs     = myLabs.filter(l => l.status === 'Pending' || l.status === 'Processing').length;
    const activeInpatients = myAdmissions.filter(a => a.status === 'Active').length;
    const criticalAlerts  = myAdmissions.filter(a => a.status === 'Active').length; // simplified

    // Daily progress %
    const apptPct   = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    const readyLabs = myLabs.filter(l => l.status === 'Ready').length;
    const labPct    = myLabs.length > 0 ? Math.round((readyLabs / myLabs.length) * 100) : 0;

    // Alerts — from activity log + overdue labs
    const alerts = useMemo(() => {
        const result: { icon: string; color: string; text: string; sub: string }[] = [];
        // Critical patients
        myAdmissions.filter(a => a.status === 'Active').slice(0, 2).forEach(a => {
            result.push({ icon: 'warn', color: 'red', text: `${a.patientName} — active admission in ${a.ward} Ward`, sub: `Bed ${a.bed} · Admitted ${a.admittedOn}` });
        });
        // Overdue labs
        myLabs.filter(l => l.status === 'Pending').slice(0, 2).forEach(l => {
            result.push({ icon: 'lab', color: 'amber', text: `${l.patientName} — ${l.testType} result pending`, sub: `Ordered ${l.orderedOn}` });
        });
        // Recent activity
        activityLogs.filter(l => l.actor === doctorName).slice(0, 2).forEach(l => {
            result.push({ icon: 'msg', color: 'blue', text: l.message, sub: timeAgo(l.timestamp ?? l.createdAt) });
        });
        return result.slice(0, 5);
    }, [myAdmissions, myLabs, activityLogs, doctorName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                Loading your dashboard…
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '22px', alignItems: 'start' }}>

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-5">

                {/* KPI Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    {[
                        {
                            icon: <CalendarDays className="h-[17px] w-[17px]" strokeWidth={1.8} />,
                            color: 'text-blue-700', bg: 'bg-blue-50',
                            num: totalToday, label: 'Appointments Today',
                            delta: completedToday > 0 ? `${completedToday} completed` : 'None yet',
                            deltaColor: completedToday > 0 ? 'text-green-700' : 'text-slate-400',
                        },
                        {
                            icon: <Users className="h-[17px] w-[17px]" strokeWidth={1.8} />,
                            color: 'text-green-700', bg: 'bg-green-50',
                            num: activeInpatients, label: 'Active In-Patients',
                            delta: myAdmissions.length > 0 ? `${myAdmissions.length} total admissions` : 'No admissions',
                            deltaColor: 'text-slate-400',
                        },
                        {
                            icon: <FlaskConical className="h-[17px] w-[17px]" strokeWidth={1.8} />,
                            color: 'text-amber-700', bg: 'bg-amber-50',
                            num: pendingLabs, label: 'Pending Lab Reports',
                            delta: pendingLabs > 0 ? 'Awaiting results' : 'All clear',
                            deltaColor: pendingLabs > 0 ? 'text-amber-600' : 'text-green-600',
                        },
                        {
                            icon: <AlertTriangle className="h-[17px] w-[17px]" strokeWidth={1.8} />,
                            color: 'text-red-700', bg: 'bg-red-50',
                            num: criticalAlerts, label: 'Active Admissions',
                            delta: criticalAlerts > 0 ? 'Requires attention' : 'All stable',
                            deltaColor: criticalAlerts > 0 ? 'text-red-600' : 'text-green-600',
                        },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-slate-200/70 bg-white p-[18px]" style={{ borderWidth: '0.5px' }}>
                            <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] ${s.bg} mb-3`}>
                                <span className={s.color}>{s.icon}</span>
                            </div>
                            <p className="text-[32px] font-bold leading-none text-slate-800" style={{ fontFamily: 'inherit' }}>{s.num}</p>
                            <p className="mt-[5px] text-xs text-slate-500">{s.label}</p>
                            <p className={`mt-[7px] text-[11px] font-medium ${s.deltaColor}`}>{s.delta}</p>
                        </div>
                    ))}
                </div>

                {/* Today's Schedule — Timeline */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Today's Schedule</h3>
                        <Link to="/appointments" className="text-xs text-blue-600 hover:underline">View full schedule →</Link>
                    </div>

                    {todayAppts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-slate-50 p-3 mb-3">
                                <CalendarDays className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">No appointments today</p>
                            <p className="text-xs text-slate-400 mt-1">Your schedule is clear</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {todayAppts.map((appt, i) => {
                                const c = getApptColor(appt.status, appt.type);
                                const isLast = i === todayAppts.length - 1;
                                return (
                                    <div key={appt.id} style={{ display: 'grid', gridTemplateColumns: '78px 6px 1fr', gap: '0 14px', alignItems: 'stretch', padding: '10px 22px' }}>
                                        {/* Time */}
                                        <div className="text-right pt-1">
                                            <strong className="block text-[13px] font-medium text-slate-800">{appt.time.slice(0, 5)}</strong>
                                            <span className="text-[11px] text-slate-400">{parseInt(appt.time) < 12 ? 'AM' : 'PM'}</span>
                                        </div>
                                        {/* Timeline dot + connector */}
                                        <div className="flex flex-col items-center pt-[7px]">
                                            <div className={`h-[9px] w-[9px] rounded-full flex-shrink-0 ${c.dot}`} />
                                            {!isLast && <div className="w-px flex-1 mt-[5px] bg-slate-200" />}
                                        </div>
                                        {/* Appointment card */}
                                        <div
                                            className={`rounded-[9px] border-l-[3px] p-[11px_13px] mb-[2px] cursor-pointer transition-opacity hover:opacity-80 ${c.card}`}
                                            onClick={() => appt.patientId && navigate(`/patients/${appt.patientId}`)}
                                        >
                                            <span className={`absolute right-[11px] top-[11px] rounded-[20px] px-2 py-[2px] text-[10px] font-medium ${c.tag}`} style={{ position: 'relative', float: 'right' }}>
                                                {c.tagLabel}
                                            </span>
                                            <p className="text-[13px] font-medium text-slate-800">{appt.patientName}</p>
                                            <p className="mt-[3px] text-[11px] text-slate-500">{appt.type || 'Consultation'} · {appt.department}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* In-patients Under Care */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">In-patients Under Care</h3>
                        <Link to="/patients" className="text-xs text-blue-600 hover:underline">All patients →</Link>
                    </div>

                    {myAdmissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="rounded-full bg-slate-50 p-3 mb-3">
                                <Users className="h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500">No active in-patients</p>
                        </div>
                    ) : (
                        myAdmissions.filter(a => a.status === 'Active').slice(0, 6).map((adm, i) => (
                            <div
                                key={adm.id}
                                className="flex items-center gap-[13px] border-b border-slate-100 px-[22px] py-[13px] cursor-pointer transition-colors hover:bg-slate-50 last:border-0"
                                style={{ borderWidth: '0.5px' }}
                                onClick={() => adm.patientId && navigate(`/patients/${adm.patientId}`)}
                            >
                                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-medium ${AV_COLORS[i % AV_COLORS.length]}`}>
                                    {adm.patientName?.slice(0, 2).toUpperCase() ?? 'P'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-slate-800">{adm.patientName}</p>
                                    <p className="mt-[2px] text-[11px] text-slate-400">
                                        {adm.ward} Ward, Bed {adm.bed} · Admitted {adm.admittedOn} · {adm.condition}
                                    </p>
                                </div>
                                <span className="flex-shrink-0 rounded-[20px] bg-blue-50 px-[9px] py-[3px] text-[10px] font-medium text-blue-700">
                                    Active
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-5">

                {/* Workload card */}
                <div className="relative overflow-hidden rounded-xl p-5" style={{ background: '#0A2540' }}>
                    <div className="absolute -right-5 -top-5 h-[110px] w-[110px] rounded-full opacity-30" style={{ background: '#1B6CA8' }} />
                    <div className="absolute bottom-[-32px] right-[22px] h-[90px] w-[90px] rounded-full opacity-15" style={{ background: '#1B6CA8' }} />
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/45">Today's workload</p>
                    <p className="relative z-10 mt-[7px] text-[22px] font-bold leading-snug text-white">
                        {completedToday} of {totalToday || '—'} appointments done
                    </p>
                    <p className="mt-2 text-[12px] text-white/45">
                        {apptPct}% through your schedule{totalToday - completedToday > 0 ? ` · ${totalToday - completedToday} remaining` : ' · All done!'}
                    </p>
                    <div className="relative z-10 mt-[14px] h-[5px] overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${apptPct}%` }} />
                    </div>
                </div>

                {/* Alerts & Notifications */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Alerts &amp; Notifications</h3>
                        <span className="text-[11px] text-slate-400">{alerts.length} new</span>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle2 className="h-5 w-5 text-green-400 mb-2" />
                            <p className="text-xs text-slate-500">No alerts right now</p>
                        </div>
                    ) : (
                        alerts.map((al, i) => {
                            const colorMap: Record<string, { bg: string; stroke: string }> = {
                                red:   { bg: 'bg-red-50',   stroke: 'text-red-600'   },
                                amber: { bg: 'bg-amber-50', stroke: 'text-amber-600' },
                                blue:  { bg: 'bg-blue-50',  stroke: 'text-blue-600'  },
                                green: { bg: 'bg-green-50', stroke: 'text-green-600' },
                            };
                            const cm = colorMap[al.color] ?? colorMap.blue;
                            const Icon = al.icon === 'warn' ? AlertTriangle : al.icon === 'lab' ? FlaskConical : MessageSquare;
                            return (
                                <div key={i} className="flex items-start gap-[11px] border-b border-slate-100 px-[18px] py-[13px] cursor-pointer transition-colors hover:bg-slate-50 last:border-0" style={{ borderWidth: '0.5px' }}>
                                    <div className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[7px] ${cm.bg}`}>
                                        <Icon className={`h-[14px] w-[14px] ${cm.stroke}`} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium leading-[1.45] text-slate-800">{al.text}</p>
                                        <p className="mt-[2px] text-[11px] text-slate-400">{al.sub}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Quick Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', padding: '16px 18px' }}>
                        {[
                            { label: 'New Prescription', icon: <FilePlus className="h-[15px] w-[15px]" />, stroke: 'text-blue-700',   bg: 'bg-blue-50',   path: '/reports'       },
                            { label: 'Admit Patient',    icon: <Users className="h-[15px] w-[15px]" />,    stroke: 'text-green-700',  bg: 'bg-green-50',  path: '/ward'          },
                            { label: 'Request Lab Test', icon: <FlaskConical className="h-[15px] w-[15px]" />, stroke: 'text-amber-700', bg: 'bg-amber-50', path: '/reports'    },
                            { label: 'Appointments',     icon: <Calendar className="h-[15px] w-[15px]" />, stroke: 'text-purple-700', bg: 'bg-purple-50', path: '/appointments'  },
                            { label: 'My Patients',      icon: <Stethoscope className="h-[15px] w-[15px]" />, stroke: 'text-red-700', bg: 'bg-red-50',    path: '/patients'     },
                            { label: 'Lab Reports',      icon: <ClipboardList className="h-[15px] w-[15px]" />, stroke: 'text-teal-700', bg: 'bg-teal-50', path: '/reports'    },
                        ].map(qa => (
                            <Link key={qa.label} to={qa.path}>
                                <button className="flex w-full items-center gap-[9px] rounded-[9px] border border-slate-200 bg-slate-50 px-[13px] py-[11px] text-left text-[12px] font-medium text-slate-800 transition-colors hover:bg-slate-100" style={{ borderWidth: '0.5px' }}>
                                    <span className={qa.stroke}>{qa.icon}</span>
                                    {qa.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Daily Progress */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Daily Progress</h3>
                    </div>
                    <div className="px-[20px] py-[16px] space-y-0">
                        {[
                            { label: 'Appointments', val: `${completedToday} / ${totalToday}`, pct: apptPct, color: 'bg-blue-600' },
                            { label: 'Lab reviews',  val: `${readyLabs} / ${myLabs.length}`,   pct: labPct,  color: 'bg-green-600' },
                            { label: 'In-patients',  val: `${activeInpatients} active`,         pct: Math.min(activeInpatients * 10, 100), color: 'bg-amber-500' },
                        ].map((p, i, arr) => (
                            <div key={p.label} className={i < arr.length - 1 ? 'mb-[14px]' : ''}>
                                <div className="mb-[5px] flex justify-between">
                                    <span className="text-[12px] text-slate-500">{p.label}</span>
                                    <span className="text-[12px] font-medium text-slate-800">{p.val}</span>
                                </div>
                                <div className="h-[5px] overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
