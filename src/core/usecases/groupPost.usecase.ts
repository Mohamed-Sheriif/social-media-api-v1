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

  async getGroupPendingPosts(groupId: number): Promise<GroupPost[]> {
    const groupPendingPosts =
      await this.groupPostRepository.getGroupPendingPosts(groupId);

    return groupPendingPosts;
  }

  async getGroupPostById(postId: number): Promise<GroupPost | null> {
    const groupPost = await this.groupPostRepository.getGroupPostById(postId);

    return groupPost;
  }

  async approveGroupPost(postId: number): Promise<void> {
    await this.groupPostRepository.approveGroupPost(postId);
  }

  async deleteGroupPost(postId: number): Promise<void> {
    await this.groupPostRepository.deleteGroupPost(postId);
  }
}
