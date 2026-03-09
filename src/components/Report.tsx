import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
// Types & mock data
// ---------------------------------------------------------------------------
type ReportStatus = 'Pending' | 'Processing' | 'Ready';

interface LabReport {
    id: string;
    patientName: string;
    patientId: string;
    testType: string;
    orderedBy: string;
    orderedOn: string;
    status: ReportStatus;
    result?: string;
}

const initialReports: LabReport[] = [
    { id: 'LAB-001', patientName: 'Rahul Verma', patientId: 'P-001', testType: 'Complete Blood Count (CBC)', orderedBy: 'Dr. Ananya Bose', orderedOn: '2026-03-01', status: 'Ready', result: 'Hemoglobin: 13.2 g/dL, WBC: 7200/µL — Normal' },
    { id: 'LAB-002', patientName: 'Arjun Patel', patientId: 'P-003', testType: 'ECG', orderedBy: 'Dr. Neha Singh', orderedOn: '2026-03-05', status: 'Ready', result: 'ST-segment elevation in V1–V4. Refer to cardiologist.' },
    { id: 'LAB-003', patientName: 'Priya Sharma', patientId: 'P-002', testType: 'X-Ray Chest', orderedBy: 'Dr. Rohan Mehta', orderedOn: '2026-03-04', status: 'Processing', result: undefined },
    { id: 'LAB-004', patientName: 'Sunita Iyer', patientId: 'P-004', testType: 'HbA1c', orderedBy: 'Dr. Ananya Bose', orderedOn: '2026-03-03', status: 'Ready', result: 'HbA1c: 7.8% — Poorly controlled diabetes' },
    { id: 'LAB-005', patientName: 'Sanjay Gupta', patientId: 'P-009', testType: 'Liver Function Test (LFT)', orderedBy: 'Dr. Kiran Rao', orderedOn: '2026-03-03', status: 'Ready', result: 'ALT: 120 U/L, AST: 98 U/L — Elevated, monitor closely' },
    { id: 'LAB-006', patientName: 'Meera Nair', patientId: 'P-006', testType: 'Sputum Culture', orderedBy: 'Dr. Kiran Rao', orderedOn: '2026-03-02', status: 'Processing', result: undefined },
    { id: 'LAB-007', patientName: 'Aditya Kumar', patientId: 'P-007', testType: 'X-Ray Forearm', orderedBy: 'Dr. Rohan Mehta', orderedOn: '2026-03-06', status: 'Pending', result: undefined },
    { id: 'LAB-008', patientName: 'Deepa Menon', patientId: 'P-008', testType: 'MRI Brain', orderedBy: 'Dr. Neha Singh', orderedOn: '2026-03-05', status: 'Pending', result: undefined },
];

const statusStyle: Record<ReportStatus, { chip: string; row: string; dot?: boolean }> = {
    Pending:    { chip: 'bg-slate-100 text-slate-600 border-slate-200',   row: 'border-l-4 border-l-slate-300' },
    Processing: { chip: 'bg-amber-100 text-amber-700 border-amber-200',   row: 'border-l-4 border-l-amber-400', dot: true },
    Ready:      { chip: 'bg-green-100 text-green-700 border-green-200',   row: 'border-l-4 border-l-green-400' },
};

type ReportFilter = 'All' | ReportStatus;
const REPORT_FILTERS: ReportFilter[] = ['All', 'Pending', 'Processing', 'Ready'];

