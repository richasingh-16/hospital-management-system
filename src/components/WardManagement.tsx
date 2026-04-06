/**
 * WardManagement — fully connected to backend
 * Admissions and Bed Overview data come from /api/admissions
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble, ClipboardList, Users, Plus, Search,
  ChevronRight, Map,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Admission {
  id: string; admissionNumber?: number; patientId: string; patientName: string; age: number; gender: string;
  doctor: string; ward: string; bed: string; admittedOn: string; condition: string;
  status: 'Active' | 'Discharged';
}
interface WardOverview { id: string; name: string; total: number; occupied: number; }
interface DoctorOption  { id: string; name: string; }

const WARD_LIST = ['ICU', 'General', 'Emergency', 'Maternity', 'Pediatrics', 'Orthopedics', 'Surgery', 'Neurology'];

const wardColors: Record<string, string> = {
  ICU: 'bg-red-100 text-red-700', Emergency: 'bg-orange-100 text-orange-700',
  General: 'bg-blue-100 text-blue-700', Maternity: 'bg-pink-100 text-pink-700',
  Pediatrics: 'bg-green-100 text-green-700', Orthopedics: 'bg-purple-100 text-purple-700',
  Surgery: 'bg-yellow-100 text-yellow-700', Neurology: 'bg-indigo-100 text-indigo-700',
};

function occupancyBar(pct: number)   { return pct >= 90 ? 'bg-red-500' : pct >= 65 ? 'bg-yellow-400' : 'bg-green-500'; }
function occupancyBadge(pct: number) { return pct >= 90 ? 'bg-red-100 text-red-700' : pct >= 65 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'; }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WardManagement() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [wards,      setWards]      = useState<WardOverview[]>([]);
  const [doctors,    setDoctors]    = useState<DoctorOption[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [saving,     setSaving]     = useState(false);
  const [showAdmitDialog, setShowAdmitDialog] = useState(false);
  const [newAdmit, setNewAdmit] = useState({ patientName: '', condition: '', doctorName: '', wardName: 'General' });
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [admData, wardData] = await Promise.all([
        apiFetch('/admissions'),
        apiFetch('/admissions/ward-overview'),
      ]);
      setAdmissions(admData);
      setWards(wardData);
    } catch {
      toast.error('Failed to load ward data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    apiFetch('/doctors').then((docs: any[]) => setDoctors(docs.map(d => ({ id: d.id, name: d.name })))).catch(() => {});
  }, [loadData]);

  const filtered = admissions.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.ward.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const active     = admissions.filter(a => a.status === 'Active').length;
  const discharged = admissions.filter(a => a.status === 'Discharged').length;

  // ── Admit ──
  const handleAdmit = async () => {
    if (!newAdmit.patientName || !newAdmit.condition || !newAdmit.doctorName) {
      toast.error('Fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const admission = await apiFetch('/admissions', {
        method: 'POST',
        body: JSON.stringify(newAdmit),
      });
      setAdmissions(prev => [admission, ...prev]);
      setNewAdmit({ patientName: '', condition: '', doctorName: '', wardName: 'General' });
      setShowAdmitDialog(false);
      toast.success(`${newAdmit.patientName} admitted to ${newAdmit.wardName} Ward`);
      loadData(); // refresh ward overview
    } catch (err: any) {
      toast.error(err.message || 'Failed to admit patient');
    } finally {
      setSaving(false);
    }
  };

  // ── Discharge ──
  const handleDischarge = async (id: string, name: string) => {
    if (!confirm(`Discharge ${name}? This will free their bed.`)) return;
    try {
      await apiFetch(`/admissions/${id}/discharge`, { method: 'PATCH' });
      setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status: 'Discharged' } : a));
      toast.success(`${name} discharged`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Discharge failed');
    }
  };

  const totalBeds     = wards.reduce((s, w) => s + w.total, 0);
  const totalOccupied = wards.reduce((s, w) => s + w.occupied, 0);
  const totalFree     = totalBeds - totalOccupied;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ward Management</h1>
          <p className="text-sm text-slate-500">Admissions, discharges and real-time bed availability</p>
        </div>
        <Button onClick={() => setShowAdmitDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Admit Patient
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Currently Admitted', value: active,            color: 'text-blue-600',   bg: 'bg-blue-50',   icon: <BedDouble className="h-7 w-7" />    },
          { label: 'Discharged',         value: discharged,        color: 'text-green-600',  bg: 'bg-green-50',  icon: <Users className="h-7 w-7" />         },
          { label: 'Total Records',      value: admissions.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: <ClipboardList className="h-7 w-7" /> },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${s.bg} border-0 shadow-sm`}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="admissions">
        <TabsList className="mb-4">
          <TabsTrigger value="admissions" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Admissions</TabsTrigger>
          <TabsTrigger value="beds"       className="gap-1.5"><BedDouble className="h-3.5 w-3.5" /> Bed Overview</TabsTrigger>
          <TabsTrigger value="floormap"   className="gap-1.5"><Map className="h-3.5 w-3.5" /> Floor Map</TabsTrigger>
        </TabsList>

        {/* ── Admissions tab ── */}
        <TabsContent value="admissions">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search by patient, ward, admission ID…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="py-10 text-center text-sm text-slate-400">Loading admissions…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-28">Admission ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Ward</TableHead>
                      <TableHead>Bed</TableHead>
                      <TableHead>Admitted On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="py-10 text-center text-slate-400">No admissions found.</TableCell></TableRow>
                    )}
                    {filtered.map(adm => (
                      <TableRow key={adm.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs text-slate-500" title={adm.id}>
                          {adm.admissionNumber ? `ADM-${String(adm.admissionNumber).padStart(3, '0')}` : adm.id.slice(0, 8) + '…'}
                        </TableCell>
                        <TableCell>
                          <button onClick={() => adm.patientId && navigate(`/patients/${adm.patientId}`)} className="group flex items-center gap-1 text-left">
                            <div>
                              <p className="font-medium text-slate-800 group-hover:text-blue-600">{adm.patientName}</p>
                              <p className="text-xs text-slate-400">{adm.age > 0 ? `${adm.age}y · ${adm.gender}` : '—'}</p>
                            </div>
                            {adm.patientId && <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{adm.condition}</TableCell>
                        <TableCell className="text-sm text-slate-600">{adm.doctor}</TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${wardColors[adm.ward] ?? 'bg-slate-100 text-slate-600'}`}>{adm.ward}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">{adm.bed}</TableCell>
                        <TableCell className="text-xs text-slate-500">{adm.admittedOn}</TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${adm.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{adm.status}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {adm.status === 'Active' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleDischarge(adm.id, adm.patientName)}>
                              Discharge
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bed Overview ── */}
        <TabsContent value="beds">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total Beds', value: totalBeds,     color: 'text-blue-600',  bg: 'bg-blue-50'  },
              { label: 'Occupied',   value: totalOccupied, color: 'text-red-600',   bg: 'bg-red-50'   },
              { label: 'Available',  value: totalFree,     color: 'text-green-600', bg: 'bg-green-50' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`${s.bg} border-0 shadow-sm`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <BedDouble className={`h-8 w-8 ${s.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                      <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {wards.map(ward => {
              const free = ward.total - ward.occupied;
              const pct  = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
              return (
                <motion.div key={ward.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center gap-2 text-sm ${wardColors[ward.name]?.split(' ')[1] ?? 'text-slate-700'}`}>
                          <BedDouble className="h-4 w-4" /> {ward.name}
                        </CardTitle>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${occupancyBadge(pct)}`}>{pct}%</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                          <span>{ward.occupied} occupied</span><span>{free} free</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full transition-all ${occupancyBar(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[['Total', ward.total, 'text-slate-800'], ['Occupied', ward.occupied, 'text-slate-800'], ['Free', free, 'text-green-600']].map(([lbl, val, cls]) => (
                          <div key={String(lbl)} className="rounded-lg bg-slate-50 p-1.5">
                            <p className={`text-lg font-bold ${cls}`}>{val}</p>
                            <p className="text-[10px] text-slate-400">{lbl}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {wards.length === 0 && !loading && (
              <p className="col-span-3 py-10 text-center text-sm text-slate-400">No ward data yet. Admit a patient to see ward stats.</p>
            )}
          </div>
        </TabsContent>

        {/* ── Floor Map ── */}
        <TabsContent value="floormap">
          <div className="space-y-5">
            {wards.map(ward => {
              const beds = Array.from({ length: ward.total }, (_, i) => ({ num: i + 1, occupied: i < ward.occupied }));
              return (
                <Card key={ward.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
                        <BedDouble className="h-4 w-4" /> {ward.name}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-slate-700" /> Occupied</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-white" /> Available</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {beds.map(bed => (
                        <div key={bed.num} title={`Bed ${bed.num} — ${bed.occupied ? 'Occupied' : 'Available'}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-md border text-[10px] font-semibold cursor-default transition-colors ${
                            bed.occupied ? 'bg-slate-700 border-slate-600 text-slate-200' : 'border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:bg-blue-50'
                          }`}>
                          {bed.num}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Admit Patient dialog ── */}
      <Dialog open={showAdmitDialog} onOpenChange={setShowAdmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Admit Patient</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Patient Name *" value={newAdmit.patientName} onChange={e => setNewAdmit({ ...newAdmit, patientName: e.target.value })} />
            <Input placeholder="Condition / Diagnosis *" value={newAdmit.condition} onChange={e => setNewAdmit({ ...newAdmit, condition: e.target.value })} />
            <Select value={newAdmit.doctorName} onValueChange={v => setNewAdmit({ ...newAdmit, doctorName: v })}>
              <SelectTrigger><SelectValue placeholder="Assign Doctor *" /></SelectTrigger>
              <SelectContent>
                {doctors.length === 0 && <SelectItem value="__none" disabled>No doctors registered yet</SelectItem>}
                {doctors.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newAdmit.wardName} onValueChange={v => setNewAdmit({ ...newAdmit, wardName: v })}>
              <SelectTrigger><SelectValue placeholder="Ward *" /></SelectTrigger>
              <SelectContent>{WARD_LIST.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmitDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdmit} disabled={saving}>
              {saving ? 'Admitting…' : 'Admit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
