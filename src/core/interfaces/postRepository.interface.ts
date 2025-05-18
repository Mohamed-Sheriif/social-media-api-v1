import { Post } from '@/core/entitys/post.entity';

export interface IPostRepository {
  createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;
}
