import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiFetch("/dashboard/admin")
      .then((data) => {
        console.log("API DATA:", data); // 👈 IMPORTANT
        setStats(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <p className="text-white">Loading real-time stats...</p>;

  return (
    <div className="bg-slate-800 text-white p-6 rounded-lg mb-6 shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Live Backend Stats 🚀</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-700 p-4 rounded-md">
          <p className="text-xs text-slate-400 font-bold uppercase">Total Patients</p>
          <p className="text-2xl font-bold">{stats.totalPatients}</p>
        </div>
        <div className="bg-slate-700 p-4 rounded-md">
          <p className="text-xs text-slate-400 font-bold uppercase">Today Admissions</p>
          <p className="text-2xl font-bold">{stats.todayAdmissions}</p>
        </div>
        <div className="bg-slate-700 p-4 rounded-md border border-green-500/30">
          <p className="text-xs text-slate-400 font-bold uppercase">Available Beds</p>
          <p className="text-2xl font-bold text-green-400">{stats.availableBeds}</p>
        </div>
        <div className="bg-slate-700 p-4 rounded-md border border-red-500/30">
          <p className="text-xs text-slate-400 font-bold uppercase">Occupied Beds</p>
          <p className="text-2xl font-bold text-red-400">{stats.occupiedBeds}</p>
        </div>
        <div className="bg-slate-700 p-4 rounded-md">
          <p className="text-xs text-slate-400 font-bold uppercase">Total Doctors</p>
          <p className="text-2xl font-bold">{stats.totalDoctors}</p>
        </div>
      </div>
    </div>
  );
}
