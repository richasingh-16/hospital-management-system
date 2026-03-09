// ---------------------------------------------------------------------------
// Shared mock data — used across Patients, PatientProfile, Admissions, etc.
// ---------------------------------------------------------------------------

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
  admittedOn: string;
  status: PatientStatus;
  contact: string;
  email: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string[];
  pastSurgeries: string[];
}

export const PATIENTS: Patient[] = [
  {
    id: 'P-001', name: 'Rahul Verma',   age: 34, gender: 'Male',   bloodGroup: 'B+',
    condition: 'Hypertension',   doctor: 'Dr. Ananya Bose',  ward: 'General',   bed: 'G-12',
    admittedOn: '2026-03-01', status: 'Admitted',   contact: '+91 98765 43210',
    email: 'rahul.verma@email.com', address: '12, Nehru Nagar, Surat, Gujarat',
    emergencyContact: '+91 87654 32109 (Wife)',
    allergies: ['Penicillin', 'Aspirin'],
    medicalHistory: ['Hypertension (2021)', 'Type 2 Diabetes (2019)', 'Viral Fever (2023)'],
    pastSurgeries: [],
  },
  {
    id: 'P-002', name: 'Priya Sharma',  age: 27, gender: 'Female', bloodGroup: 'A+',
    condition: 'Appendicitis',   doctor: 'Dr. Rohan Mehta',  ward: 'Surgery',   bed: 'S-04',
    admittedOn: '2026-03-04', status: 'Admitted',   contact: '+91 97654 32109',
    email: 'priya.sharma@email.com', address: '45, Patel Colony, Vadodara, Gujarat',
    emergencyContact: '+91 96543 21098 (Mother)',
    allergies: ['Sulfa drugs'],
    medicalHistory: ['Appendicitis (2026)', 'Thyroid disorder (2022)'],
    pastSurgeries: ['Appendectomy — in progress'],
  },
  {
    id: 'P-003', name: 'Arjun Patel',   age: 52, gender: 'Male',   bloodGroup: 'O-',
    condition: 'Cardiac Arrest',  doctor: 'Dr. Neha Singh',   ward: 'ICU',       bed: 'ICU-03',
    admittedOn: '2026-03-05', status: 'Admitted',   contact: '+91 96543 21098',
    email: 'arjun.patel@email.com', address: '7, Ring Road, Ahmedabad, Gujarat',
    emergencyContact: '+91 95432 10987 (Son)',
    allergies: ['Ibuprofen', 'Latex'],
    medicalHistory: ['Cardiac Arrest (2026)', 'Hypertension (2018)', 'Angina (2020)'],
    pastSurgeries: ['Coronary Angioplasty (2021)'],
  },
  {
    id: 'P-004', name: 'Sunita Iyer',   age: 45, gender: 'Female', bloodGroup: 'AB+',
    condition: 'Diabetes',        doctor: 'Dr. Ananya Bose',  ward: 'General',
    admittedOn: '2026-03-03', status: 'OPD',        contact: '+91 95432 10987',
    email: 'sunita.iyer@email.com', address: '33, MG Road, Pune, Maharashtra',
    emergencyContact: '+91 94321 09876 (Husband)',
    allergies: ['None known'],
    medicalHistory: ['Type 2 Diabetes (2016)', 'Hypertension (2020)'],
    pastSurgeries: [],
  },
  {
    id: 'P-005', name: 'Vikram Desai',  age: 60, gender: 'Male',   bloodGroup: 'B-',
    condition: 'Knee Replacement', doctor: 'Dr. Rohan Mehta',  ward: 'Ortho',
    admittedOn: '2026-02-28', status: 'Discharged', contact: '+91 94321 09876',
    email: 'vikram.desai@email.com', address: '22, Civil Lines, Nagpur, Maharashtra',
    emergencyContact: '+91 93210 98765 (Daughter)',
    allergies: ['Codeine'],
    medicalHistory: ['Osteoarthritis (2020)', 'Knee pain (2022)'],
    pastSurgeries: ['Left Knee Replacement (2026-02-28)'],
  },
  {
    id: 'P-006', name: 'Meera Nair',    age: 31, gender: 'Female', bloodGroup: 'A-',
    condition: 'Pneumonia',        doctor: 'Dr. Kiran Rao',    ward: 'General',   bed: 'G-20',
    admittedOn: '2026-03-02', status: 'Admitted',   contact: '+91 93210 98765',
    email: 'meera.nair@email.com', address: '8, Connaught Place, Kochi, Kerala',
    emergencyContact: '+91 92109 87654 (Father)',
    allergies: ['Erythromycin'],
    medicalHistory: ['Pneumonia (2026)', 'Asthma (2015)', 'Seasonal Allergies'],
    pastSurgeries: [],
  },
  {
    id: 'P-007', name: 'Aditya Kumar',  age: 22, gender: 'Male',   bloodGroup: 'O+',
    condition: 'Fracture - Arm',   doctor: 'Dr. Rohan Mehta',  ward: 'Emergency', bed: 'E-02',
    admittedOn: '2026-03-06', status: 'Admitted',   contact: '+91 92109 87654',
    email: 'aditya.kumar@email.com', address: '5, Connaught Circus, Delhi',
    emergencyContact: '+91 91098 76543 (Mother)',
    allergies: ['None known'],
    medicalHistory: ['Fracture - Right Arm (2026)'],
    pastSurgeries: [],
  },
  {
    id: 'P-008', name: 'Deepa Menon',   age: 39, gender: 'Female', bloodGroup: 'B+',
    condition: 'Migraine',         doctor: 'Dr. Neha Singh',   ward: 'Neurology',
    admittedOn: '2026-03-05', status: 'OPD',        contact: '+91 91098 76543',
    email: 'deepa.menon@email.com', address: '15, Brigade Road, Bangalore, Karnataka',
    emergencyContact: '+91 90987 65432 (Husband)',
    allergies: ['Opioids'],
    medicalHistory: ['Chronic Migraine (2018)', 'Cervical Spondylosis (2022)'],
    pastSurgeries: [],
  },
  {
    id: 'P-009', name: 'Sanjay Gupta',  age: 58, gender: 'Male',   bloodGroup: 'AB-',
    condition: 'Liver Cirrhosis',  doctor: 'Dr. Kiran Rao',    ward: 'ICU',       bed: 'ICU-07',
    admittedOn: '2026-03-03', status: 'Admitted',   contact: '+91 90987 65432',
    email: 'sanjay.gupta@email.com', address: '77, Civil Lines, Jaipur, Rajasthan',
    emergencyContact: '+91 89876 54321 (Brother)',
    allergies: ['Metformin'],
    medicalHistory: ['Liver Cirrhosis (2025)', 'Hepatitis B (2020)', 'Type 2 Diabetes'],
    pastSurgeries: ['Liver Biopsy (2025)'],
  },
  {
    id: 'P-010', name: 'Kavitha Reddy', age: 44, gender: 'Female', bloodGroup: 'O+',
    condition: 'Typhoid Fever',    doctor: 'Dr. Ananya Bose',  ward: 'General',
    admittedOn: '2026-03-01', status: 'Discharged', contact: '+91 89876 54321',
    email: 'kavitha.reddy@email.com', address: '3, Banjara Hills, Hyderabad, Telangana',
    emergencyContact: '+91 88765 43210 (Sister)',
    allergies: ['Amoxicillin'],
    medicalHistory: ['Typhoid (2026)', 'Anemia (2019)'],
    pastSurgeries: [],
  },
];

