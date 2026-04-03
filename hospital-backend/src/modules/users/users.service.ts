import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import { logActivity } from "../../lib/activity-logger";

// ---------------------------------------------------------------------------
// Get all users (admin view)
// ---------------------------------------------------------------------------
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:         true,
      employeeId: true,
      name:       true,
      role:       true,
      createdAt:  true,
      doctor:     { select: { department: { select: { name: true } } } },
    },
  });

  return users.map((u) => ({
    id:          u.id,
    employeeId:  u.employeeId,
    name:        u.name,
    role:        u.role,
    department:  u.doctor?.department?.name ?? null,
    createdAt:   u.createdAt.toISOString().split("T")[0],
  }));
};

// ---------------------------------------------------------------------------
// Create a new staff user (Admin, Receptionist, Lab Technician, or Doctor shell)
// ---------------------------------------------------------------------------
export const createUser = async (data: {
  employeeId: string;
  name:       string;
  password:   string;
  role:       string;
}, actor: string) => {
  const existing = await prisma.user.findUnique({ where: { employeeId: data.employeeId } });
  if (existing) throw new Error(`Employee ID "${data.employeeId}" is already taken`);

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      employeeId: data.employeeId,
      name:       data.name,
      password:   hashed,
      role:       data.role as any,
    },
  });

  await logActivity("doctor", `New staff account created: ${data.name} (${data.role})`, actor);
  return { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role };
};

// ---------------------------------------------------------------------------
// Delete / deactivate a user
// ---------------------------------------------------------------------------
export const deleteUser = async (id: string, actor: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  // Cannot delete if they have a doctor profile (would break FK)
  const doctorProfile = await prisma.doctor.findUnique({ where: { userId: id } });
  if (doctorProfile) {
    throw new Error("Cannot delete a Doctor account. Remove the doctor profile first.");
  }

  await prisma.user.delete({ where: { id } });
  await logActivity("doctor", `Staff account removed: ${user.name} (${user.role})`, actor);
  return { message: "User deleted" };
};

// ---------------------------------------------------------------------------
// Change own password (requires current password)
// ---------------------------------------------------------------------------
export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password changed successfully" };
};
