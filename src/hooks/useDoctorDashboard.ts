import { useMemo } from 'react';
import {
  getDoctorAppointments,
  getDoctorConsultationsWeek,
  getDoctorCriticalLabs,
  getDoctorDiagnosisMix,
  getDoctorKpis,
  getDoctorLabReports,
  getDoctorPatients,
  getDoctorScheduleForDate,
  getDoctorUrgentPatients,
} from '@/services/doctorDashboardService';

export function useDoctorDashboard(doctorName: string | undefined | null) {
  const safeName = doctorName ?? '';
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const patients = useMemo(
    () => getDoctorPatients(safeName),
    [safeName],
  );
  const appointments = useMemo(
    () => getDoctorAppointments(safeName),
    [safeName],
  );
  const labReports = useMemo(
    () => getDoctorLabReports(safeName),
    [safeName],
  );
  const { todayAppts, scheduleToShow, completedToday } = useMemo(
    () => getDoctorScheduleForDate(safeName, today),
    [safeName, today],
  );
  const diagnosisMix = useMemo(
    () => getDoctorDiagnosisMix(patients),
    [patients],
  );
  const urgentPatients = useMemo(
    () => getDoctorUrgentPatients(patients),
    [patients],
  );
  const criticalLabs = useMemo(
    () => getDoctorCriticalLabs(safeName),
    [safeName],
  );
  const kpis = useMemo(
    () => getDoctorKpis(safeName, today),
    [safeName, today],
  );
  const consultationsWeek = useMemo(
    () => getDoctorConsultationsWeek(),
    [],
  );

  const greeting =
    new Date().getHours() < 12
      ? 'Morning'
      : new Date().getHours() < 17
      ? 'Afternoon'
      : 'Evening';

  return {
    greeting,
    today,
    patients,
    appointments,
    labReports,
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

