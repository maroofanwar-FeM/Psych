import { Router } from "express";
import { prisma } from "../db/client.js";

export const scheduleRouter = Router();

scheduleRouter.get("/", async (req, res) => {
  const entries = await prisma.scheduleEntry.findMany({
    include: { template: true, school: true },
    orderBy: [{ dayOfWeek: "asc" }, { hour: "asc" }, { minute: "asc" }],
  });
  res.json(entries);
});

scheduleRouter.post("/", async (req, res) => {
  const { templateId, schoolId, dayOfWeek, hour, minute } = req.body ?? {};
  if (templateId === undefined || dayOfWeek === undefined || hour === undefined) {
    return res.status(400).json({ error: "templateId, dayOfWeek, and hour are required." });
  }

  const entry = await prisma.scheduleEntry.create({
    data: {
      templateId: Number(templateId),
      schoolId: schoolId ? Number(schoolId) : null,
      dayOfWeek: Number(dayOfWeek),
      hour: Number(hour),
      minute: Number(minute ?? 0),
    },
    include: { template: true, school: true },
  });
  res.status(201).json(entry);
});

scheduleRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { active } = req.body ?? {};

  const entry = await prisma.scheduleEntry.update({
    where: { id },
    data: { ...(active !== undefined ? { active } : {}) },
    include: { template: true, school: true },
  });
  res.json(entry);
});

scheduleRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.scheduleEntry.delete({ where: { id } });
  res.status(204).end();
});
