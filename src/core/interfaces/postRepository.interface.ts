import { Post } from '@/core/entitys/post.entity';

export interface IPostRepository {
  createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;

  getAllPosts(
    limit: number,
    offset: number
  ): Promise<{ posts: Post[]; totalPosts: number }>;

  getUserPosts(userId: number): Promise<Post[]>;

  getPostById(id: number): Promise<Post | null>;

  updatePost(
    id: number,
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<Post>;

  updatePostStatus(id: number, isPublic: boolean): Promise<Post>;

  deletePost(id: number): Promise<void>;
}
