import { Comment } from '@/core/entitys/comment.entity';

export interface ICommentRepository {
  createComment(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>
  ): Promise<number>;

  getCommentById(id: number): Promise<Comment | null>;

  getPostComments(postId: number): Promise<Comment[]>;

  updateComment(
    id: number,
    content: string
  ): Promise<Omit<Comment, 'replies'> | null>;

  deleteComment(id: number): Promise<void>;
}
