import { Comment } from '@/core/entitys/comment.entity';

export interface ICommentRepository {
  createComment(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;

  getCommentById(id: number): Promise<Comment | null>;
}
