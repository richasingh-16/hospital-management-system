import { APPOINTMENTS_DATA, PATIENTS } from '@/lib/mockData';
import type { Appointment, DashboardKpi, Patient } from '@/lib/types';

const appointmentVolume = [
  { day: 'Mon', scheduled: 45, walkin: 12 },
  { day: 'Tue', scheduled: 38, walkin: 9 },
  { day: 'Wed', scheduled: 52, walkin: 14 },
  { day: 'Thu', scheduled: 43, walkin: 11 },
  { day: 'Fri', scheduled: 58, walkin: 17 },
  { day: 'Sat', scheduled: 28, walkin: 8 },
  { day: 'Sun', scheduled: 15, walkin: 4 },
];

export function getReceptionTodayAppointments(date: string): {
  todayAppts: Appointment[];
  apptToShow: Appointment[];
} {
  const todayAppts = APPOINTMENTS_DATA.filter((a) => a.date === date);
  const apptToShow = todayAppts.length > 0 ? todayAppts : APPOINTMENTS_DATA;
  return { todayAppts, apptToShow };
}

export function getReceptionRecentPatients(): Patient[] {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return PATIENTS.filter((p) => new Date(p.admittedOn) >= threeDaysAgo)
    .sort(
      (a, b) =>
        new Date(b.admittedOn).getTime() - new Date(a.admittedOn).getTime(),
    )
    .slice(0, 6);
}

export function getReceptionAdmissionsToday(date: string): number {
  return PATIENTS.filter(
    (p) => p.admittedOn === date && p.status === 'Admitted',
  ).length;
}

export function getReceptionKpis(date: string): DashboardKpi[] {
  const { apptToShow } = getReceptionTodayAppointments(date);
  const checkinsPending = apptToShow.filter(
    (a) => a.status === 'Scheduled',
  ).length;
  const recentPatients = getReceptionRecentPatients();
  const admissionsToday = getReceptionAdmissionsToday(date);
  const admittedNow = PATIENTS.filter((p) => p.status === 'Admitted').length;

  return [
    {
      label: 'Appointments Today',
      value: apptToShow.length,
      context:
        checkinsPending > 0
          ? `${checkinsPending} pending check-in`
          : 'All checked in',
    },
    {
      label: 'Check-ins Pending',
      value: checkinsPending,
      context:
        checkinsPending > 0
          ? 'Patients awaiting check-in'
          : 'No pending check-ins ✓',
    },
    {
      label: 'New Registrations',
      value: recentPatients.length,
      context: 'Registered in last 3 days',
    },
    {
      label: 'Admissions Today',
      value: admissionsToday || admittedNow,
      context: admissionsToday
        ? 'Admitted today'
        : `${admittedNow} currently admitted`,
    },
  ];
}

export function getReceptionAppointmentVolume() {
  return appointmentVolume;
}

