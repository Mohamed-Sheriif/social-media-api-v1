/*
  Warnings:

  - Made the column `post_id` on table `likes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_post_id_fkey";

-- AlterTable
ALTER TABLE "likes" ALTER COLUMN "post_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
