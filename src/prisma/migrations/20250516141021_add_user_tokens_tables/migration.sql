-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_fa_enabled" BOOLEAN DEFAULT false,
ADD COLUMN     "two_fa_secret" TEXT;

-- CreateTable
CREATE TABLE "user_refresh_tokens" (
    "user_id" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_refresh_tokens_pkey" PRIMARY KEY ("user_id","refreshToken")
);

-- CreateTable
CREATE TABLE "user_invalid_tokens" (
    "user_id" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiration_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invalid_tokens_pkey" PRIMARY KEY ("user_id","accessToken")
);

-- AddForeignKey
ALTER TABLE "user_refresh_tokens" ADD CONSTRAINT "user_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invalid_tokens" ADD CONSTRAINT "user_invalid_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
