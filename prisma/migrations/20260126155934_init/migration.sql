-- AlterTable
ALTER TABLE "User" ADD COLUMN     "confirmEmailToken" TEXT,
ADD COLUMN     "isEmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';
