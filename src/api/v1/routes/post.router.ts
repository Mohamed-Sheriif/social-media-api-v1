import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { validateRequest } from '@/api/v1/middleware/validate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { PostUseCase } from '@/core/usecases/post.usecase';
import { PostRepository } from '@/db/prisma/postRepository';
import { CreatePostRequest } from '@/core/validation/post/CreatePostRequest';
import { UserUseCase } from '@/core/usecases/user.usecase';
import { UserRepository } from '@/db/prisma/userRepository';
import { CommentUseCase } from '@/core/usecases/comment.usecase';
import { CommentRepository } from '@/db/prisma/commentRepository';

export function PostRoute(prisma: PrismaClient): Router {
  const router = Router();
  const postUsecase = new PostUseCase(new PostRepository(prisma));
  const userUsecase = new UserUseCase(new UserRepository(prisma));
  const commentUsecase = new CommentUseCase(new CommentRepository(prisma));

  /**
   * @desc    Create new post
   * @route   POST /api/v1/post
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    validateRequest(CreatePostRequest),
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { content, mediaUrl, isPublic } = req.body;
      const userId = (req as RequestWithUser).user.id;

      const postId = await postUsecase.createPost({
        content,
        mediaUrl,
        isPublic,
        userId,
      });

      res.status(200).json({ message: 'Post created successfully', postId });
    })
  );

  /**
   * @desc    Get all posts
   * @route   GET /api/v1/post/
   * @access  Public
   */
  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const pageNumber = Number(req.query.pageNumber) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      // Get limit and offset for pagination
      const limit = Number(pageSize);
      const offset = Number(pageNumber - 1) * limit;
      const { posts, totalPosts } = await postUsecase.getAllPosts(
        limit,
        offset
      );

      // Metadata
      const metaData = {
        page: pageNumber,
        pageSize: limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      };

      res
        .status(200)
        .json({ message: 'Posts retrieved successfully', posts, metaData });
    })
  );

  /**
   * @desc    Get user posts
   * @route   GET /api/v1/post/user/:userId
   * @access  Public
   */
  router.get(
    '/user/:userId',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.userId);

      // Check if user exist
      const user = await userUsecase.getUserById(userId);
      if (!user) {
        return next(new ApiError('No user found for this id', 404));
      }

      // Get user posts
      const posts = await postUsecase.getUserPosts(userId);

      res
        .status(200)
        .json({ message: 'User posts retrieved successfully', posts });
    })
  );

  /**
   * @desc    Get post comments
   * @route   GET /api/v1/post/:id/comments
   * @access  Public
   */
  router.get(
    '/:id/comments',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);

      // Check if post exist
      const post = await postUsecase.getPostById(id);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Get post comments
      const comments = await commentUsecase.getPostComments(id);

      res
        .status(200)
        .json({ message: 'Post comments retrieved successfully', comments });
    })
  );

  /**
   * @desc    Get post by id
   * @route   GET /api/v1/post/:id
   * @access  Public
   */
  router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);

      // Check if post exist
      const post = await postUsecase.getPostById(id);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      res.status(200).json({ message: 'Post retrieved successfully', post });
    })
  );

  /**
   * @desc    Update post by id
   * @route   PUT /api/v1/post/:id
   * @access  Private
   */
  router.put(
    '/:id',
    authenticate,
    validateRequest(CreatePostRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);
      const { content, mediaUrl, isPublic } = req.body;
      const userId = (req as RequestWithUser).user.id;

      // Check if post exist
      const post = await postUsecase.getPostById(id);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Check if post belong to logged user
      if (userId !== post.userId) {
        return next(
          new ApiError('You are not authorized to update this post', 403)
        );
      }

      // Update post
      const updatedPost = await postUsecase.updatePost(id, {
        content,
        mediaUrl,
        isPublic,
      });

      res
        .status(200)
        .json({ message: 'Post updated successfully', post: updatedPost });
    })
  );

  /**
   * @desc    Change post status
   * @route   PUT /api/v1/post/:id/status
   * @access  Private
   */
  router.put(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);
      const { isPublic } = req.body;
      const userId = (req as RequestWithUser).user.id;

      if (!isPublic || isPublic !== true || isPublic !== false) {
        return next(
          new ApiError(
            'Ispublic is required , and should be true or false',
            400
          )
        );
      }
      // Check if post exist
      const post = await postUsecase.getPostById(id);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Check if post belong to logged user
      if (userId !== post.userId) {
        return next(
          new ApiError('You are not authorized to update this post', 403)
        );
      }

      // Update post status
      const updatedPost = await postUsecase.updatePostStatus(id, isPublic);

      res.status(200).json({
        message: 'Post status updated successfully',
        post: updatedPost,
      });
    })
  );

  /**
   * @desc    Delete post by id
   * @route   DELETE /api/v1/post/:id
   * @access  Private
   */
  router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);
      const userId = (req as RequestWithUser).user.id;

      // Check if post exist
      const post = await postUsecase.getPostById(id);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Check if post belong to logged user
      if (userId !== post.userId) {
        return next(
          new ApiError('You are not authorized to update this post', 403)
        );
      }

      // Delete post
      await postUsecase.deletePost(id);

      res.status(200).json({ message: 'Post deleted successfully' });
    })
  );

  return router;
}
