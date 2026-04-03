import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Stethoscope, Phone, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiFetch } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------
type Availability = 'Available' | 'In Surgery' | 'On Leave' | 'Busy';

interface Doctor {
    id: string;
    name: string;
    department: string;
    specialization: string;
    patientsToday: number;
    experience: number;
    contact: string;
    availability: Availability;
}

const initialDoctors: Doctor[] = [
    { id: 'D-001', name: 'Dr. Ananya Bose',  department: 'General Medicine',   specialization: 'Internal Medicine',          patientsToday: 14, experience: 12, contact: '+91 98000 11111', availability: 'Available'  },
    { id: 'D-002', name: 'Dr. Rohan Mehta',  department: 'Orthopedics',         specialization: 'Joint Replacement',           patientsToday: 9,  experience: 8,  contact: '+91 98000 22222', availability: 'In Surgery' },
    { id: 'D-003', name: 'Dr. Neha Singh',   department: 'Neurology',            specialization: 'Neurological Disorders',      patientsToday: 11, experience: 15, contact: '+91 98000 33333', availability: 'Available'  },
    { id: 'D-004', name: 'Dr. Kiran Rao',    department: 'Gastroenterology',    specialization: 'Liver Diseases',              patientsToday: 7,  experience: 10, contact: '+91 98000 44444', availability: 'Busy'       },
    { id: 'D-005', name: 'Dr. Priya Kapoor', department: 'Cardiology',           specialization: 'Interventional Cardiology',  patientsToday: 18, experience: 20, contact: '+91 98000 55555', availability: 'Available'  },
    { id: 'D-006', name: 'Dr. Arun Sharma',  department: 'Pediatrics',           specialization: 'Child Health',               patientsToday: 22, experience: 6,  contact: '+91 98000 66666', availability: 'On Leave'   },
    { id: 'D-007', name: 'Dr. Sunita Joshi', department: 'Gynecology',           specialization: 'Obstetrics',                 patientsToday: 10, experience: 14, contact: '+91 98000 77777', availability: 'Available'  },
];

const departments = [
    'General Medicine', 'Orthopedics', 'Neurology', 'Gastroenterology',
    'Cardiology', 'Pediatrics', 'Gynecology', 'Oncology', 'Radiology',
];