const testTypes = [
    'Complete Blood Count (CBC)', 'HbA1c', 'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)', 'Thyroid Profile', 'Lipid Profile',
    'ECG', 'X-Ray Chest', 'X-Ray Forearm', 'MRI Brain', 'CT Scan',
    'Sputum Culture', 'Urine Analysis',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LabReports() {
    const [reports, setReports] = useState<LabReport[]>(initialReports);
    const [search, setSearch]   = useState('');
    const [filterStatus, setFilterStatus] = useState<ReportFilter>('All');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [resultDialog, setResultDialog] = useState<LabReport | null>(null);
    const [newReport, setNewReport] = useState({
        patientName: '', testType: '', orderedBy: '',
    });

    const filtered = reports.filter((r) => {
        const matchSearch =
            r.patientName.toLowerCase().includes(search.toLowerCase()) ||
            r.testType.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleAdd = () => {
        if (!newReport.patientName || !newReport.testType || !newReport.orderedBy) return;
        const report: LabReport = {
            id: `LAB-${String(reports.length + 1).padStart(3, '0')}`,
            patientName: newReport.patientName,
            patientId: `P-${String(reports.length + 1).padStart(3, '0')}`,
            testType: newReport.testType,
            orderedBy: newReport.orderedBy,
            orderedOn: new Date().toISOString().split('T')[0],
            status: 'Pending',
        };
        setReports((prev) => [report, ...prev]);
        setNewReport({ patientName: '', testType: '', orderedBy: '' });
        setShowAddDialog(false);
    };

    const markReady = (id: string) => {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Ready', result: 'Results uploaded manually.' } : r));
    };

    const ready = reports.filter((r) => r.status === 'Ready').length;
    const processing = reports.filter((r) => r.status === 'Processing').length;
    const pending = reports.filter((r) => r.status === 'Pending').length;

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lab Reports</h1>
                    <p className="text-sm text-slate-500">Track and manage all lab test orders and results</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Order Test
                </Button>
            </div>

            {/* ── Pipeline bar ── */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-slate-200">
                    {[
                        { label: 'Pending',    count: pending,    color: 'bg-slate-400',  text: 'text-slate-500',  desc: 'Awaiting lab processing' },
                        { label: 'Processing', count: processing, color: 'bg-amber-400',  text: 'text-amber-600',  desc: 'Currently being processed' },
                        { label: 'Ready',      count: ready,      color: 'bg-green-500',  text: 'text-green-600',  desc: 'Results available' },
                    ].map((stage, i) => {
                        const pct = reports.length > 0 ? Math.round((stage.count / reports.length) * 100) : 0;
                        return (
                            <div key={stage.label} className="relative p-4">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            {i > 0 && <span className="mr-1 text-slate-300">→</span>}{stage.label}
                                        </p>
                                        <p className={`text-3xl font-bold ${stage.text}`}>{stage.count}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{stage.desc}</p>
                                    </div>
                                    <span className={`text-xs font-bold ${stage.text}`}>{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full transition-all duration-700 ${stage.color}`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Search + filter chips ── */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Search patient, test type, ID…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {REPORT_FILTERS.map((f) => {
                                const count = f === 'All' ? reports.length : reports.filter((r) => r.status === f).length;
                                return (
                                    <button key={f} onClick={() => setFilterStatus(f)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                            filterStatus === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
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
                                <TableHead className="w-28">Lab ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Test Type</TableHead>
                                <TableHead>Ordered By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((r) => (
                                <TableRow key={r.id} className={`hover:bg-slate-50 ${statusStyle[r.status].row}`}>
                                    <TableCell className="font-mono text-xs text-slate-500">{r.id}</TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-800">{r.patientName}</p>
                                        <p className="text-xs text-slate-400">{r.patientId}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-700">{r.testType}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{r.orderedBy}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{r.orderedOn}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status].chip}`}>
                                            {statusStyle[r.status].dot && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            )}
                                            {r.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {r.status === 'Ready' && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setResultDialog(r)}>View Result</Button>
                                            )}
                                            {(r.status === 'Pending' || r.status === 'Processing') && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => markReady(r.id)}>Mark Ready</Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Test dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Order Lab Test</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input placeholder="Patient Name *" value={newReport.patientName} onChange={(e) => setNewReport({ ...newReport, patientName: e.target.value })} />
                        <Select value={newReport.testType} onValueChange={(v) => setNewReport({ ...newReport, testType: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Test Type *" /></SelectTrigger>
                            <SelectContent>
                                {testTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Ordered By (Doctor) *" value={newReport.orderedBy} onChange={(e) => setNewReport({ ...newReport, orderedBy: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Result dialog */}
            {resultDialog && (
                <Dialog open={!!resultDialog} onOpenChange={() => setResultDialog(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>{resultDialog.testType}</DialogTitle></DialogHeader>
                        <div className="space-y-2 py-2 text-sm">
                            <p><span className="font-semibold">Patient:</span> {resultDialog.patientName}</p>
                            <p><span className="font-semibold">Ordered By:</span> {resultDialog.orderedBy}</p>
                            <p><span className="font-semibold">Date:</span> {resultDialog.orderedOn}</p>
                            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-slate-700">
                                {resultDialog.result}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setResultDialog(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
