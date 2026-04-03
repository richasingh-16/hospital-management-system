import prisma from "../config/prisma";

/**
 * Shared activity logger — call this after any successful DB write.
 * Never throws: if logging fails, the original operation still succeeds.
 */
export async function logActivity(
  actionType: string,
  message: string,
  actor: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { actionType, message, actor },
    });
  } catch (err) {
    // Logging must never break the main request
    console.error("[ActivityLog] Failed to write log:", err);
  }
}
