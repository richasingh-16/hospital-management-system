/**
 * Dashboard — role router
 *
 * AdminDashboard:  matches the provided HTML design reference (light theme)
 *   - 4 KPI stat cards with icon badge + mini progress bar
 *   - Revenue bar chart (last 7 days from /billing)
 *   - Ward occupancy table (from /dashboard/admin)
 *   - Staff on duty grid (real roles from /users)
 *   - Right column: alerts, recent activity, quick actions
 */
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DoctorDashboard from '@/components/DoctorDashboard';
import ReceptionistDashboard from '@/components/ReceptionistDashboard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import {
    Users, BedDouble, Stethoscope, UserPlus,
    AlertTriangle, CheckCircle2, Activity,
    FlaskConical, CalendarCheck2,
    TrendingUp,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pctBar(pct: number) {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 65) return 'bg-amber-400';
    return 'bg-green-500';
}
function pctBadge(pct: number) {
    if (pct >= 90) return 'bg-red-100 text-red-700';
    if (pct >= 65) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
}

// ---------------------------------------------------------------------------
// Custom recharts tooltip
// ---------------------------------------------------------------------------
function RevTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value ?? 0;
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-md">
            <p className="font-medium text-slate-700">{label}</p>
            <p className="mt-0.5 text-blue-600">₹{(val / 1000).toFixed(1)}K</p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AdminDashboard
