-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_code_expiry" TIMESTAMP(3),
ADD COLUMN     "password_reset_verified" BOOLEAN;
