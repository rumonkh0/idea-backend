-- CreateEnum
CREATE TYPE "BkashStatus" AS ENUM ('UNMATCHED', 'MATCHED');

-- CreateTable
CREATE TABLE "BkashTransaction" (
    "id" SERIAL NOT NULL,
    "txid" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "rawMessage" TEXT NOT NULL,
    "senderNumber" TEXT,
    "status" "BkashStatus" NOT NULL DEFAULT 'UNMATCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BkashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BkashTransaction_txid_key" ON "BkashTransaction"("txid");
