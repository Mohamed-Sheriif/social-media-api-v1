import { Like } from '@/core/entitys/like.entity';

export interface ILikeRepository {
  like(userId: number, postId: number): Promise<number>;

  unlike(userId: number, postId: number): Promise<void>;

  getLikeByPostIdAndUserId(
    userId: number,
    postId: number
  ): Promise<Like | null>;

  getPostLikes(postId: number): Promise<Like[]>;
}
