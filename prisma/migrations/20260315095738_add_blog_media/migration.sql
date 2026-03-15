/*
  Warnings:

  - You are about to drop the column `gallery` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `mainPhoto` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Blog` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "gallery",
DROP COLUMN "mainPhoto",
DROP COLUMN "stats",
DROP COLUMN "tags",
ADD COLUMN     "coverImageId" INTEGER;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "provider" TEXT,
    "alt" TEXT,
    "size" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlogGallery" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BlogGallery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BlogGallery_B_index" ON "_BlogGallery"("B");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogGallery" ADD CONSTRAINT "_BlogGallery_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogGallery" ADD CONSTRAINT "_BlogGallery_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
