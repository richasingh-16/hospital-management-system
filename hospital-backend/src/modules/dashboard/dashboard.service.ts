import prisma from "../../config/prisma";

export const getAdminStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPatients,
    totalDoctors,
    availableBeds,
    occupiedBeds,
    todayAdmissions,
    wards,
    recentAdmissions,
    past30DaysAdmissions,
    todayAppointments,
    pendingLabs,
    criticalPatients
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.bed.count({ where: { status: "AVAILABLE" } }),
    prisma.bed.count({ where: { status: "OCCUPIED" } }),
    prisma.admission.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    }),
    prisma.ward.findMany({ include: { beds: true } }),
    prisma.admission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { patient: true, bed: { include: { ward: true } } }
    }),
    prisma.admission.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    }),
    prisma.appointment.findMany({
      where: { dateTime: { gte: startOfDay, lte: endOfDay } },
      include: {
        patient: { select: { name: true, id: true } },
        doctor: { include: { user: { select: { name: true } }, department: { select: { name: true } } } }
      },
      orderBy: { dateTime: 'asc' },
      take: 10
    }),
    prisma.labReport.findMany({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
      take: 5
    }),
    prisma.patient.findMany({
      where: {
        status: "Admitted",
        OR: [
          { condition: { contains: "Cardiac", mode: "insensitive" } },
          { condition: { contains: "Stroke", mode: "insensitive" } },
          { ward: { contains: "ICU", mode: "insensitive" } },
          { ward: { contains: "Emergency", mode: "insensitive" } }
        ]
      },
      take: 5
    })
  ]);

  // Format Ward Capacity dynamically based on Database relationships
  const wardCapacity = wards.map(w => {
    return {
      name: w.name,
      total: w.capacity,
      occupied: w.beds.filter(b => b.status === "OCCUPIED").length
    };
  });

  // Create a live Activity Feed
  const recentActivity = recentAdmissions.map(adm => {
    const mins = Math.floor((new Date().getTime() - new Date(adm.createdAt).getTime()) / 60000);
    let timeStr = 'Just now';
    if (mins >= 1440) timeStr = `${Math.floor(mins / 1440)}d ago`;
    else if (mins >= 60) timeStr = `${Math.floor(mins / 60)}h ago`;
    else if (mins > 0) timeStr = `${mins} min ago`;

    return {
      text: `${adm.patient.name} admitted to ${adm.bed?.ward?.name || 'Ward'}`,
      time: timeStr,
      color: 'bg-green-500'
    };
  });

  // Calculate weeklyAdmissions (last 7 days, including today)
  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyCounts: Record<string, number> = {};

  // Initialize the last 7 days to 0 points to ensure order is preserved (most recent at the end)
  const orderedDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = WEEK_DAYS[d.getDay()];
    weeklyCounts[dayName] = 0;
    orderedDays.push(dayName);
  }

  const last7DaysAdmissions = past30DaysAdmissions.filter(a => {
    // Within last 7 days
    return (new Date().getTime() - new Date(a.createdAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;
  });

  last7DaysAdmissions.forEach(a => {
    const day = WEEK_DAYS[new Date(a.createdAt).getDay()];
    if (weeklyCounts[day] !== undefined) {
      weeklyCounts[day]++;
    }
  });

  const weeklyAdmissions = orderedDays.map(day => ({
    day, admissions: weeklyCounts[day]
  }));

  // Calculate monthlyAdmissions (W1, W2, W3, W4)
  const monthlyAdmissions = [
    { day: 'W1', admissions: 0 },
    { day: 'W2', admissions: 0 },
    { day: 'W3', admissions: 0 },
    { day: 'W4', admissions: 0 },
  ];

  past30DaysAdmissions.forEach(a => {
    const daysAgo = Math.floor((new Date().getTime() - new Date(a.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    if (daysAgo < 7) monthlyAdmissions[3].admissions++;
    else if (daysAgo < 14) monthlyAdmissions[2].admissions++;
    else if (daysAgo < 21) monthlyAdmissions[1].admissions++;
    else if (daysAgo <= 30) monthlyAdmissions[0].admissions++;
  });

  // Calculate today's schedule
  const schedule = todayAppointments.map(appt => {
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    // e.g. "SCHEDULED" -> "Scheduled"
    const statusFmt = appt.status.charAt(0) + appt.status.slice(1).toLowerCase();
    return {
      id: appt.id,
      patientId: appt.patientId,
      patientName: appt.patient.name,
      doctor: appt.doctor.user.name,
      type: appt.doctor.department?.name || 'Consultation',
      time: timeFormatter.format(new Date(appt.dateTime)),
      status: statusFmt
    };
  });

  // Calculate System Alerts
  const alerts: any[] = [];

  wardCapacity.forEach(w => {
    if (w.total > 0 && (w.occupied / w.total) >= 0.9) {
      const pct = Math.round((w.occupied / w.total) * 100);
      alerts.push({ text: `${w.name} ward at ${pct}% capacity (${w.occupied}/${w.total} beds)`, level: 'high' });
    }
  });

  criticalPatients.forEach(p => {
    alerts.push({ text: `${p.name} — admitted to ${p.ward || 'ICU'} · ${p.condition}`, level: 'high' });
  });

  pendingLabs.forEach(l => {
    alerts.push({ text: `${l.testType} for ${l.patientName} · ${l.status.toLowerCase()}`, level: 'medium' });
  });

  return {
    totalPatients,
    totalDoctors,
    availableBeds,
    occupiedBeds,
    todayAdmissions,
    wardCapacity,
    recentActivity,
    weeklyAdmissions,
    monthlyAdmissions,
    schedule,
    alerts: alerts.slice(0, 6)
  };
};
