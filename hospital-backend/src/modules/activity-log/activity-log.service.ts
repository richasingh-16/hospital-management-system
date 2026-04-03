import prisma from "../../config/prisma";

/**
 * Get activity logs — default last 7 days.
 * Optional: pass fromDate / toDate (ISO strings) to override.
 */
export const getActivityLogs = async (fromDate?: string, toDate?: string) => {
  const now = new Date();

  const from = fromDate
    ? new Date(fromDate)
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  const to = toDate ? new Date(toDate) : now;

  const logs = await prisma.activityLog.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: "desc" },
  });

  return logs.map((l) => ({
    id:         l.id,
    actionType: l.actionType,
    message:    l.message,
    actor:      l.actor,
    timestamp:  l.createdAt.toISOString(),
  }));
};
