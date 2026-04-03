import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { registerEmployee, loginEmployee } from "../services/auth.service"

export const register = async (req: Request, res: Response) => {
  try {
    const { employeeId, name, password, role } = req.body

    const user = await registerEmployee(employeeId, name, password, role)

    res.json(user)

  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {

  try {

    const { employeeId, password } = req.body

    const user = await loginEmployee(employeeId, password)

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    )

    res.json({
      token,
      user: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role
      }
    })

  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }

}