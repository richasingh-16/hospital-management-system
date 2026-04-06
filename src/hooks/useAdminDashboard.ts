import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '@/services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WardCapacity { name: string; total: number; occupied: number; }
interface Alert         { text: string; level: 'high' | 'medium'; }
interface ScheduleAppt  {
  id: string; patientId: string; patientName: string;
  doctor: string; time: string; date: string; type: string; status: string;
  department: string;
}
interface ActivityItem  { text: string; time: string; color: string; }

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAdminDashboard() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [data,         setData]         = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labReports,   setLabReports]   = useState<any[]>([]);
  const [invoices,     setInvoices]     = useState<any[]>([]);
  const [users,        setUsers]        = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/dashboard/admin').then(setData).catch(console.error);
    apiFetch('/appointments').then(setAppointments).catch(() => {});
    apiFetch('/lab-reports').then(setLabReports).catch(() => {});
    apiFetch('/billing').then(setInvoices).catch(() => {});
    apiFetch('/users').then(setUsers).catch(() => {});
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => [
    { label: 'Total Patients',   value: data ? data.totalPatients   : '…', context: 'Across all wards'   },
    { label: 'Admissions Today', value: data ? data.todayAdmissions : '…', context: 'Admitted today'     },
    { label: 'Beds Available',   value: data ? `${data.availableBeds} / ${data.availableBeds + data.occupiedBeds}` : '…',
      context: data && (data.availableBeds + data.occupiedBeds) > 0
        ? `${Math.round((data.availableBeds / (data.availableBeds + data.occupiedBeds)) * 100)}% capacity free`
        : '…' },
    { label: 'Total Doctors',    value: data ? data.totalDoctors    : '…', context: 'Active staff'       },
  ], [data]);

  // ── Ward capacity ─────────────────────────────────────────────────────────
  const wardCapacity: WardCapacity[] = useMemo(() => data?.wardCapacity ?? [], [data]);

  // ── Critical Alerts ───────────────────────────────────────────────────────
  const alerts: Alert[] = useMemo(() => {
    const result: Alert[] = [];
    wardCapacity.forEach(ward => {
      const pct = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
      if (pct >= 90) result.push({ text: `${ward.name} ward at ${pct}% capacity (${ward.occupied}/${ward.total} beds)`, level: 'high' });
    });
    labReports.filter((l: any) => l.status === 'Pending' || l.status === 'Processing').slice(0, 4).forEach((l: any) => {
      result.push({ text: `${l.testType} for ${l.patientName} · ${l.status}`, level: 'medium' });
    });
    return result.slice(0, 6);
  }, [wardCapacity, labReports]);

  // ── Today's Schedule ───────────────────────────────────────────────────────
  const schedule: ScheduleAppt[] = useMemo(() => {
    const todayAppts = appointments.filter((a: any) => a.date === today);
    return (todayAppts.length > 0 ? todayAppts : appointments).slice(0, 6);
  }, [appointments, today]);

  // ── Recent Activity ────────────────────────────────────────────────────────
  const activity: ActivityItem[] = useMemo(() => data?.recentActivity ?? [], [data]);

  // ── Revenue chart — last 7 days by invoice date ────────────────────────────
  const revenueChart = useMemo(() => {
    const totals: Record<string, number> = {};
    WEEK_DAYS.forEach(d => (totals[d] = 0));
    invoices.forEach((inv: any) => {
      const d = new Date(inv.date);
      // only last 7 days
      const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diffDays < 7) {
        const label = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
        const total = (inv.doctorFee || 0) + (inv.labTests || 0) + (inv.medication || 0) + (inv.roomCharges || 0);
        totals[label] = (totals[label] ?? 0) + total;
      }
    });
    return WEEK_DAYS.map(day => ({ day, revenue: totals[day] ?? 0 }));
  }, [invoices]);

  // ── Pending billing ────────────────────────────────────────────────────────
  const pendingBilling = useMemo(() => invoices.filter((i: any) => i.status === 'Pending').length, [invoices]);

  // ── Staff counts by role ────────────────────────────────────────────────────
  const staffCounts = useMemo(() => {
    const counts: Record<string, number> = { DOCTOR: 0, RECEPTIONIST: 0, LAB_TECHNICIAN: 0, ADMIN: 0 };
    users.forEach((u: any) => {
      const r = u.role?.toUpperCase();
      if (r in counts) counts[r]++;
    });
    return counts;
  }, [users]);

  // ── Admissions doughnut ────────────────────────────────────────────────────
  const totalPaid    = useMemo(() => invoices.filter((i: any) => i.status === 'Paid').length, [invoices]);
  const totalOverdue = useMemo(() => invoices.filter((i: any) => i.status === 'Overdue').length, [invoices]);

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  return {
    greeting, kpis, wardCapacity, alerts, schedule, activity,
    revenueChart, pendingBilling, staffCounts, invoices,
    totalPaid, totalOverdue,
  };
}
