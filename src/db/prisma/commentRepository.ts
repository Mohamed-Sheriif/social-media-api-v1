import { PrismaClient } from '@prisma/client';

import { Comment } from '@/core/entitys/comment.entity';
import { ICommentRepository } from '@/core/interfaces/commentRepository.interface';

export class CommentRepository implements ICommentRepository {
  constructor(private prisma: PrismaClient) {}

  async createComment(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>
  ): Promise<number> {
    const createdComment = await this.prisma.comment.create({
      data: {
        userId: comment.userId,
        postId: comment.postId,
        content: comment.content,
        parentId: comment.parentId,
      },
    });

    return createdComment.id;
  }

  async getCommentById(id: number): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      include: {
        replies: {
          select: {
            id: true,
            userId: true,
            content: true,
            updatedAt: true,
          },
        },
      },
    });

    return comment;
  }

  async updateComment(
    id: number,
    content: string
  ): Promise<Omit<Comment, 'replies'> | null> {
    const updatedComment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        content: content,
      },
    });

    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
