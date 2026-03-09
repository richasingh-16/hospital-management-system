import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, BedDouble, ClipboardList,
  Plus, Search, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { PATIENTS, type Patient } from '@/lib/mockData';
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
// Types & admission data
// ---------------------------------------------------------------------------
interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  doctor: string;
  ward: string;
  bed: string;
  admittedOn: string;
  condition: string;
  status: 'Active' | 'Discharged';
}

const initialAdmissions: Admission[] = PATIENTS
  .filter((p) => p.status === 'Admitted')
  .map((p, i) => ({
    id: `ADM-${String(i + 1).padStart(3, '0')}`,
    patientId: p.id,
    patientName: p.name,
    age: p.age,
    gender: p.gender,
    doctor: p.doctor,
    ward: p.ward,
    bed: p.bed ?? '—',
    admittedOn: p.admittedOn,
    condition: p.condition,
    status: 'Active',
  }));

const WARDS = ['ICU', 'General', 'Emergency', 'Maternity', 'Pediatrics', 'Orthopedics', 'Surgery', 'Neurology'];
const DOCTORS = ['Dr. Ananya Bose', 'Dr. Rohan Mehta', 'Dr. Neha Singh', 'Dr. Kiran Rao', 'Dr. Priya Kapoor'];

const wardColors: Record<string, string> = {
  ICU: 'bg-red-100 text-red-700',
  Emergency: 'bg-orange-100 text-orange-700',
  General: 'bg-blue-100 text-blue-700',
  Maternity: 'bg-pink-100 text-pink-700',
  Pediatrics: 'bg-green-100 text-green-700',
  Orthopedics: 'bg-purple-100 text-purple-700',
  Surgery: 'bg-yellow-100 text-yellow-700',
  Neurology: 'bg-indigo-100 text-indigo-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Admissions() {
  const [admissions, setAdmissions] = useState<Admission[]>(initialAdmissions);
  const [search, setSearch] = useState('');
  const [showAdmitDialog, setShowAdmitDialog] = useState(false);
  const [newAdmit, setNewAdmit] = useState({
    patientName: '', condition: '', doctor: '', ward: 'General', bed: '',
  });
  const navigate = useNavigate();

  const filtered = admissions.filter(
    (a) =>
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.ward.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  const active     = admissions.filter((a) => a.status === 'Active').length;
  const discharged = admissions.filter((a) => a.status === 'Discharged').length;

  const handleAdmit = () => {
    if (!newAdmit.patientName || !newAdmit.condition || !newAdmit.doctor || !newAdmit.ward) return;
    const admission: Admission = {
      id: `ADM-${String(admissions.length + 1).padStart(3, '0')}`,
      patientId: '',
      patientName: newAdmit.patientName,
      age: 0,
      gender: '—',
      doctor: newAdmit.doctor,
      ward: newAdmit.ward,
      bed: newAdmit.bed || `${newAdmit.ward.slice(0, 1)}-${admissions.length + 1}`,
      admittedOn: new Date().toISOString().split('T')[0],
      condition: newAdmit.condition,
      status: 'Active',
    };
    setAdmissions((prev) => [admission, ...prev]);
    setNewAdmit({ patientName: '', condition: '', doctor: '', ward: 'General', bed: '' });
    setShowAdmitDialog(false);
    toast.success(`${newAdmit.patientName} admitted to ${newAdmit.ward}`);
  };

  const handleDischarge = (id: string) => {
    const adm = admissions.find((a) => a.id === id);
    setAdmissions((prev) => prev.map((a) => a.id === id ? { ...a, status: 'Discharged' } : a));
    if (adm) toast.success(`${adm.patientName} discharged from ${adm.ward}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admissions</h1>
          <p className="text-sm text-slate-500">Track all inpatient admissions, ward assignments and beds</p>
        </div>
        <Button onClick={() => setShowAdmitDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Admit Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Currently Admitted', value: active,     icon: <BedDouble />,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
          { label: 'Discharged Today',   value: discharged, icon: <Users />,         color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Admissions',   value: admissions.length, icon: <ClipboardList />, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${s.bg} border-0 shadow-sm`}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`h-8 w-8 ${s.color}`}>{s.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by patient, ward, admission ID…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {filtered.map((adm) => (
                <TableRow key={adm.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs text-slate-500">{adm.id}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => adm.patientId && navigate(`/patients/${adm.patientId}`)}
                      className="group flex items-center gap-1 text-left"
                    >
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-blue-600">{adm.patientName}</p>
                        <p className="text-xs text-slate-400">{adm.age > 0 ? `${adm.age}y • ${adm.gender}` : '—'}</p>
                      </div>
                      {adm.patientId && <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{adm.condition}</TableCell>
                  <TableCell className="text-sm text-slate-600">{adm.doctor}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${wardColors[adm.ward] ?? 'bg-slate-100 text-slate-600'}`}>
                      {adm.ward}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{adm.bed}</TableCell>
                  <TableCell className="text-xs text-slate-500">{adm.admittedOn}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${adm.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {adm.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {adm.status === 'Active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleDischarge(adm.id)}
                      >
                        Discharge
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admit Dialog */}
      <Dialog open={showAdmitDialog} onOpenChange={setShowAdmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Admit Patient</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Patient Name *" value={newAdmit.patientName} onChange={(e) => setNewAdmit({ ...newAdmit, patientName: e.target.value })} />
            <Input placeholder="Condition / Diagnosis *" value={newAdmit.condition} onChange={(e) => setNewAdmit({ ...newAdmit, condition: e.target.value })} />
            <Select value={newAdmit.doctor} onValueChange={(v) => setNewAdmit({ ...newAdmit, doctor: v })}>
              <SelectTrigger><SelectValue placeholder="Assign Doctor *" /></SelectTrigger>
              <SelectContent>{DOCTORS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select value={newAdmit.ward} onValueChange={(v) => setNewAdmit({ ...newAdmit, ward: v })}>
                <SelectTrigger><SelectValue placeholder="Ward *" /></SelectTrigger>
                <SelectContent>{WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Bed No. (optional)" value={newAdmit.bed} onChange={(e) => setNewAdmit({ ...newAdmit, bed: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmitDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdmit}>Admit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