export const APPOINTMENTS_DATA = [
  { id: 'APT-001', patientId: 'P-001', patientName: 'Rahul Verma',   doctor: 'Dr. Ananya Bose',  department: 'General Medicine', date: '2026-03-06', time: '09:00', type: 'OPD',       status: 'Scheduled'  },
  { id: 'APT-002', patientId: 'P-002', patientName: 'Priya Sharma',  doctor: 'Dr. Rohan Mehta',  department: 'Orthopedics',      date: '2026-03-06', time: '10:30', type: 'Follow-up',  status: 'Scheduled'  },
  { id: 'APT-003', patientId: 'P-003', patientName: 'Arjun Patel',   doctor: 'Dr. Neha Singh',   department: 'Neurology',        date: '2026-03-06', time: '11:00', type: 'OPD',       status: 'Completed'  },
  { id: 'APT-004', patientId: 'P-004', patientName: 'Sunita Iyer',   doctor: 'Dr. Ananya Bose',  department: 'General Medicine', date: '2026-03-06', time: '14:00', type: 'Checkup',    status: 'Scheduled'  },
  { id: 'APT-005', patientId: 'P-001', patientName: 'Rahul Verma',   doctor: 'Dr. Ananya Bose',  department: 'General Medicine', date: '2026-02-20', time: '10:00', type: 'Follow-up',  status: 'Completed'  },
  { id: 'APT-006', patientId: 'P-007', patientName: 'Aditya Kumar',  doctor: 'Dr. Rohan Mehta',  department: 'Orthopedics',      date: '2026-03-07', time: '15:00', type: 'Emergency',  status: 'Scheduled'  },
  { id: 'APT-007', patientId: 'P-008', patientName: 'Deepa Menon',   doctor: 'Dr. Neha Singh',   department: 'Neurology',        date: '2026-03-05', time: '10:00', type: 'OPD',       status: 'Completed'  },
];

