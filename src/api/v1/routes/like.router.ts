import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { PostUseCase } from '@/core/usecases/post.usecase';
import { PostRepository } from '@/db/prisma/postRepository';
import { LikeUseCase } from '@/core/usecases/like.usecase';
import { LikeRepository } from '@/db/prisma/likeRepository.interface';

export function LikeRoute(prisma: PrismaClient): Router {
  const router = Router();
  const postUsecase = new PostUseCase(new PostRepository(prisma));
  const likeUsecase = new LikeUseCase(new LikeRepository(prisma));

  /**
   * @desc    Like a post
   * @route   POST /api/v1/likes/:postIs/like
   * @access  Private
   */
  router.post(
    ':postId/like',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const postId = Number(req.params.postId);
      const userId = (req as RequestWithUser).user.id;

      // Check if post exist
      const post = await postUsecase.getPostById(postId);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Check if this user liked this post before
      const like = await likeUsecase.getLikeByPostIdAndUserId(userId, postId);
      if (like) {
        return next(
          new ApiError('Conflict, You already liked this post brfore!', 409)
        );
      }

      // Like the post
      const likeId = await likeUsecase.like(userId, postId);

      res.status(201).json({
        message: 'Liked the post successfully',
        likeId,
      });
    })
  );

  /**
   * @desc    Unlike a post
   * @route   POST /api/v1/likes/:postId/unlike
   * @access  Private
   */
  router.post(
    ':postId/unlike',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const postId = Number(req.params.postId);
      const userId = (req as RequestWithUser).user.id;

      // Check if post exist
      const post = await postUsecase.getPostById(postId);
      if (!post) {
        return next(new ApiError('No post found with this id', 404));
      }

      // Check if this user liked this post before
      const like = await likeUsecase.getLikeByPostIdAndUserId(userId, postId);
      if (!like) {
        return next(
          new ApiError('Like not found for this post with this user!', 404)
        );
      }

      // Unlike the post
      await likeUsecase.unlike(userId, postId);

      res.status(200).json({
        message: 'Unliked the post successfully',
      });
    })
  );

  return router;
}
