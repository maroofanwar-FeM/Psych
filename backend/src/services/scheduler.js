import cron from "node-cron";
import { prisma } from "../db/client.js";
import { whatsappService, staggerDelay } from "./whatsappService.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// CoachConnect is single-coach, single-timezone (Pakistan) for now, and the
// Schedule page's hour/minute fields are meant to be read as "what time it is
// for me" — but the host (Render) runs its containers in UTC, so comparing
// against server-local time silently schedules everything 5 hours off from
// what was typed. Read the current day/hour/minute in Asia/Karachi explicitly
// instead, so the stored values always mean Pakistan wall-clock time no
// matter what timezone the server itself happens to be in.
function getPakistanTime(now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    dayOfWeek: DAY_NAMES.indexOf(byType.weekday),
    hour: Number(byType.hour) % 24, // hour12:false can render midnight as "24"
    minute: Number(byType.minute),
  };
}

// Runs once a minute and fires any ScheduleEntry that matches the current
// day/hour/minute — this is what turns planning.md's "Monday 8am -> motivation"
// rules into actual sends once the app is running.
export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const { dayOfWeek, hour, minute } = getPakistanTime(now);

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
