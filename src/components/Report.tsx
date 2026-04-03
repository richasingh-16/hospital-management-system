import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Upload, Download, FileText } from 'lucide-react';

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
type ReportStatus = 'Pending' | 'Processing' | 'Ready';

interface LabReport {
    id: string;
    patientName: string;
    patientId: string | null;
    testType: string;
    orderedBy: string;
    orderedOn: string;
    status: ReportStatus;
    hasResult: boolean;
    resultFileName: string | null;
}

interface PatientOption { id: string; name: string; doctor: string; }
interface DoctorOption  { id: string; name: string; }

// ---------------------------------------------------------------------------
// Mock demo data (stays visible so new visitors understand the workflow)
// ---------------------------------------------------------------------------
const mockReports: LabReport[] = [
    { id: 'LAB-001', patientName: 'Rahul Verma',   patientId: 'P-001', testType: 'Complete Blood Count (CBC)',   orderedBy: 'Dr. Ananya Bose', orderedOn: '2026-03-01', status: 'Ready',      hasResult: false, resultFileName: null },
    { id: 'LAB-002', patientName: 'Arjun Patel',   patientId: 'P-003', testType: 'ECG',                          orderedBy: 'Dr. Neha Singh',   orderedOn: '2026-03-05', status: 'Ready',      hasResult: false, resultFileName: null },
    { id: 'LAB-003', patientName: 'Priya Sharma',  patientId: 'P-002', testType: 'X-Ray Chest',                  orderedBy: 'Dr. Rohan Mehta',  orderedOn: '2026-03-04', status: 'Processing', hasResult: false, resultFileName: null },
    { id: 'LAB-004', patientName: 'Sunita Iyer',   patientId: 'P-004', testType: 'HbA1c',                        orderedBy: 'Dr. Ananya Bose',  orderedOn: '2026-03-03', status: 'Ready',      hasResult: false, resultFileName: null },
    { id: 'LAB-005', patientName: 'Sanjay Gupta',  patientId: 'P-009', testType: 'Liver Function Test (LFT)',    orderedBy: 'Dr. Kiran Rao',    orderedOn: '2026-03-03', status: 'Ready',      hasResult: false, resultFileName: null },
    { id: 'LAB-006', patientName: 'Meera Nair',    patientId: 'P-006', testType: 'Sputum Culture',               orderedBy: 'Dr. Kiran Rao',    orderedOn: '2026-03-02', status: 'Processing', hasResult: false, resultFileName: null },
    { id: 'LAB-007', patientName: 'Aditya Kumar',  patientId: 'P-007', testType: 'X-Ray Forearm',                orderedBy: 'Dr. Rohan Mehta',  orderedOn: '2026-03-06', status: 'Pending',    hasResult: false, resultFileName: null },
    { id: 'LAB-008', patientName: 'Deepa Menon',   patientId: 'P-008', testType: 'MRI Brain',                    orderedBy: 'Dr. Neha Singh',   orderedOn: '2026-03-05', status: 'Pending',    hasResult: false, resultFileName: null },
];

const statusStyle: Record<ReportStatus, { chip: string; row: string; dot?: boolean }> = {
    Pending:    { chip: 'bg-slate-100 text-slate-600 border-slate-200', row: 'border-l-4 border-l-slate-300' },
    Processing: { chip: 'bg-amber-100 text-amber-700 border-amber-200', row: 'border-l-4 border-l-amber-400', dot: true },
    Ready:      { chip: 'bg-green-100 text-green-700 border-green-200', row: 'border-l-4 border-l-green-400' },
};

type ReportFilter = 'All' | ReportStatus;
const REPORT_FILTERS: ReportFilter[] = ['All', 'Pending', 'Processing', 'Ready'];

