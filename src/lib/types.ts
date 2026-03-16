// Shared domain types for the hospital app.
// Centralizing here makes it easy to plug in a real backend later.

export type PatientStatus = 'OPD' | 'Admitted' | 'Discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  condition: string;
  doctor: string;
  ward: string;
  bed?: string;
  admittedOn: string; // ISO date (YYYY-MM-DD)
  status: PatientStatus;
  contact: string;
  email: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string[];
  pastSurgeries: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  department: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // HH:mm
  type: string;
  status: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  orderedBy: string;
  orderedOn: string; // ISO date (YYYY-MM-DD)
  status: 'Ready' | 'Pending' | 'Processing';
  result?: string;
}

export interface BillingInvoice {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  doctorFee: number;
  labTests: number;
  medication: number;
  roomCharges: number;
  date: string; // ISO date (YYYY-MM-DD)
  status: string;
}

export interface WardCapacity {
  name: string;
  occupied: number;
  total: number;
}

export type AlertLevel = 'high' | 'medium' | 'low';

export interface Alert {
  text: string;
  level: AlertLevel;
}

export interface DashboardKpi {
  label: string;
  value: number | string;
  context: string;
}

export interface RecentActivityItem {
  text: string;
  time: string;
  color: string;
}

