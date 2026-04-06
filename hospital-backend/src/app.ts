import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import settingsRoutes from "./modules/settings/settings.routes";




const app = express();

// ── Security headers (XSS, clickjacking, MIME sniffing, etc.) ──────────────
app.use(helmet());

// ── CORS ── only allow the configured frontend origin ──────────────────────
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Auth rate limiter: max 10 attempts per 15 min per IP ───────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

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
app.use("/api/settings", settingsRoutes);



app.use("/api/patients", patientRoutes)
app.use("/api/auth", authLimiter, authRoutes)

app.get("/", (req, res) => {
  res.send("Hospital API running");
});

export default app;

