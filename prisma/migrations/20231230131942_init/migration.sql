-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Promotion', 'updatePassword', 'Transactions');

-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "type" "NotificationType";
