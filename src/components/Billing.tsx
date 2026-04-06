import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiFetch } from '@/services/api';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BillStatus = 'Paid' | 'Pending' | 'Overdue';

interface Bill {
    id: string;
    invoiceNumber?: number;
    patientId: string;
    patientName: string;
    doctor: string;
    doctorFee: number;
    labTests: number;
    medication: number;
    roomCharges: number;
    date: string;
    status: BillStatus;
}

interface PatientOption { id: string; name: string; doctor: string; }

// ---------------------------------------------------------------------------
// Mock demo data — keeps the UI populated for new visitors
// ---------------------------------------------------------------------------
const mockBills: Bill[] = [
    { id: 'INV-001', patientId: 'P-001', patientName: 'Rahul Verma',   doctor: 'Dr. Ananya Bose',  doctorFee: 1500, labTests: 2200, medication: 800,  roomCharges: 3000, date: '2026-03-01', status: 'Paid'    },
    { id: 'INV-002', patientId: 'P-002', patientName: 'Priya Sharma',  doctor: 'Dr. Rohan Mehta',  doctorFee: 2000, labTests: 3400, medication: 1200, roomCharges: 4000, date: '2026-03-04', status: 'Pending' },
    { id: 'INV-003', patientId: 'P-003', patientName: 'Arjun Patel',   doctor: 'Dr. Neha Singh',   doctorFee: 3000, labTests: 5000, medication: 2500, roomCharges: 7000, date: '2026-03-05', status: 'Pending' },
    { id: 'INV-004', patientId: 'P-004', patientName: 'Sunita Iyer',   doctor: 'Dr. Ananya Bose',  doctorFee: 800,  labTests: 1200, medication: 500,  roomCharges: 0,    date: '2026-03-03', status: 'Paid'    },
    { id: 'INV-005', patientId: 'P-005', patientName: 'Vikram Desai',  doctor: 'Dr. Rohan Mehta',  doctorFee: 5000, labTests: 2000, medication: 3000, roomCharges: 6000, date: '2026-02-28', status: 'Paid'    },
    { id: 'INV-006', patientId: 'P-006', patientName: 'Meera Nair',    doctor: 'Dr. Kiran Rao',    doctorFee: 1500, labTests: 2500, medication: 900,  roomCharges: 3000, date: '2026-03-02', status: 'Overdue' },
    { id: 'INV-007', patientId: 'P-007', patientName: 'Aditya Kumar',  doctor: 'Dr. Rohan Mehta',  doctorFee: 2500, labTests: 1800, medication: 600,  roomCharges: 2000, date: '2026-03-06', status: 'Pending' },
];

const statusColors: Record<BillStatus, string> = {
    Paid:    'bg-green-100 text-green-700 border-green-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Overdue: 'bg-red-100   text-red-700   border-red-200',
};

const rowTint: Record<BillStatus, string> = {
    Paid:    'bg-green-50/40',
    Pending: '',
    Overdue: 'bg-red-50/60',
};

type BillFilter = 'All' | BillStatus;
const BILL_FILTERS: BillFilter[] = ['All', 'Paid', 'Pending', 'Overdue'];

