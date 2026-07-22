import { Router } from "express";
import { prisma } from "../db/client.js";

export const templatesRouter = Router();

templatesRouter.get("/", async (req, res) => {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  res.json(templates);
});

templatesRouter.post("/", async (req, res) => {
  const { title, occasion, body } = req.body ?? {};
  if (!title || !body) {
    return res.status(400).json({ error: "Title and message body are required." });
  }

  const template = await prisma.template.create({
    data: { title, body, occasion: occasion || "CUSTOM" },
  });
  res.status(201).json(template);
});

templatesRouter.patch("/:id", async (req, res) => {
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
});

templatesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.template.delete({ where: { id } });
  res.status(204).end();
});