// Availability chip style
const availStyle: Record<Availability, { chip: string; dot: string }> = {
    Available:   { chip: 'bg-green-100  text-green-700  border-green-200',  dot: 'bg-green-500'  },
    'In Surgery':{ chip: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    'On Leave':  { chip: 'bg-slate-100  text-slate-600  border-slate-200',  dot: 'bg-slate-400'  },
    Busy:        { chip: 'bg-red-100    text-red-700    border-red-200',    dot: 'bg-red-500'    },
};

// Avatar background colour — one per doctor index so they're distinct
const avatarColors = [
    'bg-blue-600', 'bg-purple-600', 'bg-teal-600',
    'bg-rose-600', 'bg-amber-600', 'bg-indigo-600', 'bg-pink-600',
];

// Initials helper
function initials(name: string) {
    return name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

type FilterKey = 'All' | Availability;
const FILTERS: FilterKey[] = ['All', 'Available', 'In Surgery', 'Busy', 'On Leave'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Doctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState<FilterKey>('All');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '', department: '', specialization: '', experience: '', contact: '',
    });

    useEffect(() => {
        apiFetch('/doctors')
            .then((data: any[]) => {
                const availMap: Record<string, Availability> = {
                        AVAILABLE: 'Available',
                        IN_SURGERY: 'In Surgery',
                        ON_LEAVE: 'On Leave',
                        BUSY: 'Busy',
                    };
                const mapped: Doctor[] = data.map(d => ({
                    id: d.id,
                    name: d.name,
                    department: d.department,
                    specialization: d.specialization,
                    experience: d.experience,
                    contact: d.contact,
                    patientsToday: d.patientsToday ?? 0,
                    availability: (availMap[d.availability] ?? 'Available') as Availability,
                }));
                // Show real DB doctors first, then append mock demos
                setDoctors([...mapped, ...initialDoctors]);
            })
            .catch(() => {
                // If API fails (not logged in yet, etc.) fall back to mock data
                setDoctors(initialDoctors);
            });
    }, []);

    const filtered = doctors.filter((d) => {
        const matchSearch =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.department.toLowerCase().includes(search.toLowerCase()) ||
            d.specialization.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || d.availability === filter;
        return matchSearch && matchFilter;
    });

    const handleAddDoctor = async () => {
        if (!newDoctor.name || !newDoctor.department) return;
        setSaving(true);
        try {
            const result = await apiFetch('/doctors', {
                method: 'POST',
                body: JSON.stringify({
                    name: newDoctor.name,
                    department: newDoctor.department,
                    specialization: newDoctor.specialization || 'General',
                    experience: parseInt(newDoctor.experience) || 0,
                    contact: newDoctor.contact,
                }),
            });

            const doctor: Doctor = {
                id: result.id,
                name: result.name,
                department: result.department,
                specialization: result.specialization,
                experience: result.experience,
                contact: result.contact,
                patientsToday: 0,
                availability: 'Available',
            };

            setDoctors(prev => [doctor, ...prev]);
            setNewDoctor({ name: '', department: '', specialization: '', experience: '', contact: '' });
            setShowAddDialog(false);
            toast.success(`${doctor.name} added and saved to database!`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to add doctor');
        } finally {
            setSaving(false);
        }
    };

    const counts = {
        total:     doctors.length,
        available: doctors.filter((d) => d.availability === 'Available').length,
        patients:  doctors.reduce((a, d) => a + d.patientsToday, 0),
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Staff</h1>
                    <p className="text-sm text-slate-500">Doctor profiles, availability and patient load</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Doctor
                </Button>
            </div>

            {/* ── Summary strip ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Doctors',  value: counts.total,     color: 'text-blue-600',   bg: 'bg-blue-50',   icon: <Stethoscope className="h-7 w-7" /> },
                    { label: 'Available Now',  value: counts.available,  color: 'text-green-600',  bg: 'bg-green-50',  icon: <Users className="h-7 w-7" />       },
                    { label: 'Patients Today', value: counts.patients,   color: 'text-purple-600', bg: 'bg-purple-50', icon: <Clock className="h-7 w-7" />       },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`${s.bg} border-0 shadow-sm`}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <span className={s.color}>{s.icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                                    <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Search + filter chips ── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by name, department, specialization…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map((f) => {
                        const count = f === 'All' ? doctors.length : doctors.filter((d) => d.availability === f).length;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                    filter === f
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                }`}
                            >
                                {f} <span className="opacity-70">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Doctor card grid ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((doctor, i) => {
                    const avail  = availStyle[doctor.availability];
                    const bgColor = avatarColors[i % avatarColors.length];
                    return (
                        <motion.div
                            key={doctor.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.04 }}
                        >
                            <Card className="group shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 overflow-hidden">
                                {/* Coloured top stripe */}
                                <div className={`h-1.5 w-full ${bgColor}`} />
                                <CardContent className="p-5 space-y-4">
                                    {/* Top row: avatar + name + availability */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-sm shadow ${bgColor}`}>
                                                {initials(doctor.name)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 leading-tight">{doctor.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${avail.chip}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${avail.dot}`} />
                                            {doctor.availability}
                                        </span>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-lg bg-slate-50 p-2.5">
                                            <p className="text-slate-400 font-medium uppercase tracking-wide text-[9px]">Department</p>
                                            <p className="text-slate-700 font-semibold mt-0.5 leading-tight">{doctor.department}</p>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 p-2.5">
                                            <p className="text-slate-400 font-medium uppercase tracking-wide text-[9px]">Experience</p>
                                            <p className="text-slate-700 font-semibold mt-0.5">{doctor.experience} yrs</p>
                                        </div>
                                    </div>

                                    {/* Patients today + contact */}
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Users className="h-3.5 w-3.5" />
                                            <span><span className="font-semibold text-slate-700">{doctor.patientsToday}</span> patients today</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Phone className="h-3 w-3" />
                                            <span className="font-mono">{doctor.contact}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Add Doctor Dialog ── */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input placeholder="Full Name (e.g. Dr. Raj Gupta) *" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} />
                        <Select value={newDoctor.department} onValueChange={(v) => setNewDoctor({ ...newDoctor, department: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Department *" /></SelectTrigger>
                            <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="Specialization" value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Years of Experience" type="number" value={newDoctor.experience} onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })} />
                            <Input placeholder="Contact Number" value={newDoctor.contact} onChange={(e) => setNewDoctor({ ...newDoctor, contact: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddDoctor} disabled={saving}>
                            {saving ? 'Saving…' : 'Add Doctor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