const formatINR = (amount: number) => '₹' + amount.toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Billing() {
    const [bills, setBills]           = useState<Bill[]>(mockBills);
    const [patients, setPatients]     = useState<PatientOption[]>([]);
    const [search, setSearch]         = useState('');
    const [billFilter, setBillFilter] = useState<BillFilter>('All');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [saving, setSaving]         = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
    const [newBill, setNewBill] = useState({
        patientId: '', doctorFee: '', labTests: '', medication: '', roomCharges: '',
    });

    // ── Load data ────────────────────────────────────────────────────────────
    useEffect(() => {
        // Load real invoices from DB — use mock only as fallback
        apiFetch('/billing')
            .then((data: Bill[]) => setBills(data))
            .catch(() => setBills(mockBills));

        // Load patients for the dropdown
        apiFetch('/patients')
            .then((data: any[]) =>
                setPatients(data.map(p => ({
                    id:     p.id,
                    name:   p.name,
                    doctor: p.doctor || 'Unassigned',
                })))
            )
            .catch(console.error);
    }, []);

    // ── When a patient is selected, auto-fill their doctor ──────────────────
    const handlePatientSelect = (patientId: string) => {
        const p = patients.find(pt => pt.id === patientId);
        setSelectedPatient(p || null);
        setNewBill(prev => ({ ...prev, patientId }));
    };

    // ── Filtering ────────────────────────────────────────────────────────────
    const filtered = bills.filter(
        (b) =>
            (b.patientName.toLowerCase().includes(search.toLowerCase()) ||
             b.id.toLowerCase().includes(search.toLowerCase())) &&
            (billFilter === 'All' || b.status === billFilter)
    );

    // ── Summary totals ───────────────────────────────────────────────────────
    const totalRevenue = bills.filter(b => b.status === 'Paid')   .reduce((a, b) => a + b.doctorFee + b.labTests + b.medication + b.roomCharges, 0);
    const totalPending = bills.filter(b => b.status === 'Pending').reduce((a, b) => a + b.doctorFee + b.labTests + b.medication + b.roomCharges, 0);
    const totalOverdue = bills.filter(b => b.status === 'Overdue').reduce((a, b) => a + b.doctorFee + b.labTests + b.medication + b.roomCharges, 0);

    // ── Mark Paid (real DB bills) ────────────────────────────────────────────
    const handleMarkPaid = async (id: string) => {
        // Check if this is a mock bill (starts with 'INV-') — update locally only
        if (id.startsWith('INV-')) {
            setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid' } : b));
            toast.success('Invoice marked as paid');
            return;
        }
        try {
            await apiFetch(`/billing/${id}/pay`, { method: 'PATCH' });
            setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid' } : b));
            toast.success('Invoice marked as paid');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update invoice');
        }
    };

    // ── Mark Overdue ─────────────────────────────────────────────────────────
    const handleMarkOverdue = async (id: string) => {
        if (id.startsWith('INV-')) {
            setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Overdue' } : b));
            toast.success('Invoice marked as overdue');
            return;
        }
        try {
            await apiFetch(`/billing/${id}/overdue`, { method: 'PATCH' });
            setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Overdue' } : b));
            toast.success('Invoice marked as overdue');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update invoice');
        }
    };

    // ── Generate Invoice ─────────────────────────────────────────────────────
    const handleAddBill = async () => {
        if (!newBill.patientId) {
            toast.error('Please select a patient');
            return;
        }
        setSaving(true);
        try {
            const result = await apiFetch('/billing', {
                method: 'POST',
                body: JSON.stringify({
                    patientId:   newBill.patientId,
                    doctorName:  selectedPatient?.doctor || 'Unassigned',
                    doctorFee:   parseFloat(newBill.doctorFee)   || 0,
                    labTests:    parseFloat(newBill.labTests)    || 0,
                    medication:  parseFloat(newBill.medication)  || 0,
                    roomCharges: parseFloat(newBill.roomCharges) || 0,
                }),
            });
            setBills(prev => [result, ...prev]);
            setNewBill({ patientId: '', doctorFee: '', labTests: '', medication: '', roomCharges: '' });
            setSelectedPatient(null);
            setShowAddDialog(false);
            toast.success(`Invoice generated for ${result.patientName}!`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate invoice');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Financial header banner ── */}
            <div className="rounded-2xl bg-emerald-950 p-6 text-white shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Billing &amp; Invoices</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">{formatINR(totalRevenue)}</h1>
                        <p className="mt-0.5 text-sm text-emerald-300">Total revenue collected</p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow">
                        <Plus className="mr-2 h-4 w-4" /> Generate Invoice
                    </Button>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Revenue Collected', value: formatINR(totalRevenue), sub: `${bills.filter(b => b.status === 'Paid').length} invoices paid`,     color: 'text-emerald-300' },
                        { label: 'Pending',           value: formatINR(totalPending), sub: `${bills.filter(b => b.status === 'Pending').length} invoices pending`, color: 'text-amber-300'   },
                        { label: 'Overdue',           value: formatINR(totalOverdue), sub: `${bills.filter(b => b.status === 'Overdue').length} invoices overdue`, color: 'text-red-300'     },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                            <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
                            <p className="mt-1 text-xl font-bold">{s.value}</p>
                            <p className="text-[10px] text-white/50 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Filter chips + search ── */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Search by patient name or invoice ID…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            {BILL_FILTERS.map((f) => {
                                const count = f === 'All' ? bills.length : bills.filter((b) => b.status === f).length;
                                return (
                                    <button key={f} onClick={() => setBillFilter(f)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                            billFilter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                        }`}>
                                        {f} <span className="opacity-70">({count})</span>
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
                                <TableHead className="w-28">Invoice ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead className="text-right">Doctor Fee</TableHead>
                                <TableHead className="text-right">Lab Tests</TableHead>
                                <TableHead className="text-right">Medication</TableHead>
                                <TableHead className="text-right">Room</TableHead>
                                <TableHead className="text-right font-bold">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-10 text-center text-slate-400">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((bill) => {
                                const total = bill.doctorFee + bill.labTests + bill.medication + bill.roomCharges;
                                return (
                                    <TableRow key={bill.id} className={`hover:brightness-95 transition-all ${rowTint[bill.status]}`}>
                                        <TableCell className="font-mono text-xs text-slate-500" title={bill.id}>
                                            {bill.id.startsWith('INV-') ? bill.id : (bill.invoiceNumber ? `INV-${String(bill.invoiceNumber).padStart(3, '0')}` : bill.id.slice(0, 8) + '…')}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-slate-800">{bill.patientName}</p>
                                            <p className="text-xs text-slate-400">{bill.date}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">{bill.doctor}</TableCell>
                                        <TableCell className="text-right text-sm">{formatINR(bill.doctorFee)}</TableCell>
                                        <TableCell className="text-right text-sm">{formatINR(bill.labTests)}</TableCell>
                                        <TableCell className="text-right text-sm">{formatINR(bill.medication)}</TableCell>
                                        <TableCell className="text-right text-sm">{formatINR(bill.roomCharges)}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-800">{formatINR(total)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[bill.status]}`}>
                                                {bill.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {bill.status !== 'Paid' && (
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleMarkPaid(bill.id)}>
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                {bill.status === 'Pending' && (
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => handleMarkOverdue(bill.id)}>
                                                        Overdue
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Generate Invoice Dialog ── */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">

                        {/* Patient — live dropdown */}
                        <Select value={newBill.patientId} onValueChange={handlePatientSelect}>
                            <SelectTrigger><SelectValue placeholder="Select Patient *" /></SelectTrigger>
                            <SelectContent>
                                {patients.length === 0 && (
                                    <SelectItem value="__none" disabled>No patients registered yet</SelectItem>
                                )}
                                {patients.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Doctor — auto-filled, read-only */}
                        {selectedPatient && (
                            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                <span className="text-xs text-slate-400 block mb-0.5">Assigned Doctor</span>
                                {selectedPatient.doctor}
                            </div>
                        )}

                        {/* Charges grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Doctor Fee (₹)"    type="number" value={newBill.doctorFee}   onChange={(e) => setNewBill({ ...newBill, doctorFee:   e.target.value })} />
                            <Input placeholder="Lab Tests (₹)"     type="number" value={newBill.labTests}    onChange={(e) => setNewBill({ ...newBill, labTests:    e.target.value })} />
                            <Input placeholder="Medication (₹)"    type="number" value={newBill.medication}  onChange={(e) => setNewBill({ ...newBill, medication:  e.target.value })} />
                            <Input placeholder="Room Charges (₹)"  type="number" value={newBill.roomCharges} onChange={(e) => setNewBill({ ...newBill, roomCharges: e.target.value })} />
                        </div>

                        {/* Live total preview */}
                        {(newBill.doctorFee || newBill.labTests || newBill.medication || newBill.roomCharges) && (
                            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm">
                                <span className="text-emerald-600 font-semibold">Total: </span>
                                <span className="font-bold text-slate-800">
                                    {formatINR(
                                        (parseFloat(newBill.doctorFee)   || 0) +
                                        (parseFloat(newBill.labTests)    || 0) +
                                        (parseFloat(newBill.medication)  || 0) +
                                        (parseFloat(newBill.roomCharges) || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddBill} disabled={saving}>
                            {saving ? 'Generating…' : 'Generate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
