import { Router } from "express";
import { prisma } from "../db/client.js";

export const schoolsRouter = Router();

schoolsRouter.get("/", async (req, res) => {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  res.json(schools);
});

schoolsRouter.post("/", async (req, res) => {
  const { name, groupId } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "School name is required." });

  const school = await prisma.school.create({ data: { name, groupId: groupId || null } });
  res.status(201).json(school);
});

schoolsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, groupId } = req.body ?? {};

  const school = await prisma.school.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(groupId !== undefined ? { groupId: groupId || null } : {}),
    },
  });
  res.json(school);
});

// Deleting a school is asking to be careful — CLAUDE.md says always confirm before
// removing a template/schedule; the frontend is responsible for that confirmation prompt.
schoolsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.school.delete({ where: { id } });
  res.status(204).end();
});
