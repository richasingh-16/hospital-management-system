import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

export const createDoctor = async (data: {
  name: string;
  department: string;
  specialization: string;
  experience: number;
  contact: string;
}) => {
  // Step 1: Find or create the Department
  let department = await prisma.department.findFirst({
    where: { name: data.department }
  });
  if (!department) {
    department = await prisma.department.create({
      data: { name: data.department }
    });
  }

  // Step 2: Generate a unique employee ID for the doctor's login account
  const count = await prisma.user.count();
  const employeeId = `DOC${String(count + 1).padStart(3, "0")}`;
  const defaultPassword = await bcrypt.hash("doctor123", 10);

  // Step 3: Create User + Doctor in one transaction
  const user = await prisma.user.create({
    data: {
      employeeId,
      name: data.name,
      password: defaultPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: data.specialization || "General",
          experience: data.experience || 0,
          phone: data.contact || "",
          departmentId: department.id,
          status: "AVAILABLE",
          patientsToday: 0,
        }
      }
    },
    include: { doctor: true }
  });

  return {
    ...user.doctor,
    name: user.name,
    employeeId: user.employeeId,
    department: data.department,
    defaultPassword: "doctor123",   // shown once to admin so they can share with the doctor
  };
};

export const getDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, employeeId: true } },
      department: { select: { name: true } },
    }
  });

  return doctors.map(d => ({
    id: d.id,
    name: d.user.name,
    employeeId: d.user.employeeId,
    department: d.department.name,
    specialization: d.specialization,
    experience: d.experience,
    contact: d.phone,
    availability: d.status,
    patientsToday: d.patientsToday,
    createdAt: d.createdAt,
  }));
};