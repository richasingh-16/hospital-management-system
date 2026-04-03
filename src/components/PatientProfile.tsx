import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Droplets,
  AlertCircle, History, ReceiptText, CalendarDays,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const statusColor = {
  Admitted:   'bg-blue-100 text-blue-700',
  OPD:        'bg-yellow-100 text-yellow-700',
  Discharged: 'bg-green-100 text-green-700',
};

const apptStatus = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const labStatus = {
  Pending:    'bg-slate-100 text-slate-600',
  Processing: 'bg-yellow-100 text-yellow-700',
  Ready:      'bg-green-100 text-green-700',
};

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Patient Profile Page
// ---------------------------------------------------------------------------
export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canSeeBilling = user?.role !== 'doctor';
  
  const [patient, setPatient]           = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labs, setLabs]                 = useState<any[]>([]);
  const [bills, setBills]               = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    // 1. Core patient record
    apiFetch(`/patients/${id}`)
      .then(data => {
        setPatient({
          ...data,
          admittedOn: new Date(data.createdAt).toISOString().split('T')[0],
          bloodGroup: data.bloodGroup || 'N/A',
          address: data.address || 'N/A',
          emergencyContact: data.emergencyContact || 'N/A',
          email: data.email || 'N/A',
          allergies: data.allergies || [],
          medicalHistory: data.medicalHistory || [],
          pastSurgeries: data.pastSurgeries || [],
        });
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });

    // 2. Sub-tab data — all filtered by patientId on the backend
    apiFetch(`/appointments?patientId=${id}`).then(setAppointments).catch(() => setAppointments([]));
    apiFetch(`/lab-reports?patientId=${id}`).then(setLabs).catch(() => setLabs([]));
    apiFetch(`/billing?patientId=${id}`).then(setBills).catch(() => setBills([]));
  }, [id]);



  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-slate-400">
        <p className="text-lg font-medium">Fetching patient records...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-slate-400">
        <User className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Patient not found</p>
        <Link to="/patients" className="mt-3 text-sm text-blue-600 hover:underline">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const totalBilled = bills.reduce((s, b) => s + b.doctorFee + b.labTests + b.medication + b.roomCharges, 0);
  const totalPaid   = bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + b.doctorFee + b.labTests + b.medication + b.roomCharges, 0);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        to="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Link>

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="overflow-hidden shadow-sm">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500" />
          <CardContent className="flex flex-wrap items-center gap-5 p-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {patient.name.charAt(0)}
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{patient.name}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[patient.status as keyof typeof statusColor] ?? 'bg-slate-100 text-slate-600'}`}>
                  {patient.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {patient.age} years · {patient.gender} · {patient.id}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Under care of <span className="font-medium">{patient.doctor}</span>
                {patient.ward && ` · ${patient.ward} Ward`}
                {patient.bed && ` · Bed ${patient.bed}`}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-5 text-center">
              {[
                { label: 'Appointments', value: appointments.length },
                { label: 'Lab Tests',    value: labs.length         },
                // Only show billing total for admin/receptionist
                ...(canSeeBilling ? [{ label: 'Total Billed', value: formatINR(totalBilled) }] : []),
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"      className="gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="history"      className="gap-1.5"><HeartPulse className="h-3.5 w-3.5" /> Medical History</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Appointments</TabsTrigger>
          <TabsTrigger value="reports"      className="gap-1.5"><span className="h-3.5 w-3.5">🔬</span> Lab Reports</TabsTrigger>
          {/* Billing visible to admin and receptionist only */}
          {canSeeBilling && (
            <TabsTrigger value="billing" className="gap-1.5"><ReceiptText className="h-3.5 w-3.5" /> Billing</TabsTrigger>
          )}
        </TabsList>

        {/* ── Profile tab ── */}
        <TabsContent value="profile">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Personal Info */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4 text-blue-500" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <User className="h-4 w-4 text-slate-400" />,    label: 'Full Name',          value: patient.name           },
                  { icon: <Droplets className="h-4 w-4 text-red-400" />,  label: 'Blood Group',        value: patient.bloodGroup     },
                  { icon: <Phone className="h-4 w-4 text-slate-400" />,   label: 'Contact',            value: patient.contact        },
                  { icon: <Mail className="h-4 w-4 text-slate-400" />,    label: 'Email',              value: patient.email          },
                  { icon: <MapPin className="h-4 w-4 text-slate-400" />,  label: 'Address',            value: patient.address        },
                  { icon: <Phone className="h-4 w-4 text-orange-400" />,  label: 'Emergency Contact',  value: patient.emergencyContact},
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="text-sm text-slate-700">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Allergies + Current Condition */}
            <div className="space-y-5">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((a: string) => (
                      <span key={a} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 border border-red-100">
                        {a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <HeartPulse className="h-4 w-4 text-blue-500" /> Current Admission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condition</span>
                    <span className="font-medium text-slate-800">{patient.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ward</span>
                    <span className="font-medium text-slate-800">{patient.ward || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bed</span>
                    <span className="font-medium text-slate-800">{patient.bed || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Since</span>
                    <span className="font-medium text-slate-800">{patient.admittedOn}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Medical History tab ── */}
        <TabsContent value="history">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <History className="h-4 w-4 text-blue-500" /> Past Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory.length === 0 ? (
                  <p className="text-sm text-slate-400">No history recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {patient.medicalHistory.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Past Surgeries</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.pastSurgeries.length === 0 ? (
                  <p className="text-sm text-slate-400">No surgeries on record.</p>
                ) : (
                  <ul className="space-y-2">
                    {patient.pastSurgeries.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Appointments tab ── */}
        <TabsContent value="appointments">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {appointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No appointments found for this patient.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{a.doctor}</td>
                        <td className="px-4 py-3 text-slate-600">{a.department}</td>
                        <td className="px-4 py-3 text-slate-600">{a.date} · {a.time}</td>
                        <td className="px-4 py-3 text-slate-600">{a.type}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${apptStatus[a.status as keyof typeof apptStatus] ?? ''}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Lab Reports tab ── */}
        <TabsContent value="reports">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {labs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No lab reports for this patient.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3">Lab ID</th>
                      <th className="px-4 py-3">Test Type</th>
                      <th className="px-4 py-3">Ordered By</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labs.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{l.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{l.testType}</td>
                        <td className="px-4 py-3 text-slate-600">{l.orderedBy}</td>
                        <td className="px-4 py-3 text-slate-500">{l.orderedOn}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${labStatus[l.status as keyof typeof labStatus]}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-xs text-slate-500">{l.result ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Billing tab — admin/receptionist only ── */}
        {canSeeBilling && (
          <TabsContent value="billing">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">Total Billed</p>
                    <p className="text-2xl font-bold text-slate-800">{formatINR(totalBilled)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-700">{formatINR(totalPaid)}</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  {bills.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">No billing records found.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <th className="px-4 py-3">Invoice</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Doctor Fee</th>
                          <th className="px-4 py-3 text-right">Lab Tests</th>
                          <th className="px-4 py-3 text-right">Medication</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills.map((b) => {
                          const total = b.doctorFee + b.labTests + b.medication + b.roomCharges;
                          return (
                            <tr key={b.id} className="border-b hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.id}</td>
                              <td className="px-4 py-3 text-slate-600">{b.date}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatINR(b.doctorFee)}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatINR(b.labTests)}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatINR(b.medication)}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-800">{formatINR(total)}</td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  b.status === 'Paid' ? 'bg-green-100 text-green-700'
                                  : b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
