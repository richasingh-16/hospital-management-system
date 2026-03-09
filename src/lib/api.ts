/**
 * Central API configuration — MediFlow HMS
 *
 * Set VITE_API_URL in your .env file (or Vercel environment variables)
 * to point to your deployed Node.js backend.
 *
 * Example .env:
 *   VITE_API_URL=https://mediflow-backend.onrender.com
 *
 * Falls back to localhost:3000 for local development.
 */
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const API_ROUTES = {
    // Auth
    login: `${API_BASE_URL}/api/auth/login`,

    // Core HMS resources
    patients: `${API_BASE_URL}/api/patients`,
    doctors: `${API_BASE_URL}/api/doctors`,
    appointments: `${API_BASE_URL}/api/appointments`,
    beds: `${API_BASE_URL}/api/beds`,
    billing: `${API_BASE_URL}/api/billing`,
    labReports: `${API_BASE_URL}/api/lab-reports`,

    // Dashboard
    dashboard: `${API_BASE_URL}/api/dashboard/stats`,
} as const;
