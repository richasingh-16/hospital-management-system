import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import prisma from "../../config/prisma";

const router = Router();

// GET /api/departments — list all with doctor count
router.get("/", authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        doctors: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const shaped = departments.map((d) => ({
      id:      d.id,
      name:    d.name,
      doctors: d.doctors.length,
      head:    d.doctors[0]?.user?.name ?? "Unassigned",
    }));

    res.json(shaped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/departments — add a new department
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });

    const existing = await prisma.department.findFirst({ where: { name } });
    if (existing) return res.status(400).json({ error: `Department "${name}" already exists` });

    const dept = await prisma.department.create({ data: { name } });
    res.json({ id: dept.id, name: dept.name, doctors: 0, head: "Unassigned" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;