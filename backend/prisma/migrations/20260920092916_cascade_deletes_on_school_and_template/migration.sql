-- DropForeignKey
ALTER TABLE "MessageLog" DROP CONSTRAINT "MessageLog_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_templateId_fkey";

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
