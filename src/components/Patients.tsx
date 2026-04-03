import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Plus, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/services/api';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------
type PatientStatus = 'OPD' | 'Admitted' | 'Discharged';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    condition: string;
    doctor: string;
    ward: string;
    admittedOn: string;
    status: PatientStatus;
    contact: string;
}

const initialPatients: Patient[] = [
    { id: 'P-001', name: 'Rahul Verma', age: 34, gender: 'Male', condition: 'Hypertension', doctor: 'Dr. Ananya Bose', ward: 'General', admittedOn: '2026-03-01', status: 'Admitted', contact: '+91 98765 43210' },
    { id: 'P-002', name: 'Priya Sharma', age: 27, gender: 'Female', condition: 'Appendicitis', doctor: 'Dr. Rohan Mehta', ward: 'Surgery', admittedOn: '2026-03-04', status: 'Admitted', contact: '+91 97654 32109' },
    { id: 'P-003', name: 'Arjun Patel', age: 52, gender: 'Male', condition: 'Cardiac Arrest', doctor: 'Dr. Neha Singh', ward: 'ICU', admittedOn: '2026-03-05', status: 'Admitted', contact: '+91 96543 21098' },
    { id: 'P-004', name: 'Sunita Iyer', age: 45, gender: 'Female', condition: 'Diabetes', doctor: 'Dr. Ananya Bose', ward: 'General', admittedOn: '2026-03-03', status: 'OPD', contact: '+91 95432 10987' },
    { id: 'P-005', name: 'Vikram Desai', age: 60, gender: 'Male', condition: 'Knee Replacement', doctor: 'Dr. Rohan Mehta', ward: 'Ortho', admittedOn: '2026-02-28', status: 'Discharged', contact: '+91 94321 09876' },
    { id: 'P-006', name: 'Meera Nair', age: 31, gender: 'Female', condition: 'Pneumonia', doctor: 'Dr. Kiran Rao', ward: 'General', admittedOn: '2026-03-02', status: 'Admitted', contact: '+91 93210 98765' },
    { id: 'P-007', name: 'Aditya Kumar', age: 22, gender: 'Male', condition: 'Fracture - Arm', doctor: 'Dr. Rohan Mehta', ward: 'Emergency', admittedOn: '2026-03-06', status: 'Admitted', contact: '+91 92109 87654' },
    { id: 'P-008', name: 'Deepa Menon', age: 39, gender: 'Female', condition: 'Migraine', doctor: 'Dr. Neha Singh', ward: 'Neurology', admittedOn: '2026-03-05', status: 'OPD', contact: '+91 91098 76543' },
    { id: 'P-009', name: 'Sanjay Gupta', age: 58, gender: 'Male', condition: 'Liver Cirrhosis', doctor: 'Dr. Kiran Rao', ward: 'ICU', admittedOn: '2026-03-03', status: 'Admitted', contact: '+91 90987 65432' },
    { id: 'P-010', name: 'Kavitha Reddy', age: 44, gender: 'Female', condition: 'Typhoid Fever', doctor: 'Dr. Ananya Bose', ward: 'General', admittedOn: '2026-03-01', status: 'Discharged', contact: '+91 89876 54321' },
];

// Doctor option loaded from live API
interface DoctorOption { id: string; name: string; department: string; }

// Left border accent per status
const rowAccent: Record<PatientStatus, string> = {
    Admitted:   'border-l-4 border-l-blue-400',
    OPD:        'border-l-4 border-l-amber-400',
    Discharged: 'border-l-4 border-l-green-400',
};

