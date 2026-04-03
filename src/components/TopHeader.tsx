import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHospital } from '@/contexts/HospitalContext';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
// Notification preferences key — matches Settings.tsx
// ---------------------------------------------------------------------------
const NOTIF_PREFS_KEY = 'mediflow_notif_prefs';
const DEFAULT_PREFS = {
    newPatient: true, labReady: true, appointmentBooked: true,
    invoiceGenerated: true, doctorAdded: false, invoicePaid: false,
};

// Maps actionType → pref key
const ACTION_TO_PREF: Record<string, keyof typeof DEFAULT_PREFS> = {
    patient:     'newPatient',
    lab:         'labReady',
    appointment: 'appointmentBooked',
    billing:     'invoiceGenerated',
    doctor:      'doctorAdded',
};

interface LogEntry { id: string; actionType: string; message: string; actor: string; timestamp: string; }

const SEARCH_PLACEHOLDER = {
    admin:        'Search patients, doctors…',
    doctor:       'Search my patients…',
    receptionist: 'Search patients, appointments…',
};

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)   return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TopHeader() {
    const { user, logout } = useAuth();
    const { hospitalInfo } = useHospital();
    const [searchValue, setSearchValue] = useState('');
    const [notifications, setNotifications] = useState<{ text: string; time: string; urgent: boolean }[]>([]);
    const [open, setOpen] = useState(false);

    // Fetch real notifications from activity log on bell open
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
                    text: l.message,
                    time: timeAgo(l.timestamp),
                    urgent: ['patient', 'lab'].includes(l.actionType),
                })));
            })
            .catch(() => {
                // fallback: show nothing (not logged in yet or server down)
                setNotifications([]);
            });
    }, [open]); // re-fetch whenever bell is opened

    const role        = (user?.role ?? 'admin') as keyof typeof SEARCH_PLACEHOLDER;
    const placeholder = SEARCH_PLACEHOLDER[role] ?? SEARCH_PLACEHOLDER.admin;
    const unreadCount = notifications.filter(n => n.urgent).length;

    return (
        <header className="flex h-[60px] flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder={placeholder}
                    className="h-9 border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-blue-400"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Notification bell */}
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
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

                {/* User avatar + name */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-slate-100">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {user?.avatar ?? 'A'}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name ?? 'Admin User'}</p>
                                <p className="text-[11px] leading-tight text-slate-400 capitalize">{user?.role ?? 'Administrator'}</p>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs text-slate-500">{hospitalInfo.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer text-slate-700">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 cursor-pointer gap-2" onClick={logout}>
                            <LogOut className="h-3.5 w-3.5" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
