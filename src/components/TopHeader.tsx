import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHospital } from '@/contexts/HospitalContext';
import { Bell, ChevronDown, LogOut, Settings, MessageSquare } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/services/api';

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------
const NOTIF_PREFS_KEY = 'mediflow_notif_prefs';
const DEFAULT_PREFS = {
    newPatient: true, labReady: true, appointmentBooked: true,
    invoiceGenerated: true, doctorAdded: false, invoicePaid: false,
};
const ACTION_TO_PREF: Record<string, keyof typeof DEFAULT_PREFS> = {
    patient: 'newPatient', lab: 'labReady', appointment: 'appointmentBooked',
    billing: 'invoiceGenerated', doctor: 'doctorAdded',
};
interface LogEntry { id: string; actionType: string; message: string; actor: string; timestamp: string; }

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `${Math.floor(diff)}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Page metadata per route
// ---------------------------------------------------------------------------
const PAGE_META: Record<string, { title: string; sub: string }> = {
    '/':            { title: 'Dashboard',      sub: 'Overview of hospital operations today' },
    '/patients':    { title: 'Patients',       sub: 'Manage and track all patients' },
    '/doctors':     { title: 'Doctors',        sub: 'Medical staff directory' },
    '/appointments':{ title: 'Appointments',   sub: 'Schedule and manage consultations' },
    '/ward':        { title: 'Ward Management',sub: 'Real-time bed and ward status' },
    '/billing':     { title: 'Billing',        sub: 'Invoices and payment records' },
    '/reports':     { title: 'Lab Reports',    sub: 'Test orders, results and uploads' },
    '/activity':    { title: 'Activity Log',   sub: 'Audit trail of all system actions' },
    '/settings':    { title: 'Settings',       sub: 'Hospital configuration and preferences' },
};

// ---------------------------------------------------------------------------
// TopHeader
// ---------------------------------------------------------------------------
export default function TopHeader() {
    const { user, logout } = useAuth();
    const { hospitalInfo } = useHospital();
    const location = useLocation();
    const [notifications, setNotifications] = useState<{ text: string; time: string; urgent: boolean }[]>([]);
    const [bellOpen, setBellOpen] = useState(false);

    // Resolve page title/sub
    const routeKey = Object.keys(PAGE_META)
        .filter(k => k !== '/')
        .find(k => location.pathname.startsWith(k)) ?? (location.pathname === '/' ? '/' : '/');
    const meta = PAGE_META[routeKey] ?? { title: 'Dashboard', sub: '' };

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // On dashboard show greeting, elsewhere show page title
    const isDashboard = location.pathname === '/';
    const headerTitle = isDashboard ? `${greeting}, ${user?.name ?? 'Welcome'}` : meta.title;
    const headerSub   = isDashboard
        ? `${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${user?.department ? `  ·  ${user.department}` : ''}`
        : meta.sub;

    useEffect(() => {
        const prefs: typeof DEFAULT_PREFS = (() => {
            try { return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || 'null') ?? DEFAULT_PREFS; }
            catch { return DEFAULT_PREFS; }
        })();
        apiFetch('/activity-log')
            .then((logs: LogEntry[]) => {
                const enabled = logs.filter(l => {
                    const prefKey = ACTION_TO_PREF[l.actionType];
                    return prefKey ? prefs[prefKey] : false;
                });
                setNotifications(enabled.slice(0, 8).map(l => ({
                    text:   l.message,
                    time:   timeAgo(l.timestamp),
                    urgent: ['patient', 'lab'].includes(l.actionType),
                })));
            })
            .catch(() => setNotifications([]));
    }, [bellOpen]);

    const unreadCount = notifications.filter(n => n.urgent).length;

    return (
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-200/70 bg-white px-6"
            style={{ boxShadow: 'none', borderBottomWidth: '0.5px' }}>

            {/* Left — page title / greeting */}
            <div>
                <h2 className="text-[15px] font-semibold leading-tight text-slate-800">{headerTitle}</h2>
                <p className="text-[11px] leading-tight text-slate-400 mt-0.5">{headerSub}</p>
            </div>

            {/* Right — icon buttons + user pill */}
            <div className="flex items-center gap-2">


                {/* Messages icon button */}
                <button className="relative flex h-9 w-9 items-center justify-center rounded-[9px] border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
                    <MessageSquare className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>

                {/* Notification bell */}
                <DropdownMenu open={bellOpen} onOpenChange={setBellOpen}>
                    <DropdownMenuTrigger asChild>
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-[9px] border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
                            <Bell className="h-[17px] w-[17px]" strokeWidth={1.8} />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-[1.5px] border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            Notifications
                            <span className="text-xs font-normal text-slate-400">{unreadCount} new</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                                No notifications yet.<br />
                                <span className="text-[10px]">Enable types in Settings → Notifications</span>
                            </div>
                        ) : (
                            notifications.map((n, i) => (
                                <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2.5">
                                    <div className="flex items-start gap-2">
                                        <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.urgent ? 'bg-red-500' : 'bg-blue-400'}`} />
                                        <span className="text-sm leading-snug text-slate-700">{n.text}</span>
                                    </div>
                                    <span className="ml-4 text-xs text-slate-400">{n.time}</span>
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/activity" className="justify-center text-xs text-blue-600 cursor-pointer">
                                View all in Activity Log →
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User pill */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 rounded-[24px] border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 transition-colors hover:bg-slate-100">
                            <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                                {user?.avatar ?? 'A'}
                            </div>
                            <div className="hidden text-left md:block">
                                <p className="text-[13px] font-medium leading-tight text-slate-800">{user?.name ?? 'Admin'}</p>
                                <p className="text-[10px] leading-tight text-slate-400 capitalize">{user?.role ?? 'admin'}</p>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs text-slate-500">{hospitalInfo.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user?.role === 'admin' && (
                            <DropdownMenuItem asChild>
                                <Link to="/settings" className="cursor-pointer text-slate-700 flex items-center gap-2">
                                    <Settings className="h-3.5 w-3.5" /> Settings
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {user?.role === 'admin' && <DropdownMenuSeparator />}
                        <DropdownMenuItem className="text-red-600 cursor-pointer gap-2" onClick={logout}>
                            <LogOut className="h-3.5 w-3.5" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
