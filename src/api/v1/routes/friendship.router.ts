import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { UserUseCase } from '@/core/usecases/user.usecase';
import { UserRepository } from '@/db/prisma/userRepository';
import { FriendshipUseCase } from '@/core/usecases/freindship.usecase';
import { FriendshipRepository } from '@/db/prisma/friendshipRepository';

export function FriendshipRoute(prisma: PrismaClient): Router {
  const router = Router();

  const friendshipUsecase = new FriendshipUseCase(
    new FriendshipRepository(prisma)
  );
  const userUsecase = new UserUseCase(new UserRepository(prisma));

  /**
   * @desc    Send friendship request
   * @route   POST /api/v1/friendship
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const addresseeId = Number(req.body.addresseeId);
      const requesterId = (req as RequestWithUser).user.id;

      // Check if addressee user exist
      const user = await userUsecase.getUserById(addresseeId);
      if (!user) {
        return next(new ApiError('User with this Does not exist', 404));
      }

      // Check if there is already a request between them
      const freindship = await friendshipUsecase.getFriendshipRequest(
        requesterId,
        addresseeId
      );
      if (freindship) {
        if (freindship.requesterId === requesterId) {
          return next(
            new ApiError('Conflict, You already sent a request before!', 409)
          );
        } else {
          return next(
            new ApiError(
              'Conflict, You already have freind request from him!',
              409
            )
          );
        }
      }

      // Send friend request
      const freindshipId = await friendshipUsecase.sendFriendRequest(
        requesterId,
        addresseeId
      );

      res
        .status(200)
        .json({ message: 'Frendship request sent successfully', freindshipId });
    })
  );

  return router;
}
