-- DropForeignKey
ALTER TABLE "group_memberships" DROP CONSTRAINT "group_memberships_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_posts" DROP CONSTRAINT "group_posts_group_id_fkey";

-- AddForeignKey
ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_posts" ADD CONSTRAINT "group_posts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
