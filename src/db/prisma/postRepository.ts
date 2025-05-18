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

  async getAllPosts(
    limit: number,
    offset: number
  ): Promise<{ posts: Post[]; totalPosts: number }> {
    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const totalPosts = await this.prisma.post.count();

    return { posts, totalPosts };
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
      },
    });

    return posts;
  }

  async getPostById(id: number): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    return post;
  }

  async updatePost(
    id: number,
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        content: post.content,
        mediaUrl: post.mediaUrl,
        isPublic: post.isPublic,
      },
    });

    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    await this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