const testTypes = [
    'Complete Blood Count (CBC)', 'HbA1c', 'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)', 'Thyroid Profile', 'Lipid Profile',
    'ECG', 'X-Ray Chest', 'X-Ray Forearm', 'MRI Brain', 'CT Scan',
    'Sputum Culture', 'Urine Analysis',
];

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LabReports() {
    const [reports, setReports]           = useState<LabReport[]>(mockReports);
    const [patients, setPatients]         = useState<PatientOption[]>([]);
    const [doctors,  setDoctors]          = useState<DoctorOption[]>([]);
    const [search, setSearch]             = useState('');
    const [filterStatus, setFilterStatus] = useState<ReportFilter>('All');
    const [saving, setSaving]             = useState(false);

    // Order dialog
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [usePatientDropdown, setUsePatientDropdown] = useState(true);
    const [newReport, setNewReport] = useState({
        patientId: '', patientName: '', testType: '', orderedBy: '',
    });

    // Upload result dialog
    const [uploadDialog, setUploadDialog] = useState<LabReport | null>(null);
    const [uploadFile, setUploadFile]     = useState<File | null>(null);
    const [uploading, setUploading]       = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Load data on mount ──────────────────────────────────────────────────
    useEffect(() => {
        apiFetch('/lab-reports')
            .then((data: LabReport[]) => setReports([...data, ...mockReports]))
            .catch(() => setReports(mockReports));

        apiFetch('/patients')
            .then((data: any[]) => setPatients(data.map(p => ({ id: p.id, name: p.name, doctor: p.doctor || '' }))))
            .catch(console.error);

        apiFetch('/doctors')
            .then((data: any[]) => setDoctors(data.map(d => ({ id: d.id, name: d.name }))))
            .catch(console.error);
    }, []);

    // ── When patient selected, auto-fill their doctor ───────────────────────
    const handlePatientSelect = (patientId: string) => {
        const p = patients.find(pt => pt.id === patientId);
        setNewReport(prev => ({
            ...prev,
            patientId,
            patientName: p?.name ?? '',
            orderedBy:   p?.doctor ?? prev.orderedBy,
        }));
    };

    // ── Filter ───────────────────────────────────────────────────────────────
    const filtered = reports.filter((r) => {
        const matchSearch =
            r.patientName.toLowerCase().includes(search.toLowerCase()) ||
            r.testType.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── Mock-report guard: only hits API for real (UUID) IDs ─────────────────
    const isMock = (id: string) => id.startsWith('LAB-');

    // ── Mark Processing ──────────────────────────────────────────────────────
    const handleMarkProcessing = async (id: string) => {
        if (isMock(id)) {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Processing' } : r));
            return;
        }
        try {
            await apiFetch(`/lab-reports/${id}/processing`, { method: 'PATCH' });
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Processing' } : r));
            toast.success('Marked as Processing');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    // ── Upload result file ───────────────────────────────────────────────────
    const handleUploadResult = async () => {
        if (!uploadDialog || !uploadFile) return;
        if (isMock(uploadDialog.id)) {
            // Mock reports: just show success without hitting API
            setReports(prev => prev.map(r =>
                r.id === uploadDialog.id
                    ? { ...r, status: 'Ready', hasResult: true, resultFileName: uploadFile.name }
                    : r
            ));
            setUploadDialog(null);
            setUploadFile(null);
            toast.success('Result uploaded (demo mode)');
            return;
        }
        setUploading(true);
        try {
            const token = localStorage.getItem('hospital_token');
            const formData = new FormData();
            formData.append('resultFile', uploadFile);

            const res = await fetch(`${API_BASE}/lab-reports/${uploadDialog.id}/ready`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }
            const updated = await res.json();
            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
            setUploadDialog(null);
            setUploadFile(null);
            toast.success('Result file uploaded successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // ── Download result ───────────────────────────────────────────────────────
    const handleDownload = (id: string) => {
        const token = localStorage.getItem('hospital_token');
        const url = `${API_BASE}/lab-reports/${id}/download`;
        // Open in a new tab with auth token via a temporary anchor
        const link = document.createElement('a');
        link.href = `${url}?token=${token}`;
        link.target = '_blank';
        link.click();
    };

    // ── Order new test ────────────────────────────────────────────────────────
    const handleAdd = async () => {
        const name = usePatientDropdown
            ? patients.find(p => p.id === newReport.patientId)?.name ?? ''
            : newReport.patientName;

        if (!name || !newReport.testType || !newReport.orderedBy) {
            toast.error('Please fill in all required fields');
            return;
        }
        setSaving(true);
        try {
            const result = await apiFetch('/lab-reports', {
                method: 'POST',
                body: JSON.stringify({
                    patientId:   usePatientDropdown ? newReport.patientId : undefined,
                    patientName: name,
                    testType:    newReport.testType,
                    orderedBy:   newReport.orderedBy,
                }),
            });
            setReports(prev => [result, ...prev]);
            setNewReport({ patientId: '', patientName: '', testType: '', orderedBy: '' });
            setShowAddDialog(false);
            toast.success('Lab test ordered successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to order test');
        } finally {
            setSaving(false);
        }
    };

    const ready      = reports.filter(r => r.status === 'Ready').length;
    const processing = reports.filter(r => r.status === 'Processing').length;
    const pending    = reports.filter(r => r.status === 'Pending').length;

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

            {/* ── Table ── */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Search patient, test type, ID…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {REPORT_FILTERS.map((f) => {
                                const count = f === 'All' ? reports.length : reports.filter(r => r.status === f).length;
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
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-slate-400">
                                        No lab reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((r) => (
                                <TableRow key={r.id} className={`hover:bg-slate-50 ${statusStyle[r.status].row}`}>
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {r.id.startsWith('LAB-') ? r.id : r.id.slice(0, 8) + '…'}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-800">{r.patientName}</p>
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
                                            {/* Pending → Processing */}
                                            {r.status === 'Pending' && (
                                                <Button size="sm" variant="outline"
                                                    className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                                                    onClick={() => handleMarkProcessing(r.id)}>
                                                    Mark Processing
                                                </Button>
                                            )}
                                            {/* Processing → Ready (upload file) */}
                                            {r.status === 'Processing' && (
                                                <Button size="sm" variant="outline"
                                                    className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    onClick={() => { setUploadDialog(r); setUploadFile(null); }}>
                                                    <Upload className="h-3 w-3 mr-1" /> Upload Result
                                                </Button>
                                            )}
                                            {/* Ready → Download */}
                                            {r.status === 'Ready' && r.hasResult && (
                                                <Button size="sm" variant="outline"
                                                    className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleDownload(r.id)}>
                                                    <Download className="h-3 w-3 mr-1" />
                                                    {r.resultFileName ? r.resultFileName.slice(0, 12) + '…' : 'Download'}
                                                </Button>
                                            )}
                                            {r.status === 'Ready' && !r.hasResult && (
                                                <Button size="sm" variant="outline"
                                                    className="h-7 text-xs text-slate-500 border-slate-200"
                                                    onClick={() => { setUploadDialog(r); setUploadFile(null); }}>
                                                    <Upload className="h-3 w-3 mr-1" /> Upload Result
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Order Test Dialog ── */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Order Lab Test</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        {/* Toggle: registered patient vs independent */}
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={() => setUsePatientDropdown(true)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${usePatientDropdown ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                Registered Patient
                            </button>
                            <button
                                onClick={() => setUsePatientDropdown(false)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${!usePatientDropdown ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                Walk-in / Independent
                            </button>
                        </div>

                        {/* Patient — dropdown or free text */}
                        {usePatientDropdown ? (
                            <Select value={newReport.patientId} onValueChange={handlePatientSelect}>
                                <SelectTrigger><SelectValue placeholder="Select Patient *" /></SelectTrigger>
                                <SelectContent>
                                    {patients.length === 0 && <SelectItem value="__none" disabled>No patients registered yet</SelectItem>}
                                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input placeholder="Patient Name *"
                                value={newReport.patientName}
                                onChange={(e) => setNewReport({ ...newReport, patientName: e.target.value })} />
                        )}

                        {/* Test type */}
                        <Select value={newReport.testType} onValueChange={(v) => setNewReport({ ...newReport, testType: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Test Type *" /></SelectTrigger>
                            <SelectContent>
                                {testTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {/* Ordered by — live doctor dropdown */}
                        <Select value={newReport.orderedBy} onValueChange={(v) => setNewReport({ ...newReport, orderedBy: v })}>
                            <SelectTrigger><SelectValue placeholder="Ordered By (Doctor) *" /></SelectTrigger>
                            <SelectContent>
                                {doctors.length === 0 && <SelectItem value="__none" disabled>No doctors registered yet</SelectItem>}
                                {doctors.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd} disabled={saving}>
                            {saving ? 'Ordering…' : 'Order Test'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Upload Result Dialog ── */}
            {uploadDialog && (
                <Dialog open={!!uploadDialog} onOpenChange={() => { setUploadDialog(null); setUploadFile(null); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Upload Test Result</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                                <p><span className="font-semibold text-slate-600">Patient:</span> {uploadDialog.patientName}</p>
                                <p className="mt-1"><span className="font-semibold text-slate-600">Test:</span> {uploadDialog.testType}</p>
                            </div>

                            {/* Drop zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                                    uploadFile ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                                }`}>
                                {uploadFile ? (
                                    <>
                                        <FileText className="h-8 w-8 text-green-600" />
                                        <p className="text-sm font-medium text-green-700">{uploadFile.name}</p>
                                        <p className="text-xs text-green-500">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-slate-400" />
                                        <p className="text-sm text-slate-600 font-medium">Click to select PDF or DOC/DOCX</p>
                                        <p className="text-xs text-slate-400">Max file size: 10 MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setUploadDialog(null); setUploadFile(null); }}>Cancel</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleUploadResult}
                                disabled={!uploadFile || uploading}>
                                {uploading ? 'Uploading…' : 'Upload & Mark Ready'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