// ---------------------------------------------------------------------------
function AdminDashboard() {
    const { user } = useAuth();
    const {
        kpis, wardCapacity, alerts, activity,
        revenueChart, pendingBilling, staffCounts,
    } = useAdminDashboard();

    const totalBeds     = wardCapacity.reduce((s, w) => s + w.total, 0);
    const totalOccupied = wardCapacity.reduce((s, w) => s + w.occupied, 0);
    const totalFree     = totalBeds - totalOccupied;

    // KPI visual config
    const kpiStyles: { icon: React.ReactNode; color: string; bg: string; barColor: string }[] = [
        { icon: <Users className="h-[16px] w-[16px]" strokeWidth={1.8} />,       color: 'text-blue-700',   bg: 'bg-blue-50',   barColor: 'bg-blue-600'   },
        { icon: <UserPlus className="h-[16px] w-[16px]" strokeWidth={1.8} />,    color: 'text-green-700',  bg: 'bg-green-50',  barColor: 'bg-green-600'  },
        { icon: <BedDouble className="h-[16px] w-[16px]" strokeWidth={1.8} />,   color: 'text-amber-700',  bg: 'bg-amber-50',  barColor: 'bg-amber-500'  },
        { icon: <Stethoscope className="h-[16px] w-[16px]" strokeWidth={1.8} />, color: 'text-purple-700', bg: 'bg-purple-50', barColor: 'bg-purple-600' },
    ];

    // Staff grid
    const staffGrid = [
        { label: 'Doctors',        key: 'DOCTOR',          color: 'text-blue-700',   bar: 'bg-blue-500'   },
        { label: 'Receptionists',  key: 'RECEPTIONIST',    color: 'text-purple-700', bar: 'bg-purple-500' },
        { label: 'Lab Technicians',key: 'LAB_TECHNICIAN',  color: 'text-amber-700',  bar: 'bg-amber-500'  },
        { label: 'Admins',         key: 'ADMIN',           color: 'text-slate-600',  bar: 'bg-slate-400'  },
    ];
    const maxStaff = Math.max(...staffGrid.map(s => staffCounts[s.key] ?? 0), 1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px', alignItems: 'start' }}>

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-5">

                {/* Section label */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 -mb-2">
                    Key performance indicators — today
                </p>

                {/* KPI Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    {kpis.map((kpi, i) => {
                        const s = kpiStyles[i];
                        const numVal = typeof kpi.value === 'string' && kpi.value.includes('/')
                            ? parseInt(kpi.value) : Number(kpi.value);
                        const fillPct = Math.min((numVal / 500) * 100, 100);
                        return (
                            <div key={kpi.label} className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-[18px]" style={{ borderWidth: '0.5px' }}>
                                {/* subtle orb */}
                                <div className={`absolute -right-4 -top-4 h-[64px] w-[64px] rounded-full opacity-[0.06] ${s.bg.replace('bg-', 'bg-')}`} style={{ background: 'currentColor' }} />
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] ${s.bg}`}>
                                        <span className={s.color}>{s.icon}</span>
                                    </div>
                                <span className="text-[11px] font-medium text-slate-400">↑ Live</span>
                                </div>
                                <p className="text-[30px] font-bold leading-none text-slate-800">{kpi.value}</p>
                                <p className="mt-[5px] text-[11px] text-slate-500">{kpi.label}</p>
                                <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${s.barColor}`} style={{ width: `${fillPct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Revenue Chart */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <div>
                            <h3 className="text-sm font-medium text-slate-800">Revenue — last 7 days</h3>
                            <p className="mt-0.5 text-[11px] text-slate-400">From billing invoices</p>
                        </div>
                        <span className="rounded-[20px] bg-green-50 px-[9px] py-[3px] text-[11px] font-medium text-green-700 border border-green-100" style={{ borderWidth: '0.5px' }}>
                            <TrendingUp className="inline h-3 w-3 mr-1" />Billing data
                        </span>
                    </div>
                    <div className="p-[16px_20px]">
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={revenueChart} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip content={<RevTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ward occupancy table */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <div>
                            <h3 className="text-sm font-medium text-slate-800">Ward occupancy</h3>
                            <p className="mt-0.5 text-[11px] text-slate-400">Bed capacity & patient load</p>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <span><strong className="text-slate-800">{totalBeds}</strong> total</span>
                            <span><strong className="text-red-600">{totalOccupied}</strong> occupied</span>
                            <span><strong className="text-green-600">{totalFree}</strong> free</span>
                        </div>
                    </div>
                    {wardCapacity.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">No ward data yet</div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    {['Ward', 'Beds', 'Occupancy', 'Status'].map(h => (
                                        <th key={h} className="px-[20px] py-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-500 border-b border-slate-100" style={{ borderWidth: '0.5px' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {wardCapacity.map((ward) => {
                                    const pct = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
                                    return (
                                        <tr key={ward.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors" style={{ borderWidth: '0.5px' }}>
                                            <td className="px-[20px] py-[12px]">
                                                <p className="text-[13px] font-medium text-slate-800">{ward.name} Ward</p>
                                            </td>
                                            <td className="px-[20px] py-[12px] text-[12px] text-slate-600">{ward.occupied} / {ward.total}</td>
                                            <td className="px-[20px] py-[12px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-[4px] w-[80px] overflow-hidden rounded-full bg-slate-100">
                                                        <div className={`h-full rounded-full ${pctBar(pct)}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className={`text-[11px] font-medium ${pct >= 90 ? 'text-red-600' : pct >= 65 ? 'text-amber-600' : 'text-green-600'}`}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-[20px] py-[12px]">
                                                <span className={`rounded-[20px] px-[8px] py-[3px] text-[10px] font-medium ${pctBadge(pct)}`}>{pct >= 90 ? 'Critical' : pct >= 65 ? 'High' : 'Normal'}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Staff on duty */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[22px] py-4" style={{ borderWidth: '0.5px' }}>
                        <div>
                            <h3 className="text-sm font-medium text-slate-800">Staff accounts</h3>
                            <p className="mt-0.5 text-[11px] text-slate-400">By role in the system</p>
                        </div>
                        <Link to="/settings" className="text-xs text-blue-600 hover:underline">Manage staff →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px' }}>
                        {staffGrid.map(s => {
                            const count = staffCounts[s.key] ?? 0;
                            const pct   = maxStaff > 0 ? Math.round((count / maxStaff) * 100) : 0;
                            return (
                                <div key={s.key} className="rounded-[9px] border border-slate-100 bg-slate-50/70 p-[14px] text-center" style={{ borderWidth: '0.5px' }}>
                                    <p className={`text-[26px] font-bold leading-none ${s.color}`}>{count}</p>
                                    <p className="mt-1 text-[11px] text-slate-500">{s.label}</p>
                                    <div className="mt-[10px] h-[3px] overflow-hidden rounded-full bg-slate-200">
                                        <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-5">

                {/* Hospital overview hero card */}
                <div className="relative overflow-hidden rounded-xl p-5" style={{ background: '#0A2540' }}>
                    <div className="absolute -right-5 -top-5 h-[110px] w-[110px] rounded-full opacity-30" style={{ background: '#1B6CA8' }} />
                    <div className="absolute bottom-[-32px] right-[22px] h-[90px] w-[90px] rounded-full opacity-15" style={{ background: '#1B6CA8' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">Hospital command centre</p>
                    <p className="relative z-10 mt-[7px] text-[18px] font-bold leading-snug text-white">
                        {user?.name ?? 'Admin'} — Live overview
                    </p>
                    <p className="mt-2 text-[11px] text-white/40">
                        {totalBeds > 0 ? `${Math.round((totalOccupied / totalBeds) * 100)}% bed occupancy · ${wardCapacity.length} wards` : 'No wards configured yet'}
                    </p>
                    {pendingBilling > 0 && (
                        <p className="mt-1 text-[11px] text-amber-400">{pendingBilling} pending invoice{pendingBilling !== 1 ? 's' : ''}</p>
                    )}
                    <div className="relative z-10 mt-[14px] h-[5px] overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: totalBeds > 0 ? `${Math.round((totalOccupied / totalBeds) * 100)}%` : '0%' }} />
                    </div>
                </div>

                {/* Critical Alerts */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Admin alerts</h3>
                        <span className="text-[11px] text-slate-400">{alerts.length} active</span>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle2 className="h-5 w-5 text-green-400 mb-2" />
                            <p className="text-xs text-slate-500">No critical alerts</p>
                        </div>
                    ) : (
                        alerts.map((al, i) => {
                            const isHigh = al.level === 'high';
                            const Icon = isHigh ? AlertTriangle : FlaskConical;
                            return (
                                <div key={i} className="flex cursor-pointer items-start gap-[11px] border-b border-slate-100 px-[18px] py-[13px] transition-colors hover:bg-slate-50 last:border-0" style={{ borderWidth: '0.5px' }}>
                                    <div className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[7px] ${isHigh ? 'bg-red-50' : 'bg-amber-50'}`}>
                                        <Icon className={`h-[14px] w-[14px] ${isHigh ? 'text-red-600' : 'text-amber-600'}`} strokeWidth={2} />
                                    </div>
                                    <p className="text-[12px] font-medium leading-[1.45] text-slate-800">{al.text}</p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[14px]" style={{ borderWidth: '0.5px' }}>
                        <h3 className="text-sm font-medium text-slate-800">Admin activity log</h3>
                        <Link to="/activity" className="text-xs text-blue-600 hover:underline">Full log →</Link>
                    </div>
                    {activity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Activity className="h-5 w-5 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-500">No recent activity</p>
                        </div>
                    ) : (
                        activity.map((act, i) => {
                            const AV_COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-red-100 text-red-700'];
                            const initials  = act.text.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
                            return (
                                <div key={i} className="flex items-center gap-[11px] border-b border-slate-100 px-[18px] py-[11px] last:border-0" style={{ borderWidth: '0.5px' }}>
                                    <div className={`flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${AV_COLORS[i % AV_COLORS.length]}`}>
                                        {initials.slice(0, 2) || 'SY'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium leading-snug text-slate-800 truncate">{act.text}</p>
                                    </div>
                                    <span className="flex-shrink-0 text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200/70 bg-white p-[16px_18px] overflow-hidden" style={{ borderWidth: '0.5px' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-3">Quick actions</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                            { label: 'Add Staff',     icon: <UserPlus className="h-[14px] w-[14px]" />,       stroke: 'text-blue-700',   path: '/settings'      },
                            { label: 'Appointments',  icon: <CalendarCheck2 className="h-[14px] w-[14px]" />,  stroke: 'text-purple-700', path: '/appointments'  },
                            { label: 'Ward Mgmt',     icon: <BedDouble className="h-[14px] w-[14px]" />,       stroke: 'text-amber-700',  path: '/ward'          },
                            { label: 'System Config', icon: <Stethoscope className="h-[14px] w-[14px]" />,    stroke: 'text-green-700',  path: '/settings'      },
                        ].map(qa => (
                            <Link key={qa.label} to={qa.path}>
                                <button className="flex w-full items-center gap-[8px] rounded-[8px] border border-slate-200 bg-slate-50 px-[12px] py-[10px] text-left text-[12px] font-medium text-slate-800 transition-colors hover:bg-slate-100" style={{ borderWidth: '0.5px' }}>
                                    <span className={qa.stroke}>{qa.icon}</span>
                                    {qa.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Dashboard — role router
// ---------------------------------------------------------------------------
export default function Dashboard() {
    const { user } = useAuth();
    if (user?.role === 'doctor')       return <DoctorDashboard />;
    if (user?.role === 'receptionist') return <ReceptionistDashboard />;
    return <AdminDashboard />;
}