type FilterKey = 'All' | PatientStatus;
const FILTERS: { key: FilterKey; label: string; color: string }[] = [
    { key: 'All',        label: 'All',        color: 'bg-slate-600' },
    { key: 'Admitted',   label: 'Admitted',   color: 'bg-blue-600'  },
    { key: 'OPD',        label: 'OPD',        color: 'bg-amber-500' },
    { key: 'Discharged', label: 'Discharged', color: 'bg-green-600' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Patients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [liveDoctors, setLiveDoctors] = useState<DoctorOption[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterKey>('All');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '', age: '', gender: 'Male', condition: '', doctor: '', contact: '',
    });

    useEffect(() => {
        // Load patients
        apiFetch("/patients")
            .then((data) => {
                const mapped = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    condition: p.condition || '-',
                    doctor: p.doctor || 'Unassigned',
                    ward: p.ward || 'General',
                    admittedOn: new Date(p.createdAt).toISOString().split('T')[0],
                    status: p.status || 'OPD',
                    contact: p.contact || '-',
                }));
                setPatients([...mapped, ...initialPatients]);
            })
            .catch(console.error);

        // Load live doctors for the dropdown
        apiFetch("/doctors")
            .then((data: any[]) => {
                setLiveDoctors(data.map(d => ({ id: d.id, name: d.name, department: d.department })));
            })
            .catch(console.error);
    }, []);

    const filtered = patients.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase()) ||
            p.condition.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleAddPatient = async () => {
        if (!newPatient.name || !newPatient.condition || !newPatient.doctor) return;
        setSaving(true);
        try {
            const result = await apiFetch("/patients", {
                method: "POST",
                body: JSON.stringify({
                    name: newPatient.name,
                    age: parseInt(newPatient.age) || 0,
                    gender: newPatient.gender,
                    condition: newPatient.condition,
                    doctor: newPatient.doctor,
                    ward: 'General',
                    status: 'OPD',
                    contact: newPatient.contact,
                }),
            });

            const patient: Patient = {
                id: result.id,
                name: result.name,
                age: result.age,
                gender: result.gender,
                condition: result.condition,
                doctor: result.doctor,
                ward: result.ward,
                admittedOn: new Date(result.createdAt).toISOString().split('T')[0],
                status: result.status,
                contact: result.contact,
            };

            setPatients((prev) => [patient, ...prev]);
            setNewPatient({ name: '', age: '', gender: 'Male', condition: '', doctor: '', contact: '' });
            setShowAddDialog(false);
            toast.success(`Patient ${patient.name} registered and saved to database!`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to register patient');
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = (id: string) => {
        const patient = patients.find((p) => p.id === id);
        setPatients((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'Discharged' } : p))
        );
        if (patient) toast.success(`${patient.name} discharged successfully`);
    };

    // Summary counts
    const admittedCount = patients.filter((p) => p.status === 'Admitted').length;
    const opdCount = patients.filter((p) => p.status === 'OPD').length;
    const dischargedCount = patients.filter((p) => p.status === 'Discharged').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patient Management</h1>
                    <p className="text-sm text-slate-500">Register, manage and track all hospital patients</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Register Patient
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Admitted', count: admittedCount, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'OPD', count: opdCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Discharged', count: dischargedCount, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((s) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className={`${s.bg} border-0 shadow-sm`}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <UserRound className={`h-8 w-8 ${s.color}`} />
                                <div>
                                    <p className="text-2xl font-bold text-slate-800">{s.count}</p>
                                    <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search + filter chips */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search by name, ID, or condition…"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {FILTERS.map(({ key, label }) => {
                                const count = key === 'All' ? patients.length : patients.filter((p) => p.status === key).length;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilterStatus(key)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                            filterStatus === key
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                        }`}
                                    >
                                        {label} <span className="opacity-70">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-24">ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Ward</TableHead>
                                <TableHead>Admitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((patient) => (
                                <TableRow key={patient.id} className={`hover:bg-slate-50 ${rowAccent[patient.status]}`}>
                                    <TableCell className="font-mono text-xs text-slate-500">{patient.id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-800">{patient.name}</p>
                                            <p className="text-xs text-slate-400">{patient.age}y · {patient.gender}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{patient.condition}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{patient.doctor}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{patient.ward}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{patient.admittedOn}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                            patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : patient.status === 'OPD'      ? 'bg-amber-100 text-amber-700 border-amber-200'
                                            :                                  'bg-green-100 text-green-700 border-green-200'
                                        }`}>
                                            {patient.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/patients/${patient.id}`}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                            {patient.status === 'Admitted' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleDischarge(patient.id)}
                                                >
                                                    Discharge
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-slate-400">
                                        No patients found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Patient Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Register New Patient</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input placeholder="Full Name *" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Age *" type="number" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} />
                            <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Input placeholder="Condition / Diagnosis *" value={newPatient.condition} onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })} />
                        <Select value={newPatient.doctor} onValueChange={(v) => setNewPatient({ ...newPatient, doctor: v })}>
                            <SelectTrigger><SelectValue placeholder="Assign Doctor *" /></SelectTrigger>
                            <SelectContent>
                                {liveDoctors.length === 0 && (
                                    <SelectItem value="__none" disabled>No doctors registered yet</SelectItem>
                                )}
                                {liveDoctors.map((d) => (
                                    <SelectItem key={d.id} value={d.name}>
                                        {d.name} — {d.department}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Contact Number" value={newPatient.contact} onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddPatient} disabled={saving}>
                            {saving ? 'Registering…' : 'Register'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
