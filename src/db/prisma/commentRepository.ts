import { PrismaClient } from '@prisma/client';

import { Comment } from '@/core/entitys/comment.entity';
import { ICommentRepository } from '@/core/interfaces/commentRepository.interface';

export class CommentRepository implements ICommentRepository {
  constructor(private prisma: PrismaClient) {}

  async createComment(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
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
    });

    return comment;
  }
}
