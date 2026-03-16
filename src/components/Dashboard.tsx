import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DoctorDashboard from '@/components/DoctorDashboard';
import ReceptionistDashboard from '@/components/ReceptionistDashboard';
import { LiveClock } from '@/components/LiveClock';
import { AdminKpiGrid } from '@/components/admin/AdminKpiGrid';
import { AdmissionsOverviewCard } from '@/components/admin/AdmissionsOverviewCard';
import { BedCapacityCard } from '@/components/admin/BedCapacityCard';
import { CriticalAlertsCard } from '@/components/admin/CriticalAlertsCard';
import { ScheduleCard } from '@/components/admin/ScheduleCard';
import { RecentActivityCard } from '@/components/admin/RecentActivityCard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';


// ---------------------------------------------------------------------------
// Admin dashboard (the original full view)
// ---------------------------------------------------------------------------
function AdminDashboard() {
  const { user } = useAuth();
  const {
    greeting,
    chartRange,
    setChartRange,
    kpis,
    admissionsSeries,
    wardCapacity,
    alerts,
    schedule,
    activity,
  } = useAdminDashboard();

  return (
    <div className="space-y-5">
      {/* Welcome strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Good {greeting}, {user?.name ?? 'Admin'} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening at the hospital today.</p>
        </div>
        <LiveClock />
      </motion.div>

      {/* KPI Cards */}
      <AdminKpiGrid kpis={kpis} />

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-5">
        <AdmissionsOverviewCard
          range={chartRange}
          onRangeChange={setChartRange}
          data={admissionsSeries}
        />
        <BedCapacityCard wards={wardCapacity} />
      </div>

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <CriticalAlertsCard alerts={alerts} />
        <ScheduleCard title="Today's Schedule" appointments={schedule} />
        <RecentActivityCard items={activity} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard — role router
// Doctors and receptionists get their own tailored views.
// Admins keep the full hospital analytics dashboard.
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'doctor')       return <DoctorDashboard />;
  if (user?.role === 'receptionist') return <ReceptionistDashboard />;
  return <AdminDashboard />;
}
