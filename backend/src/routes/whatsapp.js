import { Router } from "express";
import { prisma } from "../db/client.js";
import { whatsappService, staggerDelay } from "../services/whatsappService.js";

export const whatsappRouter = Router();

whatsappRouter.get("/status", (req, res) => {
  res.json(whatsappService.getStatus());
});

// Step 4 "Send Now" broadcast: send one message to all groups (or a chosen subset)
// right away, staggered so it doesn't look automated.
whatsappRouter.post("/send-now", async (req, res) => {
  const { body, schoolIds } = req.body ?? {};
  if (!body) return res.status(400).json({ error: "Message body is required." });

  const schools = await prisma.school.findMany({
    where: {
      groupId: { not: null },
      ...(Array.isArray(schoolIds) && schoolIds.length
        ? { id: { in: schoolIds.map(Number) } }
        : {}),
    },
  });

  if (schools.length === 0) {
    return res.status(400).json({ error: "No connected schools (with a saved group) to send to." });
  }

  const results = [];
  for (const school of schools) {
    try {
      await whatsappService.sendToGroup(school.groupId, body);
      await prisma.messageLog.create({
        data: { schoolId: school.id, body, status: "SENT", triggeredBy: "send-now" },
      });
      results.push({ schoolId: school.id, ok: true });
    } catch (err) {
      await prisma.messageLog.create({
        data: {
          schoolId: school.id,
          body,
          status: "FAILED",
          error: err.message,
          triggeredBy: "send-now",
        },
      });
      results.push({ schoolId: school.id, ok: false, error: err.message });
    }
    await staggerDelay();
  }

  res.json({ results });
});
