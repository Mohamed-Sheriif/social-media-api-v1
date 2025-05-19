import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { validateRequest } from '@/api/v1/middleware/validate';
import { RequestWithUser } from '@/api/v1/helpers/types';
//import { UserUseCase } from '@/core/usecases/user.usecase';
//import { UserRepository } from '@/db/prisma/userRepository';
import { CommentUseCase } from '@/core/usecases/comment.usecase';
import { CommentRepository } from '@/db/prisma/commentRepository';
import { CreateCommentRequest } from '@/core/validation/comment/CreateCommentRequest';

export function CommentRoute(prisma: PrismaClient): Router {
  const router = Router();
  //const userUsecase = new UserUseCase(new UserRepository(prisma));
  const commentUsecase = new CommentUseCase(new CommentRepository(prisma));

  /**
   * @desc    Create new comment
   * @route   POST /api/v1/comment
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    validateRequest(CreateCommentRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { content, postId, parentId } = req.body;
      const userId = (req as RequestWithUser).user.id;

      // Check if there is a comment with this parentId
      if (parentId) {
        const comment = await commentUsecase.getCommentById(parentId);
        if (!comment) {
          return next(new ApiError('No comment found with this parentId', 404));
        }
      }

      const commentId = await commentUsecase.createComment({
        userId,
        postId,
        content,
        parentId,
      });

      res
        .status(200)
        .json({ message: 'Comment created successfully', commentId });
    })
  );

  return router;
}
