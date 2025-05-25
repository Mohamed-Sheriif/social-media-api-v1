import { PrismaClient } from '@prisma/client';

import { GroupPost } from '@/core/entitys/groupPost.entity';
import { IGroupPostRepository } from '@/core/interfaces/groupPostsRepository.interface';

export class GroupPostRepository implements IGroupPostRepository {
  constructor(private prisma: PrismaClient) {}

  async createGroupPost(
    groupPost: Omit<GroupPost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const createdGroupPost = await this.prisma.groupPost.create({
      data: {
        userId: groupPost.userId,
        groupId: groupPost.groupId,
        content: groupPost.content,
        mediaUrl: groupPost.mediaUrl,
        status: groupPost.status,
      },
    });

    return createdGroupPost.id;
  }

  async getGroupApprovedPosts(groupId: number): Promise<any> {
    const groupPosts = await this.prisma.groupPost.findMany({
      where: {
        groupId,
        status: 'accepted',
      },
      select: {
        id: true,
        groupId: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        content: true,
        mediaUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return groupPosts;
  }
}
