/*
  Warnings:

  - A unique constraint covering the columns `[thumbnailId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "thumbnailId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Course_thumbnailId_key" ON "Course"("thumbnailId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
