import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '@/services/api';
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

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch("/dashboard/admin")
      .then(setData)
      .catch(console.error);
  }, []);

  const kpis = useMemo(() => {
    return [
      {
        label: 'Total Patients',
        value: data ? data.totalPatients : '...',
        context: 'Across all wards',
      },
      {
        label: 'Admissions Today',
        value: data ? data.todayAdmissions : '...',
        context: 'Admitted recently',
      },
      {
        label: 'Beds Available',
        value: data ? `${data.availableBeds} / ${data.availableBeds + data.occupiedBeds}` : '...',
        context: data && (data.availableBeds + data.occupiedBeds) > 0 
          ? `${Math.round((data.availableBeds / (data.availableBeds + data.occupiedBeds)) * 100)}% capacity free`
          : '...',
      },
      {
        label: 'Total Doctors',
        value: data ? data.totalDoctors : '...',
        context: 'Active staff',
      },
    ];
  }, [data]);

  const admissionsSeries = useMemo(
    () => getAdmissionsSeries(chartRange),
    [chartRange],
  );
  
  const wardCapacity = useMemo(() => data?.wardCapacity || [], [data]);
  const alerts = useMemo(() => generateSystemAlerts(), []);
  const schedule = useMemo(() => getScheduleForDate(today), [today]);
  const activity = useMemo(() => data?.recentActivity || [], [data]);

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

