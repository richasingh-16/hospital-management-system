import { Router } from "express"
import { fetchPatients, addPatient, fetchPatientById } from "../controllers/patient.controller"
import { authenticateToken } from "../middleware/auth.middleware"
import { requireRole } from "../middleware/role.middleware"

const router = Router()

router.get("/", authenticateToken, fetchPatients)
router.get("/:id", authenticateToken, fetchPatientById)
router.post("/", authenticateToken, addPatient)

router.get(
    "/",
    authenticateToken,
    requireRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
    fetchPatients
)

router.post(
    "/",
    authenticateToken,
    requireRole("ADMIN", "RECEPTIONIST"),
    addPatient
)
export default router