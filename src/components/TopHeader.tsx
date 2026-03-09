import { useState } from 'react';
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

// Role-specific notification feeds
const NOTIFICATIONS = {
    admin: [
        { text: 'ICU Bed 9 — ventilator alert',            time: '5 min ago',  urgent: true  },
        { text: 'Rahul Sharma — High BP (180/110)',         time: '12 min ago', urgent: true  },
        { text: 'Lab report LAB-003 is ready',             time: '18 min ago', urgent: false },
        { text: 'Emergency beds at 90% capacity',          time: '25 min ago', urgent: true  },
    ],
    doctor: [
        { text: 'Lab report ready — Rahul Sharma (CBC)',   time: '3 min ago',  urgent: true  },
        { text: 'New appointment added — Priya Kapoor',    time: '10 min ago', urgent: false },
        { text: 'Patient Arjun Patel marked critical',     time: '14 min ago', urgent: true  },
        { text: 'Follow-up reminder — Deepa Menon (2 PM)', time: '20 min ago', urgent: false },
    ],
    receptionist: [
        { text: 'Appointment #APT-012 rescheduled',        time: '4 min ago',  urgent: false },
        { text: 'New patient registration pending — P-085',time: '9 min ago',  urgent: true  },
        { text: 'Bed assigned — Ward C, Bed 14',           time: '15 min ago', urgent: false },
        { text: '3 patients in waiting room past slot',    time: '22 min ago', urgent: true  },
    ],
};

const SEARCH_PLACEHOLDER = {
    admin:        'Search patients, doctors…',
    doctor:       'Search my patients…',
    receptionist: 'Search patients, appointments…',
};

export default function TopHeader() {
    const { user, logout } = useAuth();
    const { hospitalInfo } = useHospital();
    const [searchValue, setSearchValue] = useState('');

    // Pick role-specific data (fallback to admin)
    const role        = user?.role ?? 'admin';
    const notifications = NOTIFICATIONS[role];
    const placeholder   = SEARCH_PLACEHOLDER[role];
    const unreadCount   = notifications.filter((n) => n.urgent).length;


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
                <DropdownMenu>
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
                            <span className="text-xs font-normal text-slate-400">{unreadCount} urgent</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.map((n, i) => (
                            <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2.5">
                                <div className="flex items-start gap-2">
                                    <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.urgent ? 'bg-red-500' : 'bg-blue-400'}`} />
                                    <span className="text-sm leading-snug text-slate-700">{n.text}</span>
                                </div>
                                <span className="ml-4 text-xs text-slate-400">{n.time}</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/activity" className="justify-center text-xs text-blue-600 cursor-pointer">
                                View all notifications
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
                        {user?.role === 'admin' && (
                            <DropdownMenuItem asChild>
                                <Link to="/settings" className="cursor-pointer text-slate-700">
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer gap-2"
                            onClick={logout}
                        >
                            <LogOut className="h-3.5 w-3.5" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
