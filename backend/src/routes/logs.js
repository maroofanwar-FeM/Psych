import { Router } from "express";
import { prisma } from "../db/client.js";

export const logsRouter = Router();

logsRouter.get("/", async (req, res) => {
  const logs = await prisma.messageLog.findMany({
    include: { school: true },
    orderBy: { sentAt: "desc" },
    take: 200,
  });
  res.json(logs);
});
