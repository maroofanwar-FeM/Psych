import { Router } from "express";
import { prisma } from "../db/client.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const templatesRouter = Router();

templatesRouter.get("/", asyncHandler(async (req, res) => {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  res.json(templates);
}));

templatesRouter.post("/", asyncHandler(async (req, res) => {
  const { title, occasion, body } = req.body ?? {};
  if (!title || !body) {
    return res.status(400).json({ error: "Title and message body are required." });
  }

  const template = await prisma.template.create({
    data: { title, body, occasion: occasion || "CUSTOM" },
  });
  res.status(201).json(template);
}));

templatesRouter.patch("/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { title, occasion, body } = req.body ?? {};

  const template = await prisma.template.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(occasion !== undefined ? { occasion } : {}),
      ...(body !== undefined ? { body } : {}),
    },
  });
  res.json(template);
}));

// Cascades to the template's scheduleEntries (see schema.prisma) so this can't
// fail with a dangling foreign key.
templatesRouter.delete("/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.template.delete({ where: { id } });
  res.status(204).end();
}));
