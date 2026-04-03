import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./modules/appointments/appointments.routes";
import doctorRoutes from "./modules/doctors/doctor.routes";
import departmentRoutes from "./modules/departments/departments.routes";
import wardRoutes from "./modules/wards/ward.routes";
import bedRoutes from "./modules/beds/bed.routes";
import admissionRoutes from "./modules/admissions/admission.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import billingRoutes from "./modules/billing/billing.routes";
import labReportsRoutes from "./modules/lab-reports/lab-reports.routes";
import activityLogRoutes from "./modules/activity-log/activity-log.routes";
import usersRoutes from "./modules/users/users.routes";




const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/lab-reports", labReportsRoutes);
app.use("/api/activity-log", activityLogRoutes);
app.use("/api/users", usersRoutes);



app.use("/api/patients", patientRoutes)
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Hospital API running");
});

export default app;

