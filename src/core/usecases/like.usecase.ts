import { Like } from '@/core/entitys/like.entity';
import { ILikeRepository } from '@/core/interfaces/likeRepository.interface';

export class LikeUseCase {
  constructor(private likeRepository: ILikeRepository) {}

  async like(userId: number, postId: number): Promise<number> {
    const likeId = await this.likeRepository.like(userId, postId);

    return likeId;
  }

  async unlike(userId: number, postId: number): Promise<void> {
    await this.likeRepository.unlike(userId, postId);
  }

  async getLikeByPostIdAndUserId(
    userId: number,
    postId: number
  ): Promise<Like | null> {
    const like = await this.likeRepository.getLikeByPostIdAndUserId(
      userId,
      postId
    );

    return like;
  }

  async getPostLikes(postId: number): Promise<Like[]> {
    const postLikes = await this.likeRepository.getPostLikes(postId);

    return postLikes;
  }
}
