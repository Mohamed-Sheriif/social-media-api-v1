import { GroupPost } from '@/core/entitys/groupPost.entity';

export interface IGroupPostRepository {
  createGroupPost(
    groupPost: Omit<GroupPost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;
}
