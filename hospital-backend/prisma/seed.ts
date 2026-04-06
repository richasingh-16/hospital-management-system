/**
 * prisma/seed.ts
 * Comprehensive seed for a realistic hospital management database.
 * Run with: npx ts-node prisma/seed.ts
 */

import { PrismaClient, AppointmentStatus, InvoiceStatus, LabStatus, BedStatus, DoctorStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hash(pw, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const hoursAgo = (n: number) => { const d = new Date(); d.setHours(d.getHours() - n); return d; };
const hoursFromNow = (n: number) => { const d = new Date(); d.setHours(d.getHours() + n); return d; };

async function main() {
  console.log('🌱  Seeding database...\n');

  // ── 0. Wipe in FK‑safe order ────────────────────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospitalSetting.deleteMany();
  console.log('✓ Cleared old data');

  // ── 1. Hospital Settings ────────────────────────────────────────────────────
  await prisma.hospitalSetting.createMany({
    data: [
      { key: 'hospitalName',   value: 'Apollo City Hospital' },
      { key: 'currency',       value: 'INR' },
      { key: 'dateFormat',     value: 'DD/MM/YYYY' },
      { key: 'timezone',       value: 'Asia/Kolkata' },
      { key: 'emergencyPhone', value: '+91-11-4040-4040' },
    ],
  });
  console.log('✓ Hospital settings');

  // ── 2. Users (Admin + Receptionists + Lab Techs + Doctors) ─────────────────
  const [adminUser, rec1, rec2, lab1, lab2,
         docUser1, docUser2, docUser3, docUser4, docUser5,
         docUser6, docUser7, docUser8] = await Promise.all([
    prisma.user.create({ data: { employeeId: 'ADM-001', name: 'Hospital Admin',       password: await hash('admin123'),  role: 'ADMIN'         } }),
    prisma.user.create({ data: { employeeId: 'REC-001', name: 'Sneha Kapoor',          password: await hash('rec123'),    role: 'RECEPTIONIST'  } }),
    prisma.user.create({ data: { employeeId: 'REC-002', name: 'Prateek Joshi',         password: await hash('rec123'),    role: 'RECEPTIONIST'  } }),
    prisma.user.create({ data: { employeeId: 'LAB-001', name: 'Ramesh Pillai',         password: await hash('lab123'),    role: 'LAB_TECHNICIAN'} }),
    prisma.user.create({ data: { employeeId: 'LAB-002', name: 'Divya Menon',           password: await hash('lab123'),    role: 'LAB_TECHNICIAN'} }),
    prisma.user.create({ data: { employeeId: 'DOC-001', name: 'Dr. Ananya Bose',       password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-002', name: 'Dr. Rohan Mehta',       password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-003', name: 'Dr. Neha Singh',        password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-004', name: 'Dr. Kiran Rao',         password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-005', name: 'Dr. Suresh Iyer',       password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-006', name: 'Dr. Priya Nambiar',     password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-007', name: 'Dr. Vikram Desai',      password: await hash('doc123'),    role: 'DOCTOR'        } }),
    prisma.user.create({ data: { employeeId: 'DOC-008', name: 'Dr. Meera Krishnan',    password: await hash('doc123'),    role: 'DOCTOR'        } }),
  ]);
  console.log('✓ Users (1 admin, 2 receptionists, 2 lab techs, 8 doctors)');

  // ── 3. Departments ──────────────────────────────────────────────────────────
  const [cardio, neuro, ortho, gastro, pulmo, emergency, gynae, general] = await Promise.all([
    prisma.department.create({ data: { name: 'Cardiology'     } }),
    prisma.department.create({ data: { name: 'Neurology'      } }),
    prisma.department.create({ data: { name: 'Orthopedics'    } }),
    prisma.department.create({ data: { name: 'Gastroenterology' } }),
    prisma.department.create({ data: { name: 'Pulmonology'    } }),
    prisma.department.create({ data: { name: 'Emergency'      } }),
    prisma.department.create({ data: { name: 'Gynaecology'    } }),
    prisma.department.create({ data: { name: 'General Medicine' } }),
  ]);
  console.log('✓ Departments');

  // ── 4. Wards & Beds ─────────────────────────────────────────────────────────
  const wardDefs = [
    { name: 'General',   floor: 1, capacity: 20 },
    { name: 'ICU',       floor: 2, capacity: 10 },
    { name: 'Surgery',   floor: 3, capacity: 12 },
    { name: 'Neurology', floor: 4, capacity: 8  },
    { name: 'Cardiology',floor: 2, capacity: 10 },
    { name: 'Maternity', floor: 5, capacity: 8  },
    { name: 'Emergency', floor: 1, capacity: 6  },
    { name: 'Ortho',     floor: 3, capacity: 10 },
  ];
  const wards = await Promise.all(wardDefs.map(w => prisma.ward.create({ data: w })));
  console.log(`✓ ${wards.length} Wards`);

  // Create beds per ward, return a flat array with ward reference
  type BedRecord = { id: string; wardName: string; status: BedStatus };
  const allBeds: BedRecord[] = [];
  for (const ward of wards) {
    const bedCount = wardDefs.find(w => w.name === ward.name)!.capacity;
    for (let i = 1; i <= bedCount; i++) {
      const bed = await prisma.bed.create({ data: { wardId: ward.id, number: i, status: 'AVAILABLE' } });
      allBeds.push({ id: bed.id, wardName: ward.name, status: 'AVAILABLE' });
    }
  }
  console.log(`✓ ${allBeds.length} Beds`);

  // Helper: get next available bed from a ward
  const usedBeds = new Set<string>();
  const getAvailableBed = (wardName: string) => {
    const bed = allBeds.find(b => b.wardName === wardName && !usedBeds.has(b.id));
    if (!bed) throw new Error(`No available bed in ${wardName}`);
    usedBeds.add(bed.id);
    return bed.id;
  };

  // ── 5. Doctors ──────────────────────────────────────────────────────────────
  const [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8] = await Promise.all([
    prisma.doctor.create({ data: { userId: docUser1.id, departmentId: cardio.id,    specialization: 'Interventional Cardiology', experience: 14, phone: '+91-98765-01001', status: 'AVAILABLE',  patientsToday: 7  } }),
    prisma.doctor.create({ data: { userId: docUser2.id, departmentId: ortho.id,     specialization: 'Joint Replacement Surgery',  experience: 10, phone: '+91-98765-01002', status: 'IN_SURGERY', patientsToday: 5  } }),
    prisma.doctor.create({ data: { userId: docUser3.id, departmentId: neuro.id,     specialization: 'Stroke & Epilepsy',           experience: 12, phone: '+91-98765-01003', status: 'BUSY',       patientsToday: 8  } }),
    prisma.doctor.create({ data: { userId: docUser4.id, departmentId: pulmo.id,     specialization: 'Critical Care & Pulmonology', experience: 9,  phone: '+91-98765-01004', status: 'AVAILABLE',  patientsToday: 6  } }),
    prisma.doctor.create({ data: { userId: docUser5.id, departmentId: gastro.id,    specialization: 'Hepatology & Endoscopy',      experience: 11, phone: '+91-98765-01005', status: 'ON_LEAVE',   patientsToday: 0  } }),
    prisma.doctor.create({ data: { userId: docUser6.id, departmentId: gynae.id,     specialization: 'High-Risk Obstetrics',        experience: 8,  phone: '+91-98765-01006', status: 'AVAILABLE',  patientsToday: 4  } }),
    prisma.doctor.create({ data: { userId: docUser7.id, departmentId: emergency.id, specialization: 'Emergency & Trauma',          experience: 7,  phone: '+91-98765-01007', status: 'BUSY',       patientsToday: 12 } }),
    prisma.doctor.create({ data: { userId: docUser8.id, departmentId: general.id,   specialization: 'Internal Medicine',           experience: 15, phone: '+91-98765-01008', status: 'AVAILABLE',  patientsToday: 9  } }),
  ]);
  console.log('✓ Doctors');

  // Doctor name → Doctor record map for use later
  const docByName: Record<string, typeof doc1> = {
    'Dr. Ananya Bose':    doc1,
    'Dr. Rohan Mehta':    doc2,
    'Dr. Neha Singh':     doc3,
    'Dr. Kiran Rao':      doc4,
    'Dr. Suresh Iyer':    doc5,
    'Dr. Priya Nambiar':  doc6,
    'Dr. Vikram Desai':   doc7,
    'Dr. Meera Krishnan': doc8,
  };

  // ── 6. Patients ─────────────────────────────────────────────────────────────
  const patientDefs = [
    // name, age, gender, condition, doctor, ward, status, contact
    ['Rahul Verma',      34, 'Male',   'Hypertension & CAD',         'Dr. Ananya Bose',    'Cardiology', 'Admitted',  '+91-98001-00001'],
    ['Priya Sharma',     27, 'Female', 'Appendicitis (Post-op)',      'Dr. Rohan Mehta',    'Surgery',    'Admitted',  '+91-98001-00002'],
    ['Arjun Patel',      52, 'Male',   'Ischaemic Stroke',            'Dr. Neha Singh',     'Neurology',  'Admitted',  '+91-98001-00003'],
    ['Sunita Iyer',      45, 'Female', 'Type 2 Diabetes',             'Dr. Ananya Bose',    'General',    'OPD',       '+91-98001-00004'],
    ['Vikram Nair',      60, 'Male',   'Total Knee Replacement',      'Dr. Rohan Mehta',    'Ortho',      'Admitted',  '+91-98001-00005'],
    ['Meera Nair',       31, 'Female', 'Community-acquired Pneumonia','Dr. Kiran Rao',      'General',    'Admitted',  '+91-98001-00006'],
    ['Aditya Kumar',     22, 'Male',   'Displaced Radial Fracture',   'Dr. Rohan Mehta',    'Emergency',  'Admitted',  '+91-98001-00007'],
    ['Deepa Menon',      39, 'Female', 'Migraine with Aura',          'Dr. Neha Singh',     'Neurology',  'OPD',       '+91-98001-00008'],
    ['Sanjay Gupta',     58, 'Male',   'Liver Cirrhosis (Child B)',   'Dr. Kiran Rao',      'ICU',        'Admitted',  '+91-98001-00009'],
    ['Kavitha Reddy',    44, 'Female', 'Typhoid Fever',               'Dr. Ananya Bose',    'General',    'Discharged','+91-98001-00010'],
    ['Mohan Das',        67, 'Male',   'COPD Exacerbation',           'Dr. Kiran Rao',      'ICU',        'Admitted',  '+91-98001-00011'],
    ['Lakshmi Pillai',   29, 'Female', 'Pre-eclampsia',               'Dr. Priya Nambiar',  'Maternity',  'Admitted',  '+91-98001-00012'],
    ['Rohit Jain',       41, 'Male',   'Peptic Ulcer & GI Bleed',     'Dr. Suresh Iyer',    'General',    'Admitted',  '+91-98001-00013'],
    ['Anita Bhatt',      55, 'Female', 'Ovarian Cyst (Post-op)',      'Dr. Priya Nambiar',  'Maternity',  'Admitted',  '+91-98001-00014'],
    ['Suresh Yadav',     48, 'Male',   'Polytrauma — RTA',            'Dr. Vikram Desai',   'Emergency',  'Admitted',  '+91-98001-00015'],
    ['Ritu Singh',       36, 'Female', 'Anaemia — Iron Deficiency',   'Dr. Meera Krishnan', 'General',    'OPD',       '+91-98001-00016'],
    ['Pankaj Choudhary', 53, 'Male',   'Atrial Fibrillation',         'Dr. Ananya Bose',    'Cardiology', 'Admitted',  '+91-98001-00017'],
    ['Nandita Ghosh',    42, 'Female', 'Hypothyroidism + Obesity',    'Dr. Meera Krishnan', 'General',    'OPD',       '+91-98001-00018'],
    ['Tarun Malhotra',   25, 'Male',   'Asthma — acute severe',       'Dr. Kiran Rao',      'General',    'Admitted',  '+91-98001-00019'],
    ['Usha Kumari',      70, 'Female', 'Hip Fracture (Osteoporotic)',  'Dr. Rohan Mehta',    'Ortho',      'Admitted',  '+91-98001-00020'],
    ['Devendra Tiwari',  38, 'Male',   'Acute Pancreatitis',          'Dr. Suresh Iyer',    'ICU',        'Admitted',  '+91-98001-00021'],
    ['Pooja Agarwal',    30, 'Female', 'UTI — recurring',             'Dr. Meera Krishnan', 'General',    'OPD',       '+91-98001-00022'],
    ['Ajay Tripathi',    63, 'Male',   "Parkinson's Disease",         'Dr. Neha Singh',     'Neurology',  'OPD',       '+91-98001-00023'],
    ['Geeta Rao',        50, 'Female', 'Rheumatoid Arthritis',        'Dr. Meera Krishnan', 'General',    'OPD',       '+91-98001-00024'],
    ['Manish Kumar',     33, 'Male',   'Dengue Fever — severe',       'Dr. Vikram Desai',   'Emergency',  'Admitted',  '+91-98001-00025'],
  ];

  const patients = await Promise.all(
    patientDefs.map(([name, age, gender, condition, doctor, ward, status, contact]) =>
      prisma.patient.create({
        data: {
          name: name as string, age: age as number,
          gender: gender as string, condition: condition as string,
          doctor: doctor as string, ward: ward as string,
          status: status as string, contact: contact as string,
        }
      })
    )
  );
  console.log(`✓ ${patients.length} Patients`);

  // ── 7. Admissions (only Admitted patients) ──────────────────────────────────
  const admittedDefs: Array<[number, string, string, string, number]> = [
    // [patientIndex, doctorName, wardName, condition, daysAgoN]
    [0,  'Dr. Ananya Bose',    'Cardiology', 'Hypertension & CAD',          3],
    [1,  'Dr. Rohan Mehta',    'Surgery',    'Appendicitis (Post-op)',       2],
    [2,  'Dr. Neha Singh',     'Neurology',  'Ischaemic Stroke',             5],
    [4,  'Dr. Rohan Mehta',    'Ortho',      'Total Knee Replacement',       4],
    [5,  'Dr. Kiran Rao',      'General',    'Community-acquired Pneumonia', 2],
    [6,  'Dr. Rohan Mehta',    'Emergency',  'Displaced Radial Fracture',    1],
    [8,  'Dr. Kiran Rao',      'ICU',        'Liver Cirrhosis (Child B)',    6],
    [10, 'Dr. Kiran Rao',      'ICU',        'COPD Exacerbation',            4],
    [11, 'Dr. Priya Nambiar',  'Maternity',  'Pre-eclampsia',                1],
    [12, 'Dr. Suresh Iyer',    'General',    'Peptic Ulcer & GI Bleed',      3],
    [13, 'Dr. Priya Nambiar',  'Maternity',  'Ovarian Cyst (Post-op)',       2],
    [14, 'Dr. Vikram Desai',   'Emergency',  'Polytrauma — RTA',             0],
    [16, 'Dr. Ananya Bose',    'Cardiology', 'Atrial Fibrillation',          2],
    [18, 'Dr. Kiran Rao',      'General',    'Asthma — acute severe',        1],
    [19, 'Dr. Rohan Mehta',    'Ortho',      'Hip Fracture (Osteoporotic)',   3],
    [20, 'Dr. Suresh Iyer',    'ICU',        'Acute Pancreatitis',           2],
    [24, 'Dr. Vikram Desai',   'Emergency',  'Dengue Fever — severe',        1],
  ];

  for (const [pIdx, docName, wardName, reason, ago] of admittedDefs) {
    await prisma.admission.create({
      data: {
        patientId: patients[pIdx].id,
        doctorId:  docByName[docName].id,
        bedId:     getAvailableBed(wardName),
        reason,
        createdAt: daysAgo(ago),
      }
    });
  }
  console.log(`✓ ${admittedDefs.length} Admissions`);

  // ── 8. Appointments ──────────────────────────────────────────────────────────
  const apptDefs: Array<[number, string, Date, AppointmentStatus, string]> = [
    // [patientIdx, doctorName, dateTime, status, notes]
    [3,  'Dr. Ananya Bose',    hoursAgo(2),       'COMPLETED', 'Routine follow-up for hypertension; BP 140/90'],
    [7,  'Dr. Neha Singh',     hoursAgo(1),       'COMPLETED', 'Migraine frequency increasing; added topiramate'],
    [15, 'Dr. Meera Krishnan', hoursAgo(3),       'COMPLETED', 'Haemoglobin 8.2 g/dL; started oral iron therapy'],
    [17, 'Dr. Meera Krishnan', hoursAgo(4),       'COMPLETED', 'TSH elevated; Eltroxin dose increased'],
    [21, 'Dr. Meera Krishnan', hoursAgo(1),       'COMPLETED', 'Repeat urine culture ordered'],
    [22, 'Dr. Neha Singh',     hoursAgo(5),       'COMPLETED', 'Parkinson tremor assessment; levodopa titrated'],
    [23, 'Dr. Meera Krishnan', hoursAgo(2),       'COMPLETED', 'RA flare; methylprednisolone injections'],
    [0,  'Dr. Ananya Bose',    hoursFromNow(1),   'SCHEDULED', 'Echo results review'],
    [2,  'Dr. Neha Singh',     hoursFromNow(2),   'SCHEDULED', 'MRI brain follow-up'],
    [4,  'Dr. Rohan Mehta',    hoursFromNow(3),   'SCHEDULED', 'Post-knee-replacement physio assessment'],
    [8,  'Dr. Kiran Rao',      hoursFromNow(1),   'SCHEDULED', 'LFT + INR monitoring'],
    [10, 'Dr. Kiran Rao',      hoursFromNow(2),   'SCHEDULED', 'ABG + spirometry review'],
    [12, 'Dr. Suresh Iyer',    hoursFromNow(4),   'SCHEDULED', 'Upper GI endoscopy scheduled'],
    [16, 'Dr. Ananya Bose',    hoursFromNow(2),   'SCHEDULED', 'Holter monitor results'],
    [20, 'Dr. Suresh Iyer',    hoursFromNow(3),   'SCHEDULED', 'Amylase/lipase trending down'],
    [24, 'Dr. Vikram Desai',   hoursFromNow(1),   'SCHEDULED', 'NS3 antigen + platelet monitoring'],
    [3,  'Dr. Ananya Bose',    daysAgo(7),        'COMPLETED', 'Initial consultation — BP poorly controlled'],
    [7,  'Dr. Neha Singh',     daysAgo(5),        'COMPLETED', 'Started preventive therapy'],
    [22, 'Dr. Neha Singh',     daysAgo(3),        'COMPLETED', 'DaTscan reviewed'],
    [9,  'Dr. Ananya Bose',    daysAgo(2),        'COMPLETED', 'Post-typhoid; discharged with antibiotics'],
    [15, 'Dr. Meera Krishnan', hoursFromNow(24),  'SCHEDULED', '2-week Hb recheck'],
    [17, 'Dr. Meera Krishnan', hoursFromNow(48),  'SCHEDULED', 'Thyroid panel follow-up'],
    [5,  'Dr. Kiran Rao',      daysAgo(1),        'CANCELLED', 'Patient unavailable'],
    [11, 'Dr. Priya Nambiar',  daysAgo(1),        'CANCELLED', 'Rescheduled — emergency admission'],
  ];

  for (const [pIdx, docName, dt, status, notes] of apptDefs) {
    await prisma.appointment.create({
      data: {
        patientId: patients[pIdx].id,
        doctorId:  docByName[docName].id,
        dateTime:  dt,
        status,
        notes,
      }
    });
  }
  console.log(`✓ ${apptDefs.length} Appointments`);

  // ── 9. Lab Reports ───────────────────────────────────────────────────────────
  const labDefs: Array<[number | null, string, string, string, LabStatus, number]> = [
    // [patientIdx|null, patientNameOverride, testType, orderedBy, status, daysAgo]
    [0,  '', 'Troponin-I (High Sensitivity)',     'Dr. Ananya Bose',    'READY',      3],
    [0,  '', 'Echocardiography Report',           'Dr. Ananya Bose',    'READY',      2],
    [1,  '', 'Complete Blood Count (CBC)',         'Dr. Rohan Mehta',    'READY',      2],
    [2,  '', 'MRI Brain (Diffusion-weighted)',     'Dr. Neha Singh',     'READY',      5],
    [2,  '', 'Coagulation Profile (INR/PT)',       'Dr. Neha Singh',     'READY',      4],
    [3,  '', 'HbA1c',                             'Dr. Ananya Bose',    'READY',      3],
    [3,  '', 'Fasting Lipid Profile',             'Dr. Ananya Bose',    'PROCESSING', 1],
    [4,  '', 'X-Ray Right Knee (AP/Lateral)',     'Dr. Rohan Mehta',    'READY',      4],
    [4,  '', 'Blood Group & Cross Match',         'Dr. Rohan Mehta',    'READY',      5],
    [5,  '', 'Chest X-Ray (PA View)',             'Dr. Kiran Rao',      'READY',      2],
    [5,  '', 'Sputum Culture & Sensitivity',      'Dr. Kiran Rao',      'PROCESSING', 1],
    [6,  '', 'X-Ray Right Forearm',               'Dr. Rohan Mehta',    'READY',      1],
    [7,  '', 'MRI Brain (Flair)',                 'Dr. Neha Singh',     'PENDING',    0],
    [8,  '', 'Liver Function Test (LFT)',         'Dr. Kiran Rao',      'READY',      3],
    [8,  '', 'Serum Ammonia',                     'Dr. Kiran Rao',      'PROCESSING', 1],
    [8,  '', 'Fibroscan',                         'Dr. Kiran Rao',      'PENDING',    0],
    [10, '', 'Arterial Blood Gas (ABG)',          'Dr. Kiran Rao',      'READY',      2],
    [10, '', 'PFT — Spirometry',                  'Dr. Kiran Rao',      'PENDING',    0],
    [11, '', 'Antenatal Profile',                 'Dr. Priya Nambiar',  'READY',      1],
    [11, '', '24h Urine Protein',                 'Dr. Priya Nambiar',  'PROCESSING', 0],
    [12, '', 'Upper GI Endoscopy Report',         'Dr. Suresh Iyer',    'PENDING',    0],
    [13, '', 'Serum CA-125',                      'Dr. Priya Nambiar',  'READY',      2],
    [15, '', 'Serum Ferritin + Peripheral Smear', 'Dr. Meera Krishnan', 'READY',      2],
    [16, '', 'ECG 12-Lead',                       'Dr. Ananya Bose',    'READY',      2],
    [16, '', 'Holter Monitor (24h)',              'Dr. Ananya Bose',    'PROCESSING', 1],
    [18, '', 'Peak Flow Rate',                    'Dr. Kiran Rao',      'READY',      1],
    [20, '', 'Serum Amylase & Lipase',            'Dr. Suresh Iyer',    'READY',      2],
    [20, '', 'CECT Abdomen',                      'Dr. Suresh Iyer',    'READY',      1],
    [24, '', 'NS1 Antigen & Dengue IgM/IgG',     'Dr. Vikram Desai',   'READY',      1],
    [24, '', 'Complete Blood Count (Daily)',      'Dr. Vikram Desai',   'PROCESSING', 0],
  ];

  for (const [pIdx, , testType, orderedBy, status, ago] of labDefs) {
    const pat = pIdx !== null ? patients[pIdx] : null;
    await prisma.labReport.create({
      data: {
        patientId:   pat?.id ?? null,
        patientName: pat?.name ?? 'Unknown',
        testType,
        orderedBy,
        status,
        createdAt: daysAgo(ago),
      }
    });
  }
  console.log(`✓ ${labDefs.length} Lab Reports`);

  // ── 10. Invoices ─────────────────────────────────────────────────────────────
  const invoiceDefs: Array<[number, string, number, number, number, number, InvoiceStatus]> = [
    // [patientIdx, doctorName, doctorFee, labTests, medication, roomCharges, status]
    [0,  'Dr. Ananya Bose',    1500, 3200,  800,  9000,  'PENDING'  ],
    [1,  'Dr. Rohan Mehta',    2000, 1800, 1200, 12000,  'PENDING'  ],
    [2,  'Dr. Neha Singh',     1800, 5500,  600, 15000,  'PENDING'  ],
    [3,  'Dr. Ananya Bose',     800,  600,  200,     0,  'PAID'     ],
    [4,  'Dr. Rohan Mehta',    3000, 2200,  900, 18000,  'PENDING'  ],
    [5,  'Dr. Kiran Rao',      1200, 1400,  500,  8000,  'PENDING'  ],
    [6,  'Dr. Rohan Mehta',    1000, 1100,  400,  4000,  'PAID'     ],
    [7,  'Dr. Neha Singh',      600,  900,  300,     0,  'PAID'     ],
    [8,  'Dr. Kiran Rao',      1500, 4200,  700, 20000,  'OVERDUE'  ],
    [9,  'Dr. Ananya Bose',     800,  600,  200,  6000,  'PAID'     ],
    [10, 'Dr. Kiran Rao',      1200, 2800,  600, 18000,  'PENDING'  ],
    [11, 'Dr. Priya Nambiar',  1500, 3100,  800, 10000,  'PENDING'  ],
    [12, 'Dr. Suresh Iyer',    1000, 2200,  500,  8000,  'PENDING'  ],
    [13, 'Dr. Priya Nambiar',  2500, 1800, 1000, 12000,  'PAID'     ],
    [14, 'Dr. Vikram Desai',   2000, 6500, 1500, 22000,  'PENDING'  ],
    [15, 'Dr. Meera Krishnan',  500,  800,  300,     0,  'PAID'     ],
    [16, 'Dr. Ananya Bose',    1500, 2800,  600, 10000,  'PENDING'  ],
    [17, 'Dr. Meera Krishnan',  500,  700,  200,     0,  'PAID'     ],
    [18, 'Dr. Kiran Rao',      1000, 1200,  400,  4000,  'PAID'     ],
    [19, 'Dr. Rohan Mehta',    2500, 1800,  900, 15000,  'PENDING'  ],
    [20, 'Dr. Suresh Iyer',    1500, 4800, 1200, 20000,  'PENDING'  ],
    [21, 'Dr. Meera Krishnan',  400,  600,  200,     0,  'PAID'     ],
    [22, 'Dr. Neha Singh',      600,  900,  300,     0,  'PAID'     ],
    [23, 'Dr. Meera Krishnan',  500,  800,  400,     0,  'PAID'     ],
    [24, 'Dr. Vikram Desai',   1200, 2200,  900,  6000,  'PENDING'  ],
  ];

  for (const [pIdx, doctorName, doctorFee, labTests, medication, roomCharges, status] of invoiceDefs) {
    await prisma.invoice.create({
      data: {
        patientId: patients[pIdx].id,
        doctorName, doctorFee, labTests, medication, roomCharges, status,
        createdAt: daysAgo(Math.floor(Math.random() * 5)),
      }
    });
  }
  console.log(`✓ ${invoiceDefs.length} Invoices`);

  // ── 11. Activity Log ─────────────────────────────────────────────────────────
  const activityEntries = [
    // [actionType, message, actor, hoursAgoN]
    ['patient',     'New patient Rahul Verma registered',                     'Sneha Kapoor',     5],
    ['patient',     'New patient Priya Sharma registered',                    'Prateek Joshi',    4],
    ['patient',     'New patient Arjun Patel registered',                    'Sneha Kapoor',     6],
    ['appointment', 'Appointment booked for Sunita Iyer with Dr. Ananya Bose','Sneha Kapoor',    3],
    ['appointment', 'Appointment booked for Meera Nair with Dr. Kiran Rao',   'Prateek Joshi',   2],
    ['lab',         'Lab test ordered: Troponin-I for Rahul Verma',           'Dr. Ananya Bose', 3],
    ['lab',         'Lab report ready: MRI Brain for Arjun Patel',            'Ramesh Pillai',   2],
    ['lab',         'Lab test ordered: CBC for Priya Sharma',                 'Dr. Rohan Mehta', 2],
    ['billing',     'Invoice generated for Vikram Nair — ₹24,100',            'Sneha Kapoor',    1],
    ['billing',     'Invoice PAID for Arjun Patel — ₹7,650',                  'Prateek Joshi',   1],
    ['patient',     'Patient Kavitha Reddy discharged',                       'Dr. Ananya Bose', 2],
    ['appointment', 'Dr. Vikram Desai marked appointment cancelled',          'Dr. Vikram Desai',1],
    ['lab',         'Lab report ready: ECG for Pankaj Choudhary',             'Divya Menon',     1],
    ['patient',     'New patient Manish Kumar registered via Emergency',      'Dr. Vikram Desai',0],
    ['lab',         'Sample received: NS1 Antigen for Manish Kumar',          'Ramesh Pillai',   0],
    ['billing',     'Invoice overdue: Sanjay Gupta — ₹26,400',               'Hospital Admin',  0],
    ['appointment', 'Appointment confirmed for Rahul Verma with Dr. Bose',   'Sneha Kapoor',    0],
    ['lab',         'CBC result critical — platelet 42K: Manish Kumar',       'Divya Menon',     0],
  ] as const;

  for (const [actionType, message, actor, h] of activityEntries) {
    await prisma.activityLog.create({
      data: { actionType, message, actor, createdAt: hoursAgo(h) }
    });
  }
  console.log(`✓ ${activityEntries.length} Activity log entries`);

  console.log('\n✅  Seed complete!\n');
  console.log('Demo Login Credentials:');
  console.log('  Admin:        ADM-001 / admin123');
  console.log('  Receptionist: REC-001 / rec123');
  console.log('  Lab Tech:     LAB-001 / lab123');
  console.log('  Doctor:       DOC-001 / doc123   (Dr. Ananya Bose — Cardiology)');
  console.log('  Doctor:       DOC-002 / doc123   (Dr. Rohan Mehta — Orthopedics)');
  console.log('  Doctor:       DOC-003 / doc123   (Dr. Neha Singh  — Neurology)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
