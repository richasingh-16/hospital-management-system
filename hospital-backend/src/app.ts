import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes)
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Hospital API running");
});

export default app;

