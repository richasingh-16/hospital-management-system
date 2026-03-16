import { APPOINTMENTS_DATA, PATIENTS, LAB_REPORTS_DATA } from '@/lib/mockData';
import type {
  Appointment,
  Alert,
  DashboardKpi,
  RecentActivityItem,
  WardCapacity,
} from '@/lib/types';

// Local static data that would eventually come from APIs
const weeklyAdmissions = [
  { day: 'Mon', admissions: 32 },
  { day: 'Tue', admissions: 27 },
  { day: 'Wed', admissions: 41 },
  { day: 'Thu', admissions: 35 },
  { day: 'Fri', admissions: 48 },
  { day: 'Sat', admissions: 22 },
  { day: 'Sun', admissions: 15 },
];

const monthlyAdmissions = [
  { day: 'W1', admissions: 182 },
  { day: 'W2', admissions: 214 },
  { day: 'W3', admissions: 197 },
  { day: 'W4', admissions: 220 },
];

const wardCapacity: WardCapacity[] = [
  { name: 'ICU',         occupied: 14, total: 20 },
  { name: 'General',     occupied: 52, total: 80 },
  { name: 'Emergency',   occupied: 10, total: 15 },
  { name: 'Maternity',   occupied: 16, total: 25 },
  { name: 'Pediatrics',  occupied: 9,  total: 20 },
  { name: 'Orthopedics', occupied: 11, total: 18 },
];

const staticRecentActivity: RecentActivityItem[] = [
  { text: 'Arjun Patel admitted to ICU',             time: '2 min ago',  color: 'bg-green-500'  },
  { text: 'Appointment #APT-004 marked complete',    time: '8 min ago',  color: 'bg-blue-500'   },
  { text: 'Lab report LAB-003 ready for review',     time: '15 min ago', color: 'bg-orange-400' },
  { text: 'Vikram Desai discharged from Ortho',      time: '31 min ago', color: 'bg-slate-400'  },
  { text: 'Invoice INV-007 generated — Aditya Kumar',time: '45 min ago', color: 'bg-purple-500' },
];

export type AdmissionsRange = '7' | '30';

export function getAdminKpis(): DashboardKpi[] {
  const appointmentsToday = APPOINTMENTS_DATA.length;
  const remainingAppts = APPOINTMENTS_DATA.filter((a) => a.status === 'Scheduled').length;
  const admittedCount = PATIENTS.filter((p) => p.status === 'Admitted').length;
  const totalBeds = wardCapacity.reduce((sum, w) => sum + w.total, 0);
  const occupiedBeds = wardCapacity.reduce((sum, w) => sum + w.occupied, 0);
  const bedsAvailable = totalBeds - occupiedBeds;
  const freePct = totalBeds === 0 ? 0 : Math.round((bedsAvailable / totalBeds) * 100);

  return [
    {
      label: 'Patients Today',
      // Keep original visual for now; later this can be real-time
      value: 124,
      context: '↑ 12 from yesterday',
    },
    {
      label: 'Appointments Today',
      value: appointmentsToday,
      context: `${remainingAppts} remaining`,
    },
    {
      label: 'Beds Available',
      value: `${bedsAvailable} / ${totalBeds}`,
      context: `${freePct}% of capacity free`,
    },
    {
      label: 'Doctors On Duty',
      value: 12,
      context: 'Across 7 departments',
    },
  ];
}

export function getAdmissionsSeries(range: AdmissionsRange) {
  return range === '7' ? weeklyAdmissions : monthlyAdmissions;
}

export function getWardCapacity(): WardCapacity[] {
  return wardCapacity;
}

export function generateSystemAlerts(): Alert[] {
  const alerts: Alert[] = [];

  // Rule 1 — over-capacity wards
  wardCapacity.forEach((ward) => {
    const pct = Math.round((ward.occupied / ward.total) * 100);
    if (pct >= 90) {
      alerts.push({
        text: `${ward.name} ward at ${pct}% capacity (${ward.occupied}/${ward.total} beds)`,
        level: 'high',
      });
    }
  });

  // Rule 2 — ICU patients (critical by definition)
  PATIENTS.filter((p) => p.ward === 'ICU' && p.status === 'Admitted').forEach((p) => {
    alerts.push({
      text: `${p.name} — admitted to ICU · ${p.condition}`,
      level: 'high',
    });
  });

  // Rule 3 — lab reports delayed (not yet Ready)
  LAB_REPORTS_DATA.filter((l) => l.status === 'Pending' || l.status === 'Processing').forEach((l) => {
    alerts.push({
      text: `${l.id} — ${l.testType} for ${l.patientName} · ${l.status}`,
      level: 'medium',
    });
  });

  return alerts.slice(0, 6);
}

export function getScheduleForDate(date: string): Appointment[] {
  const todayAppts = APPOINTMENTS_DATA.filter((a) => a.date === date);
  return todayAppts.length > 0 ? todayAppts : APPOINTMENTS_DATA;
}

export function getRecentActivity(): RecentActivityItem[] {
  return staticRecentActivity;
}

