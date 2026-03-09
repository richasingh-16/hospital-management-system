import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, CalendarDays } from 'lucide-react';
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
type ApptStatus = 'Scheduled' | 'Completed' | 'Cancelled';

interface Appointment {
  id: string;
  patientName: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: string;
  status: ApptStatus;
}

const initialAppointments: Appointment[] = [
  { id: 'APT-001', patientName: 'Rahul Verma', doctor: 'Dr. Ananya Bose', department: 'General Medicine', date: '2026-03-06', time: '09:00', type: 'OPD', status: 'Scheduled' },
  { id: 'APT-002', patientName: 'Priya Sharma', doctor: 'Dr. Rohan Mehta', department: 'Orthopedics', date: '2026-03-06', time: '10:30', type: 'Follow-up', status: 'Scheduled' },
  { id: 'APT-003', patientName: 'Arjun Patel', doctor: 'Dr. Neha Singh', department: 'Neurology', date: '2026-03-06', time: '11:00', type: 'OPD', status: 'Completed' },
  { id: 'APT-004', patientName: 'Sunita Iyer', doctor: 'Dr. Ananya Bose', department: 'General Medicine', date: '2026-03-06', time: '14:00', type: 'Checkup', status: 'Scheduled' },
  { id: 'APT-005', patientName: 'Vikram Desai', doctor: 'Dr. Kiran Rao', department: 'Gastroenterology', date: '2026-03-07', time: '09:30', type: 'Follow-up', status: 'Scheduled' },
  { id: 'APT-006', patientName: 'Meera Nair', doctor: 'Dr. Priya Kapoor', department: 'Cardiology', date: '2026-03-07', time: '11:30', type: 'OPD', status: 'Cancelled' },
  { id: 'APT-007', patientName: 'Aditya Kumar', doctor: 'Dr. Rohan Mehta', department: 'Orthopedics', date: '2026-03-07', time: '15:00', type: 'Emergency', status: 'Scheduled' },
  { id: 'APT-008', patientName: 'Deepa Menon', doctor: 'Dr. Neha Singh', department: 'Neurology', date: '2026-03-05', time: '10:00', type: 'OPD', status: 'Completed' },
];

const doctors = [
  { name: 'Dr. Ananya Bose', dept: 'General Medicine' },
  { name: 'Dr. Rohan Mehta', dept: 'Orthopedics' },
  { name: 'Dr. Neha Singh', dept: 'Neurology' },
  { name: 'Dr. Kiran Rao', dept: 'Gastroenterology' },
  { name: 'Dr. Priya Kapoor', dept: 'Cardiology' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const statusColors: Record<ApptStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AppointmentSystem() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patientName: '', doctorIndex: '', date: '', time: '', type: 'OPD',
  });

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: ApptStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleAdd = () => {
    if (!newAppt.patientName || !newAppt.doctorIndex || !newAppt.date || !newAppt.time) return;
    const doc = doctors[parseInt(newAppt.doctorIndex)];
    const appt: Appointment = {
      id: `APT-${String(appointments.length + 1).padStart(3, '0')}`,
      patientName: newAppt.patientName,
      doctor: doc.name,
      department: doc.dept,
      date: newAppt.date,
      time: newAppt.time,
      type: newAppt.type,
      status: 'Scheduled',
    };
    setAppointments((prev) => [appt, ...prev]);
    setNewAppt({ patientName: '', doctorIndex: '', date: '', time: '', type: 'OPD' });
    setShowAddDialog(false);
  };

  const scheduled = appointments.filter((a) => a.status === 'Scheduled').length;
  const completed = appointments.filter((a) => a.status === 'Completed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-sm text-slate-500">Schedule and manage all patient appointments</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Scheduled', value: scheduled, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: completed, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', value: cancelled, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${s.bg} border-0 shadow-sm`}>
              <CardContent className="flex items-center gap-3 p-4">
                <CalendarDays className={`h-8 w-8 ${s.color}`} />
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
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search patient, doctor, ID…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-28">ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs text-slate-500">{a.id}</TableCell>
                  <TableCell className="font-medium text-slate-800">{a.patientName}</TableCell>
                  <TableCell className="text-sm text-slate-600">{a.doctor}</TableCell>
                  <TableCell className="text-sm text-slate-500">{a.department}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{a.date}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{a.type}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {a.status === 'Scheduled' && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(a.id, 'Completed')}>Complete</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(a.id, 'Cancelled')}>Cancel</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Book Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Book Appointment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Patient Name *" value={newAppt.patientName} onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })} />
            <Select value={newAppt.doctorIndex} onValueChange={(v) => setNewAppt({ ...newAppt, doctorIndex: v })}>
              <SelectTrigger><SelectValue placeholder="Select Doctor *" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d, i) => (
                  <SelectItem key={d.name} value={String(i)}>{d.name} — {d.dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} />
              <Select value={newAppt.time} onValueChange={(v) => setNewAppt({ ...newAppt, time: v })}>
                <SelectTrigger><SelectValue placeholder="Pick Time *" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select value={newAppt.type} onValueChange={(v) => setNewAppt({ ...newAppt, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPD">OPD</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Checkup">Checkup</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
