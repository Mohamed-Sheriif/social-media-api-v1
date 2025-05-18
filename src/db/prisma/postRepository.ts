import { PrismaClient } from '@prisma/client';

import { Post } from '@/core/entitys/post.entity';
import { IPostRepository } from '@/core/interfaces/postRepository.interface';

export class PostRepository implements IPostRepository {
  constructor(private prisma: PrismaClient) {}

  async createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const createdPost = await this.prisma.post.create({
      data: {
        userId: post.userId,
        content: post.content,
        mediaUrl: post.mediaUrl,
        isPublic: post.isPublic || true,
      },
    });

    return createdPost.id;
  }
}
