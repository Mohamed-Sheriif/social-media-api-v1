import { GroupPost } from '@/core/entitys/groupPost.entity';
import { IGroupPostRepository } from '@/core/interfaces/groupPostsRepository.interface';

export class GroupPostUseCase {
  constructor(private groupPostRepository: IGroupPostRepository) {}

  async createGroupPost(
    groupPost: Omit<GroupPost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const groupPostId = await this.groupPostRepository.createGroupPost(
      groupPost
    );

    return groupPostId;
  }

  async getGroupApprovedPosts(groupId: number): Promise<GroupPost[]> {
    const groupPosts = await this.groupPostRepository.getGroupApprovedPosts(
      groupId
    );

    return groupPosts;
  }
}
