import { Post } from '@/core/entitys/post.entity';
import { IPostRepository } from '@/core/interfaces/postRepository.interface';

export class PostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const postId = await this.postRepository.createPost(post);

    return postId;
  }

  async getAllPosts(
    limit: number,
    offset: number
  ): Promise<{ posts: Post[]; totalPosts: number }> {
    const { posts, totalPosts } = await this.postRepository.getAllPosts(
      limit,
      offset
    );

    return { posts, totalPosts };
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const posts = await this.postRepository.getUserPosts(userId);

    return posts;
  }

  async getPostById(id: number): Promise<Post | null> {
    const post = await this.postRepository.getPostById(id);

    return post;
  }

  async updatePost(
    id: number,
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<Post> {
    const updatedPost = await this.postRepository.updatePost(id, post);

    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    await this.postRepository.deletePost(id);
  }
}
