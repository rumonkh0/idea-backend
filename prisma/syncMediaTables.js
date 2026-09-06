import prisma from "../config/prisma.js";

async function main() {
  console.log("Checking and creating missing tables...");

  // 1. Create NoticeCategory enum if not exists
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "NoticeCategory" AS ENUM ('Urgent', 'General', 'Course Update', 'Event');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log("✓ NoticeCategory enum ready");

  // 2. Create Notice table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Notice" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "excerpt" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "category" "NoticeCategory" NOT NULL DEFAULT 'General',
      "isPinned" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("✓ Notice table ready");

  // 3. Create TvMediaReport table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TvMediaReport" (
      "id" SERIAL NOT NULL,
      "channel" TEXT NOT NULL,
      "topic" TEXT NOT NULL,
      "link" TEXT NOT NULL,
      "platform" TEXT NOT NULL DEFAULT 'YouTube',
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TvMediaReport_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("✓ TvMediaReport table ready");

  // 4. Create NewspaperClip table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NewspaperClip" (
      "id" SERIAL NOT NULL,
      "title" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "imageId" INTEGER,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NewspaperClip_pkey" PRIMARY KEY ("id")
    );
  `);

  // 5. Add foreign key relation if not already present
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'NewspaperClip_imageId_fkey'
        ) THEN
          ALTER TABLE "NewspaperClip"
          ADD CONSTRAINT "NewspaperClip_imageId_fkey"
          FOREIGN KEY ("imageId") REFERENCES "Media"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
  } catch (err) {
    console.log("Note on FK:", err.message);
  }
  console.log("✓ NewspaperClip table ready");

  console.log("\n🎉 All missing tables have been created successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
