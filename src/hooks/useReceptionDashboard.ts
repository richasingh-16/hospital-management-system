/**
 * useReceptionDashboard — live API version
 */
import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/services/api';

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Morning' : HOUR < 17 ? 'Afternoon' : 'Evening';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useReceptionDashboard() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients,     setPatients]     = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/appointments').then(setAppointments).catch(() => {});
    apiFetch('/patients')
      .then((data: any) => setPatients(Array.isArray(data) ? data : (data.patients ?? [])))
      .catch(() => {});
  }, []);

  const todayAppts  = useMemo(() => appointments.filter((a: any) => a.date === today),  [appointments, today]);
  const apptToShow  = useMemo(() => todayAppts.length > 0 ? todayAppts : appointments.slice(0, 6), [todayAppts, appointments]);
  const recentPatients  = useMemo(() => patients.slice(0, 5), [patients]);
  const scheduledToday  = useMemo(() => todayAppts.filter((a: any) => a.status === 'Scheduled').length,  [todayAppts]);
  const completedToday  = useMemo(() => todayAppts.filter((a: any) => a.status === 'Completed').length,  [todayAppts]);
  const admittedCount   = useMemo(() => patients.filter((p: any) => p.status === 'Admitted').length,     [patients]);

  const kpis = useMemo(() => [
    { label: "Today's Appointments", value: todayAppts.length,  context: `${scheduledToday} scheduled`, bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100',   icon: '📅' },
    { label: 'Total Patients',        value: patients.length,    context: 'registered',                  bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100', icon: '👤' },
    { label: 'Currently Admitted',    value: admittedCount,      context: 'inpatients',                  bg: 'bg-teal-50',   color: 'text-teal-600',   border: 'border-teal-100',   icon: '🛏' },
    { label: 'Completed Today',       value: completedToday,     context: 'consultations done',          bg: 'bg-green-50',  color: 'text-green-600',  border: 'border-green-100',  icon: '✅' },
  ], [todayAppts, patients, scheduledToday, admittedCount, completedToday]);

  const appointmentVolume = useMemo(() => {
    const scheduled: Record<string, number> = {};
    const walkin:    Record<string, number> = {};
    WEEK_DAYS.forEach(d => { scheduled[d] = 0; walkin[d] = 0; });
    appointments.forEach((a: any) => {
      const d = new Date(a.date);
      const day = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      if (a.type?.toLowerCase().includes('walk')) walkin[day] = (walkin[day] ?? 0) + 1;
      else scheduled[day] = (scheduled[day] ?? 0) + 1;
    });
    return WEEK_DAYS.map(day => ({ day, scheduled: scheduled[day] ?? 0, walkin: walkin[day] ?? 0 }));
  }, [appointments]);

  return {
    greeting:            GREETING,
    today,
    kpis,
    appointmentVolume,
    recentPatients,
    admissionsToday:     admittedCount,
    todayAppts,
    apptToShow,
    todayHasExactMatches: todayAppts.length > 0,
  };
}
