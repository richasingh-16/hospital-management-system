import prisma from "../../config/prisma";

export const getAdminStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalPatients,
    totalDoctors,
    availableBeds,
    occupiedBeds,
    todayAdmissions,
    wards,
    recentAdmissions
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.bed.count({
      where: { status: "AVAILABLE" }
    }),
    prisma.bed.count({
      where: { status: "OCCUPIED" }
    }),
    prisma.admission.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    }),
    prisma.ward.findMany({
      include: {
        beds: true
      }
    }),
    prisma.admission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        patient: true, 
        bed: { include: { ward: true } } 
      }
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
    return {
      text: `${adm.patient.name} admitted to ${adm.bed?.ward?.name || 'Ward'}`,
      time: mins === 0 ? 'Just now' : `${mins} min ago`,
      color: 'bg-green-500'
    };
  });

  return {
    totalPatients,
    totalDoctors,
    availableBeds,
    occupiedBeds,
    todayAdmissions,
    wardCapacity,
    recentActivity
  };
};
