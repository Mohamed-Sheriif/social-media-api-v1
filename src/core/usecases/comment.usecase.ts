import { Comment } from '@/core/entitys/comment.entity';
import { ICommentRepository } from '@/core/interfaces/commentRepository.interface';

export class CommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async createComment(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>
  ): Promise<number> {
    const commentId = await this.commentRepository.createComment(comment);

    return commentId;
  }

  async getCommentById(id: number): Promise<Comment | null> {
    const comment = await this.commentRepository.getCommentById(id);

    return comment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.getPostComments(postId);

    return comments;
  }

  async updateComment(
    id: number,
    content: string
  ): Promise<Omit<Comment, 'replies'> | null> {
    const updatedComment = await this.commentRepository.updateComment(
      id,
      content
    );

    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await this.commentRepository.deleteComment(id);
  }
}
