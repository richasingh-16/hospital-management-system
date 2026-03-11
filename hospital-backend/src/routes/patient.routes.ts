import { Router } from "express"
import { fetchPatients, addPatient } from "../controllers/patient.controller"
import { authenticateToken } from "../middleware/auth.middleware"

const router = Router()

router.get("/", authenticateToken, fetchPatients)
router.post("/", authenticateToken, addPatient)

export default router