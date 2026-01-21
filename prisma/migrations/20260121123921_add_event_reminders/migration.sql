-- AlterTable
ALTER TABLE "ApplicationEvent" ADD COLUMN     "remindAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
