import { GroupPost } from '@/core/entitys/groupPost.entity';

export interface IGroupPostRepository {
  createGroupPost(
    groupPost: Omit<GroupPost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;

  getGroupApprovedPosts(groupId: number): Promise<GroupPost[]>;

  getGroupPendingPosts(groupId: number): Promise<GroupPost[]>;

  getGroupPostById(postId: number): Promise<GroupPost | null>;

  approveGroupPost(postId: number): Promise<void>;

  deleteGroupPost(postId: number): Promise<void>;
}
