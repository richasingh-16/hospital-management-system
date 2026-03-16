import { PATIENTS, APPOINTMENTS_DATA, LAB_REPORTS_DATA } from '@/lib/mockData';
import type {
  Appointment,
  LabReport,
  Patient,
  DashboardKpi,
} from '@/lib/types';

const myConsultationsWeek = [
  { day: 'Mon', count: 7 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 9 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 8 },
  { day: 'Sat', count: 3 },
  { day: 'Sun', count: 2 },
];

export function getDoctorPatients(doctorName: string): Patient[] {
  return PATIENTS.filter((p) => p.doctor === doctorName);
}

export function getDoctorAppointments(doctorName: string): Appointment[] {
  return APPOINTMENTS_DATA.filter((a) => a.doctor === doctorName);
}

export function getDoctorLabReports(doctorName: string): LabReport[] {
  return LAB_REPORTS_DATA.filter((l) => l.orderedBy === doctorName);
}

export function getDoctorScheduleForDate(doctorName: string, date: string) {
  const myAppointments = getDoctorAppointments(doctorName);
  const todayAppts = myAppointments.filter((a) => a.date === date);
  const scheduleToShow = todayAppts.length > 0 ? todayAppts : myAppointments;
  const completedToday = todayAppts.filter((a) => a.status === 'Completed').length;

  return { todayAppts, scheduleToShow, completedToday };
}

export function getDoctorDiagnosisMix(patients: Patient[]) {
  const diagMap: Record<string, number> = {};
  patients.forEach((p) => {
    const key = p.condition.split(' ')[0];
    diagMap[key] = (diagMap[key] ?? 0) + 1;
  });
  return Object.entries(diagMap).map(([name, value]) => ({ name, value }));
}

export function getDoctorUrgentPatients(patients: Patient[]): Patient[] {
  return patients.filter(
    (p) =>
      p.status === 'Admitted' &&
      ['Cardiac Arrest', 'ICU', 'Emergency'].some((kw) =>
        p.condition.toLowerCase().includes(kw.toLowerCase()) ||
        p.ward.toLowerCase().includes(kw.toLowerCase()),
      ),
  );
}

export function getDoctorCriticalLabs(doctorName: string): LabReport[] {
  const myLabReports = getDoctorLabReports(doctorName);
  return myLabReports.filter(
    (l) =>
      l.status !== 'Ready' &&
      ['ECG', 'Lipid', 'LFT', 'CBC'].some((kw) => l.testType.includes(kw)),
  );
}

export function getDoctorKpis(doctorName: string, today: string): DashboardKpi[] {
  const myPatients = getDoctorPatients(doctorName);
  const myAppointments = getDoctorAppointments(doctorName);
  const { todayAppts, completedToday } = getDoctorScheduleForDate(doctorName, today);
  const myLabReports = getDoctorLabReports(doctorName);
  const pendingReports = myLabReports.filter(
    (l) => l.status === 'Pending' || l.status === 'Processing',
  );

  return [
    {
      label: 'My Patients',
      value: myPatients.length,
      context: `${myPatients.filter((p) => p.status === 'Admitted').length} admitted · ${
        myPatients.filter((p) => p.status === 'OPD').length
      } OPD`,
    },
    {
      label: 'Appointments Today',
      value: todayAppts.length || myAppointments.length,
      context: todayAppts.length
        ? `${completedToday} completed · ${todayAppts.length - completedToday} remaining`
        : `${myAppointments.filter((a) => a.status === 'Completed').length} completed overall`,
    },
    {
      label: 'Pending Lab Reports',
      value: pendingReports.length,
      context:
        pendingReports.length === 0
          ? 'All reports ready'
          : `${pendingReports.filter((l) => l.status === 'Pending').length} pending · ${
              pendingReports.filter((l) => l.status === 'Processing').length
            } processing`,
    },
    {
      label: 'Consultations Done',
      value: myAppointments.filter((a) => a.status === 'Completed').length,
      context: `Out of ${myAppointments.length} total`,
    },
  ];
}

export function getDoctorConsultationsWeek() {
  return myConsultationsWeek;
}

