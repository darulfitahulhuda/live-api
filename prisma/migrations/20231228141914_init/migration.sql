-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "averageRatings" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalVote" INTEGER DEFAULT 0;
