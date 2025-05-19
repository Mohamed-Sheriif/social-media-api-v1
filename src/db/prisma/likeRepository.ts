import { PrismaClient } from '@prisma/client';

import { Like } from '@/core/entitys/like.entity';
import { ILikeRepository } from '@/core/interfaces/likeRepository.interface';

export class LikeRepository implements ILikeRepository {
  constructor(private prisma: PrismaClient) {}

  async like(userId: number, postId: number): Promise<number> {
    const like = await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return like.id;
  }

  async unlike(userId: number, postId: number): Promise<void> {
    await this.prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async getLikeByPostIdAndUserId(
    userId: number,
    postId: number
  ): Promise<Like | null> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return like;
  }

  async getPostLikes(postId: number): Promise<Like[]> {
    const postLikes = await this.prisma.like.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return postLikes;
  }
}
