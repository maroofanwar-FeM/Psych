import { Router } from "express";
import { prisma } from "../db/client.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const logsRouter = Router();

logsRouter.get("/", asyncHandler(async (req, res) => {
  const logs = await prisma.messageLog.findMany({
    include: { school: true },
    orderBy: { sentAt: "desc" },
    take: 200,
  });
  res.json(logs);
}));
