import { useState, useMemo } from 'react';
import {
  getAdminKpis,
  getAdmissionsSeries,
  getWardCapacity,
  generateSystemAlerts,
  getScheduleForDate,
  getRecentActivity,
  type AdmissionsRange,
} from '@/services/adminDashboardService';

export function useAdminDashboard() {
  const [chartRange, setChartRange] = useState<AdmissionsRange>('7');

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const kpis = useMemo(() => getAdminKpis(), []);
  const admissionsSeries = useMemo(
    () => getAdmissionsSeries(chartRange),
    [chartRange],
  );
  const wardCapacity = useMemo(() => getWardCapacity(), []);
  const alerts = useMemo(() => generateSystemAlerts(), []);
  const schedule = useMemo(() => getScheduleForDate(today), [today]);
  const activity = useMemo(() => getRecentActivity(), []);

  const greeting =
    new Date().getHours() < 12
      ? 'Morning'
      : new Date().getHours() < 17
      ? 'Afternoon'
      : 'Evening';

  return {
    greeting,
    chartRange,
    setChartRange,
    kpis,
    admissionsSeries,
    wardCapacity,
    alerts,
    schedule,
    activity,
  };
}

