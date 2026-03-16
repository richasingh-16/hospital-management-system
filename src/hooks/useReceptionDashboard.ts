import { useMemo } from 'react';
import {
  getReceptionAdmissionsToday,
  getReceptionAppointmentVolume,
  getReceptionKpis,
  getReceptionRecentPatients,
  getReceptionTodayAppointments,
} from '@/services/receptionDashboardService';

export function useReceptionDashboard() {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const { todayAppts, apptToShow } = useMemo(
    () => getReceptionTodayAppointments(today),
    [today],
  );
  const kpis = useMemo(
    () => getReceptionKpis(today),
    [today],
  );
  const appointmentVolume = useMemo(
    () => getReceptionAppointmentVolume(),
    [],
  );
  const recentPatients = useMemo(
    () => getReceptionRecentPatients(),
    [],
  );
  const admissionsToday = useMemo(
    () => getReceptionAdmissionsToday(today),
    [today],
  );

  const greeting =
    new Date().getHours() < 12
      ? 'Morning'
      : new Date().getHours() < 17
      ? 'Afternoon'
      : 'Evening';

  const todayHasExactMatches = todayAppts.length > 0;

  return {
    greeting,
    today,
    kpis,
    appointmentVolume,
    recentPatients,
    admissionsToday,
    todayAppts,
    apptToShow,
    todayHasExactMatches,
  };
}

