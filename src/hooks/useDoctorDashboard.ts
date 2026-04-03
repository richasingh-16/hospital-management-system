/**
 * useDoctorDashboard — live API version
 * Fetches appointments, patients, and lab reports from the backend.
 */
import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/services/api';

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Morning' : HOUR < 17 ? 'Afternoon' : 'Evening';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useDoctorDashboard(doctorName: string | undefined | null) {
  const today    = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const safeName = doctorName ?? '';

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients,     setPatients]     = useState<any[]>([]);
  const [labs,         setLabs]         = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/appointments').then(setAppointments).catch(() => {});
    apiFetch('/patients')
      .then((data: any) => setPatients(Array.isArray(data) ? data : (data.patients ?? [])))
      .catch(() => {});
    apiFetch('/lab-reports').then(setLabs).catch(() => {});
  }, []);

  const myAppts    = useMemo(() => appointments.filter((a: any) => a.doctor === safeName),     [appointments, safeName]);
  const myPatients = useMemo(() => patients.filter((p: any) => p.doctor === safeName),         [patients,     safeName]);
  const myLabs     = useMemo(() => labs.filter((l: any) => l.orderedBy === safeName),          [labs,         safeName]);

  const todayAppts     = useMemo(() => myAppts.filter((a: any) => a.date === today), [myAppts, today]);
  const scheduleToShow = useMemo(() => todayAppts.length > 0 ? todayAppts : myAppts.slice(0, 5), [todayAppts, myAppts]);
  const completedToday = useMemo(() => todayAppts.filter((a: any) => a.status === 'Completed').length, [todayAppts]);

  const diagnosisMix = useMemo(() => {
    const counts: Record<string, number> = {};
    myPatients.forEach((p: any) => { if (p.condition) counts[p.condition] = (counts[p.condition] ?? 0) + 1; });
    return Object.entries(counts).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [myPatients]);

  const urgentPatients = useMemo(() => myPatients.filter((p: any) => p.status === 'Admitted').slice(0, 5),               [myPatients]);
  const criticalLabs   = useMemo(() => myLabs.filter((l: any) => l.status === 'Pending' || l.status === 'Processing').slice(0, 3), [myLabs]);

  const kpis = useMemo(() => [
    { label: 'My Patients',     value: myPatients.length,                      context: 'total assigned',    bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100',   icon: '👥' },
    { label: "Today's Appts",   value: todayAppts.length,                      context: `${completedToday} completed`, bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100', icon: '📅' },
    { label: 'Pending Labs',    value: criticalLabs.length,                    context: 'awaiting results',  bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100', icon: '🔬' },
    { label: 'Needs Attention', value: urgentPatients.length + criticalLabs.length, context: 'urgent items', bg: 'bg-red-50',    color: 'text-red-600',    border: 'border-red-100',    icon: '⚠️' },
  ], [myPatients, todayAppts, completedToday, criticalLabs, urgentPatients]);

  const consultationsWeek = useMemo(() => {
    const counts: Record<string, number> = {};
    WEEK_DAYS.forEach(d => { counts[d] = 0; });
    myAppts.forEach((a: any) => {
      const d = new Date(a.date);
      const day = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      counts[day] = (counts[day] ?? 0) + 1;
    });
    return WEEK_DAYS.map(day => ({ day, count: counts[day] ?? 0 }));
  }, [myAppts]);

  return {
    greeting: GREETING,
    today,
    patients:        myPatients,
    appointments:    myAppts,
    labReports:      myLabs,
    todayAppts,
    scheduleToShow,
    completedToday,
    diagnosisMix,
    urgentPatients,
    criticalLabs,
    kpis,
    consultationsWeek,
  };
}
