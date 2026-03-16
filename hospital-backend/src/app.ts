import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./modules/appointments/appointments.routes";
import doctorRoutes from "./modules/doctors/doctor.routes";
import departmentRoutes from "./modules/departments/departments.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);

app.use("/api/patients", patientRoutes)
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Hospital API running");
});

export default app;

