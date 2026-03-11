import { Request, Response } from "express"
import { getPatients, createPatient } from "../services/patient.service"

export const fetchPatients = async (req: Request, res: Response) => {
  const patients = await getPatients()
  res.json(patients)
}

export const addPatient = async (req: Request, res: Response) => {
  const { name, age, gender } = req.body

  const patient = await createPatient({
    name,
    age,
    gender
  })

  res.json(patient)
}