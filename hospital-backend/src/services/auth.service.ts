import prisma from "../config/prisma"
import bcrypt from "bcrypt"

export const registerEmployee = async (
  employeeId: string,
  name: string,
  password: string,
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST"
) => {

  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      employeeId,
      name,
      password: hashedPassword,
      role
    }
  })
}

export const loginEmployee = async (employeeId: string, password: string) => {

  const user = await prisma.user.findUnique({
    where: { employeeId }
  })

  if (!user) {
    throw new Error("Employee not found")
  }

  const validPassword = await bcrypt.compare(password, user.password)

  if (!validPassword) {
    throw new Error("Invalid password")
  }

  return user
}