/*
  Warnings:

  - Made the column `content` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_public` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "media_url" DROP NOT NULL,
ALTER COLUMN "media_url" SET DATA TYPE TEXT,
ALTER COLUMN "is_public" SET NOT NULL,
ALTER COLUMN "is_public" DROP DEFAULT;
