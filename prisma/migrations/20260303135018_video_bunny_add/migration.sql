/*
  Warnings:

  - You are about to drop the column `library_id` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `video_id` on the `Module` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "library_id" INTEGER,
ADD COLUMN     "video_id" INTEGER;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "library_id",
DROP COLUMN "video_id";
