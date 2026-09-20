import { Router } from "express";
import { prisma } from "../db/client.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const schoolsRouter = Router();

schoolsRouter.get("/", asyncHandler(async (req, res) => {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  res.json(schools);
}));

schoolsRouter.post("/", asyncHandler(async (req, res) => {
  const { name, groupId } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "School name is required." });

  // Copy-pasting a group ID from WhatsApp/the Dashboard table can drag in a
  // leading/trailing tab or space, which then silently fails to match the
  // real group JID at send time — trim it so that can't happen.
  const school = await prisma.school.create({
    data: { name, groupId: groupId?.trim() || null },
  });
  res.status(201).json(school);
}));

schoolsRouter.patch("/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, groupId } = req.body ?? {};

  const school = await prisma.school.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(groupId !== undefined ? { groupId: groupId?.trim() || null } : {}),
    },
  });
  res.json(school);
}));

// Deleting a school is asking to be careful — CLAUDE.md says always confirm before
// removing a template/schedule; the frontend is responsible for that confirmation prompt.
// Cascades to the school's scheduleEntries/messageLogs (see schema.prisma) so this
// can't fail with a dangling foreign key.
schoolsRouter.delete("/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.school.delete({ where: { id } });
  res.status(204).end();
}));
