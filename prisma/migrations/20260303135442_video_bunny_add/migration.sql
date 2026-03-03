/*
  Warnings:

  - The `library_id` column on the `Lesson` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "library_id",
ADD COLUMN     "library_id" INTEGER,
ALTER COLUMN "video_id" SET DATA TYPE TEXT;
