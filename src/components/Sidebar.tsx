import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarDays,
    BedDouble,
    Receipt,
    FlaskConical,
    Settings,
    ChevronLeft,
    ChevronRight,
    Hospital,
    LogOut,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useHospital } from '@/contexts/HospitalContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Nav config with section grouping
// ---------------------------------------------------------------------------
// BASE nav groups — Settings is added dynamically below based on role
const BASE_NAV_GROUPS = [
    {
        label: 'MAIN',
        items: [
            { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/' },
        ],
    },
    {
        label: 'MANAGEMENT',
        items: [
            { label: 'Patients',     icon: <Users className="h-4 w-4" />,          path: '/patients'     },
            { label: 'Doctors',      icon: <Stethoscope className="h-4 w-4" />,    path: '/doctors'      },
            { label: 'Appointments', icon: <CalendarDays className="h-4 w-4" />,   path: '/appointments' },
            { label: 'Ward Mgmt',    icon: <BedDouble className="h-4 w-4" />,      path: '/ward'         },
        ],
    },
];

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { hospitalInfo } = useHospital();

    // Full nav structure varies per role — doctors and receptionists
    // see only pages relevant to their workflow.
    const navGroups = user?.role === 'doctor' ? [
        {
            label: 'MAIN',
            items: [
                { label: 'Dashboard',    icon: <LayoutDashboard className="h-4 w-4" />, path: '/'             },
            ],
        },
        {
            label: 'MY WORK',
            items: [
                { label: 'My Patients',  icon: <Users className="h-4 w-4" />,          path: '/patients'     },
                { label: 'Appointments', icon: <CalendarDays className="h-4 w-4" />,   path: '/appointments' },
                { label: 'Lab Reports',  icon: <FlaskConical className="h-4 w-4" />,   path: '/reports'      },
            ],
        },
        {
            label: 'MONITORING',
            items: [
                { label: 'Activity Log', icon: <History className="h-4 w-4" />, path: '/activity' },
            ],
        },
    ] : user?.role === 'receptionist' ? [
        {
            label: 'MAIN',
            items: [
                { label: 'Dashboard',    icon: <LayoutDashboard className="h-4 w-4" />,  path: '/'             },
            ],
        },
        {
            label: 'MANAGEMENT',
            items: [
                { label: 'Patients',     icon: <Users className="h-4 w-4" />,           path: '/patients'     },
                { label: 'Appointments', icon: <CalendarDays className="h-4 w-4" />,    path: '/appointments' },
                { label: 'Ward Mgmt',    icon: <BedDouble className="h-4 w-4" />,       path: '/ward'         },
            ],
        },
        {
            label: 'OPERATIONS',
            items: [
                { label: 'Billing',      icon: <Receipt className="h-4 w-4" />,         path: '/billing'      },
            ],
        },
    ] : [
        // Admin — full access
        ...BASE_NAV_GROUPS,
        {
            label: 'OPERATIONS',
            items: [
                { label: 'Billing',      icon: <Receipt className="h-4 w-4" />,         path: '/billing'   },
                { label: 'Lab Reports',  icon: <FlaskConical className="h-4 w-4" />,    path: '/reports'   },
            ],
        },
        {
            label: 'MONITORING',
            items: [
                { label: 'Activity Log', icon: <History className="h-4 w-4" />,         path: '/activity'  },
                { label: 'Settings',     icon: <Settings className="h-4 w-4" />,         path: '/settings'  },
            ],
        },
    ];

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const NavItem = ({ label, icon, path }: { label: string; icon: React.ReactNode; path: string }) => {
        const active = isActive(path);
        if (collapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            to={path}
                            className={cn(
                                'mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                                active
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:scale-105'
                            )}
                        >
                            {icon}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="border-slate-700 bg-slate-800 text-slate-100 shadow-xl">
                        {label}
                    </TooltipContent>
                </Tooltip>
            );
        }
        return (
            <Link
                to={path}
                className={cn(
                    'group flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                    active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:translate-x-1'
                )}
            >
                <span className="flex-shrink-0">{icon}</span>
                <span className="whitespace-nowrap">{label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
            </Link>
        );
    };

    return (
        <TooltipProvider delayDuration={80}>
            <motion.aside
                animate={{ width: collapsed ? 64 : 236 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="relative flex h-screen flex-shrink-0 flex-col bg-slate-900 text-slate-100 shadow-xl"
            >
                {/* ── Logo + Identity ── */}
                <div className="flex h-[60px] items-center gap-3 border-b border-slate-700/60 px-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow">
                        <Hospital className="h-4.5 w-4.5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.15 }}
                            >
                                <p className="text-sm font-bold tracking-tight leading-tight">{hospitalInfo.name}</p>
                                <p className="text-[10px] text-slate-400 leading-tight">Hospital Management</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── User identity strip ── */}
                {!collapsed && (
                    <div className="border-b border-slate-700/60 px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                                {user?.avatar ?? 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-200 truncate capitalize">{user?.role ?? 'Admin'}</p>
                                <p className="text-[10px] text-slate-500 truncate">{hospitalInfo.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Navigation groups ── */}
                <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            {!collapsed && (
                                <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                                    {group.label}
                                </p>
                            )}
                            {collapsed && <Separator className="mb-2 bg-slate-700/50" />}
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem key={item.path} {...item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* ── System section ── */}
                <div className="border-t border-slate-700/60 px-2 py-2 space-y-0.5">
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-600/80 hover:text-white">
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="border-slate-700 bg-slate-800 text-slate-100">Logout</TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">SYSTEM</p>
                            <button
                                onClick={logout}
                                className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition-all hover:bg-red-600/80 hover:text-white"
                            >
                                <LogOut className="h-4 w-4 flex-shrink-0" /> Logout
                            </button>
                        </>
                    )}
                </div>

                {/* ── Collapse toggle ── */}
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md transition-colors hover:bg-slate-700 hover:text-slate-200"
                >
                    {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>
            </motion.aside>
        </TooltipProvider>
    );
}
