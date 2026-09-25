-- AlterTable
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
  ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarId" INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- CreateIndex
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_key" UNIQUE ("avatarId");
EXCEPTION WHEN duplicate_table OR duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
