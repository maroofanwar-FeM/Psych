import cron from "node-cron";
import { prisma } from "../db/client.js";
import { whatsappService, staggerDelay } from "./whatsappService.js";

// Runs once a minute and fires any ScheduleEntry that matches the current
// day/hour/minute — this is what turns planning.md's "Monday 8am -> motivation"
// rules into actual sends once the app is running.
export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const entries = await prisma.scheduleEntry.findMany({
      where: { active: true, dayOfWeek, hour, minute },
      include: { template: true, school: true },
    });

    for (const entry of entries) {
      const schools = entry.school
        ? [entry.school]
        : await prisma.school.findMany({ where: { groupId: { not: null } } });

      for (const school of schools) {
        if (!school.groupId) continue;
        try {
          await whatsappService.sendToGroup(school.groupId, entry.template.body);
          await prisma.messageLog.create({
            data: {
              schoolId: school.id,
              body: entry.template.body,
              status: "SENT",
              triggeredBy: "schedule",
            },
          });
        } catch (err) {
          await prisma.messageLog.create({
            data: {
              schoolId: school.id,
              body: entry.template.body,
              status: "FAILED",
              error: err.message,
              triggeredBy: "schedule",
            },
          });
        }
        await staggerDelay();
      }
    }
  });
}