export const LAB_REPORTS_DATA = [
  { id: 'LAB-001', patientId: 'P-001', patientName: 'Rahul Verma',  testType: 'Complete Blood Count (CBC)',  orderedBy: 'Dr. Ananya Bose',  orderedOn: '2026-03-01', status: 'Ready',      result: 'Hemoglobin: 13.2 g/dL, WBC: 7200/µL — Normal' },
  { id: 'LAB-002', patientId: 'P-003', patientName: 'Arjun Patel',  testType: 'ECG',                         orderedBy: 'Dr. Neha Singh',   orderedOn: '2026-03-05', status: 'Ready',      result: 'ST-segment elevation in V1–V4. Refer to cardiologist.' },
  { id: 'LAB-003', patientId: 'P-002', patientName: 'Priya Sharma', testType: 'X-Ray Chest',                 orderedBy: 'Dr. Rohan Mehta',  orderedOn: '2026-03-04', status: 'Processing', result: undefined },
  { id: 'LAB-004', patientId: 'P-004', patientName: 'Sunita Iyer',  testType: 'HbA1c',                       orderedBy: 'Dr. Ananya Bose',  orderedOn: '2026-03-03', status: 'Ready',      result: 'HbA1c: 7.8% — Poorly controlled diabetes' },
  { id: 'LAB-005', patientId: 'P-009', patientName: 'Sanjay Gupta', testType: 'Liver Function Test (LFT)',   orderedBy: 'Dr. Kiran Rao',    orderedOn: '2026-03-03', status: 'Ready',      result: 'ALT: 120 U/L, AST: 98 U/L — Elevated, monitor closely' },
  { id: 'LAB-006', patientId: 'P-001', patientName: 'Rahul Verma',  testType: 'Lipid Profile',               orderedBy: 'Dr. Ananya Bose',  orderedOn: '2026-03-06', status: 'Pending',    result: undefined },
];

export const BILLING_DATA = [
  { id: 'INV-001', patientId: 'P-001', patientName: 'Rahul Verma',  doctor: 'Dr. Ananya Bose',  doctorFee: 1500, labTests: 2200, medication: 800,  roomCharges: 3000, date: '2026-03-01', status: 'Paid'    },
  { id: 'INV-002', patientId: 'P-002', patientName: 'Priya Sharma', doctor: 'Dr. Rohan Mehta',  doctorFee: 2000, labTests: 3400, medication: 1200, roomCharges: 4000, date: '2026-03-04', status: 'Pending' },
  { id: 'INV-003', patientId: 'P-003', patientName: 'Arjun Patel',  doctor: 'Dr. Neha Singh',   doctorFee: 3000, labTests: 5000, medication: 2500, roomCharges: 7000, date: '2026-03-05', status: 'Pending' },
  { id: 'INV-004', patientId: 'P-001', patientName: 'Rahul Verma',  doctor: 'Dr. Ananya Bose',  doctorFee: 800,  labTests: 1200, medication: 500,  roomCharges: 0,    date: '2026-02-20', status: 'Paid'    },
  { id: 'INV-005', patientId: 'P-006', patientName: 'Meera Nair',   doctor: 'Dr. Kiran Rao',    doctorFee: 1500, labTests: 2500, medication: 900,  roomCharges: 3000, date: '2026-03-02', status: 'Overdue' },
];
